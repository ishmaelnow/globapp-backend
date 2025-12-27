import api, { PUBLIC_API_KEY } from '../config/api.js';

const getPublicHeaders = (apiKey) => {
  const headers = {};
  // Use provided apiKey, or fallback to build-time PUBLIC_API_KEY
  // Only check localStorage if apiKey not provided and PUBLIC_API_KEY not set
  let keyToUse = apiKey;
  if (!keyToUse || !keyToUse.trim()) {
    keyToUse = PUBLIC_API_KEY;
  }
  if (!keyToUse || !keyToUse.trim()) {
    // Last resort: check localStorage (for backward compatibility)
    if (typeof window !== 'undefined') {
      const localStorageKey = localStorage.getItem('public_api_key');
      if (localStorageKey && localStorageKey.trim()) {
        keyToUse = localStorageKey;
      }
    }
  }
  if (keyToUse && keyToUse.trim()) {
    headers['X-API-Key'] = keyToUse;
  }
  return headers;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getV1Health = async () => {
  const response = await api.get('/v1/health');
  return response.data;
};

export const getV1Info = async () => {
  const response = await api.get('/v1/info');
  return response.data;
};

export const getV1Time = async () => {
  const response = await api.get('/v1/time');
  return response.data;
};

export const getRideQuote = async (quoteData, apiKey) => {
  const response = await api.post('/rides/quote', quoteData, {
    headers: getPublicHeaders(apiKey),
  });
  return response.data;
};

export const createRide = async (rideData, apiKey) => {
  const response = await api.post('/rides', rideData, {
    headers: getPublicHeaders(apiKey),
  });
  return response.data;
};

