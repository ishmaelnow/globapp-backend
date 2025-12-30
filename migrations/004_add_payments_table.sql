-- Migration: Add payments table
-- Date: 2025-12-30
-- Description: Store payment records linked to rides

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'cash', 'stripe', etc.
    status VARCHAR(50) NOT NULL, -- 'pending_cash', 'requires_payment_method', 'confirmed', 'failed', 'refunded'
    amount_usd DECIMAL(10, 2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255), -- For Stripe payments
    stripe_client_secret VARCHAR(255), -- Temporary, for frontend
    metadata JSONB, -- Store provider-specific data
    created_at_utc TIMESTAMP NOT NULL,
    confirmed_at_utc TIMESTAMP,
    failed_at_utc TIMESTAMP,
    refunded_at_utc TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Add payment_id column to rides table (optional, for quick lookup)
-- We'll use JOIN instead, but this can be added later if needed

