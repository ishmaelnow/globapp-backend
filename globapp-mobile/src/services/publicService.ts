import api from '../config/api';

const getPublicHeaders = (apiKey?: string) => {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getRideQuote = async (quoteData: any, apiKey?: string) => {
  const headers = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  const response = await api.post('/rides/quote', quoteData, { headers });
  return response.data;
};

export const createRide = async (rideData: any, apiKey?: string) => {
  const headers = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  const response = await api.post('/rides', rideData, { headers });
  return response.data;
};

