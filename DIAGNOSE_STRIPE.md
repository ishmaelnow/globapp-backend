# Quick Stripe Diagnosis

Run these commands on your Droplet to diagnose the issue:

```bash
cd ~/globapp-backend

# 1. Test backend payment intent creation
curl -X POST https://rider.globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "ride_id": "test-123",
    "provider": "stripe"
  }' 2>&1 | head -20

# 2. Check if Stripe key is actually in the build
cd rider-app
grep -r "VITE_STRIPE_PUBLISHABLE_KEY" dist/ 2>/dev/null | head -5 || echo "Key not found in build"

# 3. Check .env.production
cat .env.production

# 4. Test payment options endpoint
curl https://rider.globapp.app/api/v1/payment/options
```

Then check browser console (F12) when testing - look for:
- "Creating payment intent..."
- "Payment intent created:" (check if client_secret exists)
- "StripeCheckout rendered:" (check what it says)



