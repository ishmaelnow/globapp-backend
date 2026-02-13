// Stripe Publishable Key
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

console.log('Stripe Key configured:', STRIPE_PUBLISHABLE_KEY ? 'Yes' : 'No');
console.log('Google Maps Key configured:', GOOGLE_MAPS_API_KEY ? 'Yes' : 'No');

