# Testing Notifications Feature

This guide helps you test that notifications are being created correctly.

## Prerequisites

- ✅ Migration `005_add_notifications_table.sql` has been run
- ✅ Backend has been restarted with latest code
- ✅ Notifications table exists in database

## Quick Test (PowerShell Script)

Run the test script from your local machine:

```powershell
.\test_notifications.ps1
```

This will:
1. Create a test ride → Should create 2 notifications (rider + admin)
2. Assign ride to driver → Should create 3 notifications (rider + driver + admin)
3. Check notifications via API

## Manual Testing Steps

### Step 1: Create a Ride

```bash
# From your local machine or Droplet
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{
    "rider_name": "Test Rider",
    "rider_phone": "4155551234",
    "pickup": "123 Main St, San Francisco, CA",
    "dropoff": "456 Market St, San Francisco, CA",
    "service_type": "economy"
  }'
```

**Expected:** Returns ride_id. Should create 2 notifications:
- One for rider (recipient_type='rider')
- One for admin (recipient_type='admin')

### Step 2: Check Notifications in Database

```bash
# SSH into Droplet
ssh ishmael@157.245.231.224
cd ~/globapp-backend

# Check notifications for the ride
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  notification_type,
  recipient_type,
  title,
  message,
  status,
  created_at_utc
FROM notifications
WHERE ride_id = 'YOUR_RIDE_ID_HERE'
ORDER BY created_at_utc;
"
```

**Expected Output:**
```
 notification_type | recipient_type |     title      |                          message                           | status  |       created_at_utc
-------------------+----------------+----------------+------------------------------------------------------------+---------+----------------------------
 ride_booked       | rider          | Ride Booked    | Your ride from 123 Main St to 456 Market St has been... | pending | 2025-12-31 08:00:00.123456
 ride_booked       | admin          | Ride Booked    | New ride request: Test Rider from 123 Main St to...    | pending | 2025-12-31 08:00:00.234567
```

### Step 3: Test API Endpoint

```bash
# Get all notifications for a ride
curl "https://rider.globapp.app/api/v1/notifications?ride_id=YOUR_RIDE_ID&limit=10"

# Get notifications for rider
curl "https://rider.globapp.app/api/v1/notifications?recipient_type=rider&recipient_id=YOUR_RIDE_ID&limit=10"

# Get notifications for admin
curl "https://rider.globapp.app/api/v1/notifications?recipient_type=admin&limit=10"
```

**Expected:** Returns JSON array of notifications

### Step 4: Assign Ride to Driver (Optional)

```bash
# First, get a driver ID (requires admin API key)
curl -X GET https://rider.globapp.app/api/v1/drivers \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"

# Assign ride to driver
curl -X POST "https://rider.globapp.app/api/v1/dispatch/rides/YOUR_RIDE_ID/assign" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_API_KEY" \
  -d '{
    "driver_id": "DRIVER_ID_HERE"
  }'
```

**Expected:** Should create 3 more notifications:
- Rider: "Your driver [name] is on the way!"
- Driver: "You've been assigned a ride..."
- Admin: "Ride assigned: [driver] → [rider]'s ride"

### Step 5: Check All Notifications

```bash
# On Droplet - see all recent notifications
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  id,
  notification_type,
  recipient_type,
  title,
  LEFT(message, 50) as message_preview,
  status,
  created_at_utc
FROM notifications
ORDER BY created_at_utc DESC
LIMIT 10;
"
```

## Expected Results

### After Ride Booking:
- ✅ 2 notifications created (rider + admin)
- ✅ Both have `notification_type = 'ride_booked'`
- ✅ Status = 'pending'
- ✅ Messages formatted correctly

### After Ride Assignment:
- ✅ 3 notifications created (rider + driver + admin)
- ✅ All have `notification_type = 'ride_assigned'`
- ✅ Driver notification has `recipient_id = driver_id`
- ✅ Messages include driver name and ride details

### After Status Update:
- ✅ 2-3 notifications created (rider + driver + admin for completed/cancelled)
- ✅ Notification type matches status (enroute → ride_enroute, etc.)

## Troubleshooting

### No Notifications Created?

1. **Check backend logs:**
   ```bash
   sudo journalctl -u globapp-api -n 50 | grep -i notification
   ```

2. **Verify table exists:**
   ```bash
   psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "\d notifications"
   ```

3. **Check for errors:**
   ```bash
   sudo journalctl -u globapp-api -n 100 | grep -i "warning\|error"
   ```

### Notifications Created But API Returns Empty?

1. **Check recipient_id matches:**
   - For riders: `recipient_id` should be `ride_id`
   - For drivers: `recipient_id` should be `driver_id`
   - For admin: `recipient_id` should be `NULL`

2. **Verify query parameters:**
   - Make sure `recipient_type` matches ('rider', 'driver', 'admin')
   - Make sure `recipient_id` matches the UUID format

### Import Errors?

If you see "ModuleNotFoundError: No module named 'notifications'":

1. **Check file exists:**
   ```bash
   ls -la ~/globapp-backend/notifications.py
   ```

2. **Check Python path:**
   ```bash
   cd ~/globapp-backend
   python -c "import notifications; print('OK')"
   ```

## Complete Test Checklist

- [ ] Migration run successfully
- [ ] Backend restarted
- [ ] Created test ride → Notifications created
- [ ] API endpoint returns notifications
- [ ] Database shows notification records
- [ ] Assigned ride → More notifications created
- [ ] Updated status → Status notifications created

## Next Steps After Testing

Once notifications are working:
1. Build frontend UI to display notifications
2. Add notification badge/count
3. Add mark as read functionality
4. Add real-time updates (polling or WebSocket)

