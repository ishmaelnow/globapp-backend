import api from '../config/api';
import { getAdminApiKey } from '../utils/auth';
import { ADMIN_API_KEY } from '../config/api';

const getAdminApiKeyValue = async (): Promise<string> => {
  const storageKey = await getAdminApiKey();
  if (storageKey && storageKey.trim()) {
    return storageKey;
  }
  return ADMIN_API_KEY || '';
};

const getAdminHeaders = async (apiKey?: string) => {
  const headers: Record<string, string> = {};
  const key = apiKey || await getAdminApiKeyValue();
  if (key && key.trim()) {
    headers['X-API-Key'] = key;
  }
  return headers;
};

// Drivers
export const listDrivers = async (apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/drivers', { headers });
  return response.data;
};

export const createDriver = async (driverData: any, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.post('/drivers', driverData, { headers });
  return response.data;
};

export const getDriverLocation = async (driverId: string, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get(`/drivers/${driverId}/location`, { headers });
  return response.data;
};

// Dispatch - Available Drivers
export const getAvailableDrivers = async (minutesRecent: number = 5, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/dispatch/available-drivers', {
    params: { minutes_recent: minutesRecent },
    headers,
  });
  return response.data;
};

// Dispatch - Driver Presence
export const getDriverPresence = async (apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/dispatch/driver-presence', { headers });
  return response.data;
};

// Dispatch - Rides
export const listDispatchRides = async (status?: string, limit: number = 50, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/dispatch/rides', {
    params: { status, limit },
    headers,
  });
  return response.data;
};

export const assignRide = async (rideId: string, driverId: string, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.post(
    `/dispatch/rides/${rideId}/assign`,
    {
      driver_id: driverId,
    },
    { headers }
  );
  return response.data;
};

export const getActiveRides = async (limit: number = 50, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/dispatch/active-rides', {
    params: { limit },
    headers,
  });
  return response.data;
};

// Payment Reports & Revenue Analytics
export const getPaymentReports = async (
  startDate?: string,
  endDate?: string,
  provider?: string,
  apiKey?: string
) => {
  const params: Record<string, any> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (provider) params.provider = provider;

  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/admin/payments/reports', {
    params,
    headers,
  });
  return response.data;
};

// Driver Performance Metrics
export const getDriverMetrics = async (
  driverId?: string,
  startDate?: string,
  endDate?: string,
  apiKey?: string
) => {
  const params: Record<string, any> = {};
  if (driverId) params.driver_id = driverId;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/admin/drivers/metrics', {
    params,
    headers,
  });
  return response.data;
};

// Enhanced Ride History
export const getRidesHistory = async (
  status?: string,
  driverId?: string,
  startDate?: string,
  endDate?: string,
  limit: number = 100,
  offset: number = 0,
  apiKey?: string
) => {
  const params: Record<string, any> = { limit, offset };
  if (status) params.status = status;
  if (driverId) params.driver_id = driverId;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/admin/rides/history', {
    params,
    headers,
  });
  return response.data;
};

// Auto-Assignment Settings
export const getAutoAssignmentSetting = async (apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.get('/admin/settings/auto-assignment', { headers });
  return response.data;
};

export const updateAutoAssignmentSetting = async (enabled: boolean, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.put(
    '/admin/settings/auto-assignment',
    { enabled },
    { headers }
  );
  return response.data;
};

// Auto-Assign Ride
export const autoAssignRide = async (rideId: string, apiKey?: string) => {
  const headers = await getAdminHeaders(apiKey);
  const response = await api.post(`/dispatch/rides/${rideId}/auto-assign`, {}, { headers });
  return response.data;
};






