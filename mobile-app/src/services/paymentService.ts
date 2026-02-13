import api from '../config/api';
import { getPublicApiKey } from '../utils/auth';
import { PUBLIC_API_KEY } from '../config/api';

/**
 * Get API key with fallback priority
 */
const getApiKey = async (): Promise<string> => {
  const storageKey = await getPublicApiKey();
  if (storageKey && storageKey.trim()) {
    return storageKey;
  }
  return PUBLIC_API_KEY || '';
};

const getPublicHeaders = async () => {
  const headers: Record<string, string> = {};
  const apiKey = await getApiKey();
  if (apiKey && apiKey.trim()) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
};

/**
 * Estimate fare for a ride
 */
export const estimateFare = async (pickup: string, dropoff: string, rideId: string | null = null) => {
  const headers = await getPublicHeaders();
  const response = await api.post(
    '/fare/estimate',
    {
      pickup,
      dropoff,
      ride_id: rideId,
    },
    { headers }
  );
  return response.data;
};

/**
 * Accept a fare quote
 */
export const acceptQuote = async (quoteId: string, rideId: string) => {
  const headers = await getPublicHeaders();
  const response = await api.post(
    '/fare/accept',
    {
      quote_id: quoteId,
      ride_id: rideId,
    },
    { headers }
  );
  return response.data;
};

/**
 * Get available payment options
 */
export const getPaymentOptions = async () => {
  const headers = await getPublicHeaders();
  const response = await api.get('/payment/options', { headers });
  return response.data;
};

/**
 * Create payment intent
 */
export const createPaymentIntent = async (rideId: string, quoteId: string, provider: string) => {
  const headers = await getPublicHeaders();
  const response = await api.post(
    '/payment/create-intent',
    {
      ride_id: rideId,
      quote_id: quoteId,
      provider,
    },
    { headers }
  );
  return response.data;
};

/**
 * Confirm payment
 */
export const confirmPayment = async (paymentId: string, providerPayload: any = null) => {
  const headers = await getPublicHeaders();
  const response = await api.post(
    '/payment/confirm',
    {
      payment_id: paymentId,
      provider_payload: providerPayload,
    },
    { headers }
  );
  return response.data;
};







