import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createRide } from '../../services/rideService';
import { estimateFare } from '../../services/paymentService';
import { normalizePhone } from '../../utils/phoneUtils';
import { setRiderPhone } from '../../utils/auth';
import PaymentSelection from '../../components/PaymentSelection';

const RiderBooking = () => {
  const [formData, setFormData] = useState({
    rider_name: '',
    rider_phone: '',
    pickup: '',
    dropoff: '',
    service_type: 'economy',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [createdRideId, setCreatedRideId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
      const quoteData = await estimateFare(formData.pickup, formData.dropoff, createdRideId);
      setQuote(quoteData);
      setSuccess(`Estimated fare: $${quoteData.total_estimated_usd || quoteData.estimated_price_usd || 'N/A'}`);
    } catch (err: any) {
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
      // Normalize phone number
      const normalizedPhone = normalizePhone(formData.rider_phone.trim());
      
      const rideData = {
        ...formData,
        rider_phone: normalizedPhone,
      };

      const response = await createRide(rideData);
      const rideId = response.ride_id;
      setCreatedRideId(rideId);

      // Store phone number for history
      await setRiderPhone(normalizedPhone);

      // Build quote from ride creation response if not already available
      let rideQuote = quote;
      if (!rideQuote && response.estimated_price_usd) {
        rideQuote = {
          quote_id: null,
          breakdown: {
            base_fare: 4.0,
            distance_fare: response.estimated_distance_miles ? response.estimated_distance_miles * 2.8 : 0,
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

      setSuccess('Ride created! Please select a payment method.');
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    Alert.alert('Success', 'Payment method selected successfully! Your ride is confirmed.');
    
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
      setSuccess(null);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Book Your Ride</Text>
        <Text style={styles.subtitle}>Enter your details to book a ride</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && !showPaymentModal && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        <View style={styles.form}>
          {/* Rider Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={formData.rider_name}
              onChangeText={(value) => handleChange('rider_name', value)}
            />
          </View>

          {/* Rider Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234567890"
              value={formData.rider_phone}
              onChangeText={(value) => handleChange('rider_phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Pickup Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Location</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St, City, State"
              value={formData.pickup}
              onChangeText={(value) => handleChange('pickup', value)}
            />
          </View>

          {/* Dropoff Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="456 Oak Ave, City, State"
              value={formData.dropoff}
              onChangeText={(value) => handleChange('dropoff', value)}
            />
          </View>

          {/* Service Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Type</Text>
            <View style={styles.serviceTypeContainer}>
              {['economy', 'premium', 'luxury'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.serviceButton,
                    formData.service_type === type && styles.serviceButtonActive,
                  ]}
                  onPress={() => handleChange('service_type', type)}
                >
                  <Text
                    style={[
                      styles.serviceButtonText,
                      formData.service_type === type && styles.serviceButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quote Display */}
          {quote && (
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteTitle}>Estimated Fare</Text>
              <Text style={styles.quoteAmount}>
                ${quote.total_estimated_usd || quote.estimated_price_usd || 'N/A'}
              </Text>
              {quote.estimated_distance_miles && (
                <Text style={styles.quoteDetails}>
                  Distance: {quote.estimated_distance_miles.toFixed(1)} miles
                </Text>
              )}
              {quote.estimated_duration_min && (
                <Text style={styles.quoteDetails}>
                  Duration: {quote.estimated_duration_min} minutes
                </Text>
              )}
            </View>
          )}

          {/* Get Quote Button */}
          <TouchableOpacity
            style={[styles.button, styles.quoteButton]}
            onPress={handleGetQuote}
            disabled={quoteLoading || !formData.pickup || !formData.dropoff}
          >
            {quoteLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Price Quote</Text>
            )}
          </TouchableOpacity>

          {/* Book Ride Button */}
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Book Ride</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Selection Modal */}
      {showPaymentModal && createdRideId && (
        <PaymentSelection
          quote={quote}
          rideId={createdRideId}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 20,
  },
  form: {
    marginTop: 10,
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  serviceButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  serviceButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  serviceButtonTextActive: {
    color: '#fff',
  },
  quoteContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  quoteTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  quoteAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  quoteDetails: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteButton: {
    backgroundColor: '#2196F3',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  successContainer: {
    backgroundColor: '#efe',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RiderBooking;
