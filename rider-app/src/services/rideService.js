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

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://globapp.org/api/v1';
  const response = await fetch(
    `${apiBaseUrl}/rides/my-rides?rider_phone=${encodeURIComponent(riderPhone)}&limit=50`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch rides: ${response.statusText}`);
  }

  const data = await response.json();
  // API returns a JSON array; normalize so callers can always use .rides
  const rides = Array.isArray(data) ? data : data?.rides || [];
  return { rides };
};

/** Statuses where the rider still cares about this trip on the home screen */
export const ACTIVE_RIDE_STATUSES = [
  'requested',
  'assigned',
  'enroute',
  'arrived',
  'in_progress',
];

export const CANCELLABLE_RIDE_STATUSES = [
  'requested',
  'assigned',
  'enroute',
  'arrived',
  'in_progress',
];

/**
 * Latest open ride for this phone (by created_at order from API), or null.
 */
export const getActiveRideForPhone = async (riderPhone) => {
  if (!riderPhone || !String(riderPhone).trim()) return null;
  const { rides } = await getMyRides(riderPhone.trim());
  const open = (rides || []).filter((r) =>
    ACTIVE_RIDE_STATUSES.includes(String(r.status || '').toLowerCase())
  );
  return open.length ? open[0] : null;
};

export const cancelRide = async (rideId, riderPhone) => {
  if (!rideId) throw new Error('rideId is required');
  if (!riderPhone || !String(riderPhone).trim()) {
    throw new Error('riderPhone is required');
  }
  const apiKey = getApiKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://globapp.org/api/v1';
  const response = await fetch(`${apiBaseUrl}/rides/${rideId}/cancel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ rider_phone: String(riderPhone).trim() }),
  });
  if (!response.ok) {
    let msg = `Failed to cancel ride: ${response.statusText}`;
    try {
      const err = await response.json();
      if (err?.detail) msg = err.detail;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return response.json();
};

