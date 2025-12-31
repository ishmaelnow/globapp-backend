import api from '../config/api';

/**
 * Get notifications for a driver
 */
export const getDriverNotifications = async (driverId, limit = 50) => {
  const response = await api.get('/notifications', {
    params: {
      recipient_type: 'driver',
      recipient_id: driverId,
      limit,
    },
  });
  return response.data;
};

/**
 * Get notifications for a specific ride
 */
export const getRideNotifications = async (rideId, limit = 50) => {
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
export const getAllNotifications = async (recipientType = null, limit = 50) => {
  const params = { limit };
  if (recipientType) {
    params.recipient_type = recipientType;
  }
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

