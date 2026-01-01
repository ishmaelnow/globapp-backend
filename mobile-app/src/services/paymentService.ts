import api from '../config/api';

export interface PaymentIntentCreatePayload {
  ride_id: string;
  amount_usd: number;
}

export interface PaymentConfirmPayload {
  payment_id: string;
  provider: 'stripe' | 'cash';
  stripe_payment_intent_id?: string;
}

/**
 * Get payment options
 */
export const getPaymentOptions = async () => {
  const response = await api.get('/payment/options');
  return response.data;
};

/**
 * Create payment intent
 */
export const createPaymentIntent = async (payload: PaymentIntentCreatePayload) => {
  const response = await api.post('/payment/create-intent', payload);
  return response.data;
};

/**
 * Confirm payment
 */
export const confirmPayment = async (payload: PaymentConfirmPayload) => {
  const response = await api.post('/payment/confirm', payload);
  return response.data;
};

