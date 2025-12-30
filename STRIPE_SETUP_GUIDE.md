# Stripe Payment Integration Setup Guide

## Backend Setup

### 1. Install Stripe Python SDK

```bash
cd ~/globapp-backend
source .venv/bin/activate  # or your venv path
pip install stripe
```

### 2. Get Stripe API Keys

1. Sign up at https://stripe.com
2. Go to Developers → API Keys
3. Copy your **Secret Key** (starts with `sk_`)
4. Copy your **Publishable Key** (starts with `pk_`)

### 3. Set Environment Variables

Add to `/etc/globapp-api.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
```

Then restart backend:
```bash
sudo systemctl restart globapp-api
```

## Frontend Setup

### 1. Install Stripe Dependencies

```bash
cd ~/globapp-backend/rider-app
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Set Stripe Publishable Key

Create `.env.production` in `rider-app/`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key
```

Or set it when building:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... npm run build
```

### 3. Rebuild and Deploy

```bash
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider
```

## Testing

### Test Mode
- Use test keys (start with `sk_test_` and `pk_test_`)
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Production Mode
- Use live keys (start with `sk_live_` and `pk_live_`)
- Real cards will be charged

## How It Works

1. **User selects "Card" payment** → Frontend calls `/api/v1/payment/create-intent`
2. **Backend creates Stripe PaymentIntent** → Returns `client_secret`
3. **Frontend shows Stripe Elements** → User enters card details
4. **User submits payment** → Stripe processes payment
5. **Frontend confirms with backend** → Backend verifies with Stripe
6. **Payment confirmed** → Ride booking complete

## Security Notes

- ✅ Secret key stays on backend (never exposed to frontend)
- ✅ Publishable key is safe to expose (used in frontend)
- ✅ Payment verification happens server-side
- ✅ PCI compliance handled by Stripe Elements

