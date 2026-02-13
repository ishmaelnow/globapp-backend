import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import PaymentSelection from '../../components/PaymentSelection';
import { createRide } from '../../services/rideService';
import { estimateFare } from '../../services/paymentService';
import { normalizeAddressForGeocoding } from '../../utils/addressNormalizer';
import { setRiderPhone } from '../../utils/auth';

interface FormData {
  rider_name: string;
  rider_phone: string;
  pickup: string;
  dropoff: string;
  service_type: 'economy' | 'premium' | 'luxury';
}

interface Quote {
  quote_id?: string;
  estimated_price_usd?: number;
  total_estimated_usd?: number;
  estimated_distance_miles?: number;
  estimated_duration_min?: number;
  service_type?: string;
  breakdown?: {
    base_fare?: number;
    distance_fare?: number;
    time_fare?: number;
    booking_fee?: number;
    total_estimated?: number;
  };
}

const RiderBooking: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    rider_name: '',
    rider_phone: '',
    pickup: '',
    dropoff: '',
    service_type: 'economy',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [createdRideId, setCreatedRideId] = useState<string | null>(null);
  const [showServiceTypePicker, setShowServiceTypePicker] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const serviceTypes = [
    { label: 'Economy', value: 'economy' },
    { label: 'Premium', value: 'premium' },
    { label: 'Luxury', value: 'luxury' },
  ];

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleGetQuote = async () => {
    if (!formData.pickup || !formData.dropoff) {
      setError('Please enter both pickup and destination locations');
      return;
    }

    setQuoteLoading(true);
    setError(null);

    try {
      // Normalize addresses before sending to backend
      const normalizedPickup = normalizeAddressForGeocoding(formData.pickup);
      const normalizedDropoff = normalizeAddressForGeocoding(formData.dropoff);

      console.log('Original addresses:', {
        pickup: formData.pickup,
        dropoff: formData.dropoff,
      });
      console.log('Normalized addresses:', {
        pickup: normalizedPickup,
        dropoff: normalizedDropoff,
      });

      const quoteData = await estimateFare(normalizedPickup, normalizedDropoff, createdRideId);
      
      console.log('Quote received:', quoteData);
      setQuote(quoteData);
    } catch (err: any) {
      console.error('Error getting quote:', err);
      setError(err.response?.data?.detail || 'Failed to get quote. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.rider_name || !formData.rider_phone || !formData.pickup || !formData.dropoff) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Normalize addresses before sending to backend
      const normalizedPickup = normalizeAddressForGeocoding(formData.pickup);
      const normalizedDropoff = normalizeAddressForGeocoding(formData.dropoff);

      const rideData = {
        ...formData,
        pickup: normalizedPickup,
        dropoff: normalizedDropoff,
      };

      const response = await createRide(rideData);
      const rideId = response.ride_id;
      setCreatedRideId(rideId);

      // Save phone number for ride history
      await setRiderPhone(formData.rider_phone);

      // Build quote from ride creation response if we don't have one
      if (!quote && response.estimated_price_usd) {
        const baseFare = 4.0;
        const perMile = 2.8;
        const distanceFare = perMile * (response.estimated_distance_miles || 0);

        const rideQuote: Quote = {
          quote_id: null,
          breakdown: {
            base_fare: baseFare,
            distance_fare: Math.round(distanceFare * 100) / 100,
            time_fare: 0,
            booking_fee: 0,
            total_estimated: response.estimated_price_usd,
          },
          total_estimated_usd: response.estimated_price_usd,
          estimated_price_usd: response.estimated_price_usd,
          estimated_distance_miles: response.estimated_distance_miles || 0,
          estimated_duration_min: response.estimated_duration_min || 0,
          service_type: response.service_type || formData.service_type,
        };
        setQuote(rideQuote);
      }

      setSuccess('Ride created successfully! Please select a payment method.');
      
      // Show success alert
      Alert.alert(
        'Ride Booked!',
        `Your ride has been created. Ride ID: ${rideId}`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Your Ride</Text>
        <Text style={styles.subtitle}>Enter your details to book a ride</Text>
      </View>

      <View style={styles.form}>
        {/* Rider Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={formData.rider_name}
            onChangeText={(value) => handleInputChange('rider_name', value)}
            placeholder="John Doe"
            placeholderTextColor="#999"
          />
        </View>

        {/* Rider Phone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.rider_phone}
            onChangeText={(value) => handleInputChange('rider_phone', value)}
            placeholder="1234567890"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* Pickup Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pickup Location</Text>
          <AddressAutocomplete
            value={formData.pickup}
            onChange={handleInputChange}
            name="pickup"
            placeholder="Start typing an address..."
          />
        </View>

        {/* Destination */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destination</Text>
          <AddressAutocomplete
            value={formData.dropoff}
            onChange={handleInputChange}
            name="dropoff"
            placeholder="Start typing an address..."
          />
        </View>

        {/* Service Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Type</Text>
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={() => setShowServiceTypePicker(true)}
          >
            <Text style={styles.pickerText}>
              {serviceTypes.find((st) => st.value === formData.service_type)?.label || 'Economy'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Service Type Picker Modal */}
        <Modal
          visible={showServiceTypePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowServiceTypePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Service Type</Text>
              {serviceTypes.map((serviceType) => (
                <TouchableOpacity
                  key={serviceType.value}
                  style={[
                    styles.modalOption,
                    formData.service_type === serviceType.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    handleInputChange('service_type', serviceType.value);
                    setShowServiceTypePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      formData.service_type === serviceType.value && styles.modalOptionTextSelected,
                    ]}
                  >
                    {serviceType.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowServiceTypePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Get Quote Button */}
        {formData.pickup && formData.dropoff && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGetQuote}
            disabled={quoteLoading}
          >
            {quoteLoading ? (
              <ActivityIndicator color="#666" />
            ) : (
              <Text style={styles.secondaryButtonText}>Get Fare Estimate</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Quote Display */}
        {quote && (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteTitle}>Trip Details & Estimated Fare</Text>
            <View style={styles.quoteDetails}>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Distance:</Text>
                <Text style={styles.quoteValue}>
                  {quote.estimated_distance_miles?.toFixed(1) || '0.0'} miles
                </Text>
              </View>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteLabel}>Duration:</Text>
                <Text style={styles.quoteValue}>
                  {quote.estimated_duration_min?.toFixed(0) || '0'} min
                </Text>
              </View>
              <View style={styles.quoteTotal}>
                <Text style={styles.quoteTotalLabel}>Total:</Text>
                <Text style={styles.quoteTotalValue}>
                  ${quote.estimated_price_usd?.toFixed(2) || quote.total_estimated_usd?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Success Message */}
        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* Submit Button */}
        {!createdRideId && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Book Now</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Payment Selection */}
        {createdRideId && !paymentComplete && (
          <View style={styles.paymentContainer}>
            <PaymentSelection
              quote={quote}
              rideId={createdRideId}
              onPaymentComplete={(paymentData) => {
                setPaymentComplete(true);
                setSuccess('Payment method selected successfully! Your ride is confirmed.');
                Alert.alert(
                  'Payment Confirmed',
                  'Your ride is confirmed and payment method has been selected.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Reset form after a delay
                        setTimeout(() => {
                          setFormData({
                            rider_name: '',
                            rider_phone: '',
                            pickup: '',
                            dropoff: '',
                            service_type: 'economy',
                          });
                          setQuote(null);
                          setCreatedRideId(null);
                          setPaymentComplete(false);
                        }, 2000);
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        )}

        {/* Payment Complete Message */}
        {paymentComplete && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Payment method selected successfully! Your ride is confirmed.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  modalOptionSelected: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  quoteContainer: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
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
    borderTopColor: '#4CAF50',
  },
  quoteTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quoteTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  paymentContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  paymentSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default RiderBooking;
