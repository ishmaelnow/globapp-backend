import { useState } from 'react';
import { createRide, getRideQuote } from '../services/rideService';
import { estimateFare, acceptQuote } from '../services/paymentService';
import { saveBooking } from '../utils/localStorage';
// API key is now automatically handled - no user input needed
import PaymentSelection from './PaymentSelection';
import AddressAutocomplete from './AddressAutocomplete';

const RideBooking = ({ onBookingCreated }) => {
  const [formData, setFormData] = useState({
    rider_name: '',
    rider_phone: '',
    pickup: '',
    dropoff: '',
    service_type: 'economy',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  // API key is automatically included in requests - no state needed
  const [createdRideId, setCreatedRideId] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      // Use new fare estimate endpoint
      const quoteData = await estimateFare(formData.pickup, formData.dropoff, createdRideId);
      setQuote(quoteData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get quote. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await createRide(formData);
      const rideId = response.ride_id;
      setCreatedRideId(rideId);
      
      // Build quote from ride creation response
      // If user already got a quote, use that, otherwise build from response
      let rideQuote = quote;
      if (!rideQuote && response.estimated_price_usd) {
        // Build quote from ride creation response
        // Calculate breakdown from backend response
        const baseFare = 4.00;
        const perMile = 2.80; // Match backend pricing
        const distanceFare = perMile * (response.estimated_distance_miles || 0);
        
        rideQuote = {
          quote_id: null, // No quote_id from simple ride creation
          breakdown: {
            base_fare: baseFare,
            distance_fare: Math.round(distanceFare * 100) / 100,
            time_fare: 0, // Not calculated in simple version
            booking_fee: 0,
            total_estimated: response.estimated_price_usd,
          },
          total_estimated_usd: response.estimated_price_usd,
          estimated_price_usd: response.estimated_price_usd,
          estimated_distance_miles: response.estimated_distance_miles || 0,
          estimated_duration_min: response.estimated_duration_min || 0,
          service_type: response.service_type || formData.service_type,
        };
        setQuote(rideQuote); // Update quote state for display
      } else if (rideQuote && response.estimated_price_usd) {
        // Update existing quote with ride info
        rideQuote = {
          ...rideQuote,
          estimated_price_usd: response.estimated_price_usd,
          estimated_distance_miles: response.estimated_distance_miles || rideQuote.estimated_distance_miles,
          estimated_duration_min: response.estimated_duration_min || rideQuote.estimated_duration_min,
        };
        setQuote(rideQuote);
      }
      
      // Save to localStorage for "My Bookings"
      const booking = {
        ...response,
        rider_name: formData.rider_name,
        rider_phone: formData.rider_phone,
        pickup: formData.pickup,
        dropoff: formData.dropoff,
        service_type: formData.service_type,
        booked_at: new Date().toISOString(),
      };
      saveBooking(booking);

      setSuccess('Ride created! Please select a payment method.');
      setPaymentComplete(false);
    } catch (err) {
      console.error('Booking error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || err.message || 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // API key handling removed - automatically included in requests

  const handlePaymentComplete = (paymentData) => {
    setPaymentComplete(true);
    setSuccess('Payment method selected successfully! Your ride is confirmed.');
    
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
      
      // Notify parent component
      if (onBookingCreated) {
        onBookingCreated();
      }
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Ride</h2>
            <p className="text-gray-600">Enter your details to book a ride</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rider Name */}
          <div>
            <label htmlFor="rider_name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="rider_name"
              name="rider_name"
              value={formData.rider_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Rider Phone */}
          <div>
            <label htmlFor="rider_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="rider_phone"
              name="rider_phone"
              value={formData.rider_phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="1234567890"
              required
            />
          </div>

          {/* Pickup Location */}
          <div>
            <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location
            </label>
            <AddressAutocomplete
              id="pickup"
              name="pickup"
              value={formData.pickup}
              onChange={handleChange}
              placeholder="Start typing an address..."
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <AddressAutocomplete
              id="dropoff"
              name="dropoff"
              value={formData.dropoff}
              onChange={handleChange}
              placeholder="Start typing an address..."
              required
            />
          </div>

          {/* Service Type */}
          <div>
            <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              id="service_type"
              name="service_type"
              value={formData.service_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          {/* Get Quote Button */}
          {formData.pickup && formData.dropoff && (
            <button
              type="button"
              onClick={handleGetQuote}
              disabled={quoteLoading}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quoteLoading ? 'Getting Quote...' : 'Get Fare Estimate'}
            </button>
          )}

          {/* Quote Display */}
          {quote && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">Trip Details & Estimated Fare</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Distance: {quote.estimated_distance_miles} miles</p>
                  <p className="text-sm text-gray-600">Duration: {quote.estimated_duration_min} minutes</p>
                </div>
                <div className="text-2xl font-bold text-primary-600">
                  ${quote.estimated_price_usd?.toFixed(2) || quote.total_estimated_usd?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit Button - Hide after booking */}
          {!createdRideId && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? 'Booking...' : 'Book Now'}
            </button>
          )}
        </form>

        {/* Payment Selection - Show after ride is created */}
        {createdRideId && !paymentComplete && (
          <div className="mt-6">
            <PaymentSelection
              quote={quote}
              rideId={createdRideId}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RideBooking;

