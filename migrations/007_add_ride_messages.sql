-- Migration: Add ride_messages table for driver-rider in-app chat
-- Run this on the droplet/DB before using chat endpoints

CREATE TABLE IF NOT EXISTS ride_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('rider', 'driver')),
    sender_id UUID NULL,
    message_text TEXT NOT NULL,
    created_at_utc TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_ride_messages_ride_id ON ride_messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_messages_created ON ride_messages(created_at_utc);
