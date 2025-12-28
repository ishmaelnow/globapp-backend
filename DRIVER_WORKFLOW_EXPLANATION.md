# Driver Workflow - How It Works

## Overview

The driver system works in phases:
1. **Driver Location Updates** - Drivers send their location periodically
2. **Driver Availability** - Drivers become "available" when they update location recently
3. **Ride Assignment** - Admin assigns rides to available drivers
4. **Ride Status Updates** - Drivers update ride status as they progress

---

## 1. Driver Location Updates

### How It Works

**Endpoint:** `PUT /api/v1/driver/location`
**Authentication:** Requires driver JWT token (from login)

**What happens:**
- Driver sends: `lat`, `lng`, `heading_deg`, `speed_mph`, `accuracy_m`
- Backend stores in `driver_locations` table
- Updates `updated_at_utc` timestamp
- Uses `ON CONFLICT` to upsert (update if exists, insert if new)

**Frontend:**
- Driver goes to "Update Location" tab
- Enters coordinates manually (or could use GPS)
- Clicks "Update Location" button
- Location is saved to database

**Current Implementation:**
- Manual entry (driver types lat/lng)
- Could be enhanced with browser geolocation API

---

## 2. Driver Availability ("Active")

### How Drivers Become Available

**A driver is "available" if:**
1. `drivers.is_active = true` (set by admin when creating driver)
2. Has location updated within last N minutes (default: 5 minutes)
3. Not currently assigned to an active ride

**Endpoint:** `GET /api/v1/dispatch/available-drivers?minutes_recent=5`
**Authentication:** Requires admin API key

**Query Logic:**
```sql
SELECT d.*, dl.*
FROM drivers d
JOIN driver_locations dl ON dl.driver_id = d.id
WHERE d.is_active = true
  AND dl.updated_at_utc >= (now() - 5 minutes)
ORDER BY dl.updated_at_utc DESC
```

**Presence Status:**
- **Online**: Location updated ≤ 60 seconds ago
- **Stale**: Location updated > 60 seconds but ≤ 10 minutes ago  
- **Offline**: Location updated > 10 minutes ago (or never)

**Thresholds (configurable):**
- `PRESENCE_ONLINE_SECONDS = 60` (default)
- `PRESENCE_STALE_SECONDS = 600` (default: 10 minutes)

---

## 3. Ride Assignment

### How Rides Get Assigned

**Flow:**
1. **Rider books ride** → Status: `requested`
2. **Admin views "Rides" tab** → Sees requested rides
3. **Admin views "Available" tab** → Sees available drivers
4. **Admin assigns ride:**
   - Selects ride from dropdown
   - Selects driver from dropdown
   - Clicks "Assign Ride"

**Endpoint:** `POST /api/v1/dispatch/rides/{ride_id}/assign`
**Authentication:** Requires admin API key

**What happens:**
- Checks ride status is `requested` or `assigned`
- Checks driver exists and `is_active = true`
- Updates ride:
  - Sets `assigned_driver_id`
  - Sets `assigned_at_utc`
  - Changes status to `assigned`

**After assignment:**
- Ride status: `assigned`
- Driver can see ride in "Assigned Ride" tab

---

## 4. Driver Accepts/Updates Ride Status

### Status Flow

**Ride Statuses (in order):**
1. `requested` - Rider booked, waiting for assignment
2. `assigned` - Admin assigned to driver
3. `enroute` - Driver heading to pickup
4. `arrived` - Driver arrived at pickup
5. `in_progress` - Rider in vehicle, enroute to destination
6. `completed` - Ride finished
7. `cancelled` - Ride cancelled (can happen anytime after assigned)

**Endpoint:** `POST /api/v1/driver/rides/{ride_id}/status`
**Authentication:** Requires driver JWT token

**What driver does:**
1. Sees assigned ride in "Assigned Ride" tab
2. Clicks status buttons to progress:
   - "Start Trip" → `assigned` → `enroute`
   - "Arrived" → `enroute` → `arrived`
   - "Start Ride" → `arrived` → `in_progress`
   - "Complete Ride" → `in_progress` → `completed`

**Backend validates:**
- Ride is assigned to this driver
- Status progression is valid (can't go backwards)
- Sets timestamps: `enroute_at_utc`, `arrived_at_utc`, etc.

---

## 5. Driver Views Assigned Ride

**Endpoint:** `GET /api/v1/driver/assigned-ride`
**Authentication:** Requires driver JWT token

**Returns:**
- Current assigned ride (if any)
- Only rides with status: `assigned`, `enroute`, `arrived`, `in_progress`
- Most recent assignment first

**Frontend:**
- Driver dashboard polls this endpoint
- Shows ride details when assigned
- Shows status update buttons

---

## Current Limitations & Improvements Needed

### Location Updates
- **Current**: Manual entry (driver types coordinates)
- **Better**: Use browser geolocation API automatically
- **Best**: Auto-update every 30 seconds when driver is active

### Driver Availability
- **Current**: Based on last location update time
- **Issue**: Driver must manually update location to stay "available"
- **Better**: Auto-update location periodically when driver is logged in

### Ride Assignment
- **Current**: Manual assignment by admin
- **Better**: Auto-assign based on proximity
- **Best**: Driver can accept/reject ride requests

### Status Updates
- **Current**: Manual button clicks
- **Better**: Auto-detect when driver arrives (geofencing)
- **Best**: Integration with navigation apps

---

## Recommended Enhancements

1. **Auto Location Updates**
   - Use browser `navigator.geolocation.watchPosition()`
   - Update every 30 seconds automatically
   - Only when driver is logged in

2. **Auto-Assignment**
   - Calculate distance from driver to pickup
   - Auto-assign nearest available driver
   - Or show ride requests to drivers to accept/reject

3. **Geofencing**
   - Auto-detect when driver arrives at pickup
   - Auto-detect when driver arrives at destination
   - Update status automatically

4. **Driver Status**
   - Add "Available/Unavailable" toggle
   - Only update location when "Available"
   - Don't show unavailable drivers in available list




