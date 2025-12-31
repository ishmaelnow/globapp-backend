# Setup Stripe Publishable Key for Rider App

The Stripe publishable key needs to be configured at **build time** for Vite apps.

## Option 1: Create .env.production File (Recommended)

**On your Droplet:**

```bash
cd ~/globapp-backend/rider-app

# Create .env.production file
nano .env.production
```

**Add this line (replace with your actual Stripe publishable key):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**Save and rebuild:**
```bash
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

## Option 2: Set Environment Variable During Build

```bash
cd ~/globapp-backend/rider-app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

## Option 3: Hardcode in Code (Not Recommended, but Quick)

If you want a quick fix, you can temporarily hardcode it in `StripeCheckout.jsx`:

```javascript
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
```

**Then rebuild:**
```bash
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

## Important Notes

1. **Build Time Only:** Vite environment variables are embedded at build time, not runtime
2. **Must Rebuild:** After adding the key, you MUST rebuild the app
3. **Public Key is Safe:** The publishable key (starts with `pk_`) is safe to expose in frontend code
4. **Secret Key:** Never put the secret key (starts with `sk_`) in frontend code

## Your Stripe Keys

**Important:** Never commit secret keys to git!

- **Secret Key:** Starts with `sk_test_` (keep this secret, never commit!)
- **Publishable Key:** Starts with `pk_test_` (safe to use in frontend)

**To get your exact publishable key:**
1. Log into Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
2. Copy the "Publishable key" (starts with `pk_test_`)

## Quick Fix Command

```bash
cd ~/globapp-backend/rider-app
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE" > .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

**Note:** Replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual publishable key from Stripe dashboard!

