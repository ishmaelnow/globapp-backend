import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getPaymentOptions, createPaymentIntent } from '../services/paymentService';
import { Platform } from 'react-native';

// Conditionally import Stripe (not available in Expo Go)
let initPaymentSheet: any = null;
let presentPaymentSheet: any = null;

try {
  if (Platform.OS !== 'web') {
    const stripeModule = require('@stripe/stripe-react-native');
    initPaymentSheet = stripeModule.initPaymentSheet;
    presentPaymentSheet = stripeModule.presentPaymentSheet;
  }
} catch (error) {
  console.log('Stripe not available:', error);
}

interface PaymentSelectionProps {
  quote: any;
  rideId: string;
  onPaymentComplete: (paymentData?: any) => void;
  onClose?: () => void;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  quote,
  rideId,
  onPaymentComplete,
  onClose,
}) => {
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadPaymentOptions();
  }, []);

  const loadPaymentOptions = async () => {
    try {
      setLoadingOptions(true);
      const response = await getPaymentOptions();
      const options = response.options || [];
      setPaymentOptions(options);
      
      // Default to cash payment if available
      const cashOption = options.find((opt: any) => opt.provider === 'cash' && opt.enabled);
      if (cashOption) {
        setSelectedProvider('cash');
      } else {
        const firstEnabled = options.find((opt: any) => opt.enabled);
        if (firstEnabled) {
          setSelectedProvider(firstEnabled.provider);
        }
      }
    } catch (err: any) {
      setError('Failed to load payment options');
      console.error('Error loading payment options:', err);
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
      const intent = await createPaymentIntent(rideId, quote?.quote_id || null, selectedProvider);
      setPaymentIntent(intent);

      if (selectedProvider === 'cash') {
        // Cash payment is immediately pending
        Alert.alert(
          'Payment Initialized',
          'Cash payment selected. Please pay the driver directly when the ride is completed.',
          [
            {
              text: 'OK',
              onPress: () => {
                onPaymentComplete({
                  paymentId: intent.payment_id,
                  status: 'pending_cash',
                  provider: 'cash',
                });
              },
            },
          ]
        );
      } else if (selectedProvider === 'stripe') {
        // Initialize Stripe Payment Sheet
        if (!intent.client_secret) {
          setError('Payment intent created but client_secret is missing. Please try again.');
          return;
        }

        if (!initPaymentSheet || !presentPaymentSheet) {
          setError('Stripe is not available in Expo Go. Please use a development build or select cash payment.');
          return;
        }

        try {
          const { error: initError } = await initPaymentSheet({
            merchantDisplayName: 'GlobApp',
            paymentIntentClientSecret: intent.client_secret,
            returnURL: 'globapp://stripe-redirect',
          });

          if (initError) {
            setError(`Stripe initialization failed: ${initError.message}`);
            return;
          }

          const { error: presentError } = await presentPaymentSheet();

          if (presentError) {
            if (presentError.code !== 'Canceled') {
              setError(`Payment failed: ${presentError.message}`);
            }
            return;
          }

          // Payment successful
          Alert.alert('Success', 'Payment completed successfully!', [
            {
              text: 'OK',
              onPress: () => {
                onPaymentComplete({
                  paymentId: intent.payment_id,
                  status: 'completed',
                  provider: 'stripe',
                });
              },
            },
          ]);
        } catch (stripeError: any) {
          setError(`Stripe error: ${stripeError.message}`);
        }
      }
    } catch (err: any) {
      console.error('Payment intent creation failed:', err);
      setError(err.response?.data?.detail || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const amountUsd = quote?.total_estimated_usd || quote?.estimated_price_usd || 0;

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <Text style={styles.title}>Select Payment Method</Text>
              {onClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingOptions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading payment options...</Text>
              </View>
            ) : (
              <>
                {/* Fare Breakdown */}
                {quote && (
                  <View style={styles.quoteContainer}>
                    <Text style={styles.quoteTitle}>Fare Breakdown</Text>
                    {quote.breakdown && (
                      <View style={styles.breakdown}>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Base Fare:</Text>
                          <Text style={styles.breakdownValue}>
                            ${quote.breakdown.base_fare?.toFixed(2) || '0.00'}
                          </Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>Distance:</Text>
                          <Text style={styles.breakdownValue}>
                            ${quote.breakdown.distance_fare?.toFixed(2) || '0.00'}
                          </Text>
                        </View>
                        {quote.breakdown.time_fare > 0 && (
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Time:</Text>
                            <Text style={styles.breakdownValue}>
                              ${quote.breakdown.time_fare?.toFixed(2) || '0.00'}
                            </Text>
                          </View>
                        )}
                        {quote.breakdown.booking_fee > 0 && (
                          <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Booking Fee:</Text>
                            <Text style={styles.breakdownValue}>
                              ${quote.breakdown.booking_fee?.toFixed(2) || '0.00'}
                            </Text>
                          </View>
                        )}
                        <View style={styles.totalRow}>
                          <Text style={styles.totalLabel}>Total:</Text>
                          <Text style={styles.totalValue}>
                            ${amountUsd.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Payment Method Selection */}
                <View style={styles.paymentMethods}>
                  <Text style={styles.paymentMethodsTitle}>Choose Payment Method</Text>
                  {paymentOptions.map((option: any) => (
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
                        <View style={styles.radioContainer}>
                          <View
                            style={[
                              styles.radio,
                              selectedProvider === option.provider && styles.radioSelected,
                            ]}
                          >
                            {selectedProvider === option.provider && (
                              <View style={styles.radioInner} />
                            )}
                          </View>
                        </View>
                        <View style={styles.paymentOptionText}>
                          <Text style={styles.paymentOptionName}>
                            {option.provider === 'cash'
                              ? 'Cash'
                              : option.provider === 'stripe'
                              ? 'Card'
                              : option.name}
                          </Text>
                          <Text style={styles.paymentOptionDescription}>
                            {option.provider === 'cash'
                              ? 'Pay directly to the driver'
                              : option.provider === 'stripe'
                              ? 'Pay with credit or debit card'
                              : option.description || ''}
                          </Text>
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
                  style={[
                    styles.submitButton,
                    (loading || !selectedProvider) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleCreatePayment}
                  disabled={loading || !selectedProvider}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Continue with Payment</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  scrollView: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  quoteContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  breakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paymentOption: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paymentOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9ff',
  },
  paymentOptionDisabled: {
    opacity: 0.5,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#4CAF50',
  },
  radioInner: {
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentSelection;

