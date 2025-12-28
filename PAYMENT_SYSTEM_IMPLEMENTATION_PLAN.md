# Ride Cost Estimation + Payment Options - Implementation Plan

## 📋 Overview

This document outlines the complete implementation plan for adding fare estimation and payment processing to the GlobApp ride-sharing system. **No changes will be made until you review and approve this plan.**

---

## 🔍 Current Codebase Analysis

### Backend (FastAPI + PostgreSQL)
- **Framework**: FastAPI
- **Database**: PostgreSQL (using `psycopg`, raw SQL queries)
- **Auth**: API keys (`GLOBAPP_PUBLIC_API_KEY`, `GLOBAPP_ADMIN_API_KEY`) + JWT for drivers
- **Current Ride Schema**: Has `estimated_price_usd`, `estimated_distance_miles`, `estimated_duration_min`
- **Current Pricing**: Hardcoded simple calculation (`base + per_mile * distance`)

### Frontend (React + Vite)
- **Framework**: React with Vite
- **Current Flow**: `RideBooking.jsx` → `rideService.js` → `publicService.js` → API
- **Quote Display**: Shows basic price estimate before booking

---

## 📁 Files to Create/Modify

### Backend Files

#### New Files:
1. **`pricing_engine.py`** - Pricing calculation logic
2. **`distance_calculator.py`** - Haversine distance + duration estimation
3. **`payment_providers.py`** - PaymentProvider interface + StripeProvider + CashProvider
4. **`migrations/001_add_fare_payment_tables.sql`** - Database migration
5. **`migrations/002_add_ride_payment_fields.sql`** - Add payment fields to rides table
6. **`tests/test_pricing_engine.py`** - Unit tests for pricing
7. **`tests/test_payment_api.py`** - API integration tests

#### Modified Files:
1. **`app.py`** - Add new endpoints, extend existing ride creation
2. **`requirements.txt`** - Add Stripe SDK dependency

### Frontend Files

#### New Files:
1. **`frontend/src/services/paymentService.js`** - Payment API calls
2. **`frontend/src/components/PaymentSelection.jsx`** - Payment method selection UI

#### Modified Files:
1. **`frontend/src/components/RideBooking.jsx`** - Add payment selection after quote
2. **`frontend/src/services/rideService.js`** - Add fare estimation calls
3. **`frontend/package.json`** - Add Stripe.js (optional, for future full integration)

---

## 🗄️ Database Schema Changes

### 1. New Table: `fare_quotes`

```sql
CREATE TABLE fare_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    distance_miles DECIMAL(10, 2) NOT NULL,
    duration_minutes DECIMAL(10, 2) NOT NULL,
    breakdown_json JSONB NOT NULL,
    total_estimated_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('estimated', 'accepted', 'expired', 'finalized')),
    created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at_utc TIMESTAMP NOT NULL,
    INDEX idx_fare_quotes_ride_id (ride_id),
    INDEX idx_fare_quotes_status (status),
    INDEX idx_fare_quotes_expires_at (expires_at_utc)
);
```

**Fields:**
- `breakdown_json`: Stores `{base_fare, distance_fare, time_fare, booking_fee, surge_multiplier, subtotal, taxes, total_estimated}`
- `total_estimated_cents`: Stored in cents (integer) for precision
- `status`: Tracks quote lifecycle

### 2. New Table: `payments`

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'cash')),
    intent_id VARCHAR(255), -- Stripe payment_intent id
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL CHECK (status IN ('requires_method', 'authorized', 'captured', 'failed', 'canceled', 'refunded', 'pending_cash')),
    metadata_json JSONB DEFAULT '{}',
    created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    INDEX idx_payments_ride_id (ride_id),
    INDEX idx_payments_provider (provider),
    INDEX idx_payments_status (status),
    INDEX idx_payments_intent_id (intent_id)
);
```

### 3. Modify `rides` Table

```sql
ALTER TABLE rides
ADD COLUMN fare_quote_id UUID REFERENCES fare_quotes(id) ON DELETE SET NULL,
ADD COLUMN final_fare_cents INTEGER,
ADD COLUMN payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'pending_cash')),
ADD COLUMN payment_method_selected VARCHAR(20) CHECK (payment_method_selected IN ('stripe_card', 'cash')),
ADD INDEX idx_rides_fare_quote_id (fare_quote_id),
ADD INDEX idx_rides_payment_status (payment_status);
```

---

## 🔧 Backend Implementation Details

### 1. Pricing Engine (`pricing_engine.py`)

**Class**: `PricingEngine`

**Configuration (env vars):**
- `GLOBAPP_BASE_FARE_USD` (default: 4.00)
- `GLOBAPP_PER_MILE_USD` (default: 1.00)
- `GLOBAPP_PER_MINUTE_USD` (default: 0.20)
- `GLOBAPP_MINIMUM_FARE_USD` (default: 5.00)
- `GLOBAPP_BOOKING_FEE_USD` (default: 0.00)
- `GLOBAPP_SURGE_MULTIPLIER` (default: 1.0)

**Methods:**
- `calculate_fare(distance_miles, duration_minutes, surge_multiplier=1.0) -> dict`
  - Returns breakdown with all components
  - Applies minimum fare rule
  - Rounds to 2 decimals, converts to cents for storage

**Example Output:**
```python
{
    "base_fare": 4.00,
    "distance_fare": 2.60,  # 2.6 miles * $1.00
    "time_fare": 1.60,      # 8 min * $0.20
    "booking_fee": 0.00,
    "surge_multiplier": 1.0,
    "subtotal": 8.20,
    "taxes": 0.00,
    "total_estimated": 8.20  # Max(subtotal, minimum_fare)
}
```

### 2. Distance Calculator (`distance_calculator.py`)

**Class**: `DistanceCalculator`

**Methods:**
- `calculate_distance(pickup_lat, pickup_lng, dropoff_lat, dropoff_lng) -> float`
  - Uses Haversine formula (placeholder implementation)
  - Returns distance in miles

- `estimate_duration(distance_miles) -> float`
  - Heuristic: assumes average speed of 30 mph
  - Returns duration in minutes

**Note**: This is a placeholder. Can be replaced with Google Maps API or OSRM later without changing the interface.

### 3. Payment Providers (`payment_providers.py`)

**Abstract Base Class**: `PaymentProvider`

```python
class PaymentProvider(ABC):
    @abstractmethod
    def create_intent(self, amount_cents: int, currency: str, metadata: dict) -> dict:
        """Create payment intent. Returns {intent_id, client_secret, ...}"""
        pass
    
    @abstractmethod
    def confirm_payment(self, intent_id: str, payload: dict) -> dict:
        """Confirm/capture payment. Returns {status, ...}"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier: 'stripe' or 'cash'"""
        pass
```

**StripeProvider**:
- Uses Stripe SDK (`stripe` package)
- Requires `STRIPE_SECRET_KEY` env var
- Creates `PaymentIntent` objects
- Handles webhook signature verification

**CashProvider**:
- No external API calls
- Returns `pending_cash` status immediately
- Used for offline/cash payments

### 4. API Endpoints (add to `app.py`)

#### Fare Estimation

**POST `/api/v1/fare/estimate`**
- **Auth**: Public API key (optional, same as rides)
- **Body**: `{pickup: str, dropoff: str, ride_id?: UUID}`
- **Returns**: `{quote_id, breakdown, total_estimated_cents, expires_at_utc}`
- **Logic**:
  1. Parse pickup/dropoff (extract lat/lng if provided, or use placeholder)
  2. Calculate distance/duration
  3. Calculate fare using PricingEngine
  4. Create FareQuote record with status='estimated'
  5. Set expires_at = now + 15 minutes
  6. Return quote_id and breakdown

#### Accept Quote

**POST `/api/v1/fare/accept`**
- **Auth**: Public API key
- **Body**: `{quote_id: UUID, ride_id: UUID}`
- **Returns**: `{ok: true, quote_id, ride_id}`
- **Logic**:
  1. Verify quote exists and status='estimated'
  2. Verify quote not expired
  3. Verify ride exists
  4. Update quote: status='accepted', ride_id=ride_id
  5. Update ride: fare_quote_id=quote_id

#### Payment Options

**GET `/api/v1/payment/options`**
- **Auth**: Public API key
- **Returns**: `{options: [{provider: 'stripe', name: 'Card', enabled: true}, {provider: 'cash', name: 'Cash', enabled: true}]}`
- **Logic**: Check env vars to determine enabled providers

#### Create Payment Intent

**POST `/api/v1/payment/create-intent`**
- **Auth**: Public API key
- **Body**: `{ride_id: UUID, quote_id?: UUID, provider: 'stripe' | 'cash'}`
- **Returns**: 
  - Stripe: `{payment_id, client_secret, amount_cents, currency}`
  - Cash: `{payment_id, status: 'pending_cash', amount_cents, currency}`
- **Logic**:
  1. Get ride and fare quote
  2. Determine amount (from quote or final_fare if ride completed)
  3. Create Payment record with status='requires_method' (stripe) or 'pending_cash' (cash)
  4. Call provider.create_intent()
  5. Update Payment with intent_id
  6. Return client_secret (stripe) or confirmation (cash)

#### Confirm Payment

**POST `/api/v1/payment/confirm`**
- **Auth**: Public API key
- **Body**: `{payment_id: UUID, provider_payload?: dict}`
- **Returns**: `{ok: true, payment_id, status}`
- **Logic**:
  1. Get Payment record
  2. Call provider.confirm_payment()
  3. Update Payment status
  4. Update Ride payment_status

#### Finalize Fare

**POST `/api/v1/ride/{ride_id}/finalize-fare`**
- **Auth**: Admin API key (or driver token if ride assigned to driver)
- **Body**: `{actual_distance_miles?: float, actual_duration_minutes?: float}`
- **Returns**: `{ok: true, ride_id, final_fare_cents, breakdown}`
- **Logic**:
  1. Get ride (must be status='completed')
  2. Use actual distance/duration if provided, else use estimated
  3. Recalculate fare using PricingEngine
  4. Update ride: final_fare_cents, fare_quote status='finalized'
  5. Lock fare (prevent further changes)

#### Stripe Webhook

**POST `/api/v1/webhooks/stripe`**
- **Auth**: Stripe signature verification (no API key)
- **Body**: Raw Stripe event JSON
- **Headers**: `Stripe-Signature` header
- **Logic**:
  1. Verify signature using `STRIPE_WEBHOOK_SECRET`
  2. Parse event type
  3. Handle `payment_intent.succeeded` → update Payment status='captured'
  4. Handle `payment_intent.payment_failed` → update Payment status='failed'
  5. Update Ride payment_status accordingly

---

## 🎨 Frontend Implementation Details

### 1. Payment Service (`frontend/src/services/paymentService.js`)

```javascript
// Functions:
- estimateFare(pickup, dropoff, rideId?)
- acceptQuote(quoteId, rideId)
- getPaymentOptions()
- createPaymentIntent(rideId, quoteId, provider)
- confirmPayment(paymentId, providerPayload?)
```

### 2. Payment Selection Component (`frontend/src/components/PaymentSelection.jsx`)

**Props:**
- `quote`: Fare quote object
- `rideId`: UUID of created ride
- `onPaymentSelected`: Callback when payment method chosen

**UI:**
- Shows fare breakdown (base, distance, time, total)
- Radio buttons: "Card" and "Cash"
- "Pay with Card" button → calls create-intent, shows "Payment initialized"
- "Pay with Cash" button → calls create-intent (cash), shows "Cash payment selected"

### 3. Modified RideBooking Flow

**New Flow:**
1. User enters pickup/dropoff
2. Clicks "Get Price Estimate" → calls `/api/v1/fare/estimate`
3. Shows quote breakdown
4. User fills name/phone, clicks "Book Now"
5. Creates ride → gets `ride_id`
6. Shows `PaymentSelection` component
7. User selects payment method
8. Calls `/api/v1/payment/create-intent`
9. Shows confirmation message

---

## 🧪 Testing Strategy

### Unit Tests (`tests/test_pricing_engine.py`)

**Test Cases:**
1. Minimum fare enforcement
2. Surge multiplier application
3. Rounding to 2 decimals
4. Cents conversion accuracy
5. Edge cases: zero distance, zero duration

### API Integration Tests (`tests/test_payment_api.py`)

**Test Flow:**
1. Estimate fare → get quote_id
2. Create ride → get ride_id
3. Accept quote → link quote to ride
4. Create payment intent (cash) → get payment_id
5. Verify payment status = 'pending_cash'
6. Finalize fare → verify final_fare_cents set
7. Test Stripe webhook signature verification (positive + negative)

---

## 🔐 Environment Variables

### Required (Backend)

```bash
# Existing
DATABASE_URL=postgresql://...
GLOBAPP_PUBLIC_API_KEY=...
GLOBAPP_ADMIN_API_KEY=...

# New - Pricing
GLOBAPP_BASE_FARE_USD=4.00
GLOBAPP_PER_MILE_USD=1.00
GLOBAPP_PER_MINUTE_USD=0.20
GLOBAPP_MINIMUM_FARE_USD=5.00
GLOBAPP_BOOKING_FEE_USD=0.00

# New - Stripe (optional, only if using Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New - Frontend Build (optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # For future Stripe Elements integration
```

---

## 📦 Dependencies

### Backend (`requirements.txt` additions)

```
stripe>=7.0.0  # Only if using Stripe
```

### Frontend (`package.json` additions)

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.0.0"  // Optional, for future Stripe Elements
  }
}
```

---

## 🚀 Deployment Steps

### 1. Database Migration

```bash
# On Droplet
cd ~/globapp-backend
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

### 2. Backend Deployment

```bash
# Install dependencies
pip install stripe

# Update environment file
sudo nano /etc/globapp-api.env
# Add pricing and Stripe env vars

# Restart service
sudo systemctl restart globapp-api
```

### 3. Frontend Deployment

```bash
cd ~/globapp-backend/frontend
npm install  # If adding Stripe.js
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

---

## 📝 Example API Calls (cURL)

### Estimate Fare

```bash
curl -X POST https://globapp.app/api/v1/fare/estimate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Oak Ave, San Francisco, CA"
  }'
```

### Accept Quote

```bash
curl -X POST https://globapp.app/api/v1/fare/accept \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "quote_id": "uuid-here",
    "ride_id": "uuid-here"
  }'
```

### Create Payment Intent (Cash)

```bash
curl -X POST https://globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "ride_id": "uuid-here",
    "quote_id": "uuid-here",
    "provider": "cash"
  }'
```

### Finalize Fare

```bash
curl -X POST https://globapp.app/api/v1/ride/{ride_id}/finalize-fare \
  -H "Content-Type: application/json" \
  -H "X-API-Key: admincan" \
  -d '{
    "actual_distance_miles": 3.2,
    "actual_duration_minutes": 10
  }'
```

---

## ✅ Implementation Checklist

### Phase 1: Backend Core
- [ ] Create `pricing_engine.py`
- [ ] Create `distance_calculator.py`
- [ ] Create `payment_providers.py`
- [ ] Write database migrations
- [ ] Add fare estimation endpoint
- [ ] Add quote acceptance endpoint
- [ ] Add payment options endpoint
- [ ] Add payment intent creation endpoint
- [ ] Add payment confirmation endpoint
- [ ] Add fare finalization endpoint
- [ ] Add Stripe webhook endpoint

### Phase 2: Database
- [ ] Run migration 001 (fare_quotes, payments tables)
- [ ] Run migration 002 (add fields to rides)
- [ ] Verify indexes created

### Phase 3: Frontend
- [ ] Create `paymentService.js`
- [ ] Create `PaymentSelection.jsx`
- [ ] Modify `RideBooking.jsx` to integrate payment flow
- [ ] Update `rideService.js` to use new fare endpoints

### Phase 4: Testing
- [ ] Write unit tests for pricing engine
- [ ] Write API integration tests
- [ ] Test Stripe webhook signature verification
- [ ] Manual end-to-end test

### Phase 5: Deployment
- [ ] Update environment variables
- [ ] Run migrations on production
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Verify production endpoints

---

## 🎯 Key Design Decisions

1. **Cents Storage**: All monetary values stored as integers (cents) to avoid floating-point precision issues
2. **Quote Expiration**: Quotes expire after 15 minutes to prevent stale pricing
3. **Provider Abstraction**: PaymentProvider interface allows easy addition of new providers (PayPal, etc.)
4. **Audit Trail**: All payment events stored in `payments` table with timestamps
5. **Minimal Frontend**: Payment UI is minimal (stub) - full Stripe Elements integration can be added later
6. **Backward Compatible**: Existing ride creation flow still works (estimated_price_usd remains)

---

## ⚠️ Assumptions & Notes

1. **Pickup/Dropoff Parsing**: For MVP, we'll use placeholder lat/lng extraction. Full address geocoding can be added later.
2. **Stripe Integration**: Full Stripe Elements UI not included in MVP. Backend supports it, frontend shows "Payment initialized" message.
3. **Tax Calculation**: Taxes set to 0 for now. Can be added later.
4. **Surge Pricing**: Surge multiplier defaults to 1.0. Logic for dynamic surge can be added later.
5. **Refunds**: Refund logic not implemented in MVP. Status field supports it for future.

---

## 📋 Next Steps After Approval

1. **Review this plan** - Confirm approach and assumptions
2. **Approve changes** - Give go-ahead to implement
3. **Implementation** - I'll create all files according to this plan
4. **Testing** - Run tests and verify functionality
5. **Deployment** - Deploy to production following steps above

---

**Ready for your review! Please confirm:**
- ✅ Database schema looks good?
- ✅ API endpoints match your expectations?
- ✅ Frontend integration approach acceptable?
- ✅ Testing strategy sufficient?
- ✅ Any changes needed before implementation?



