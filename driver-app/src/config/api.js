import axios from 'axios';

// Base URL - can be configured via environment variable
// Set VITE_API_BASE_URL in .env.local or .env file
// Example: VITE_API_BASE_URL=https://your-app.ondigitalocean.app/api/v1
// 
// API Base URL Configuration
// - Production (on Droplet): Use relative URL '/api/v1' (same domain, no CORS)
// - Development (localhost): Use full URL or localhost
// Priority: Environment variable > Relative URL (production) > Hardcoded > Localhost
const DIGITALOCEAN_URL = 'https://globapp.app/api/v1';
const RELATIVE_URL = '/api/v1'; // Use when frontend is served from same domain as backend

// In production (on Droplet), use relative URL. In dev, use full URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                 (import.meta.env.PROD ? RELATIVE_URL : DIGITALOCEAN_URL) || 
                 'http://localhost:8000/api/v1';

// Public API Key - embedded at build time
// Set VITE_PUBLIC_API_KEY in .env.production or build environment
// This is automatically included in all public API requests
export const PUBLIC_API_KEY = import.meta.env.VITE_PUBLIC_API_KEY || '';

// Admin API Key - embedded at build time
// Set VITE_ADMIN_API_KEY in .env.production or build environment
// This is automatically included in all admin API requests
export const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

console.log('API Base URL:', BASE_URL);
console.log('Public API Key configured:', PUBLIC_API_KEY ? 'Yes' : 'No');
console.log('Public API Key value:', PUBLIC_API_KEY || '(empty)');
console.log('Admin API Key configured:', ADMIN_API_KEY ? 'Yes' : 'No');
console.log('Admin API Key value:', ADMIN_API_KEY || '(empty)');

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add Bearer token to authenticated requests
api.interceptors.request.use((config) => {
  // Check if Authorization header is already set (manual override takes precedence)
  if (!config.headers['Authorization']) {
    // Try to get access token from localStorage
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('driver_access_token');
      if (accessToken && accessToken.trim()) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
  }
  return config;
});

export default api;
export { BASE_URL };
