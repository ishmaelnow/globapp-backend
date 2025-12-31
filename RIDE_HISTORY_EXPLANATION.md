# Ride History - How It Works

## Overview

Ride history can now be accessed in **two ways**:

1. **Browser Storage (LocalStorage)** - Quick access, browser-specific
2. **Backend API** - Cross-device access, always up-to-date with ride status

## How Riders Track Their Rides

### Option 1: Browser Storage (Default)
- **What it is**: Rides are saved to your browser's localStorage when you book
- **Pros**: 
  - Instant access, no phone number needed
  - Works offline
- **Cons**: 
  - Only visible on the same browser/device
  - Lost if you clear browser data
  - Status updates from drivers may not sync

### Option 2: Backend API (Recommended)
- **What it is**: Fetch ride history from the server using your phone number
- **Pros**: 
  - Works across all devices and browsers
  - Always shows latest ride status (requested, assigned, enroute, completed, etc.)
  - Never lost, stored in database
- **Cons**: 
  - Requires entering your phone number
  - Requires internet connection

## How to Use

### View Browser Storage History
1. Go to "My Bookings" page
2. Click "Refresh" button
3. See rides saved in your browser

### View Server History (Cross-Device)
1. Go to "My Bookings" page
2. Enter your phone number (same one used when booking)
3. Click "Load from Server"
4. See all your rides with latest status updates

## Backend Endpoint

**GET `/api/v1/rides/my-rides`**
- Query params:
  - `rider_phone` (required): Phone number used when booking
  - `limit` (optional, default: 50): Max number of rides to return
- Returns: List of rides with full details including status, timestamps, payment info

## Ride Status Flow

Rides progress through these statuses:
1. **requested** - Ride just booked
2. **assigned** - Admin assigned a driver
3. **enroute** - Driver heading to pickup
4. **arrived** - Driver arrived at pickup
5. **in_progress** - Rider in vehicle, going to destination
6. **completed** - Ride finished
7. **cancelled** - Ride cancelled

## Technical Details

- **Database**: All rides are stored in PostgreSQL `rides` table
- **Identification**: Rides are linked by normalized phone number (`rider_phone_e164`)
- **Privacy**: Phone numbers are masked in responses (e.g., "+1234567890" → "+1******890")
- **Backward Compatibility**: Browser storage still works for existing users





