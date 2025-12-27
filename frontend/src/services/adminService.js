import api, { ADMIN_API_KEY } from '../config/api.js';

const getAdminHeaders = (apiKey) => {
  // Use provided apiKey, or fallback to build-time ADMIN_API_KEY, or localStorage
  let keyToUse = apiKey;
  if (!keyToUse || !keyToUse.trim()) {
    keyToUse = ADMIN_API_KEY;
  }
  if (!keyToUse || !keyToUse.trim()) {
    // Last resort: check localStorage (for backward compatibility)
    if (typeof window !== 'undefined') {
      const localStorageKey = localStorage.getItem('admin_api_key');
      if (localStorageKey && localStorageKey.trim()) {
        keyToUse = localStorageKey;
      }
    }
  }
  return {
    'X-API-Key': keyToUse || '',
  };
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

