import api from '../config/api';

export interface RideBookingPayload {
  rider_name: string;
  rider_phone: string;
  pickup: string;
  dropoff: string;
  service_type: 'economy' | 'premium' | 'luxury';
}

export interface Ride {
  ride_id: string;
  rider_name: string;
  rider_phone_masked?: string;
  pickup: string;
  dropoff: string;
  service_type: string;
  status: string;
  estimated_distance_miles?: number;
  estimated_duration_min?: number;
  estimated_price_usd?: number;
  final_fare_usd?: number;
  created_at_utc?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
}

/**
 * Book a new ride
 */
export const bookRide = async (payload: RideBookingPayload) => {
  const response = await api.post('/rides', payload);
  return response.data;
};

/**
 * Get ride details by ID
 */
export const getRideDetails = async (rideId: string) => {
  const response = await api.get(`/rides/${rideId}`);
  return response.data;
};

/**
 * Get my rides (by phone number)
 */
export const getMyRides = async (phoneNumber: string, limit: number = 50) => {
  const response = await api.get('/rides/my-rides', {
    params: { phone: phoneNumber, limit },
  });
  return response.data;
};

/**
 * Get driver location for a ride
 */
export const getDriverLocation = async (rideId: string) => {
  const response = await api.get(`/rides/${rideId}/driver-location`);
  return response.data;
};

