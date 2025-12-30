# Run Payment Records Migration

## Safe Migration Steps

This migration adds a `payments` table to store payment records. The code is already updated to use it, but will gracefully fall back if the table doesn't exist yet.

### Step 1: Run Migration on Droplet

```bash
# SSH into Droplet
ssh ishmael@157.245.231.224

# Navigate to project
cd ~/globapp-backend

# Run migration (replace with your actual database connection details)
psql $DATABASE_URL -f migrations/004_add_payments_table.sql

# OR if DATABASE_URL is not set, use:
# psql -h localhost -U globapp_user -d globapp_db -f migrations/004_add_payments_table.sql
```

### Step 2: Verify Table Created

```bash
# Check if table exists
psql $DATABASE_URL -c "\d payments"

# Should show:
# - id (uuid)
# - ride_id (uuid)
# - provider (varchar)
# - status (varchar)
# - amount_usd (decimal)
# - stripe_payment_intent_id (varchar)
# - created_at_utc (timestamp)
# - confirmed_at_utc (timestamp)
# etc.
```

### Step 3: Test Payment (No Changes Needed)

The code already handles the table gracefully:
- **If table exists**: Payment records are stored
- **If table doesn't exist**: Payment still works, just logs a message

### Step 4: Restart Backend (Optional)

```bash
sudo systemctl restart globapp-api
```

## What This Enables

✅ **Payment History**: All payments stored in database  
✅ **Ride-Payment Linking**: Link payments to specific rides  
✅ **Analytics**: Query payment data for reports  
✅ **Cash Payments**: Track cash payments too  
✅ **Status Tracking**: Track payment status changes  

## Rollback (If Needed)

```bash
# Drop the table (only if you need to rollback)
psql $DATABASE_URL -c "DROP TABLE IF EXISTS payments CASCADE;"
```

The code will continue working without the table (it gracefully handles missing table).

## Testing

After migration, test a payment:
1. Book a ride
2. Select payment method (cash or card)
3. Complete payment
4. Check database:

```bash
# View recent payments
psql $DATABASE_URL -c "SELECT id, ride_id, provider, status, amount_usd, created_at_utc FROM payments ORDER BY created_at_utc DESC LIMIT 5;"
```

