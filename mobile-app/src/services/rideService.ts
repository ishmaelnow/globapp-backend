import { createRide as createRideApi, getRideQuote as getRideQuoteApi } from './publicService';
import { getPublicApiKey } from '../utils/auth';
import { PUBLIC_API_KEY } from '../config/api';
import api from '../config/api';

/**
 * Get API key with fallback priority:
 * 1. AsyncStorage (if user manually entered one)
 * 2. Build-time PUBLIC_API_KEY (embedded)
 * 3. Empty string (optional)
 */
const getApiKey = async (): Promise<string> => {
  const storageKey = await getPublicApiKey();
  if (storageKey && storageKey.trim()) {
    return storageKey;
  }
  return PUBLIC_API_KEY || '';
};

/**
 * Create a new ride booking
 */
export const createRide = async (rideData: any) => {
  const apiKey = await getApiKey();
  return createRideApi(rideData, apiKey);
};

/**
 * Get a quote for a ride
 */
export const getRideQuote = async (quoteData: any) => {
  const apiKey = await getApiKey();
  return getRideQuoteApi(quoteData, apiKey);
};

/**
 * Get ride history for a rider by phone number
 */
export const getMyRides = async (riderPhone: string) => {
  const apiKey = await getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  // Strip non-digits from phone number (backend expects digits only)
  const phoneDigits = riderPhone.replace(/\D/g, '');
  
  const response = await api.get(
    `/rides/my-rides?rider_phone=${encodeURIComponent(phoneDigits)}&limit=50`,
    { headers }
  );

  if (!response.data) {
    throw new Error('Failed to fetch rides: No data returned');
  }

  // Handle both array and object responses
  if (Array.isArray(response.data)) {
    return { rides: response.data };
  }

  return response.data;
};

/**
 * Get ride details by ride ID
 */
export const getRideDetails = async (rideId: string) => {
  const apiKey = await getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const response = await api.get(`/rides/${rideId}`, { headers });

  if (!response.data) {
    throw new Error('Failed to fetch ride details: No data returned');
  }

  return response.data;
};



