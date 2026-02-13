// Driver Auth Storage
export const saveDriverAuth = (authData) => {
  localStorage.setItem('driver_auth', JSON.stringify(authData));
};

export const getDriverAuth = () => {
  const auth = localStorage.getItem('driver_auth');
  return auth ? JSON.parse(auth) : null;
};

export const clearDriverAuth = () => {
  localStorage.removeItem('driver_auth');
};

export const getDriverAccessToken = () => {
  const auth = getDriverAuth();
  return auth?.access_token || null;
};

export const getDriverRefreshToken = () => {
  const auth = getDriverAuth();
  return auth?.refresh_token || null;
};

export const getDriverId = () => {
  const auth = getDriverAuth();
  const driverId = auth?.driver_id;
  // Ensure we return a string, not an object
  if (!driverId) return null;
  
  // If it's already a string, return it
  if (typeof driverId === 'string') {
    // Validate it's not '[object Object]'
    if (driverId === '[object Object]') {
      console.error('Driver ID is corrupted string "[object Object]"');
      return null;
    }
    return driverId;
  }
  
  // If it's an object, try to extract the UUID string
  if (typeof driverId === 'object' && driverId !== null) {
    console.warn('Driver ID is an object, attempting to extract UUID:', driverId);
    
    // Check if it's a UUID object with _j property (common UUID library format)
    if (driverId._j && typeof driverId._j === 'string') {
      console.log('Extracted UUID from _j property:', driverId._j);
      return driverId._j;
    }
    
    // Check if it has a toString method
    if (typeof driverId.toString === 'function') {
      const str = driverId.toString();
      if (str !== '[object Object]' && str.length > 0) {
        return str;
      }
    }
    
    // Try common UUID object properties
    if (driverId.value && typeof driverId.value === 'string') {
      return driverId.value;
    }
    if (driverId.uuid && typeof driverId.uuid === 'string') {
      return driverId.uuid;
    }
    if (driverId.id && typeof driverId.id === 'string') {
      return driverId.id;
    }
    
    console.error('Could not extract UUID string from object:', driverId);
    return null;
  }
  
  // Fallback: convert to string
  const str = String(driverId);
  if (str === '[object Object]' || str === 'null' || str === 'undefined') {
    return null;
  }
  return str;
};

// API Key Storage
export const savePublicApiKey = (key) => {
  localStorage.setItem('public_api_key', key);
};

export const getPublicApiKey = () => {
  return localStorage.getItem('public_api_key') || '';
};

export const saveAdminApiKey = (key) => {
  localStorage.setItem('admin_api_key', key);
};

export const getAdminApiKey = () => {
  return localStorage.getItem('admin_api_key') || '';
};

