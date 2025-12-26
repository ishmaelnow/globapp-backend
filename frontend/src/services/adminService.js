import api from '../config/api.js';

const getAdminHeaders = (apiKey) => ({
  'X-API-Key': apiKey,
});

// Drivers
export const listDrivers = async (apiKey) => {
  const response = await api.get('/drivers', {
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

export const createDriver = async (driverData, apiKey) => {
  const response = await api.post('/drivers', driverData, {
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

export const getDriverLocation = async (driverId, apiKey) => {
  const response = await api.get(`/drivers/${driverId}/location`, {
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

// Dispatch - Available Drivers
export const getAvailableDrivers = async (minutesRecent, apiKey) => {
  const response = await api.get('/dispatch/available-drivers', {
    params: { minutes_recent: minutesRecent },
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

// Dispatch - Driver Presence
export const getDriverPresence = async (apiKey) => {
  const response = await api.get('/dispatch/driver-presence', {
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

// Dispatch - Rides
export const listDispatchRides = async (status, limit, apiKey) => {
  const response = await api.get('/dispatch/rides', {
    params: { status, limit },
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

export const assignRide = async (rideId, driverId, apiKey) => {
  const response = await api.post(`/dispatch/rides/${rideId}/assign`, {
    driver_id: driverId,
  }, {
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

export const getActiveRides = async (limit, apiKey) => {
  const response = await api.get('/dispatch/active-rides', {
    params: { limit },
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

