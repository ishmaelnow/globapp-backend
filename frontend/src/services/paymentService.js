import api from '../config/api.js';
import { getPublicApiKey } from '../utils/auth';
import { PUBLIC_API_KEY } from '../config/api';

/**
 * Get API key with fallback priority
 */
const getApiKey = () => {
  const localStorageKey = getPublicApiKey();
  if (localStorageKey && localStorageKey.trim()) {
    return localStorageKey;
  }
  return PUBLIC_API_KEY || '';
};

const getPublicHeaders = () => {
  const headers = {};
  const apiKey = getApiKey();
  if (apiKey && apiKey.trim()) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
};

/**
 * Estimate fare for a ride
 */
export const estimateFare = async (pickup, dropoff, rideId = null) => {
  const response = await api.post(
    '/fare/estimate',
    {
      pickup,
      dropoff,
      ride_id: rideId,
    },
    {
      headers: getPublicHeaders(),
    }
  );
  return response.data;
};

/**
 * Accept a fare quote
 */
export const acceptQuote = async (quoteId, rideId) => {
  const response = await api.post(
    '/fare/accept',
    {
      quote_id: quoteId,
      ride_id: rideId,
    },
    {
      headers: getPublicHeaders(),
    }
  );
  return response.data;
};

/**
 * Get available payment options
 */
export const getPaymentOptions = async () => {
  const response = await api.get('/payment/options', {
    headers: getPublicHeaders(),
  });
  return response.data;
};

/**
 * Create payment intent
 */
export const createPaymentIntent = async (rideId, quoteId, provider) => {
  const response = await api.post(
    '/payment/create-intent',
    {
      ride_id: rideId,
      quote_id: quoteId,
      provider,
    },
    {
      headers: getPublicHeaders(),
    }
  );
  return response.data;
};

/**
 * Confirm payment
 */
export const confirmPayment = async (paymentId, providerPayload = null) => {
  const response = await api.post(
    '/payment/confirm',
    {
      payment_id: paymentId,
      provider_payload: providerPayload,
    },
    {
      headers: getPublicHeaders(),
    }
  );
  return response.data;
};


