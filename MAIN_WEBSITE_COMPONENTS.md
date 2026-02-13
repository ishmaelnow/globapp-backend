# Main Website/PWA Component Usage

## 🎯 **Main Website: `frontend/` App**

The **`frontend/`** app is the **main website/webpage PWA** - this is the primary web application users will access.

---

## 📱 **PWA Configuration**

### **Frontend App** (`frontend/`)
- **Type:** Main Website / PWA
- **Port:** 3000 (development)
- **Deployment:** Main domain (e.g., `globapp.app` or `www.globapp.app`)
- **Manifest:** `frontend/public/manifest.json` (if exists)
- **Service Worker:** Configured for PWA functionality

### **Separate Apps** (Sub-apps)
- **`rider-app/`** - Standalone rider app (can be deployed separately)
- **`driver-app/`** - Standalone driver app (can be deployed separately)
- **`admin-app/`** - Standalone admin app (can be deployed separately)

---

## 🏗️ **Main Website Structure** (`frontend/`)

### **Routes:**
- `/` → `LandingPage.jsx` (Home page with navigation)
- `/rider` → `RiderPage` component (contains tabs)
- `/driver` → `DriverPage` component (login or dashboard)
- `/admin` → `AdminPage` component (dashboard)

### **Components Used in Main Website:**

#### ✅ **Active Components (Used):**

1. **`LandingPage.jsx`**
   - **Route:** `/`
   - **Purpose:** Home page / landing page
   - **Features:**
     - Welcome message
     - Navigation buttons (Rider, Driver, Admin)
     - Feature highlights
     - API info section

2. **`RideBooking.jsx`**
   - **Route:** `/rider` → "Book Ride" tab
   - **Purpose:** Book a ride
   - **Features:**
     - Get fare quote
     - Create ride booking
     - Service type selection
     - Address autocomplete

3. **`MyBookings.jsx`**
   - **Route:** `/rider` → "My Bookings" tab
   - **Purpose:** View ride history
   - **Features:**
     - List rides by phone number
     - Filter by status
     - View ride details

4. **`DriverLogin.jsx`**
   - **Route:** `/driver` (before authentication)
   - **Purpose:** Driver authentication
   - **Features:**
     - Phone + PIN login
     - Device ID (optional)
     - Token storage

5. **`DriverDashboard.jsx`**
   - **Route:** `/driver` (after authentication)
   - **Purpose:** Driver operations
   - **Tabs:**
     - Assigned Ride
     - Update Location
     - My Rides
   - **Features:**
     - View assigned ride
     - Update ride status
     - Update location
     - View ride history

6. **`AdminDashboard.jsx`**
   - **Route:** `/admin`
   - **Purpose:** Admin operations
   - **Tabs:**
     - Drivers (create/list)
     - Available (available drivers)
     - Presence (driver presence status)
     - Rides (dispatch/assignment)
     - Active (active rides)
   - **Features:**
     - Driver management
     - Ride assignment
     - Driver presence monitoring
     - Active rides tracking

#### ❌ **Unused Components (To Remove):**

1. **`DriverPortal.jsx`**
   - **Status:** NOT USED
   - **Reason:** `DriverDashboard.jsx` is used instead
   - **Action:** Remove

2. **`Booking.jsx`**
   - **Status:** NOT USED
   - **Reason:** `RideBooking.jsx` and `MyBookings.jsx` are used directly
   - **Action:** Remove

---

## 🔄 **Component Flow in Main Website**

### **Rider Flow:**
```
LandingPage (/)
  ↓ (Click "Book a Ride")
RiderPage (/rider)
  ├── Tab: "Book Ride" → RideBooking.jsx
  └── Tab: "My Bookings" → MyBookings.jsx
```

### **Driver Flow:**
```
LandingPage (/)
  ↓ (Click "Driver Portal")
DriverPage (/driver)
  ├── Not Authenticated → DriverLogin.jsx
  └── Authenticated → DriverDashboard.jsx
      ├── Tab: "Assigned Ride"
      ├── Tab: "Update Location"
      └── Tab: "My Rides"
```

### **Admin Flow:**
```
LandingPage (/)
  ↓ (Click "Admin Dashboard")
AdminPage (/admin)
  └── AdminDashboard.jsx
      ├── Tab: "Drivers" (create/list)
      ├── Tab: "Available" (available drivers)
      ├── Tab: "Presence" (driver presence)
      ├── Tab: "Rides" (dispatch/assignment)
      └── Tab: "Active" (active rides)
```

---

## 📋 **Feature Mapping for Main Website**

| Feature | Component | Route | Tab/Page |
|---------|-----------|-------|----------|
| **Home/Landing** | `LandingPage.jsx` | `/` | Main page |
| **Book Ride** | `RideBooking.jsx` | `/rider` | "Book Ride" tab |
| **My Bookings** | `MyBookings.jsx` | `/rider` | "My Bookings" tab |
| **Driver Login** | `DriverLogin.jsx` | `/driver` | Login page |
| **Driver Dashboard** | `DriverDashboard.jsx` | `/driver` | Dashboard (3 tabs) |
| **Admin Dashboard** | `AdminDashboard.jsx` | `/admin` | Dashboard (5 tabs) |
| **Driver Management** | `AdminDashboard.jsx` | `/admin` | "Drivers" tab |
| **Ride Assignment** | `AdminDashboard.jsx` | `/admin` | "Rides" tab |
| **Driver Presence** | `AdminDashboard.jsx` | `/admin` | "Presence" tab |
| **Active Rides** | `AdminDashboard.jsx` | `/admin` | "Active" tab |

---

## 🎨 **Main Website Features**

### **Rider Features:**
- ✅ Book rides
- ✅ View booking history
- ✅ Get fare quotes
- ✅ Address autocomplete

### **Driver Features:**
- ✅ Login with phone + PIN
- ✅ View assigned ride
- ✅ Update ride status
- ✅ Update location
- ✅ View ride history

### **Admin Features:**
- ✅ Create drivers
- ✅ List all drivers
- ✅ View available drivers
- ✅ Monitor driver presence
- ✅ Assign rides to drivers
- ✅ Auto-assign rides
- ✅ View active rides

---

## 📱 **PWA Capabilities**

The main website (`frontend/`) should have:
- ✅ Service Worker (for offline support)
- ✅ Web App Manifest (for installability)
- ✅ Responsive design (mobile-friendly)
- ✅ Offline functionality (if configured)

---

## 🔗 **Backend Integration**

All components in `frontend/` are **already compatible** with the GlobApp backend:
- ✅ All endpoints mapped correctly
- ✅ Authentication working
- ✅ API calls functional
- ✅ No changes needed

---

## 📝 **Summary**

**Main Website (`frontend/`):**
- **Purpose:** Primary web application / PWA
- **Components Used:** 6 active components
- **Components to Remove:** 2 unused components
- **Status:** Fully functional, compatible with backend

**Separate Apps:**
- `rider-app/` - Can be deployed separately (has its own components)
- `driver-app/` - Can be deployed separately (has its own components)
- `admin-app/` - Can be deployed separately (has its own components)

---

## ✅ **Action Items**

1. **Keep these components in `frontend/`:**
   - ✅ `LandingPage.jsx`
   - ✅ `RideBooking.jsx`
   - ✅ `MyBookings.jsx`
   - ✅ `DriverLogin.jsx`
   - ✅ `DriverDashboard.jsx`
   - ✅ `AdminDashboard.jsx`

2. **Remove these unused components:**
   - ❌ `DriverPortal.jsx` (unused duplicate)
   - ❌ `Booking.jsx` (unused wrapper)

3. **Verify PWA configuration:**
   - Check `manifest.json` exists
   - Verify service worker is configured
   - Ensure installability works




























