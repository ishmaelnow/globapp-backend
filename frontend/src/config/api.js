import axios from 'axios';

// Base URL - can be configured via environment variable
// Set VITE_API_BASE_URL in .env.local or .env file
// Example: VITE_API_BASE_URL=https://your-app.ondigitalocean.app/api/v1
// 
// DigitalOcean backend URL - confirmed: https://globapp.app/
// API endpoints follow pattern: https://globapp.app/api/v1/...
// Priority: Environment variable (for production builds) > Hardcoded > Localhost
const DIGITALOCEAN_URL = 'https://globapp.app/api/v1';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || DIGITALOCEAN_URL || 'http://localhost:8000/api/v1';

console.log('API Base URL:', BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { BASE_URL };
