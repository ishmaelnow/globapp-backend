import api from '../config/api';
import { getPublicApiKey } from '../utils/auth';
import { PUBLIC_API_KEY } from '../config/api';

const getApiKey = async (): Promise<string> => {
  const storageKey = await getPublicApiKey();
  if (storageKey && storageKey.trim()) {
    return storageKey;
  }
  return PUBLIC_API_KEY || '';
};

/**
 * Get driver location for a specific driver
 */
export const getDriverLocation = async (driverId: string) => {
  const response = await api.get(`/drivers/${driverId}/location`);
  return response.data;
};

/**
 * Get ride details including driver information
 */
export const getRideWithDriver = async (rideId: string) => {
  const apiKey = await getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://globapp.app/api/v1';
  const response = await fetch(`${BASE_URL}/rides/${rideId}`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch ride: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

/**
 * Calculate estimated time of arrival
 */
export const calculateETA = (distanceMiles: number, speedMph: number = 30): number => {
  if (distanceMiles <= 0) return 0;
  const hours = distanceMiles / speedMph;
  return Math.ceil(hours * 60); // Return in minutes, rounded up
};

