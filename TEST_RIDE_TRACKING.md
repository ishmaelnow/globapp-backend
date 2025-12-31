# Test Ride Tracking - Troubleshooting

## Issue: "Ride not found" or No Tracking Visible

### Step 1: Check if Backend Endpoint is Available

**On Droplet, test the endpoint directly:**

```bash
# Test with a known ride ID
curl -X GET "https://globapp.app/api/v1/rides/94df0d7f-ecd9-4c80-86e9-69245bc7d441" \
  -H "X-API-Key: yesican" \
  -H "Content-Type: application/json"
```

**If you get 404:**
- Ride doesn't exist in database
- Use a different ride ID from your bookings

**If you get 401:**
- API key issue
- Check `/etc/globapp-api.env` has `GLOBAPP_PUBLIC_API_KEY` set

**If you get 500:**
- Backend error - check logs: `sudo journalctl -u globapp-api -n 50`

### Step 2: Restart Backend (Required!)

**After adding new endpoints, restart backend:**

```bash
sudo systemctl restart globapp-api
sudo systemctl status globapp-api
```

### Step 3: Verify Ride Exists

**Check database for the ride:**

```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT id, rider_name, status, driver_id, created_at_utc 
FROM rides 
WHERE id = '94df0d7f-ecd9-4c80-86e9-69245bc7d441';
"
```

**If no results:**
- Ride doesn't exist - use a ride ID from "My Bookings"

**If ride exists but no driver_id:**
- Ride hasn't been assigned yet
- Tracking won't show until driver is assigned

### Step 4: Test with Active Ride

**For tracking to show, ride must:**
1. ✅ Exist in database
2. ✅ Have `driver_id` assigned
3. ✅ Status be: `assigned`, `enroute`, `arrived`, or `in_progress`
4. ✅ Driver must have updated location (via driver app)

**Get a ride ID that meets these requirements:**

```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT id, rider_name, status, driver_id 
FROM rides 
WHERE driver_id IS NOT NULL 
  AND status IN ('assigned', 'enroute', 'arrived', 'in_progress')
ORDER BY created_at_utc DESC 
LIMIT 5;
"
```

### Step 5: Check Driver Location

**If ride has driver, check if driver location exists:**

```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT dl.driver_id, dl.lat, dl.lng, dl.updated_at_utc
FROM driver_locations dl
JOIN rides r ON r.driver_id = dl.driver_id
WHERE r.id = 'YOUR_RIDE_ID_HERE';
"
```

**If no location:**
- Driver hasn't updated location yet
- Driver needs to use driver app to update location
- Map will show pickup/dropoff but no driver marker

## Quick Fix Checklist

- [ ] Backend restarted? (`sudo systemctl restart globapp-api`)
- [ ] Ride exists in database?
- [ ] Ride has driver assigned?
- [ ] Ride status is active?
- [ ] Driver has updated location?
- [ ] Frontend rebuilt and deployed?
- [ ] Browser cache cleared? (Hard refresh: Ctrl+Shift+R)

## Test Flow

1. **Create a new ride** → Get ride ID
2. **Assign driver** (via admin app)
3. **Driver updates location** (via driver app - "Update Location" tab)
4. **View ride** → "Ride Details" → Enter ride ID → Should see map!

