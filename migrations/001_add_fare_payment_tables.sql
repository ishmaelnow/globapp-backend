-- Migration: Add fare_quotes and payments tables
-- Run this migration to add payment support to the rides system

-- Table: fare_quotes
-- Stores fare estimates with breakdown and expiration
CREATE TABLE IF NOT EXISTS fare_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    distance_miles DECIMAL(10, 2) NOT NULL,
    duration_minutes DECIMAL(10, 2) NOT NULL,
    breakdown_json JSONB NOT NULL,
    total_estimated_cents INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('estimated', 'accepted', 'expired', 'finalized')),
    created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at_utc TIMESTAMP NOT NULL
);

-- Indexes for fare_quotes
CREATE INDEX IF NOT EXISTS idx_fare_quotes_ride_id ON fare_quotes(ride_id);
CREATE INDEX IF NOT EXISTS idx_fare_quotes_status ON fare_quotes(status);
CREATE INDEX IF NOT EXISTS idx_fare_quotes_expires_at ON fare_quotes(expires_at_utc);

-- Table: payments
-- Stores payment records for rides
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'cash')),
    intent_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL CHECK (status IN ('requires_method', 'authorized', 'captured', 'failed', 'canceled', 'refunded', 'pending_cash')),
    metadata_json JSONB DEFAULT '{}',
    created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at_utc TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
-- Create index on intent_id if it exists, otherwise on provider_intent_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'intent_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_payments_intent_id ON payments(intent_id);
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'provider_intent_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_payments_provider_intent_id ON payments(provider_intent_id);
    END IF;
END $$;




