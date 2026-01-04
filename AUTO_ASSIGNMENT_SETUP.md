# Auto-Assignment Feature Setup

## Overview

The auto-assignment feature automatically assigns the closest available driver to a ride based on proximity. It supports both:
- **Environment variable** (`.env` file) - Deployment-level default
- **Database setting** (via admin API) - Runtime toggle override

Priority: Database setting > Environment variable > Default (false)

## Setup

### Option 1: Environment Variable (Simplest)

Add to your `.env` file:

```bash
GLOBAPP_AUTO_ASSIGNMENT_ENABLED=true
```

Or set to `false` to disable (default is `false` if not set).

**Note:** Requires restart to take effect.

### Option 2: Database Table (Runtime Toggle)

Run the migration to create the `app_settings` table (optional - only needed if you want runtime toggle via API):

```bash
# SSH into your server
ssh ishmael@157.245.231.224

# Navigate to project
cd ~/globapp-backend

# Run migration
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "CREATE TABLE IF NOT EXISTS app_settings (key VARCHAR(255) PRIMARY KEY, value BOOLEAN NOT NULL, updated_at_utc TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()); INSERT INTO app_settings (key, value) VALUES ('auto_assignment_enabled', false) ON CONFLICT (key) DO NOTHING; CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);"
```

**Note:** Database setting overrides environment variable if both are set.

## API Endpoints

### 1. Get Auto-Assignment Setting

**GET** `/api/v1/admin/settings/auto-assignment`

**Headers:**
```
X-API-Key: your_admin_api_key
```

**Response:**
```json
{
  "enabled": false
}
```

### 2. Enable/Disable Auto-Assignment

**PUT** `/api/v1/admin/settings/auto-assignment`

**Headers:**
```
X-API-Key: your_admin_api_key
Content-Type: application/json
```

**Body:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "enabled": true
}
```

### 3. Auto-Assign Driver to Ride

**POST** `/api/v1/dispatch/rides/{ride_id}/auto-assign`

**Headers:**
```
X-API-Key: your_admin_api_key
```

**Response:**
```json
{
  "ok": true,
  "ride_id": "uuid",
  "assigned_driver_id": "uuid",
  "assigned_at_utc": "2025-01-XX...",
  "status": "assigned",
  "driver_name": "John Doe",
  "distance_miles": 2.5,
  "pickup_coords": {
    "lat": 32.7767,
    "lng": -96.7970
  }
}
```

## How It Works

1. **Checks if auto-assignment is enabled** - Returns error if disabled
2. **Geocodes pickup address** - Uses Nominatim to get coordinates
3. **Finds available drivers** - Queries drivers with:
   - `is_active = true`
   - Recent location data (within 1 hour)
   - No active rides
4. **Calculates distances** - Uses Haversine formula to find distance from each driver to pickup
5. **Selects closest driver** - Sorts by distance and assigns the closest one
6. **Assigns ride** - Updates ride status to "assigned" and sets `assigned_driver_id`
7. **Sends notifications** - Notifies rider and driver (if notifications available)

## Default Behavior

- **Default setting**: `false` (disabled) if neither env var nor database setting is set
- **Priority order**: 
  1. Database setting (if `app_settings` table exists and has value)
  2. Environment variable (`GLOBAPP_AUTO_ASSIGNMENT_ENABLED`)
  3. Default `false`
- **Safe fallback**: If `app_settings` table doesn't exist, falls back to env var or default
- **Manual assignment still works**: The existing `/dispatch/rides/{ride_id}/assign` endpoint continues to work regardless of auto-assignment setting

## Usage Examples

### Enable Auto-Assignment

**Via Environment Variable** (requires restart):
```bash
# Add to .env file
GLOBAPP_AUTO_ASSIGNMENT_ENABLED=true

# Restart service
sudo systemctl restart globapp-api
```

**Via Admin API** (runtime, no restart needed):
```bash
curl -X PUT https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: your_admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Disable Auto-Assignment

**Via Environment Variable** (requires restart):
```bash
# Set in .env file
GLOBAPP_AUTO_ASSIGNMENT_ENABLED=false

# Or remove the line entirely (defaults to false)
```

**Via Admin API** (runtime, no restart needed):
```bash
curl -X PUT https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: your_admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Auto-Assign a Ride

```bash
curl -X POST https://globapp.app/api/v1/dispatch/rides/{ride_id}/auto-assign \
  -H "X-API-Key: your_admin_api_key"
```

## Error Handling

- **Auto-assignment disabled**: Returns `400` with message to enable it first
- **Ride not found**: Returns `404`
- **Ride not assignable**: Returns `400` if status is not "requested" or "assigned"
- **Ride already assigned**: Returns `400` if ride already has a driver
- **Geocoding failed**: Returns `400` if pickup address cannot be geocoded
- **No drivers available**: Returns `404` if no drivers with recent location data found
- **All drivers busy**: Returns `404` if all drivers have active rides

## Integration with Existing System

- **Works alongside manual assignment**: Both endpoints can be used
- **Uses same notification system**: Sends notifications via existing `notify_ride_assigned()` function
- **Same ride status flow**: Sets status to "assigned" just like manual assignment
- **Respects driver availability**: Skips drivers with active rides

## Future Enhancements

Potential improvements you could add later:
- Maximum distance threshold (don't assign if driver is > X miles away)
- Minimum driver rating requirement
- Service type matching (economy driver for economy ride)
- Business hours only (auto-assign only during certain times)
- Percentage rollout (A/B testing - auto-assign X% of rides)

## Testing

After running the migration:

1. **Check default setting**:
   ```bash
   curl -X GET https://globapp.app/api/v1/admin/settings/auto-assignment \
     -H "X-API-Key: your_admin_api_key"
   ```
   Should return `{"enabled": false}`

2. **Enable auto-assignment**:
   ```bash
   curl -X PUT https://globapp.app/api/v1/admin/settings/auto-assignment \
     -H "X-API-Key: your_admin_api_key" \
     -H "Content-Type: application/json" \
     -d '{"enabled": true}'
   ```

3. **Create a test ride** (via rider app)

4. **Auto-assign the ride**:
   ```bash
   curl -X POST https://globapp.app/api/v1/dispatch/rides/{ride_id}/auto-assign \
     -H "X-API-Key: your_admin_api_key"
   ```

5. **Verify assignment** - Check that ride has `assigned_driver_id` set and status is "assigned"

