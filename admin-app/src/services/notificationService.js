import api from '../config/api';

/**
 * Get notifications for admin (broadcast - recipient_id is null)
 */
export const getAdminNotifications = async (limit = 50) => {
  const response = await api.get('/notifications', {
    params: {
      recipient_type: 'admin',
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
 * Get all notifications (any recipient type)
 */
export const getAllNotifications = async (limit = 50) => {
  const response = await api.get('/notifications', {
    params: {
      limit,
    },
  });
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markNotificationRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};

