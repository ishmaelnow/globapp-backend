# Testing Payment Records in Database

This guide helps you verify that payment records are being correctly stored and updated in the database.

## Prerequisites

- Backend is running on the Droplet
- Database migration `004_add_payments_table.sql` has been run
- Stripe is configured (for Stripe payment testing)

## Test Scenarios

### 1. Test Cash Payment Record Creation

**Step 1: Create a ride**
```bash
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{
    "rider_name": "Test Rider",
    "rider_phone": "4155551234",
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Market St, San Francisco, CA",
    "service_type": "economy"
  }'
```

**Step 2: Create cash payment intent**
```bash
# Replace RIDE_ID with the ID from Step 1
curl -X POST https://rider.globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "ride_id": "RIDE_ID",
    "provider": "cash"
  }'
```

**Step 3: Verify payment record in database**
```bash
# SSH into Droplet first
ssh ishmael@157.245.231.224

# Query the database
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  p.id,
  p.ride_id,
  p.provider,
  p.status,
  p.amount_cents / 100.0 as amount_usd,
  p.currency,
  p.created_at_utc,
  r.rider_name,
  r.pickup,
  r.dropoff
FROM payments p
JOIN rides r ON p.ride_id = r.id
ORDER BY p.created_at_utc DESC
LIMIT 5;
"
```

### 2. Test Stripe Payment Record Creation and Update

**Step 1: Create a ride** (same as above)

**Step 2: Create Stripe payment intent**
```bash
curl -X POST https://rider.globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "ride_id": "RIDE_ID",
    "provider": "stripe"
  }'
```

**Step 3: Check payment record BEFORE confirmation**
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  id,
  ride_id,
  provider,
  status,
  amount_cents / 100.0 as amount_usd,
  provider_intent_id,
  created_at_utc,
  confirmed_at_utc
FROM payments
WHERE provider = 'stripe'
ORDER BY created_at_utc DESC
LIMIT 1;
"
```

**Expected:** `status` should be `requires_method`, `confirmed_at_utc` should be `NULL`

**Step 4: Complete payment via frontend**
- Go to https://rider.globapp.app
- Complete the payment with test card: `4242 4242 4242 4242`
- Or use API to confirm (see below)

**Step 5: Check payment record AFTER confirmation**
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  id,
  ride_id,
  provider,
  status,
  amount_cents / 100.0 as amount_usd,
  provider_intent_id,
  created_at_utc,
  confirmed_at_utc,
  updated_at_utc
FROM payments
WHERE provider = 'stripe'
ORDER BY created_at_utc DESC
LIMIT 1;
"
```

**Expected:** `status` should be `captured`, `confirmed_at_utc` should have a timestamp

### 3. Verify Payment-Ride Relationship

**Check that payments are linked to rides correctly:**
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  r.id as ride_id,
  r.rider_name,
  r.estimated_price_usd as ride_price,
  p.id as payment_id,
  p.provider,
  p.status,
  p.amount_cents / 100.0 as payment_amount,
  p.created_at_utc as payment_created
FROM rides r
LEFT JOIN payments p ON r.id = p.ride_id
ORDER BY r.created_at_utc DESC
LIMIT 10;
"
```

### 4. Check Payment Statistics

**View payment summary by provider:**
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  provider,
  status,
  COUNT(*) as count,
  SUM(amount_cents) / 100.0 as total_amount_usd,
  AVG(amount_cents) / 100.0 as avg_amount_usd
FROM payments
GROUP BY provider, status
ORDER BY provider, status;
"
```

### 5. Verify Metadata Storage (Stripe)

**Check that Stripe metadata is stored:**
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  id,
  provider,
  provider_intent_id,
  metadata_json->>'client_secret' as client_secret_preview,
  created_at_utc
FROM payments
WHERE provider = 'stripe'
ORDER BY created_at_utc DESC
LIMIT 3;
"
```

## Quick Test Commands (All-in-One)

**On your local machine, create a test script:**

```bash
# test_payment_records.sh
#!/bin/bash

echo "=== Step 1: Create Ride ==="
RIDE_RESPONSE=$(curl -s -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{
    "rider_name": "Test Rider",
    "rider_phone": "4155551234",
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Market St, San Francisco, CA",
    "service_type": "economy"
  }')

RIDE_ID=$(echo $RIDE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Ride ID: $RIDE_ID"

echo ""
echo "=== Step 2: Create Cash Payment Intent ==="
curl -X POST https://rider.globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -d "{
    \"ride_id\": \"$RIDE_ID\",
    \"provider\": \"cash\"
  }" | jq

echo ""
echo "=== Step 3: Check Database (run on Droplet) ==="
echo "Run this on the Droplet:"
echo "psql \"postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db\" -c \"SELECT * FROM payments WHERE ride_id = '$RIDE_ID';\""
```

## Expected Results

### Cash Payment:
- ✅ Record created with `provider='cash'`
- ✅ `status='pending_cash'`
- ✅ `amount_cents` matches ride price
- ✅ `ride_id` links to correct ride

### Stripe Payment:
- ✅ Record created with `provider='stripe'`
- ✅ Initial `status='requires_method'`
- ✅ `provider_intent_id` contains Stripe PaymentIntent ID
- ✅ `metadata_json` contains client_secret
- ✅ After confirmation: `status='captured'`
- ✅ `confirmed_at_utc` is set

## Troubleshooting

**If no records appear:**
1. Check backend logs: `sudo journalctl -u globapp-api -n 50`
2. Verify table exists: `psql ... -c "\d payments"`
3. Check for errors: Look for "payments table not found" warnings

**If status doesn't update:**
1. Verify Stripe webhook/confirmation endpoint is called
2. Check backend logs for update errors
3. Verify `payment_id` matches between create and confirm

## Next Steps

After verifying records are working:
- Set up payment history views in admin app
- Add payment status filters
- Create payment reports

