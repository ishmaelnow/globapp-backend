import api from '../config/api';

/**
 * Get ride details including pickup and dropoff locations
 */
export const getRideDetails = async (rideId) => {
  const response = await api.get(`/rides/${rideId}`);
  return response.data;
};

/**
 * Geocode an address to get coordinates
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'GlobApp Driver App'
        }
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Get driver's current location from browser geolocation
 */
export const getCurrentDriverLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

/**
 * Calculate estimated time of arrival
 * @param {number} distanceMiles - Distance in miles
 * @param {number} speedMph - Speed in miles per hour (default: 30 mph average city speed)
 * @returns {number} - Estimated time in minutes
 */
export const calculateETA = (distanceMiles, speedMph = 30) => {
  if (distanceMiles <= 0) return 0;
  const hours = distanceMiles / speedMph;
  return Math.ceil(hours * 60); // Return in minutes, rounded up
};

