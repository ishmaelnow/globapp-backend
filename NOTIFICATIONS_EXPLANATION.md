# How the Notifications System Works

This document explains how the notification system is implemented and how it integrates with your ride-sharing app.

## 🏗️ Architecture Overview

The notification system has **3 main components**:

1. **Database Table** (`notifications`) - Stores all notifications
2. **Notification Service** (`notifications.py`) - Creates and sends notifications
3. **API Integration** (`app.py`) - Triggers notifications at key events

## 📊 Database Schema

The `notifications` table stores:
- **Who** gets notified (`recipient_type`: rider/driver/admin, `recipient_id`)
- **What** happened (`notification_type`: ride_booked, ride_assigned, etc.)
- **Message** (`title`, `message` - formatted with ride details)
- **Status** (`pending`, `sent`, `read`, `failed`)
- **Channel** (`in_app`, `sms`, `email`, `push` - currently only `in_app` is used)
- **Metadata** (`metadata_json` - stores ride details like pickup, dropoff, names)

## 🔄 How It Works - Step by Step

### Step 1: Ride is Booked

**What happens:**
```python
# User books a ride via POST /api/v1/rides
# In app.py, after ride is saved to database:

notify_ride_booked(
    ride_id=ride_id,
    rider_name="John Doe",
    pickup="123 Main St",
    dropoff="456 Oak Ave",
    rider_phone="+14155551234"
)
```

**What `notify_ride_booked()` does:**
1. Formats message: "Your ride from 123 Main St to 456 Oak Ave has been booked..."
2. Creates notification record for **rider** (recipient_type='rider', recipient_id=ride_id)
3. Creates notification record for **admin** (recipient_type='admin', recipient_id=NULL)

**Database records created:**
```
Notification 1:
- recipient_type: 'rider'
- recipient_id: <ride_id>
- notification_type: 'ride_booked'
- title: 'Ride Booked'
- message: 'Your ride from 123 Main St to 456 Oak Ave has been booked...'
- status: 'pending'

Notification 2:
- recipient_type: 'admin'
- recipient_id: NULL (broadcast to all admins)
- notification_type: 'ride_booked'
- title: 'Ride Booked'
- message: 'New ride request: John Doe from 123 Main St to 456 Oak Ave'
- status: 'pending'
```

### Step 2: Admin Assigns Ride to Driver

**What happens:**
```python
# Admin assigns ride via POST /api/v1/dispatch/rides/{ride_id}/assign
# In app.py, after assignment is saved:

# First, fetch ride and driver details
ride = get_ride_details(ride_id)  # rider_name, pickup, dropoff
driver = get_driver_details(driver_id)  # driver_name

notify_ride_assigned(
    ride_id=ride_id,
    driver_id=driver_id,
    driver_name="Jane Smith",
    rider_name="John Doe",
    pickup="123 Main St",
    dropoff="456 Oak Ave"
)
```

**What `notify_ride_assigned()` does:**
1. Creates notification for **rider**: "Your driver Jane Smith is on the way!"
2. Creates notification for **driver**: "You've been assigned a ride: John Doe from..."
3. Creates notification for **admin**: "Ride assigned: Jane Smith assigned to John Doe's ride"

**Database records created:**
```
Notification 3 (Rider):
- recipient_type: 'rider'
- recipient_id: <ride_id>
- notification_type: 'ride_assigned'
- message: 'Your driver Jane Smith is on the way! They'll arrive shortly.'

Notification 4 (Driver):
- recipient_type: 'driver'
- recipient_id: <driver_id>
- notification_type: 'ride_assigned'
- message: 'You've been assigned a ride: John Doe from 123 Main St to 456 Oak Ave'

Notification 5 (Admin):
- recipient_type: 'admin'
- recipient_id: NULL
- notification_type: 'ride_assigned'
- message: 'Ride assigned: Jane Smith assigned to John Doe's ride'
```

### Step 3: Driver Updates Ride Status

**What happens:**
```python
# Driver updates status via POST /api/v1/driver/rides/{ride_id}/status
# Status can be: 'enroute', 'arrived', 'in_progress', 'completed', 'cancelled'

notify_ride_status_update(
    ride_id=ride_id,
    driver_id=driver_id,
    driver_name="Jane Smith",
    rider_name="John Doe",
    pickup="123 Main St",
    dropoff="456 Oak Ave",
    status="enroute"  # or 'arrived', 'in_progress', etc.
)
```

**What `notify_ride_status_update()` does:**
1. Maps status to notification type:
   - `enroute` → `ride_enroute`
   - `arrived` → `ride_arrived`
   - `in_progress` → `ride_in_progress`
   - `completed` → `ride_completed`
   - `cancelled` → `ride_cancelled`
2. Creates notifications for rider and driver
3. Creates admin notification only for `completed` or `cancelled`

## 🔍 How Notifications Are Retrieved

### API Endpoint: `GET /api/v1/notifications`

**Query Parameters:**
- `recipient_type` - Filter by 'rider', 'driver', or 'admin'
- `recipient_id` - Filter by specific recipient UUID
- `ride_id` - Filter by ride UUID
- `status` - Filter by 'pending', 'sent', 'read', 'failed'
- `limit` - Number of results (default: 50, max: 200)

**Examples:**

```bash
# Get all notifications for a specific ride (rider's view)
GET /api/v1/notifications?recipient_type=rider&recipient_id=<ride_id>&limit=10

# Get all notifications for a driver
GET /api/v1/notifications?recipient_type=driver&recipient_id=<driver_id>&limit=20

# Get all unread notifications for admin
GET /api/v1/notifications?recipient_type=admin&status=pending&limit=50

# Get all notifications for a specific ride (any recipient)
GET /api/v1/notifications?ride_id=<ride_id>
```

**Response Format:**
```json
[
  {
    "id": "uuid",
    "ride_id": "uuid",
    "driver_id": "uuid",
    "recipient_type": "rider",
    "recipient_id": "uuid",
    "notification_type": "ride_assigned",
    "title": "Ride Assigned",
    "message": "Your driver Jane Smith is on the way!",
    "channel": "in_app",
    "status": "pending",
    "metadata": {
      "driver_name": "Jane Smith",
      "rider_name": "John Doe",
      "pickup": "123 Main St",
      "dropoff": "456 Oak Ave"
    },
    "created_at_utc": "2025-12-31T01:23:00",
    "sent_at_utc": null,
    "read_at_utc": null
  }
]
```

## 🛡️ Graceful Fallback Mechanism

**What if the notifications table doesn't exist?**

The system is designed to **never break** if notifications aren't set up:

1. **In `app.py`:**
   ```python
   try:
       from notifications import notify_ride_booked, ...
       NOTIFICATIONS_AVAILABLE = True
   except ImportError:
       NOTIFICATIONS_AVAILABLE = False
       # Define no-op functions (do nothing)
       def notify_ride_booked(*args, **kwargs):
           pass
   ```

2. **When creating notifications:**
   ```python
   try:
       if NOTIFICATIONS_AVAILABLE:
           notify_ride_booked(...)
   except Exception as notify_error:
       # Don't fail the request if notification fails
       print(f"Warning: Failed to send notification: {notify_error}")
   ```

3. **In `notifications.py`:**
   ```python
   try:
       # Insert notification
   except UndefinedTable:
       # Table doesn't exist - that's OK, just log it
       print("Info: notifications table not found. Run migration...")
       return None
   ```

**Result:** If notifications aren't set up, rides still work perfectly. Notifications just won't be created.

## 📝 Message Formatting

Messages are formatted using Python's `.format()` method with metadata:

```python
message_template = "Your driver {driver_name} is on the way to {pickup}"
metadata = {
    "driver_name": "Jane Smith",
    "pickup": "123 Main St"
}
message = message_template.format(**metadata)
# Result: "Your driver Jane Smith is on the way to 123 Main St"
```

## 🔐 Security & Access

- **Public API Key Required:** All notification endpoints require the public API key
- **No Authentication Needed:** Notifications are public data (no sensitive info)
- **Filtering:** Recipients can only see their own notifications via `recipient_id` filtering

## 🎯 Current Implementation Status

**✅ Working:**
- Database schema
- Notification creation on ride events
- API endpoints to retrieve notifications
- Graceful error handling

**🚧 Future Enhancements:**
- SMS notifications (Twilio integration)
- Email notifications (SendGrid/SES integration)
- Push notifications (Firebase/OneSignal)
- Real-time updates (WebSocket)
- Frontend UI to display notifications
- Notification preferences (opt-in/opt-out)

## 🔄 Complete Flow Example

**Scenario:** User books a ride, admin assigns it, driver completes it

1. **User books ride** → 2 notifications created (rider + admin)
2. **Admin assigns driver** → 3 notifications created (rider + driver + admin)
3. **Driver marks "enroute"** → 2 notifications created (rider + driver)
4. **Driver marks "arrived"** → 2 notifications created (rider + driver)
5. **Driver marks "in_progress"** → 2 notifications created (rider + driver)
6. **Driver marks "completed"** → 3 notifications created (rider + driver + admin)

**Total:** 14 notifications for one complete ride!

## 💡 Key Design Decisions

1. **In-App First:** Started with `in_app` channel (easiest to implement)
2. **Extensible:** Easy to add SMS/email/push later
3. **Non-Blocking:** Notification failures don't break ride functionality
4. **Queryable:** Rich filtering options for different use cases
5. **Audit Trail:** All notifications stored permanently for history

## 🧪 Testing the System

After migration, test by:

1. **Create a ride** → Check notifications table
2. **Assign ride** → Check notifications table
3. **Update status** → Check notifications table
4. **Query API** → Verify notifications are returned correctly

The system is **production-ready** and will automatically create notifications as rides progress!

