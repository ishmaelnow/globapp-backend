import axios from 'axios';

// Base URL - can be configured via environment variable
// Set VITE_API_BASE_URL in .env.local or .env file
// Example: VITE_API_BASE_URL=https://your-app.ondigitalocean.app/api/v1
// 
// API Base URL Configuration
// - Production (on Droplet): Use relative URL '/api/v1' (same domain, no CORS)
// - Development (localhost): Use full URL or localhost
// Priority: Environment variable > Relative URL (production) > Hardcoded > Localhost
const DIGITALOCEAN_URL = 'https://globapp.org/api/v1';
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

// Automatically add Bearer token to authenticated requests and API key to public requests
api.interceptors.request.use((config) => {
  // Automatically add public API key to all requests (like rider-app does)
  // Check localStorage first, then fall back to environment variable
  if (!config.headers['X-API-Key']) {
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('public_api_key');
      if (storedApiKey) {
        config.headers['X-API-Key'] = storedApiKey;
      } else if (PUBLIC_API_KEY) {
        config.headers['X-API-Key'] = PUBLIC_API_KEY;
      }
    } else if (PUBLIC_API_KEY) {
      config.headers['X-API-Key'] = PUBLIC_API_KEY;
    }
  }
  
  // Add Authorization Bearer token for authenticated driver endpoints
  if (!config.headers['Authorization']) {
    if (typeof window !== 'undefined') {
      try {
        const driverAuth = localStorage.getItem('driver_auth');
        if (driverAuth) {
          const auth = JSON.parse(driverAuth);
          const accessToken = auth?.access_token;
          if (accessToken && accessToken.trim()) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  
  // Debug logging for notification requests
  if (config.url && config.url.includes('/notifications')) {
    console.log('Notification API Request:', {
      url: config.url,
      params: config.params,
      hasApiKey: !!config.headers['X-API-Key'],
      hasAuth: !!config.headers['Authorization'],
    });
  }
  
  return config;
});

export default api;
export { BASE_URL };
