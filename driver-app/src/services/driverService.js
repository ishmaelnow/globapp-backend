import api from '../config/api.js';

// Driver Authentication
export const driverLogin = async (phone, pin, deviceId = null) => {
  const response = await api.post('/driver/login', {
    phone,
    pin,
    device_id: deviceId,
  });
  return response.data;
};

export const driverRefresh = async (refreshToken, deviceId = null) => {
  const response = await api.post('/driver/refresh', {
    refresh_token: refreshToken,
    device_id: deviceId,
  });
  return response.data;
};

// Driver Location
export const updateDriverLocation = async (locationData, accessToken = null) => {
  // accessToken is optional - interceptor will add it automatically if not provided
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await api.put('/driver/location', locationData, { headers });
  return response.data;
};

// Driver Rides
export const getAssignedRide = async (accessToken = null) => {
  // accessToken is optional - interceptor will add it automatically if not provided
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await api.get('/driver/assigned-ride', { headers });
  return response.data;
};

export const updateRideStatus = async (rideId, status, accessToken = null) => {
  // accessToken is optional - interceptor will add it automatically if not provided
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await api.post(`/driver/rides/${rideId}/status`, { status }, { headers });
  return response.data;
};

export const getDriverRides = async (status, limit, accessToken = null) => {
  // accessToken is optional - interceptor will add it automatically if not provided
  const params = { limit };
  if (status) params.status = status;
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const response = await api.get('/driver/rides', { params, headers });
  return response.data;
};

