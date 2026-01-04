-- Migration: Add app_settings table
-- Date: 2025-01-XX
-- Description: Store application settings/feature flags (e.g., auto-assignment toggle)

CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(255) PRIMARY KEY,
    value BOOLEAN NOT NULL,
    updated_at_utc TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Default: auto-assignment OFF (manual assignment by default)
INSERT INTO app_settings (key, value) 
VALUES ('auto_assignment_enabled', false)
ON CONFLICT (key) DO NOTHING;

-- Index for faster lookups (though primary key already provides this)
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

