import { useState, useEffect, useCallback } from 'react';
import { getAllNotifications, getRideNotifications } from '../services/notificationService';

/**
 * Custom hook for managing notifications with real-time updates
 * @param {string} recipientType - 'rider', 'driver', or 'admin'
 * @param {string} recipientId - Optional recipient ID
 * @param {string} rideId - Optional ride ID to filter by
 * @param {number} pollInterval - Polling interval in milliseconds (default: 10000 = 10 seconds)
 */
export const useNotifications = (recipientType = 'rider', recipientId = null, rideId = null, pollInterval = 10000) => {
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
      } else if (recipientId) {
        // For driver/rider with specific ID
        const allData = await getAllNotifications(recipientType);
        data = allData.filter(n => n.recipient_id === recipientId);
      } else {
        data = await getAllNotifications(recipientType);
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
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
      setLoading(false);
    }
  }, [recipientType, recipientId, rideId, unreadCount]);

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

