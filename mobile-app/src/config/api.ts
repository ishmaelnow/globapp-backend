import axios from 'axios';

// Base URL - can be configured via environment variable
// Set EXPO_PUBLIC_API_BASE_URL in .env file
const DIGITALOCEAN_URL = 'https://globapp.app/api/v1';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DIGITALOCEAN_URL;

// Public API Key - from environment variable
export const PUBLIC_API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

// Admin API Key - from environment variable
export const ADMIN_API_KEY = process.env.EXPO_PUBLIC_ADMIN_API_KEY || '';

console.log('API Base URL:', BASE_URL);
console.log('Public API Key configured:', PUBLIC_API_KEY ? 'Yes' : 'No');
console.log('Admin API Key configured:', ADMIN_API_KEY ? 'Yes' : 'No');

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add public API key to ALL requests if configured
api.interceptors.request.use((config) => {
  if (PUBLIC_API_KEY) {
    config.headers['X-API-Key'] = PUBLIC_API_KEY;
  }
  return config;
});

export default api;
export { BASE_URL };


































