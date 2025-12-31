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
  return auth?.driver_id || null;
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

