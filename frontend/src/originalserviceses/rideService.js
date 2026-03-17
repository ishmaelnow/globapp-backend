import { createRide as createRideApi, getRideQuote as getRideQuoteApi } from './publicService';
import { getPublicApiKey } from '../utils/auth';

/**
 * Create a new ride booking
 */
export const createRide = async (rideData) => {
  const apiKey = getPublicApiKey();
  return createRideApi(rideData, apiKey);
};

/**
 * Get a quote for a ride
 */
export const getRideQuote = async (quoteData) => {
  const apiKey = getPublicApiKey();
  return getRideQuoteApi(quoteData, apiKey);
};

