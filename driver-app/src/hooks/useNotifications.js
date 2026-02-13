import { useState, useEffect, useCallback } from 'react';
import { getAllNotifications, getRideNotifications, getDriverNotifications } from '../services/notificationService';

/**
 * Custom hook for managing notifications with real-time updates
 * @param {string} recipientType - 'rider', 'driver', or 'admin'
 * @param {string} recipientId - Optional recipient ID
 * @param {string} rideId - Optional ride ID to filter by
 * @param {number} pollInterval - Polling interval in milliseconds (default: 10000 = 10 seconds)
 */
export const useNotifications = (recipientType = 'driver', recipientId = null, rideId = null, pollInterval = 10000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      let data;
      
      if (rideId) {
        data = await getRideNotifications(rideId);
      } else if (recipientId && recipientType === 'driver') {
        // Use the dedicated driver notifications endpoint
        if (!recipientId) {
          console.warn('Driver ID is missing, cannot load notifications');
          setError('Driver ID is missing');
          setLoading(false);
          return;
        }
        // Ensure recipientId is a string, not an object
        let driverIdString = recipientId;
        
        // Extract string from UUID object if needed
        if (typeof recipientId === 'object' && recipientId !== null) {
          // Check for UUID object format with _j property
          if (recipientId._j && typeof recipientId._j === 'string') {
            driverIdString = recipientId._j;
            console.log('Extracted UUID string from object._j:', driverIdString);
          } else if (recipientId.value && typeof recipientId.value === 'string') {
            driverIdString = recipientId.value;
          } else if (recipientId.uuid && typeof recipientId.uuid === 'string') {
            driverIdString = recipientId.uuid;
          } else if (typeof recipientId.toString === 'function') {
            driverIdString = recipientId.toString();
          } else {
            driverIdString = String(recipientId);
          }
        } else if (typeof recipientId !== 'string') {
          driverIdString = String(recipientId);
        }
        
        if (!driverIdString || driverIdString === '[object Object]' || driverIdString === 'null' || driverIdString === 'undefined') {
          console.error('Invalid driver ID format:', recipientId, '->', driverIdString);
          setError('Invalid driver ID. Please log out and log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Loading driver notifications for driver ID:', driverIdString);
        data = await getDriverNotifications(driverIdString);
        console.log('Received notifications:', data);
      } else if (recipientId) {
        // For rider/admin with specific ID, use getAllNotifications with proper filtering
        const allData = await getAllNotifications(recipientType);
        data = allData.filter(n => n.recipient_id === recipientId);
      } else {
        data = await getAllNotifications(recipientType);
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Notifications data is not an array:', data);
        data = [];
      }
      
      // Sort by created_at descending (newest first)
      data.sort((a, b) => new Date(b.created_at_utc) - new Date(a.created_at_utc));
      
      setNotifications(data);
      const unread = data.filter(n => n.status === 'pending').length;
      
      // Check if we have new notifications
      const previousUnread = unreadCount;
      if (unread > previousUnread && previousUnread > 0) {
        // New notification arrived - trigger sound
        playNotificationSound();
        // Request browser notification permission if not already granted
        requestNotificationPermission();
      }
      
      setUnreadCount(unread);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load notifications';
      setError(errorMsg);
      console.error('Error loading notifications:', err);
      console.error('Error response:', err.response);
      setLoading(false);
      // Don't retry on error to prevent infinite loops
      setUnreadCount(0);
    }
  }, [recipientType, recipientId, rideId]); // Removed unreadCount to prevent infinite loops

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [loadNotifications, pollInterval]);

  // Play sound for new notifications
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Higher pitch
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (err) {
      console.log('Could not play notification sound:', err);
    }
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id, // Prevent duplicate notifications
      });
    }
  };

  // Mark notification as read (local state update only)
  const markAsReadLocal = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId
          ? { ...n, status: 'read', read_at_utc: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Show browser notifications for new unread items
  useEffect(() => {
    if (notifications.length > 0 && unreadCount > 0) {
      const unreadNotifications = notifications.filter(n => n.status === 'pending');
      unreadNotifications.forEach(notification => {
        // Only show browser notification if it's very recent (within last minute)
        const notificationTime = new Date(notification.created_at_utc);
        const now = new Date();
        const diffMs = now - notificationTime;
        
        if (diffMs < 60000) { // Within last minute
          showBrowserNotification(notification);
        }
      });
    }
  }, [notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    lastUpdate,
    refresh: loadNotifications,
    markAsRead: markAsReadLocal,
  };
};

