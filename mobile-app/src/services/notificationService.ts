import api from '../config/api';

export interface Notification {
  id: string;
  ride_id?: string;
  driver_id?: string;
  recipient_type: 'rider' | 'driver' | 'admin';
  recipient_id?: string;
  notification_type: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  metadata?: any;
  created_at_utc: string;
  sent_at_utc?: string;
  read_at_utc?: string;
}

/**
 * Get notifications
 */
export const getNotifications = async (
  recipientType: 'rider' | 'driver' | 'admin',
  recipientId?: string,
  limit: number = 50
) => {
  const params: any = { recipient_type: recipientType, limit };
  if (recipientId) params.recipient_id = recipientId;
  
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId: string) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

