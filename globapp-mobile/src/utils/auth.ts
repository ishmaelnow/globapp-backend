import AsyncStorage from '@react-native-async-storage/async-storage';

const PUBLIC_API_KEY_STORAGE = 'public_api_key';
const ADMIN_API_KEY_STORAGE = 'admin_api_key';
const RIDER_PHONE_STORAGE = 'rider_phone';
const DRIVER_ID_STORAGE = 'driver_id';
const ADMIN_ID_STORAGE = 'admin_id';

/**
 * Get stored public API key
 * EXACT COPY from web app - returns empty string if not found
 */
export const getPublicApiKey = async (): Promise<string> => {
  try {
    const key = await AsyncStorage.getItem(PUBLIC_API_KEY_STORAGE);
    return key || '';
  } catch (error) {
    console.error('Error getting public API key:', error);
    return '';
  }
};

/**
 * Set public API key
 */
export const setPublicApiKey = async (apiKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(PUBLIC_API_KEY_STORAGE, apiKey);
  } catch (error) {
    console.error('Error setting public API key:', error);
  }
};

/**
 * Get stored admin API key
 */
export const getAdminApiKey = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ADMIN_API_KEY_STORAGE);
  } catch (error) {
    console.error('Error getting admin API key:', error);
    return null;
  }
};

/**
 * Set admin API key
 */
export const setAdminApiKey = async (apiKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ADMIN_API_KEY_STORAGE, apiKey);
  } catch (error) {
    console.error('Error setting admin API key:', error);
  }
};

/**
 * Get stored rider phone
 */
export const getRiderPhone = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(RIDER_PHONE_STORAGE);
  } catch (error) {
    console.error('Error getting rider phone:', error);
    return null;
  }
};

/**
 * Set rider phone
 */
export const setRiderPhone = async (phone: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(RIDER_PHONE_STORAGE, phone);
  } catch (error) {
    console.error('Error setting rider phone:', error);
  }
};

/**
 * Clear rider phone
 */
export const clearRiderPhone = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RIDER_PHONE_STORAGE);
  } catch (error) {
    console.error('Error clearing rider phone:', error);
  }
};

/**
 * Get stored driver ID
 */
export const getDriverId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DRIVER_ID_STORAGE);
  } catch (error) {
    console.error('Error getting driver ID:', error);
    return null;
  }
};

/**
 * Set driver ID
 */
export const setDriverId = async (driverId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(DRIVER_ID_STORAGE, driverId);
  } catch (error) {
    console.error('Error setting driver ID:', error);
  }
};

/**
 * Get stored admin ID
 */
export const getAdminId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ADMIN_ID_STORAGE);
  } catch (error) {
    console.error('Error getting admin ID:', error);
    return null;
  }
};

/**
 * Set admin ID
 */
export const setAdminId = async (adminId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ADMIN_ID_STORAGE, adminId);
  } catch (error) {
    console.error('Error setting admin ID:', error);
  }
};

/**
 * Clear all auth data
 */
export const clearAllAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      PUBLIC_API_KEY_STORAGE,
      ADMIN_API_KEY_STORAGE,
      RIDER_PHONE_STORAGE,
      DRIVER_ID_STORAGE,
      ADMIN_ID_STORAGE,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

