# Testing Guide - Separate React Apps

## ✅ Dependencies Installed
All three apps now have their dependencies installed and are ready to test!

## Prerequisites

### 1. Backend Must Be Running
Make sure your Flask backend (`app.py`) is running:

```powershell
# In a separate terminal, start the backend
python app.py
# or
flask run
```

The backend should be running on `http://localhost:8000` (or your configured port).

## Testing Each App

### Option 1: Test One App at a Time

**Terminal 1 - Test Rider App:**
```powershell
cd rider-app
npm run dev
```
→ Opens at http://localhost:3001
→ Test: Book a ride, view bookings, check ride details

**Terminal 2 - Test Driver App:**
```powershell
cd driver-app
npm run dev
```
→ Opens at http://localhost:3002
→ Test: Login as driver, view assigned rides, update location

**Terminal 3 - Test Admin App:**
```powershell
cd admin-app
npm run dev
```
→ Opens at http://localhost:3003
→ Test: Enter API key, manage drivers, dispatch rides

### Option 2: Test All Apps Simultaneously

Open **3 separate terminal windows** and run each app in its own terminal.

## What to Test

### Rider App (http://localhost:3001)
- [ ] App loads without errors
- [ ] Tabs switch correctly (Book Ride, My Bookings, Ride Details)
- [ ] Can book a ride
- [ ] Can view bookings
- [ ] Can search for ride details

### Driver App (http://localhost:3002)
- [ ] App loads without errors
- [ ] Login screen appears
- [ ] Can login with driver credentials
- [ ] Tabs switch correctly (Assigned Ride, Update Location, My Rides)
- [ ] Can view assigned rides
- [ ] Can update location
- [ ] Can view ride history

### Admin App (http://localhost:3003)
- [ ] App loads without errors
- [ ] API key input appears (if no embedded key)
- [ ] Can enter API key
- [ ] Tabs switch correctly (Drivers, Available, Presence, Rides, Active)
- [ ] Can view drivers
- [ ] Can create drivers
- [ ] Can dispatch rides

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:** Make sure backend is running on port 8000

### Issue: "CORS error"
**Solution:** Backend CORS should allow all origins, or add the specific ports (3001, 3002, 3003)

### Issue: "Port already in use"
**Solution:** Change port in `vite.config.js`:
```js
server: {
  port: 3004, // Use different port
}
```

### Issue: "Module not found"
**Solution:** Make sure you ran `npm install` in that app's directory

## Quick Start Commands

```powershell
# Start Backend (Terminal 1)
python app.py

# Start Rider App (Terminal 2)
cd rider-app
npm run dev

# Start Driver App (Terminal 3)
cd driver-app
npm run dev

# Start Admin App (Terminal 4)
cd admin-app
npm run dev
```

## Success Indicators

✅ All apps load without console errors
✅ All apps can connect to backend API
✅ Tabs switch correctly in each app
✅ Data loads from backend
✅ Forms submit successfully




