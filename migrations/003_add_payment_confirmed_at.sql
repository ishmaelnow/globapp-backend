-- Migration: Add confirmed_at_utc and rename intent_id to provider_intent_id in payments table
-- Run this after 001_add_fare_payment_tables.sql and 002_add_ride_payment_fields.sql

-- Add confirmed_at_utc column to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS confirmed_at_utc TIMESTAMP;

-- Rename intent_id to provider_intent_id if it exists and provider_intent_id doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'intent_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'provider_intent_id'
    ) THEN
        ALTER TABLE payments RENAME COLUMN intent_id TO provider_intent_id;
    END IF;
    
    -- If neither exists, add provider_intent_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'provider_intent_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN provider_intent_id VARCHAR(255);
    END IF;
END $$;

-- Update index for provider_intent_id
DROP INDEX IF EXISTS idx_payments_intent_id;
CREATE INDEX IF NOT EXISTS idx_payments_provider_intent_id ON payments(provider_intent_id);

