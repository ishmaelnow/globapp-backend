/**
 * Local storage utilities for storing bookings locally
 * Note: This is a temporary solution since there's no public API endpoint
 * to fetch rides. In production, this should be replaced with an API call.
 */

const BOOKINGS_KEY = 'globapp_bookings';

/**
 * Get all bookings from localStorage
 * @returns {Array} Array of bookings
 */
export const getBookings = () => {
  try {
    const bookings = localStorage.getItem(BOOKINGS_KEY);
    return bookings ? JSON.parse(bookings) : [];
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
    return [];
  }
};

/**
 * Save a booking to localStorage
 * @param {Object} booking - Booking object to save
 */
export const saveBooking = (booking) => {
  try {
    const bookings = getBookings();
    bookings.unshift(booking); // Add to beginning
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving booking to localStorage:', error);
  }
};

/**
 * Clear all bookings from localStorage
 */
export const clearBookings = () => {
  try {
    localStorage.removeItem(BOOKINGS_KEY);
  } catch (error) {
    console.error('Error clearing bookings from localStorage:', error);
  }
};

