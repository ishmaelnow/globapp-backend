import { createRide as createRideApi, getRideQuote as getRideQuoteApi } from './publicService';
import { getPublicApiKey } from '../utils/auth';
import { PUBLIC_API_KEY } from '../config/api';

/**
 * Get API key with fallback priority:
 * 1. localStorage (if user manually entered one)
 * 2. Build-time PUBLIC_API_KEY (embedded)
 * 3. Empty string (optional)
 */
const getApiKey = () => {
  const localStorageKey = getPublicApiKey();
  // Only use localStorage if it has a non-empty value
  // Otherwise, use the embedded PUBLIC_API_KEY
  if (localStorageKey && localStorageKey.trim()) {
    return localStorageKey;
  }
  return PUBLIC_API_KEY || '';
};

/**
 * Create a new ride booking
 */
export const createRide = async (rideData) => {
  return createRideApi(rideData, getApiKey());
};

/**
 * Get a quote for a ride
 */
export const getRideQuote = async (quoteData) => {
  return getRideQuoteApi(quoteData, getApiKey());
};

/**
 * Get ride history for a rider by phone number
 */
export const getMyRides = async (riderPhone) => {
  const apiKey = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const response = await fetch(
    `${apiUrl}/api/v1/rides/my-rides?rider_phone=${encodeURIComponent(riderPhone)}&limit=50`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch rides: ${response.statusText}`);
  }

  return response.json();
};

