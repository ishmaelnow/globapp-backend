# Test Stripe Payment Integration

## Prerequisites Check

### 1. Backend Setup (on Droplet)

**SSH into your Droplet:**
```bash
ssh ishmael@157.245.231.224
cd ~/globapp-backend
```

**Check if Stripe SDK is installed:**
```bash
source .venv/bin/activate
python -c "import stripe; print('Stripe version:', stripe.__version__)"
```

**If not installed, install it:**
```bash
pip install stripe
```

**Verify Stripe Secret Key is set:**
```bash
sudo cat /etc/globapp-api.env | grep STRIPE_SECRET_KEY
```

**If not set, add it:**
```bash
sudo bash -c 'echo "STRIPE_SECRET_KEY=sk_test_..." >> /etc/globapp-api.env'
sudo systemctl daemon-reload
sudo systemctl restart globapp-api
```

**Check backend is running:**
```bash
sudo systemctl status globapp-api
curl https://rider.globapp.app/api/v1/health
```

### 2. Frontend Setup (on Droplet)

**Check if Stripe publishable key is configured:**
```bash
cd ~/globapp-backend/rider-app
cat .env.production 2>/dev/null || echo "No .env.production file"
```

**If not set, create it:**
```bash
cat > .env.production << EOF
VITE_API_BASE_URL=/api/v1
VITE_PUBLIC_API_KEY=yesican
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
EOF
```

**Rebuild frontend:**
```bash
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

## Testing Steps

### Test 1: Check Payment Options Endpoint

**From your local machine or Droplet:**
```bash
curl https://rider.globapp.app/api/v1/payment/options
```

**Expected Response:**
```json
{
  "options": [
    {
      "provider": "cash",
      "name": "Cash",
      "enabled": true,
      "description": "Pay with cash on arrival"
    },
    {
      "provider": "stripe",
      "name": "Card",
      "enabled": true,
      "description": "Pay with credit or debit card"
    }
  ]
}
```

**If Stripe is not enabled:**
- Check `STRIPE_SECRET_KEY` is set in `/etc/globapp-api.env`
- Check `stripe` package is installed: `pip list | grep stripe`

### Test 2: Create a Test Ride

**Create a ride first:**
```bash
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "rider_name": "Test User",
    "rider_phone": "1234567890",
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Market St, San Francisco, CA",
    "service_type": "economy"
  }'
```

**Save the `ride_id` from the response.**

### Test 3: Create Stripe Payment Intent

**Replace `RIDE_ID` with the actual ride ID from Test 2:**
```bash
curl -X POST https://rider.globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "ride_id": "RIDE_ID",
    "provider": "stripe"
  }'
```

**Expected Response:**
```json
{
  "payment_id": "...",
  "ride_id": "...",
  "provider": "stripe",
  "status": "requires_payment_method",
  "amount_usd": 15.50,
  "client_secret": "pi_..._secret_...",
  "stripe_payment_intent_id": "pi_...",
  "created_at_utc": "..."
}
```

**If you get an error:**
- `"Stripe is not configured"` → Check `STRIPE_SECRET_KEY` in `/etc/globapp-api.env`
- `"Stripe SDK not installed"` → Run `pip install stripe` in venv
- `"Stripe error: ..."` → Check your Stripe secret key is valid

### Test 4: Test in Browser (Full Flow)

1. **Open:** `https://rider.globapp.app`

2. **Book a ride:**
   - Enter pickup: "123 Main St, San Francisco, CA"
   - Enter dropoff: "456 Market St, San Francisco, CA"
   - Click "Book Now"

3. **Select payment method:**
   - You should see two options: "Cash" and "Card"
   - Click "Card" (Stripe)

4. **Stripe checkout should appear:**
   - You should see Stripe's payment form
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Submit payment:**
   - Click "Pay Now"
   - Should show "Payment confirmed!" or success message

### Test 5: Verify Payment Confirmation

**After successful payment in browser, check backend:**
```bash
curl -X POST https://rider.globapp.app/api/v1/payment/confirm \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "payment_id": "PAYMENT_ID_FROM_STEP_3",
    "provider_payload": {
      "payment_intent_id": "pi_..."
    }
  }'
```

**Expected Response:**
```json
{
  "payment_id": "...",
  "status": "confirmed",
  "confirmed_at_utc": "...",
  "provider": "stripe",
  "stripe_payment_intent_id": "pi_..."
}
```

## Troubleshooting

### Issue: "Stripe is not configured"
**Solution:**
```bash
# On Droplet
sudo bash -c 'echo "STRIPE_SECRET_KEY=sk_test_YOUR_KEY" >> /etc/globapp-api.env'
sudo systemctl restart globapp-api
```

### Issue: "Stripe SDK not installed"
**Solution:**
```bash
# On Droplet
cd ~/globapp-backend
source .venv/bin/activate
pip install stripe
sudo systemctl restart globapp-api
```

### Issue: Stripe form doesn't appear
**Check:**
1. Frontend has `VITE_STRIPE_PUBLISHABLE_KEY` set
2. Frontend is rebuilt: `npm run build`
3. Browser console for errors (F12 → Console)

### Issue: Payment fails
**Check:**
1. Using test card numbers (not real cards)
2. Stripe secret key is from test mode (`sk_test_...`)
3. Stripe publishable key matches secret key (same account)
4. Backend logs: `sudo journalctl -u globapp-api -f`

## Stripe Test Cards

Use these test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

All test cards:
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Success Criteria

✅ Payment options endpoint returns Stripe option  
✅ Payment intent creation succeeds  
✅ Stripe checkout form appears in browser  
✅ Test card payment succeeds  
✅ Payment confirmation endpoint returns success  

## Next Steps

Once testing is successful:
1. Add payment records to database (TODO item)
2. Set up Stripe webhooks for production
3. Test with real cards (in test mode first)
4. Deploy to production with live Stripe keys



