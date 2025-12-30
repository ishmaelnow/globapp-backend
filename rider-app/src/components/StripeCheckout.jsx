import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { confirmPayment } from '../services/paymentService';

// Initialize Stripe (use publishable key from env or hardcode for now)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const StripeCheckoutForm = ({ clientSecret, paymentId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const result = await confirmPayment(paymentId, {
          payment_intent_id: paymentIntent.id,
        });

        if (onSuccess) {
          onSuccess({
            paymentId,
            status: 'confirmed',
            provider: 'stripe',
            stripePaymentIntentId: paymentIntent.id,
          });
        }
      } else {
        setError('Payment was not successful');
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const StripeCheckout = ({ clientSecret, paymentId, onSuccess, onError }) => {
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  // Debug logging
  console.log('StripeCheckout rendered:', { 
    hasClientSecret: !!clientSecret, 
    paymentId, 
    hasStripePromise: !!stripePromise,
    stripeKeySet: !!stripeKey,
    stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) : 'MISSING'
  });

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <strong>Error:</strong> Payment intent not available. Please try again.
        <br />
        <small>Client secret is missing from payment intent response.</small>
      </div>
    );
  }

  if (!stripeKey || !stripeKey.startsWith('pk_')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <strong>Configuration Error:</strong> Stripe publishable key is not configured.
        <br />
        <small>
          Please set VITE_STRIPE_PUBLISHABLE_KEY in .env.production and rebuild the frontend.
          <br />
          Current value: {stripeKey || '(empty)'}
        </small>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <strong>Stripe Error:</strong> Failed to initialize Stripe SDK.
        <br />
        <small>Check browser console for details.</small>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeCheckoutForm
        clientSecret={clientSecret}
        paymentId={paymentId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripeCheckout;

