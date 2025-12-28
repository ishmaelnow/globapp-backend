# Payment Feature - Step-by-Step Testing Guide

## Prerequisites

Before testing, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js and npm installed
- ✅ PostgreSQL database running
- ✅ Database connection string (`DATABASE_URL`)

---

## Step 1: Install Dependencies

### Backend Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- `fastapi`
- `uvicorn`
- `psycopg` (PostgreSQL adapter)
- `pydantic`
- `stripe` (optional, only if using Stripe)

### Frontend Dependencies
```bash
cd frontend
npm install
```

---

## Step 2: Run Database Migrations

**IMPORTANT**: Run these migrations before starting the server!

```bash
# Set your database URL (or use your existing method)
# Windows PowerShell:
$env:DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Or create a .env file with DATABASE_URL

# Run migrations
psql $env:DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $env:DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

**Verify migrations ran successfully:**
```bash
psql $env:DATABASE_URL -c "\d fare_quotes"
psql $env:DATABASE_URL -c "\d payments"
psql $env:DATABASE_URL -c "\d rides"  # Should show new payment columns
```

You should see:
- `fare_quotes` table exists
- `payments` table exists
- `rides` table has new columns: `fare_quote_id`, `final_fare_cents`, `payment_status`, `payment_method_selected`

---

## Step 3: Set Environment Variables

Create a `.env` file in the root directory (or set them in your environment):

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
GLOBAPP_PUBLIC_API_KEY=yesican
GLOBAPP_ADMIN_API_KEY=admincan

# Optional - Pricing Configuration (defaults provided)
GLOBAPP_BASE_FARE_USD=4.00
GLOBAPP_PER_MILE_USD=1.00
GLOBAPP_PER_MINUTE_USD=0.20
GLOBAPP_MINIMUM_FARE_USD=5.00
GLOBAPP_BOOKING_FEE_USD=0.00

# Optional - Stripe (only if using Stripe payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note**: For testing, you can skip Stripe keys - cash payments will work without them.

---

## Step 4: Start Backend Server

Open a terminal and run:

```bash
# Make sure you're in the project root
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test backend is running:**
```bash
curl http://localhost:8000/api/health
```

Should return: `{"ok": true}`

---

## Step 5: Start Frontend Dev Server

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser to: `http://localhost:5173`

---

## Step 6: Test Payment Feature via Frontend UI

### 6.1 Test Fare Estimation

1. **Navigate to Booking Page**
   - Go to `http://localhost:5173`
   - Click on "Book a Ride" or navigate to booking page

2. **Enter Locations**
   - **Pickup Location**: `123 Main St, San Francisco, CA`
   - **Destination**: `456 Oak Ave, San Francisco, CA`

3. **Get Price Estimate**
   - Click **"Get Price Estimate"** button
   - **Expected**: You should see a price estimate box showing:
     - Distance: ~2.6 miles (placeholder)
     - Duration: ~8 minutes (placeholder)
     - Price: ~$6.60 (base $4.00 + distance $2.60)

4. **Verify Quote Details**
   - The quote should show breakdown (if using new endpoint)
   - Note the quote ID if displayed

### 6.2 Test Ride Booking with Payment

1. **Fill in Rider Details**
   - **Name**: `John Doe`
   - **Phone**: `1234567890`
   - **Pickup**: `123 Main St, San Francisco, CA`
   - **Destination**: `456 Oak Ave, San Francisco, CA`
   - **Service Type**: `Economy` (default)

2. **Book Ride**
   - Click **"Book Now"** button
   - **Expected**: 
     - Success message: "Ride created! Please select a payment method."
     - Payment selection component appears below the form

3. **Select Payment Method**
   - **Payment Selection Component** should show:
     - Fare breakdown (base fare, distance, time, total)
     - Radio buttons for payment methods:
       - "Card" (if Stripe configured)
       - "Cash" (always available)

4. **Choose Cash Payment**
   - Select **"Cash"** radio button
   - Click **"Continue with Payment"**
   - **Expected**:
     - Success message: "Payment method selected successfully! Your ride is confirmed."
     - Green checkmark icon
     - Message: "Cash payment selected. Please pay the driver directly when the ride is completed."

5. **Verify Payment Created**
   - Check browser console (F12) for any errors
   - Form should reset after 3 seconds

---

## Step 7: Test via API (Optional - Advanced)

You can also test the endpoints directly using `curl` or Postman:

### 7.1 Test Fare Estimate Endpoint

```bash
curl -X POST http://localhost:8000/api/v1/fare/estimate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Oak Ave, San Francisco, CA"
  }'
```

**Expected Response:**
```json
{
  "quote_id": "uuid-here",
  "breakdown": {
    "base_fare": 4.0,
    "distance_fare": 2.6,
    "time_fare": 1.6,
    "booking_fee": 0.0,
    "surge_multiplier": 1.0,
    "subtotal": 8.2,
    "taxes": 0.0,
    "total_estimated": 8.2
  },
  "total_estimated_cents": 820,
  "total_estimated_usd": 8.2,
  "expires_at_utc": "2025-12-28T12:30:00Z"
}
```

### 7.2 Test Create Ride

```bash
curl -X POST http://localhost:8000/api/v1/rides \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "rider_name": "John Doe",
    "rider_phone": "1234567890",
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Oak Ave, San Francisco, CA",
    "service_type": "economy"
  }'
```

**Expected Response:**
```json
{
  "ride_id": "uuid-here",
  "status": "requested",
  "created_at_utc": "2025-12-28T12:00:00Z",
  "rider_phone_masked": "***7890"
}
```

**Save the `ride_id` for next steps!**

### 7.3 Test Accept Quote

```bash
curl -X POST http://localhost:8000/api/v1/fare/accept \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "quote_id": "quote-uuid-from-step-7.1",
    "ride_id": "ride-uuid-from-step-7.2"
  }'
```

### 7.4 Test Get Payment Options

```bash
curl -X GET http://localhost:8000/api/v1/payment/options \
  -H "X-API-Key: yesican"
```

**Expected Response:**
```json
{
  "options": [
    {
      "provider": "cash",
      "name": "Cash",
      "enabled": true
    }
  ]
}
```

(Stripe option appears only if `STRIPE_SECRET_KEY` is set)

### 7.5 Test Create Payment Intent (Cash)

```bash
curl -X POST http://localhost:8000/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "ride_id": "ride-uuid-from-step-7.2",
    "quote_id": "quote-uuid-from-step-7.1",
    "provider": "cash"
  }'
```

**Expected Response:**
```json
{
  "payment_id": "payment-uuid",
  "status": "pending_cash",
  "amount_cents": 820,
  "currency": "USD"
}
```

### 7.6 Verify Payment in Database

```bash
psql $env:DATABASE_URL -c "SELECT id, ride_id, provider, status, amount_cents FROM payments ORDER BY created_at_utc DESC LIMIT 1;"
```

Should show your payment record with `status = 'pending_cash'`.

---

## Step 8: Test Complete Flow (End-to-End)

### Full User Journey:

1. ✅ User opens booking page
2. ✅ User enters pickup/destination
3. ✅ User clicks "Get Price Estimate"
4. ✅ Fare breakdown appears
5. ✅ User fills in name and phone
6. ✅ User clicks "Book Now"
7. ✅ Ride is created
8. ✅ Payment selection appears
9. ✅ User selects "Cash"
10. ✅ User clicks "Continue with Payment"
11. ✅ Payment intent created
12. ✅ Success message shown
13. ✅ Form resets

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'pricing_engine'"

**Solution:**
- Make sure `pricing_engine.py` exists in the root directory
- Make sure you're running `uvicorn app:app` from the root directory
- Check Python path: `python -c "import pricing_engine"`

### Issue: "Table 'fare_quotes' does not exist"

**Solution:**
- Run database migrations:
  ```bash
  psql $env:DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
  psql $env:DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
  ```

### Issue: Payment Selection Component Not Appearing

**Check:**
1. Browser console (F12) for JavaScript errors
2. Network tab - are API calls succeeding?
3. Is `createdRideId` state being set?
4. Check React DevTools - is component rendering?

**Solution:**
- Restart frontend dev server: `npm run dev`
- Clear browser cache: `Ctrl + Shift + R`
- Check `PaymentSelection.jsx` exists in `frontend/src/components/`

### Issue: "Failed to get quote"

**Check:**
1. Is backend server running?
2. Is API key correct?
3. Check backend logs for errors

**Solution:**
- Verify backend is running: `curl http://localhost:8000/api/health`
- Check API key matches: `GLOBAPP_PUBLIC_API_KEY=yesican`
- Check backend terminal for error messages

### Issue: "Failed to create payment intent"

**Check:**
1. Does ride exist?
2. Does quote exist?
3. Is provider valid ('stripe' or 'cash')?

**Solution:**
- Verify ride was created successfully
- Check database: `SELECT * FROM rides ORDER BY created_at_utc DESC LIMIT 1;`
- Use 'cash' provider for testing (no external dependencies)

### Issue: Stripe Not Working

**Solution:**
- Stripe requires `STRIPE_SECRET_KEY` environment variable
- For testing, use 'cash' payment method instead
- Stripe full integration requires Stripe Elements UI (not included in MVP)

---

## Expected Database State After Testing

After completing a full test, you should have:

**`rides` table:**
- 1+ ride records
- `fare_quote_id` set (if quote was accepted)
- `payment_status` = 'pending_cash' (if cash payment selected)

**`fare_quotes` table:**
- 1+ quote records
- `status` = 'accepted' or 'estimated'
- `breakdown_json` with fare details

**`payments` table:**
- 1+ payment records
- `provider` = 'cash'
- `status` = 'pending_cash'
- `amount_cents` = fare amount in cents

---

## Next Steps After Testing

1. ✅ Verify all endpoints work
2. ✅ Test error handling (invalid data, missing fields)
3. ✅ Test with multiple rides
4. ✅ Verify database records are correct
5. ⏳ (Optional) Set up Stripe test keys for card payments
6. ⏳ (Optional) Test fare finalization endpoint

---

## Quick Test Checklist

- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] Database migrations ran successfully
- [ ] Fare estimate endpoint works
- [ ] Ride creation works
- [ ] Payment selection component appears
- [ ] Cash payment can be selected
- [ ] Payment intent is created
- [ ] Database records are created correctly
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

**Need Help?** Check the browser console (F12) and backend terminal logs for detailed error messages.


