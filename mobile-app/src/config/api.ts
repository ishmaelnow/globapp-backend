import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - connects to your existing backend
const API_BASE_URL = 'https://globapp.app/api/v1';

// Public API Key (same as web apps)
export const PUBLIC_API_KEY = 'yesican'; // You can move this to .env later

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add API key and auth token
api.interceptors.request.use(
  async (config) => {
    // Add public API key to all requests
    if (PUBLIC_API_KEY) {
      config.headers['X-API-Key'] = PUBLIC_API_KEY;
    }

    // Add driver auth token if available
    try {
      const driverAuth = await AsyncStorage.getItem('driver_auth');
      if (driverAuth) {
        const auth = JSON.parse(driverAuth);
        if (auth?.access_token) {
          config.headers['Authorization'] = `Bearer ${auth.access_token}`;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth on unauthorized
      await AsyncStorage.removeItem('driver_auth');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };

