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
export const updateDriverLocation = async (locationData, accessToken) => {
  const response = await api.put('/driver/location', locationData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

// Driver Rides
export const getAssignedRide = async (accessToken) => {
  const response = await api.get('/driver/assigned-ride', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const updateRideStatus = async (rideId, status, accessToken) => {
  const response = await api.post(`/driver/rides/${rideId}/status`, { status }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const getDriverRides = async (status, limit, accessToken) => {
  const params = { limit };
  if (status) params.status = status;
  const response = await api.get('/driver/rides', {
    params,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

