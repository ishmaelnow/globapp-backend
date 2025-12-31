# Run Notifications Migration

This guide helps you add the notifications feature to your GlobApp backend.

## Step 1: Run Database Migration

SSH into your Droplet and run the migration:

```bash
ssh ishmael@157.245.231.224
cd ~/globapp-backend

# Run the migration
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -f migrations/005_add_notifications_table.sql
```

## Step 2: Verify Table Creation

```bash
# Check the table was created
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "\d notifications"
```

You should see the `notifications` table with all columns and indexes.

## Step 3: Pull Latest Code

```bash
cd ~/globapp-backend
git pull origin main
```

## Step 4: Restart Backend

```bash
sudo systemctl restart globapp-api
sleep 3
sudo systemctl status globapp-api
```

## Step 5: Test Notifications

### Test 1: Create a ride (should trigger notification)

From your local machine:
```powershell
.\test_payment_records.ps1
```

### Test 2: Check notifications in database

On Droplet:
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "
SELECT 
  id,
  ride_id,
  recipient_type,
  notification_type,
  title,
  message,
  status,
  created_at_utc
FROM notifications
ORDER BY created_at_utc DESC
LIMIT 10;
"
```

### Test 3: Test API endpoint

```bash
# Get all notifications
curl https://rider.globapp.app/api/v1/notifications?limit=10

# Get notifications for a specific ride
curl "https://rider.globapp.app/api/v1/notifications?ride_id=YOUR_RIDE_ID&limit=10"

# Get notifications for a driver
curl "https://rider.globapp.app/api/v1/notifications?recipient_type=driver&recipient_id=YOUR_DRIVER_ID&limit=10"
```

## Expected Behavior

After running the migration and restarting:

1. **When a ride is booked:**
   - Notification created for rider (recipient_type='rider', recipient_id=ride_id)
   - Notification created for admin (recipient_type='admin', recipient_id=NULL)

2. **When a ride is assigned:**
   - Notification created for rider
   - Notification created for driver (recipient_type='driver', recipient_id=driver_id)
   - Notification created for admin

3. **When ride status updates:**
   - Notifications created for rider and driver
   - Notifications created for admin on completion/cancellation

## Troubleshooting

**If notifications table doesn't exist:**
- Check migration file exists: `ls migrations/005_add_notifications_table.sql`
- Run migration again: `psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -f migrations/005_add_notifications_table.sql`

**If notifications aren't being created:**
- Check backend logs: `sudo journalctl -u globapp-api -n 50 | grep -i notification`
- Verify `notifications.py` file exists: `ls notifications.py`
- Check for import errors in logs

**If API endpoint returns empty:**
- Check table has data: `SELECT COUNT(*) FROM notifications;`
- Verify recipient_type and recipient_id match your query

## Next Steps

After notifications are working:
1. Add frontend UI to display notifications
2. Add real-time updates (WebSocket or polling)
3. Add SMS/email channels (Twilio, SendGrid, etc.)
4. Add push notifications (Firebase, OneSignal, etc.)

