import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
// Try to import expo-web-browser, fallback if not available
let WebBrowser: any = null;
try {
  WebBrowser = require('expo-web-browser');
} catch (e) {
  console.warn('expo-web-browser not available, using Linking fallback');
}
import { getPaymentOptions, createPaymentIntent, confirmPayment } from '../services/paymentService';

interface PaymentSelectionProps {
  quote: any;
  rideId: string;
  onPaymentComplete: (paymentData: any) => void;
}

interface PaymentOption {
  provider: string;
  name: string;
  enabled: boolean;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  quote,
  rideId,
  onPaymentComplete,
}) => {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadPaymentOptions();
  }, []);

  // Handle deep linking for Stripe payment return
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, [paymentIntent]);

  const handleDeepLink = async (event: { url: string }) => {
    const { url } = event;
    
    if (url.includes('stripe_payment_success') && paymentIntent) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const paymentIntentId = urlParams.get('payment_intent');
      const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

      if (paymentIntentId && paymentIntentClientSecret) {
        try {
          // Confirm payment with backend
          const result = await confirmPayment(paymentIntent.payment_id, {
            payment_intent_id: paymentIntentId,
          });

          if (onPaymentComplete) {
            onPaymentComplete({
              paymentId: paymentIntent.payment_id,
              status: 'confirmed',
              provider: 'stripe',
              stripePaymentIntentId: paymentIntentId,
            });
          }
        } catch (err: any) {
          setError(err.response?.data?.detail || 'Failed to confirm payment');
        }
      }
    } else if (url.includes('stripe_payment_cancel')) {
      setError('Payment was cancelled');
      setPaymentIntent(null);
    }
  };

  const loadPaymentOptions = async () => {
    try {
      setLoadingOptions(true);
      const response = await getPaymentOptions();
      setPaymentOptions(response.options || []);
      
      // Default to cash payment if available
      const cashOption = response.options?.find(
        (opt: PaymentOption) => opt.provider === 'cash' && opt.enabled
      );
      if (cashOption) {
        setSelectedProvider('cash');
      } else {
        // Fallback to first enabled option
        const firstEnabled = response.options?.find((opt: PaymentOption) => opt.enabled);
        if (firstEnabled) {
          setSelectedProvider(firstEnabled.provider);
        }
      }
    } catch (err: any) {
      console.error('Error loading payment options:', err);
      setError('Failed to load payment options');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handlePaymentMethodSelect = (provider: string) => {
    setSelectedProvider(provider);
    setError(null);
  };

  const handleCreatePayment = async () => {
    if (!selectedProvider) {
      setError('Please select a payment method');
      return;
    }

    if (!rideId) {
      setError('Ride ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating payment intent:', { rideId, provider: selectedProvider });
      const intent = await createPaymentIntent(
        rideId,
        quote?.quote_id || null,
        selectedProvider
      );
      console.log('Payment intent created:', {
        paymentId: intent.payment_id,
        provider: intent.provider,
        hasClientSecret: !!intent.client_secret,
      });
      setPaymentIntent(intent);

      if (selectedProvider === 'cash') {
        // Cash payment is immediately pending
        if (onPaymentComplete) {
          onPaymentComplete({
            paymentId: intent.payment_id,
            status: 'pending_cash',
            provider: 'cash',
          });
        }
      } else if (selectedProvider === 'stripe') {
        // Open Stripe checkout in web browser
        if (intent.client_secret && intent.checkout_url) {
          await openStripeCheckout(intent.checkout_url, intent);
        } else {
          setError('Stripe checkout URL not available');
        }
      }
    } catch (err: any) {
      console.error('Payment intent creation failed:', err);
      setError(err.response?.data?.detail || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openStripeCheckout = async (checkoutUrl: string, intent: any) => {
    try {
      if (WebBrowser && WebBrowser.openBrowserAsync) {
        // Use expo-web-browser if available
        const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
          enableBarCollapsing: false,
          showInRecents: true,
        });

        // Handle browser result
        if (result.type === 'cancel') {
          setError('Payment was cancelled');
          setPaymentIntent(null);
        }
      } else {
        // Fallback to Linking for opening URL
        const canOpen = await Linking.canOpenURL(checkoutUrl);
        if (canOpen) {
          await Linking.openURL(checkoutUrl);
        } else {
          setError('Cannot open payment page. Please install expo-web-browser.');
        }
      }
    } catch (err: any) {
      console.error('Error opening Stripe checkout:', err);
      setError('Failed to open payment page');
    }
  };

  if (loadingOptions) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading payment options...</Text>
      </View>
    );
  }

  if (paymentIntent && selectedProvider === 'cash') {
    // Cash payment success
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Payment Method Selected</Text>
          <Text style={styles.successText}>
            Cash payment selected. Please pay the driver directly.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Payment Method</Text>

        {/* Fare Breakdown */}
        {quote && (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteTitle}>Fare Breakdown</Text>
            {quote.breakdown && (
              <View style={styles.quoteDetails}>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Base Fare:</Text>
                  <Text style={styles.quoteValue}>
                    ${quote.breakdown.base_fare?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={styles.quoteRow}>
                  <Text style={styles.quoteLabel}>Distance:</Text>
                  <Text style={styles.quoteValue}>
                    ${quote.breakdown.distance_fare?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={styles.quoteTotal}>
                  <Text style={styles.quoteTotalLabel}>Total:</Text>
                  <Text style={styles.quoteTotalValue}>
                    ${quote.total_estimated_usd?.toFixed(2) ||
                      quote.breakdown.total_estimated?.toFixed(2) ||
                      '0.00'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Payment Method Selection */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.provider}
              style={[
                styles.paymentOption,
                selectedProvider === option.provider && styles.paymentOptionSelected,
                !option.enabled && styles.paymentOptionDisabled,
              ]}
              onPress={() => option.enabled && handlePaymentMethodSelect(option.provider)}
              disabled={!option.enabled}
            >
              <View style={styles.paymentOptionContent}>
                <View style={styles.radioButton}>
                  {selectedProvider === option.provider && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionName}>
                    {option.provider === 'cash'
                      ? 'Cash'
                      : option.provider === 'stripe'
                      ? 'Card'
                      : option.name}
                  </Text>
                  {option.provider === 'cash' && (
                    <Text style={styles.paymentOptionDescription}>
                      Pay directly to the driver
                    </Text>
                  )}
                  {option.provider === 'stripe' && (
                    <Text style={styles.paymentOptionDescription}>
                      Pay with credit or debit card
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreatePayment}
          disabled={loading || !selectedProvider}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm Payment Method</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  quoteContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quoteDetails: {
    gap: 8,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteLabel: {
    fontSize: 14,
    color: '#666',
  },
  quoteValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  quoteTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  quoteTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quoteTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentMethodsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  paymentOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 20,
    margin: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#2e7d32',
  },
});

export default PaymentSelection;

