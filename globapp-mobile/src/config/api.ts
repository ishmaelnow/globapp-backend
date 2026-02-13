import axios from 'axios';
import Constants from 'expo-constants';

// Mobile API Base URL Configuration
// - Native apps must use an absolute URL (no same-origin relative URLs).
// - Match web app's working URL: https://globapp.app/api/v1
//
// Priority:
// 1) process.env.EXPO_PUBLIC_API_BASE_URL (from .env file)
// 2) Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL (from app.json)
// 3) Default production URL (matches web app)
const DEFAULT_PROD_URL = 'https://globapp.app/api/v1'; // Match web app's working URL

// Read from app.json's extra section (Expo's recommended way)
const envBaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL as string | undefined;

export const BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL?.trim()) ||
  (envBaseUrl?.trim()) ||
  DEFAULT_PROD_URL;

// Public API Key - embedded at build time
// Set EXPO_PUBLIC_API_KEY in .env or app.json's extra section
const envApiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_KEY as string | undefined;
export const PUBLIC_API_KEY =
  (process.env.EXPO_PUBLIC_API_KEY?.trim()) ||
  (envApiKey?.trim()) ||
  '';

// Admin API Key (optional)
const envAdminKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_ADMIN_API_KEY as string | undefined;
export const ADMIN_API_KEY =
  (process.env.EXPO_PUBLIC_ADMIN_API_KEY?.trim()) ||
  (envAdminKey?.trim()) ||
  '';

console.log('API Base URL:', BASE_URL);
console.log('Public API Key configured:', PUBLIC_API_KEY ? 'Yes' : 'No');
console.log('Public API Key value:', PUBLIC_API_KEY || '(empty)');
console.log('Admin API Key configured:', ADMIN_API_KEY ? 'Yes' : 'No');
console.log('Admin API Key value:', ADMIN_API_KEY || '(empty)');

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add API key to ALL requests if configured
api.interceptors.request.use((config) => {
  if (PUBLIC_API_KEY) {
    config.headers = config.headers || {};
    config.headers['X-API-Key'] = PUBLIC_API_KEY;
  }
  return config;
});

export default api;
