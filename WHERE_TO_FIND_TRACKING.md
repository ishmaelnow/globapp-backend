# Where to Find Ride Tracking & ETA

## 📍 Location in UI

### **Ride Details Tab** → Search for Ride ID

**Steps:**
1. Go to **"Ride Details"** tab (3rd tab in navigation)
2. Enter a **Ride ID** in the search box
3. Click **"Search"** or press Enter
4. **If ride is active** (has driver assigned and status is: assigned/enroute/arrived/in_progress):
   - You'll see a **"📍 Track Your Ride"** section at the TOP
   - Map shows driver location, pickup, and dropoff
   - **ETA** appears in a blue box above the map showing "Arriving in X minutes"

### **My Bookings Tab** → Click "Track" Button

**Steps:**
1. Go to **"My Bookings"** tab (2nd tab)
2. Load your rides (enter phone number → "Load from Server")
3. Find an **active ride** (status: assigned/enroute/arrived/in_progress)
4. Click the **"🗺️ Track"** button in the Actions column
5. This takes you to Ride Details with tracking map visible

## 🎯 What You'll See

### For Active Rides:
- ✅ **Map** with 3 markers:
  - 🟢 **Green** = Pickup location
  - 🔴 **Red** = Dropoff location  
  - 🔵 **Blue** = Driver location (updates every 10 seconds)
- ✅ **ETA Display**: "Arriving in X minutes" with driver speed
- ✅ **Route Lines**: 
  - Solid blue line = Pickup to Dropoff route
  - Dashed green line = Driver to Pickup path

### For Non-Active Rides:
- ⚠️ **Message**: "Waiting for driver" or "Ride tracking only available for active rides"
- No map shown (ride not started or already completed)

## 🔍 Requirements for Tracking

**Tracking ONLY shows when:**
1. ✅ Ride has a **driver assigned** (`driver_id` exists)
2. ✅ Ride status is one of: **assigned**, **enroute**, **arrived**, or **in_progress**
3. ✅ Driver has **updated their location** (driver must be using driver app)

## 🚨 Troubleshooting

### "No tracking visible"
**Check:**
- Is ride assigned to a driver? (Check status in ride details)
- Is ride status active? (assigned/enroute/arrived/in_progress)
- Has driver updated location? (Driver must use driver app to update location)

### "ETA not showing"
**Check:**
- Driver location must be available
- Pickup location must be geocoded successfully
- Check browser console for errors

### "Map not loading"
**Check:**
- Browser console for errors
- Internet connection (map tiles load from OpenStreetMap)
- Try hard refresh (Ctrl+Shift+R)

## 📱 Quick Test

1. **Book a ride** → Get ride ID
2. **Assign driver** (via admin app)
3. **Driver updates location** (via driver app)
4. **View ride** → Go to "Ride Details" → Enter ride ID → See map!

## 🎨 Visual Guide

```
Ride Details Page:
┌─────────────────────────────────────┐
│  📍 Track Your Ride  [Live Tracking]│
│  ┌───────────────────────────────┐ │
│  │  ETA: Arriving in 5 minutes   │ │
│  │  Speed: 35 mph                │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │         MAP HERE               │ │
│  │  🟢 Pickup  🔵 Driver  🔴 Drop │ │
│  └───────────────────────────────┘ │
│                                     │
│  Ride Information                   │
│  Fare Breakdown                     │
│  Payment Info                       │
│  Status Timeline                    │
│  Receipt (if completed)            │
└─────────────────────────────────────┘
```

The tracking map appears **at the very top** of the ride details, right after you search for a ride ID!

