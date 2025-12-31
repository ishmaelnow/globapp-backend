-- Quick queries to check payment records in the database
-- Run with: psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -f check_payment_records.sql

-- 1. View all recent payments
SELECT 
  id,
  ride_id,
  provider,
  status,
  amount_cents / 100.0 as amount_usd,
  currency,
  provider_intent_id,
  created_at_utc,
  confirmed_at_utc,
  updated_at_utc
FROM payments
ORDER BY created_at_utc DESC
LIMIT 10;

-- 2. View payments with ride details
SELECT 
  p.id as payment_id,
  p.provider,
  p.status,
  p.amount_cents / 100.0 as payment_amount_usd,
  p.created_at_utc as payment_created,
  p.confirmed_at_utc as payment_confirmed,
  r.id as ride_id,
  r.rider_name,
  r.pickup,
  r.dropoff,
  r.estimated_price_usd as ride_price_usd
FROM payments p
JOIN rides r ON p.ride_id = r.id
ORDER BY p.created_at_utc DESC
LIMIT 10;

-- 3. Payment statistics by provider and status
SELECT 
  provider,
  status,
  COUNT(*) as count,
  SUM(amount_cents) / 100.0 as total_amount_usd,
  AVG(amount_cents) / 100.0 as avg_amount_usd,
  MIN(created_at_utc) as first_payment,
  MAX(created_at_utc) as last_payment
FROM payments
GROUP BY provider, status
ORDER BY provider, status;

-- 4. Check Stripe payment metadata
SELECT 
  id,
  provider,
  status,
  provider_intent_id,
  amount_cents / 100.0 as amount_usd,
  metadata_json->>'client_secret' as has_client_secret,
  created_at_utc,
  confirmed_at_utc
FROM payments
WHERE provider = 'stripe'
ORDER BY created_at_utc DESC
LIMIT 5;

-- 5. Check cash payments
SELECT 
  id,
  ride_id,
  status,
  amount_cents / 100.0 as amount_usd,
  created_at_utc
FROM payments
WHERE provider = 'cash'
ORDER BY created_at_utc DESC
LIMIT 5;

-- 6. Find rides without payments (should be empty if all rides have payments)
SELECT 
  r.id,
  r.rider_name,
  r.estimated_price_usd,
  r.created_at_utc
FROM rides r
LEFT JOIN payments p ON r.id = p.ride_id
WHERE p.id IS NULL
ORDER BY r.created_at_utc DESC
LIMIT 10;

