import React from 'react';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Conditionally import StripeProvider - only works in development builds, not Expo Go
let StripeProvider: any = null;
let STRIPE_PUBLISHABLE_KEY = '';

try {
  if (Platform.OS !== 'web') {
    // Only try to use Stripe in native builds (not Expo Go)
    const stripeModule = require('@stripe/stripe-react-native');
    StripeProvider = stripeModule.StripeProvider;
    const keysModule = require('./src/config/keys');
    STRIPE_PUBLISHABLE_KEY = keysModule.STRIPE_PUBLISHABLE_KEY || '';
  }
} catch (error) {
  console.log('Stripe not available (likely using Expo Go):', error);
}

export default function App() {
  const AppContent = () => <AppNavigator />;

  // Wrap with StripeProvider only if available and key is set
  if (StripeProvider && STRIPE_PUBLISHABLE_KEY) {
    return (
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <AppContent />
      </StripeProvider>
    );
  }

  // Otherwise, render without StripeProvider (works in Expo Go)
  return <AppContent />;
}
