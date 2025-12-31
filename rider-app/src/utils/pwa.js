// PWA utility functions

/**
 * Check if app is installed as PWA
 */
export const isPWAInstalled = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Show install prompt (if available)
 */
export const showInstallPrompt = async () => {
  // Check if browser supports install prompt
  if ('BeforeInstallPromptEvent' in window) {
    return null; // Will be handled by browser
  }
  
  // For iOS, show custom instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    return {
      platform: 'ios',
      instructions: 'Tap the Share button and select "Add to Home Screen"',
    };
  }
  
  return null;
};

/**
 * Register service worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

/**
 * Show notification
 */
export const showNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  }
};

