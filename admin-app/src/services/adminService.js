import api, { ADMIN_API_KEY } from '../config/api.js';

const getAdminHeaders = (apiKey) => {
  // API key is now automatically added by axios interceptor
  // This function is kept for backward compatibility but no longer needed
  // If apiKey is provided, use it; otherwise interceptor handles it
  const headers = {};
  if (apiKey && apiKey.trim()) {
    headers['X-API-Key'] = apiKey;
  }
  // If no apiKey provided, interceptor will add ADMIN_API_KEY automatically
  return headers;
};

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

// Payment Reports & Revenue Analytics
export const getPaymentReports = async (startDate, endDate, provider, apiKey) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (provider) params.provider = provider;
  
  const response = await api.get('/admin/payments/reports', {
    params,
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

// Driver Performance Metrics
export const getDriverMetrics = async (driverId, startDate, endDate, apiKey) => {
  const params = {};
  if (driverId) params.driver_id = driverId;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/admin/drivers/metrics', {
    params,
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

// Enhanced Ride History
export const getRidesHistory = async (status, driverId, startDate, endDate, limit, offset, apiKey) => {
  const params = { limit: limit || 100, offset: offset || 0 };
  if (status) params.status = status;
  if (driverId) params.driver_id = driverId;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/admin/rides/history', {
    params,
    headers: getAdminHeaders(apiKey),
  });
  return response.data;
};

