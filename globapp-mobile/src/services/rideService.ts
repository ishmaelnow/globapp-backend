import {
  createRide as createRideApi,
  getRideQuote as getRideQuoteApi,
} from "./publicService";
import { getPublicApiKey } from "../utils/auth";
import { PUBLIC_API_KEY } from "../config/api";
import Constants from 'expo-constants';

/**
 * Get API key with fallback priority:
 * 1. AsyncStorage (if user manually entered one)
 * 2. Build-time PUBLIC_API_KEY (embedded)
 * 3. Empty string (optional)
 */
const getApiKey = async (): Promise<string> => {
  const storageKey = await getPublicApiKey();
  if (storageKey?.trim()) {
    return storageKey.trim();
  }
  return (PUBLIC_API_KEY || "").trim();
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
 * EXACT COPY from web app - rider-app/src/services/rideService.js (lines 38-58)
 * Only changes for React Native:
 * 1. getApiKey() is async (uses AsyncStorage instead of localStorage)
 * 2. Use Expo env vars (process.env.EXPO_PUBLIC_API_BASE_URL) instead of VITE
 */
export const getMyRides = async (riderPhone: string) => {
  // Web app: const apiKey = getApiKey(); (synchronous)
  // Mobile: await getApiKey() (async because AsyncStorage is async)
  const apiKey = await getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  // Web app: import.meta.env.VITE_API_BASE_URL || 'https://globapp.app/api/v1'
  // Mobile: process.env.EXPO_PUBLIC_API_BASE_URL || Constants || 'https://globapp.app/api/v1'
  const envBaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL as string | undefined;
  const apiBaseUrl = 
    (process.env.EXPO_PUBLIC_API_BASE_URL?.trim()) ||
    (envBaseUrl?.trim()) ||
    'https://globapp.app/api/v1';
  
  // EXACT COPY from web app - same fetch call, same URL format
  const response = await fetch(
    `${apiBaseUrl}/rides/my-rides?rider_phone=${encodeURIComponent(riderPhone)}&limit=50`,
    { headers }
  );

  // EXACT COPY from web app - same error handling
  if (!response.ok) {
    throw new Error(`Failed to fetch rides: ${response.statusText}`);
  }

  // EXACT COPY from web app - same return
  return response.json();
};
