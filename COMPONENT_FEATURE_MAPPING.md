# Component Feature Mapping

## 🎯 **IMPORTANT: Main Website/PWA**

**The `frontend/` app is the MAIN WEBSITE/WEBPAGE PWA** - this is the primary web application users will access.

The separate apps (`rider-app/`, `driver-app/`, `admin-app/`) are standalone apps that can be deployed separately if needed.

---

## Overview
This document maps which components/pages handle which features across all apps.

---

## 🚗 **RIDE BOOKING**

### **Main Website** (`frontend/`) ⭐ **PRIMARY PWA**
- **Component:** `RideBooking.jsx`
- **Location:** `frontend/src/components/RideBooking.jsx`
- **Route:** `/rider` → Tab: "Book Ride"
- **Features:**
  - Get fare quote
  - Create ride booking
  - Select service type
  - Enter pickup/destination
- **Status:** ✅ **Main website component**

### **Rider App** (`rider-app/`)
- **Component:** `Booking.jsx` → Contains `RideBooking.jsx`
- **Location:** `rider-app/src/components/Booking.jsx` & `RideBooking.jsx`
- **Route:** Main app component
- **Features:**
  - Book ride (via `RideBooking.jsx`)
  - View bookings (via `MyBookings.jsx`)
  - View ride details (via `RideDetails.jsx`)
  - Notifications tab

### **Mobile App** (`mobile-app/`)
- **Component:** `RiderBooking.tsx`
- **Location:** `mobile-app/src/screens/rider/RiderBooking.tsx`
- **Route:** Rider Stack → Booking tab
- **Features:**
  - Book ride
  - Get fare estimate
  - Payment selection

---

## 📋 **RIDE HISTORY / MY BOOKINGS**

### **Main Website** (`frontend/`) ⭐ **PRIMARY PWA**
- **Component:** `MyBookings.jsx`
- **Location:** `frontend/src/components/MyBookings.jsx`
- **Route:** `/rider` → Tab: "My Bookings"
- **Features:**
  - View ride history by phone number
  - Filter rides by status
- **Status:** ✅ **Main website component**

### **Rider App** (`rider-app/`)
- **Component:** `MyBookings.jsx`
- **Location:** `rider-app/src/components/MyBookings.jsx`
- **Route:** Booking component → "My Bookings" tab
- **Features:**
  - View ride history
  - Filter by status
  - View ride details

### **Mobile App** (`mobile-app/`)
- **Component:** `RiderHistory.tsx`
- **Location:** `mobile-app/src/screens/rider/RiderHistory.tsx`
- **Route:** Rider Stack → History tab
- **Features:**
  - View ride history by phone
  - Filter by status

---

## 🔔 **NOTIFICATIONS**

### **Rider App** (`rider-app/`)
- **Component:** `Notifications.jsx`
- **Location:** `rider-app/src/components/Notifications.jsx`
- **Route:** Booking component → "Notifications" tab
- **Features:**
  - View rider notifications
  - Mark notifications as read
  - Filter notifications

- **Component:** `NotificationBadge.jsx`
- **Location:** `rider-app/src/components/NotificationBadge.jsx`
- **Usage:** Shows unread count badge in header

### **Admin App** (`admin-app/`)
- **Component:** `Notifications.jsx`
- **Location:** `admin-app/src/components/Notifications.jsx`
- **Route:** AdminDashboard → "Notifications" tab
- **Features:**
  - View admin notifications
  - Mark notifications as read
  - Filter by recipient type

- **Component:** `NotificationBadge.jsx`
- **Location:** `admin-app/src/components/NotificationBadge.jsx`
- **Usage:** Shows unread count badge in header

### **Driver App** (`driver-app/`)
- **Component:** `Notifications.jsx`
- **Location:** `driver-app/src/components/Notifications.jsx`
- **Route:** DriverPortal → "Notifications" tab
- **Features:**
  - View driver notifications
  - Mark notifications as read

- **Component:** `NotificationBadge.jsx`
- **Location:** `driver-app/src/components/NotificationBadge.jsx`
- **Usage:** Shows unread count badge in header

### **Mobile App** (`mobile-app/`)
- **Component:** `RiderNotifications.tsx`
- **Location:** `mobile-app/src/screens/rider/RiderNotifications.tsx`
- **Route:** Rider Stack → Notifications tab
- **Features:**
  - View notifications
  - Mark as read

---

## 👤 **DRIVER MANAGEMENT**

### **Main Website** (`frontend/`) ⭐ **PRIMARY PWA**
- **Component:** `AdminDashboard.jsx` → "Drivers" tab
- **Location:** `frontend/src/components/AdminDashboard.jsx`
- **Route:** `/admin` → "drivers" tab
- **Features:**
  - **Create Driver** (form in AdminDashboard)
    - Name, phone, vehicle, PIN, is_active
  - **List Drivers** (table in AdminDashboard)
    - View all drivers
    - See driver status (active/inactive)
    - See creation date
- **Status:** ✅ **Main website component**

### **Admin App** (`admin-app/`)
- **Component:** `AdminDashboard.jsx` → "Drivers" tab
- **Location:** `admin-app/src/components/AdminDashboard.jsx`
- **Route:** Main app → "drivers" tab
- **Features:**
  - Same as main website version
- **Status:** Standalone app (can be deployed separately)

---

## 🎯 **RIDE ASSIGNMENT / DISPATCH**

### **Main Website** (`frontend/`) ⭐ **PRIMARY PWA**
- **Component:** `AdminDashboard.jsx` → "Rides" tab
- **Location:** `frontend/src/components/AdminDashboard.jsx`
- **Route:** `/admin` → "rides" tab
- **Features:**
  - **View Requested Rides** (list)
  - **Select Ride** (dropdown)
  - **Select Driver** (dropdown - shows active drivers)
  - **Assign Ride** (button)
  - **Auto-Assign** (toggle + button)
  - **View Available Drivers** (for assignment)
- **Status:** ✅ **Main website component**

### **Admin App** (`admin-app/`)
- **Component:** `AdminDashboard.jsx` → "Rides" tab
- **Location:** `admin-app/src/components/AdminDashboard.jsx`
- **Route:** Main app → "rides" tab
- **Features:**
  - Same as main website version
- **Status:** Standalone app (can be deployed separately)

---

## 📍 **DRIVER LOCATION TRACKING**

### **Driver App** (`driver-app/`)
- **Component:** `DriverPortal.jsx` → "Update Location" tab
- **Location:** `driver-app/src/components/DriverPortal.jsx`
- **Route:** Main app → "location" tab
- **Features:**
  - Get current location (GPS)
  - Manual location entry
  - Update location to backend
  - Continuous location tracking (watch position)

- **Component:** `DriverRideTracking.jsx`
- **Location:** `driver-app/src/components/DriverRideTracking.jsx`
- **Usage:** Shows map with driver location and assigned ride

### **Mobile App** (`mobile-app/`)
- **Component:** `RideTracking.tsx`
- **Location:** `mobile-app/src/components/RideTracking.tsx`
- **Usage:** Shows map with ride tracking (rider view)

---

## 🚕 **DRIVER OPERATIONS**

### **Driver App** (`driver-app/`)
- **Component:** `DriverPortal.jsx`
- **Location:** `driver-app/src/components/DriverPortal.jsx`
- **Tabs:**
  1. **"Assigned Ride"** tab
     - View assigned ride details
     - Update ride status (enroute, arrived, in_progress, completed)
     - Complete/cancel ride
  2. **"Update Location"** tab
     - Update driver location
  3. **"My Rides"** tab
     - View driver's ride history
  4. **"Notifications"** tab
     - View driver notifications

### **Main Website** (`frontend/`) ⭐ **PRIMARY PWA**
- **Component:** `DriverDashboard.jsx`
- **Location:** `frontend/src/components/DriverDashboard.jsx`
- **Route:** `/driver` (after login)
- **Tabs:**
  1. **"Assigned Ride"** tab
  2. **"Update Location"** tab
  3. **"My Rides"** tab
- **Status:** ✅ **Main website component**

### **Mobile App** (`mobile-app/`)
- **Component:** `DriverHome.tsx` (placeholder)
- **Component:** `DriverHistory.tsx`
- **Location:** `mobile-app/src/screens/driver/`
- **Status:** Placeholder screens (not fully implemented)

---

## 🔐 **AUTHENTICATION**

### **Driver Login**
- **Main Website:** `DriverLogin.jsx` → `/driver` route ⭐ **PRIMARY PWA**
- **Driver App:** `DriverLogin.jsx` → Main app (before auth)
- **Mobile App:** `DriverLogin.tsx` → Driver Stack

### **Admin Login**
- **Main Website:** `AdminDashboard.jsx` → API Key input ⭐ **PRIMARY PWA**
- **Admin App:** `AdminDashboard.jsx` → API Key input (if no embedded key)
- **Mobile App:** `AdminLogin.tsx` → Admin Stack

---

## 💳 **PAYMENT**

### **Rider App** (`rider-app/`)
- **Component:** `PaymentSelection.jsx`
- **Location:** `rider-app/src/components/PaymentSelection.jsx`
- **Usage:** Used in `RideBooking.jsx` after ride creation
- **Features:**
  - Select payment method (cash/card)
  - Create payment intent
  - Confirm payment
  - Stripe checkout integration

- **Component:** `StripeCheckout.jsx`
- **Location:** `rider-app/src/components/StripeCheckout.jsx`
- **Usage:** Stripe payment form

- **Component:** `Receipt.jsx`
- **Location:** `rider-app/src/components/Receipt.jsx`
- **Usage:** Display ride receipt after completion

### **Mobile App** (`mobile-app/`)
- **Component:** `PaymentSelection.tsx`
- **Location:** `mobile-app/src/components/PaymentSelection.tsx`
- **Usage:** Used in `RiderBooking.tsx` after ride creation

---

## 📊 **ADMIN FEATURES**

### **Admin App** (`admin-app/`)
- **Component:** `AdminDashboard.jsx`
- **Tabs:**
  1. **"Drivers"** - Driver management
  2. **"Available"** - Available drivers list
  3. **"Presence"** - Driver presence status (online/stale/offline)
  4. **"Rides"** - Ride dispatch/assignment
  5. **"Active"** - Active rides monitoring
  6. **"Reports"** - Payment reports (via `PaymentReports.jsx`)
  7. **"Metrics"** - Driver metrics (via `DriverMetrics.jsx`)
  8. **"History"** - Enhanced ride history (via `EnhancedRideHistory.jsx`)
  9. **"Notifications"** - Admin notifications

- **Component:** `PaymentReports.jsx`
- **Location:** `admin-app/src/components/PaymentReports.jsx`
- **Usage:** Payment reports and analytics

- **Component:** `DriverMetrics.jsx`
- **Location:** `admin-app/src/components/DriverMetrics.jsx`
- **Usage:** Driver performance metrics

- **Component:** `EnhancedRideHistory.jsx`
- **Location:** `admin-app/src/components/EnhancedRideHistory.jsx`
- **Usage:** Advanced ride history with filters

---

## 🗺️ **RIDE TRACKING**

### **Rider App** (`rider-app/`)
- **Component:** `RideTracking.jsx`
- **Location:** `rider-app/src/components/RideTracking.jsx`
- **Usage:** Shows map with driver location for active rides
- **Used in:** `RideDetails.jsx`

### **Driver App** (`driver-app/`)
- **Component:** `DriverRideTracking.jsx`
- **Location:** `driver-app/src/components/DriverRideTracking.jsx`
- **Usage:** Shows map with driver location and assigned ride route

### **Mobile App** (`mobile-app/`)
- **Component:** `RideTracking.tsx`
- **Location:** `mobile-app/src/components/RideTracking.tsx`
- **Usage:** Shows map with ride tracking

---

## 📱 **MOBILE APP SPECIFIC**

### **App Selector**
- **Component:** `AppSelector.tsx`
- **Location:** `mobile-app/src/screens/AppSelector.tsx`
- **Usage:** Choose between Rider/Driver/Admin app

### **Rider Screens**
- `RiderBooking.tsx` - Book ride
- `RiderHistory.tsx` - View history
- `RideDetails.tsx` - View ride details
- `RiderNotifications.tsx` - View notifications
- `RiderSettings.tsx` - Settings

### **Driver Screens**
- `DriverLogin.tsx` - Login (placeholder)
- `DriverHome.tsx` - Home (placeholder)
- `DriverHistory.tsx` - History (placeholder)

### **Admin Screens**
- `AdminLogin.tsx` - Login
- `AdminHome.tsx` - Dashboard

---

## 📋 **Summary Table**

| Feature | Main Website ⭐ | Rider App | Driver App | Admin App | Mobile App |
|---------|-----------------|----------|------------|-----------|------------|
| **Book Ride** | `RideBooking.jsx` ⭐ | `RideBooking.jsx` | - | - | `RiderBooking.tsx` |
| **My Bookings** | `MyBookings.jsx` ⭐ | `MyBookings.jsx` | - | - | `RiderHistory.tsx` |
| **Ride Details** | - | `RideDetails.jsx` | - | - | `RideDetails.tsx` |
| **Notifications** | - | `Notifications.jsx` | `Notifications.jsx` | `Notifications.jsx` | `RiderNotifications.tsx` |
| **Driver Management** | `AdminDashboard.jsx` ⭐ | - | - | `AdminDashboard.jsx` | `AdminHome.tsx` |
| **Ride Assignment** | `AdminDashboard.jsx` ⭐ | - | - | `AdminDashboard.jsx` | `AdminHome.tsx` |
| **Driver Location** | `DriverDashboard.jsx` ⭐ | - | `DriverPortal.jsx` | - | - |
| **Assigned Ride** | `DriverDashboard.jsx` ⭐ | - | `DriverPortal.jsx` | - | `DriverHome.tsx` |
| **Payment** | - | `PaymentSelection.jsx` | - | - | `PaymentSelection.tsx` |
| **Ride Tracking** | - | `RideTracking.jsx` | `DriverRideTracking.jsx` | - | `RideTracking.tsx` |
| **Driver Login** | `DriverLogin.jsx` ⭐ | - | `DriverLogin.jsx` | - | `DriverLogin.tsx` |
| **Admin Login** | `AdminDashboard.jsx` ⭐ | - | - | `AdminDashboard.jsx` | `AdminLogin.tsx` |

**⭐ = Main Website/PWA Components** (Primary web application)

---

## 🎯 **Key Components by Feature**

### **Booking Rides:**
- `RideBooking.jsx` (frontend & rider-app)
- `RiderBooking.tsx` (mobile-app)

### **Notifications:**
- `Notifications.jsx` (rider-app, driver-app, admin-app)
- `NotificationBadge.jsx` (all apps)

### **Ride Assignment:**
- `AdminDashboard.jsx` → "Rides" tab (frontend & admin-app)

### **Driver Management:**
- `AdminDashboard.jsx` → "Drivers" tab (frontend & admin-app)

### **Driver Operations:**
- `DriverPortal.jsx` (driver-app)
- `DriverDashboard.jsx` (frontend)

### **Payment:**
- `PaymentSelection.jsx` (rider-app)
- `PaymentSelection.tsx` (mobile-app)

---

## 📝 **Notes**

1. **Frontend App** (`frontend/`) - Combined app with LandingPage routing
2. **Separate Apps** (`rider-app/`, `driver-app/`, `admin-app/`) - Standalone apps
3. **Mobile App** (`mobile-app/`) - React Native app (some screens are placeholders)
4. Components with same name in different apps are **separate implementations**
5. Some features exist in multiple apps (e.g., notifications in all apps)

