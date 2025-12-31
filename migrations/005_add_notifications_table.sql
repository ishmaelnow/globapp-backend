-- Migration: Add notifications table
-- Date: 2025-12-31
-- Description: Store notifications for ride events (booking, assignment, status updates)

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('rider', 'driver', 'admin')),
    recipient_id UUID, -- rider_id (from rides), driver_id, or NULL for admin (broadcast)
    notification_type VARCHAR(50) NOT NULL, -- 'ride_booked', 'ride_assigned', 'ride_enroute', 'ride_arrived', 'ride_in_progress', 'ride_completed', 'ride_cancelled'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'sms', 'email', 'push')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
    metadata_json JSONB DEFAULT '{}', -- Store additional data (phone numbers, email addresses, etc.)
    created_at_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    sent_at_utc TIMESTAMP WITHOUT TIME ZONE,
    read_at_utc TIMESTAMP WITHOUT TIME ZONE,
    error_message TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_ride_id ON notifications(ride_id);
CREATE INDEX IF NOT EXISTS idx_notifications_driver_id ON notifications(driver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_type, recipient_id, status) WHERE status != 'read';

-- Composite index for common queries (get unread notifications for a recipient)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON notifications(recipient_type, recipient_id, created_at_utc DESC) WHERE status != 'read';

