# Complete Driver Workflow Explanation

## How It Works - Step by Step

### 1. Driver Location Updates

**Current Process:**
- Driver logs in with PIN
- Goes to "Update Location" tab
- **Manually enters** latitude and longitude
- Clicks "Update Location" button
- Location saved to `driver_locations` table

**Backend Endpoint:** `PUT /api/v1/driver/location`
- Requires driver JWT token (from login)
- Stores: `lat`, `lng`, `heading_deg`, `speed_mph`, `accuracy_m`
- Updates `updated_at_utc` timestamp

**Database:**
- Table: `driver_locations`
- One row per driver (upsert on update)
- Tracks when location was last updated

---

### 2. Driver Becomes "Available"

**A driver is considered "available" when:**

1. **Admin sets driver as active:**
   - Admin creates driver with `is_active = true`
   - Or admin can toggle this later

2. **Driver updates location recently:**
   - Location must be updated within last **5 minutes** (default)
   - Admin can query with different time window: `?minutes_recent=5`

3. **Not currently assigned:**
   - Driver shouldn't have an active ride (status: assigned/enroute/arrived/in_progress)

**Backend Endpoint:** `GET /api/v1/dispatch/available-drivers?minutes_recent=5`
- Returns drivers who:
  - Have `is_active = true`
  - Have location updated within `minutes_recent` minutes
  - Ordered by most recently updated

**Presence Status (for admin dashboard):**
- **Online**: Location updated ≤ 60 seconds ago
- **Stale**: Location updated > 60 seconds but ≤ 10 minutes ago
- **Offline**: Location updated > 10 minutes ago (or never)

---

### 3. Ride Assignment Process

**Step-by-Step:**

1. **Rider books ride:**
   - Rider fills form and clicks "Book Now"
   - Ride created with status: `requested`

2. **Admin views rides:**
   - Admin goes to "Rides" tab
   - Sees all rides with status `requested`
   - Can see pickup/destination details

3. **Admin views available drivers:**
   - Admin goes to "Available" tab
   - Sees drivers who:
     - Are active (`is_active = true`)
     - Updated location within last 5 minutes
     - Shows driver name, vehicle, last location

4. **Admin assigns ride:**
   - Selects ride from dropdown
   - Selects driver from dropdown
   - Clicks "Assign Ride" button

5. **Backend assigns:**
   - Checks ride status is `requested` or `assigned`
   - Checks driver exists and is active
   - Updates ride:
     - Sets `assigned_driver_id`
     - Sets `assigned_at_utc` timestamp
     - Changes status to `assigned`

**Backend Endpoint:** `POST /api/v1/dispatch/rides/{ride_id}/assign`
- Requires admin API key
- Body: `{ "driver_id": "uuid" }`

---

### 4. Driver Sees Assigned Ride

**Backend Endpoint:** `GET /api/v1/driver/assigned-ride`
- Requires driver JWT token
- Returns most recent assigned ride
- Only returns rides with status: `assigned`, `enroute`, `arrived`, `in_progress`

**Frontend:**
- Driver dashboard polls this endpoint
- Shows ride details when assigned:
  - Rider name and phone
  - Pickup location
  - Destination
  - Current status

---

### 5. Driver Updates Ride Status

**Status Flow (must follow this order):**
1. `assigned` → Admin assigned ride
2. `enroute` → Driver heading to pickup
3. `arrived` → Driver arrived at pickup
4. `in_progress` → Rider in vehicle, going to destination
5. `completed` → Ride finished
6. `cancelled` → Can cancel anytime after assigned

**Backend Endpoint:** `POST /api/v1/driver/rides/{ride_id}/status`
- Requires driver JWT token
- Body: `{ "status": "enroute" }`
- Validates:
  - Ride is assigned to this driver
  - Status progression is valid (can't go backwards)
  - Sets appropriate timestamps (`enroute_at_utc`, `arrived_at_utc`, etc.)

**Frontend:**
- Driver sees status buttons based on current status
- Clicks button to progress to next status
- Status updates immediately

---

## Current Limitations

### 1. Manual Location Entry
- **Current**: Driver must manually type coordinates
- **Problem**: Not practical for real-world use
- **Solution Needed**: Auto GPS location updates

### 2. Manual Status Updates
- **Current**: Driver clicks buttons to update status
- **Problem**: Easy to forget or miss steps
- **Solution Needed**: Auto-detect based on location (geofencing)

### 3. Manual Ride Assignment
- **Current**: Admin manually selects driver
- **Problem**: Not scalable, admin must be available
- **Solution Needed**: Auto-assign based on proximity or driver acceptance

### 4. Driver Must Keep Updating Location
- **Current**: Driver becomes "unavailable" if location not updated in 5 minutes
- **Problem**: Driver must constantly update location to stay available
- **Solution Needed**: Auto-update location periodically when logged in

---

## Recommended Enhancements

### 1. Auto Location Updates (High Priority)

**Add to DriverDashboard component:**
```javascript
useEffect(() => {
  if (accessToken) {
    // Get GPS location automatically
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy_m: position.coords.accuracy,
        }, accessToken);
      },
      (error) => console.error('GPS error:', error),
      { enableHighAccuracy: true, timeout: 5000 }
    );
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(...);
    }, 30000);
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    };
  }
}, [accessToken]);
```

### 2. Driver Status Toggle

**Add "Available/Unavailable" toggle:**
- Driver can toggle availability
- Only update location when "Available"
- Don't show unavailable drivers in available list

### 3. Auto-Assignment or Driver Acceptance

**Option A: Auto-Assign Nearest Driver**
- Calculate distance from each available driver to pickup
- Auto-assign nearest driver
- Notify driver via push notification

**Option B: Driver Accepts/Rejects**
- Show ride requests to available drivers
- Driver can accept or reject
- First to accept gets the ride

### 4. Geofencing for Status Updates

- Auto-detect when driver arrives at pickup (within 50m)
- Auto-update status to `arrived`
- Auto-detect when driver arrives at destination
- Auto-update status to `completed`

---

## Summary

**Current Flow:**
1. Driver manually updates location → Becomes available
2. Admin manually assigns ride → Driver sees assignment
3. Driver manually updates status → Ride progresses

**Ideal Flow:**
1. Driver location auto-updates → Always available when online
2. Auto-assign or driver accepts → Ride assigned automatically
3. Status auto-updates via geofencing → Minimal manual input

The current system works but requires a lot of manual steps. The enhancements above would make it much smoother and more professional.




