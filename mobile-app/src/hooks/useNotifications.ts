import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { getAllNotifications, markNotificationRead } from '../services/notificationService';
import { getRiderPhone } from '../utils/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'pending' | 'read';
  recipient_type: string;
  recipient_id?: string;
  ride_id?: string;
  created_at_utc: string;
}

/**
 * Custom hook for managing notifications with real-time updates
 * @param recipientId - Optional rider phone number to filter notifications
 * @param pollInterval - Polling interval in milliseconds (default: 10000 = 10 seconds)
 */
export const useNotifications = (
  recipientId: string | null = null,
  pollInterval: number = 10000
) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Configure notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications received while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // Refresh notifications when a new one arrives
      loadNotifications();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      
      // Get rider phone if not provided
      let riderPhone = recipientId;
      if (!riderPhone) {
        riderPhone = await getRiderPhone();
      }

      // Load notifications for rider
      const data = await getAllNotifications('rider', 50);
      
      // Filter by recipient_id if phone number is available
      let filteredData = data;
      if (riderPhone) {
        filteredData = data.filter((n: Notification) => n.recipient_id === riderPhone);
      }
      
      // Sort by created_at descending (newest first)
      filteredData.sort(
        (a: Notification, b: Notification) =>
          new Date(b.created_at_utc).getTime() - new Date(a.created_at_utc).getTime()
      );
      
      setNotifications(filteredData);
      const unread = filteredData.filter((n: Notification) => n.status === 'pending').length;
      
      // Check if we have new notifications
      const previousUnread = unreadCount;
      if (unread > previousUnread && previousUnread > 0) {
        // New notification arrived
        console.log('New notification detected!');
      }
      
      setUnreadCount(unread);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
      setLoading(false);
    }
  }, [recipientId, unreadCount]);

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

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markNotificationRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, status: 'read' as const } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => n.status === 'pending');
      await Promise.all(unreadNotifications.map((n) => markNotificationRead(n.id)));
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    lastUpdate,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    refresh,
  };
};

/**
 * Register for push notifications
 */
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } catch (error) {
    console.error('Error registering for push notifications:', error);
  }

  return token;
}
































