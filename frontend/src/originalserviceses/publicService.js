import api from '../config/api.js';

const getPublicHeaders = (apiKey) => {
  const headers = {};
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
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

