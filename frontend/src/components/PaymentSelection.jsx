import { useState, useEffect } from 'react';
import { getPaymentOptions, createPaymentIntent } from '../services/paymentService';

const PaymentSelection = ({ quote, rideId, onPaymentComplete }) => {
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadPaymentOptions();
  }, []);

  const loadPaymentOptions = async () => {
    try {
      setLoadingOptions(true);
      const response = await getPaymentOptions();
      setPaymentOptions(response.options || []);
      // Default to cash payment
      const cashOption = response.options?.find((opt) => opt.provider === 'cash' && opt.enabled);
      if (cashOption) {
        setSelectedProvider('cash');
      } else {
        // Fallback to first enabled option if cash not available
        const firstEnabled = response.options?.find((opt) => opt.enabled);
        if (firstEnabled) {
          setSelectedProvider(firstEnabled.provider);
        }
      }
    } catch (err) {
      setError('Failed to load payment options');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handlePaymentMethodSelect = (provider) => {
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
      const intent = await createPaymentIntent(rideId, quote?.quote_id, selectedProvider);
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
        // For Stripe, we would normally integrate Stripe Elements here
        // For MVP, we'll just show a success message
        if (onPaymentComplete) {
          onPaymentComplete({
            paymentId: intent.payment_id,
            status: 'requires_method',
            provider: 'stripe',
            clientSecret: intent.client_secret,
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <p className="text-gray-600">Loading payment options...</p>
      </div>
    );
  }

  if (paymentIntent) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Initialized</h3>
          {selectedProvider === 'cash' ? (
            <p className="text-gray-600">
              Cash payment selected. Please pay the driver directly when the ride is completed.
            </p>
          ) : (
            <p className="text-gray-600">
              Payment intent created. In a full implementation, Stripe Elements would be integrated here.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method: Cash or Card</h3>

      {/* Fare Breakdown */}
      {quote && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Fare Breakdown</h4>
          {quote.breakdown && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare:</span>
                <span className="text-gray-900">${quote.breakdown.base_fare?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="text-gray-900">${quote.breakdown.distance_fare?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="text-gray-900">${quote.breakdown.time_fare?.toFixed(2) || '0.00'}</span>
              </div>
              {quote.breakdown.booking_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Fee:</span>
                  <span className="text-gray-900">${quote.breakdown.booking_fee?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-primary-600 text-lg">
                    ${quote.total_estimated_usd?.toFixed(2) || quote.breakdown.total_estimated?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Payment Method
        </label>
        <div className="space-y-3">
          {paymentOptions.map((option) => (
            <label
              key={option.provider}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedProvider === option.provider
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!option.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="payment_method"
                value={option.provider}
                checked={selectedProvider === option.provider}
                onChange={() => handlePaymentMethodSelect(option.provider)}
                disabled={!option.enabled}
                className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {option.provider === 'cash' ? 'Cash' : option.provider === 'stripe' ? 'Card' : option.name}
                </div>
                {option.provider === 'cash' && (
                  <div className="text-sm text-gray-500">Pay directly to the driver</div>
                )}
                {option.provider === 'stripe' && (
                  <div className="text-sm text-gray-500">Pay with credit or debit card</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleCreatePayment}
        disabled={loading || !selectedProvider}
        className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Continue with Payment'}
      </button>
    </div>
  );
};

export default PaymentSelection;




