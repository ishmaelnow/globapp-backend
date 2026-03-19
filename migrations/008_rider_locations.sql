-- Live rider GPS for active rides (driver map). Run once per database.
CREATE TABLE IF NOT EXISTS rider_locations (
    ride_id UUID PRIMARY KEY REFERENCES rides(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    accuracy_m DOUBLE PRECISION,
    updated_at_utc TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rider_locations_updated ON rider_locations(updated_at_utc);
