-- Migration: Add payment-related fields to rides table
-- Run this after 001_add_fare_payment_tables.sql

-- Add payment fields to rides table
ALTER TABLE rides
ADD COLUMN IF NOT EXISTS fare_quote_id UUID REFERENCES fare_quotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS final_fare_cents INTEGER,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'pending_cash')),
ADD COLUMN IF NOT EXISTS payment_method_selected VARCHAR(20) CHECK (payment_method_selected IN ('stripe_card', 'cash'));

-- Indexes for rides payment fields
CREATE INDEX IF NOT EXISTS idx_rides_fare_quote_id ON rides(fare_quote_id);
CREATE INDEX IF NOT EXISTS idx_rides_payment_status ON rides(payment_status);


