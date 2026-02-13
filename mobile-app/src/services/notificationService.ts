import api from '../config/api';

/**
 * Get notifications for a rider (by ride_id)
 */
export const getRiderNotifications = async (rideId: string, limit: number = 50) => {
  const response = await api.get('/notifications', {
    params: {
      recipient_type: 'rider',
      recipient_id: rideId,
      limit,
    },
  });
  return response.data;
};

/**
 * Get notifications for a specific ride
 */
export const getRideNotifications = async (rideId: string, limit: number = 50) => {
  const response = await api.get('/notifications', {
    params: {
      ride_id: rideId,
      limit,
    },
  });
  return response.data;
};

/**
 * Get all notifications (for admin or general view)
 */
export const getAllNotifications = async (recipientType: string | null = null, limit: number = 50) => {
  const params: Record<string, any> = { limit };
  if (recipientType) {
    params.recipient_type = recipientType;
  }
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationRead = async (notificationId: string) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};


































