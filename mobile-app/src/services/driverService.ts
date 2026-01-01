import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DriverLoginPayload {
  phone: string;
  pin: string;
}

export interface DriverLocationPayload {
  lat: number;
  lng: number;
  heading_deg?: number | null;
  speed_mph?: number | null;
  accuracy_m?: number | null;
}

/**
 * Driver login
 */
export const driverLogin = async (payload: DriverLoginPayload) => {
  const response = await api.post('/driver/login', payload);
  
  // Store auth token
  if (response.data.access_token) {
    await AsyncStorage.setItem('driver_auth', JSON.stringify({
      access_token: response.data.access_token,
      driver_id: response.data.driver_id,
    }));
  }
  
  return response.data;
};

/**
 * Get assigned ride
 */
export const getAssignedRide = async () => {
  const response = await api.get('/drivers/me/assigned-ride');
  return response.data;
};

/**
 * Update ride status
 */
export const updateRideStatus = async (rideId: string, status: string) => {
  const response = await api.post(`/rides/${rideId}/status`, { status });
  return response.data;
};

/**
 * Update driver location
 */
export const updateDriverLocation = async (payload: DriverLocationPayload) => {
  const response = await api.post('/drivers/me/location', payload);
  return response.data;
};

/**
 * Get my rides (driver)
 */
export const getDriverRides = async (status: string | null = null, limit: number = 50) => {
  const params: any = { limit };
  if (status) params.status = status;
  
  const response = await api.get('/drivers/me/rides', { params });
  return response.data;
};

/**
 * Logout driver
 */
export const driverLogout = async () => {
  await AsyncStorage.removeItem('driver_auth');
};

