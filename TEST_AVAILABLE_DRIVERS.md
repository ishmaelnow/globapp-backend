# Test Available Drivers Feature

## Why the Table is Empty

The "Available Drivers" tab only shows drivers who:
1. ✅ Are active (`is_active = true`) - You have 5 active drivers
2. ❌ Have updated their location within the last **5 minutes** - None have done this yet

## How to Test Available Drivers

### Step 1: Login as a Driver
1. Open a new browser tab (or incognito window)
2. Go to: `https://globapp.app/driver`
3. Login with a driver's phone number and PIN
   - You can use any of your 5 drivers (Test, Nata, Meme, Hassan, or Driver Format Test)
   - You'll need their phone number and PIN

### Step 2: Update Driver Location
1. After logging in, click the **"Update Location"** tab
2. Click the **"Get My Location"** button
3. Browser will ask: "Allow globapp.app to access your location?"
   - Click **"Allow"**
4. Wait a few seconds - location should auto-populate:
   - Latitude and Longitude will fill in automatically
   - Heading, Speed, and Accuracy may also populate
5. Click **"Update Location to Server"** button
6. You should see: "Location updated successfully" message

### Step 3: Check Available Drivers in Admin Dashboard
1. Go back to Admin Dashboard tab: `https://globapp.app/admin`
2. Click the **"Available"** tab
3. Click the **"Refresh"** button
4. **Expected result:** 
   - The driver you just updated should appear in the table
   - You should see: Name, Phone, Vehicle, Location (lat/lng), Last Seen

### Step 4: Test Auto-Update (Optional)
1. Go back to Driver Dashboard
2. Click **"Start Auto-Update"** button
3. This will continuously update location every few seconds
4. Go back to Admin Dashboard → Available tab
5. The driver should stay visible as long as auto-update is running

## Troubleshooting

### If driver doesn't appear after updating location:
1. **Check browser console (F12):**
   - Look for errors when clicking "Update Location to Server"
   - Check Network tab → Look for `PUT /api/v1/driver/location` request
   - Should be status 200 (success)

2. **Check time window:**
   - Available drivers only show if location was updated within last 5 minutes
   - If more than 5 minutes passed, click "Refresh" in Available tab
   - Or update location again

3. **Check driver is active:**
   - Go to Admin Dashboard → Drivers tab
   - Make sure the driver has green "Active" badge
   - If not, the driver won't appear in Available tab

4. **Check backend logs:**
   ```bash
   sudo journalctl -u globapp-api -n 50
   ```
   Look for errors when driver tries to update location

### If GPS doesn't work:
- Make sure you clicked "Allow" when browser asked for permission
- Make sure you're using HTTPS (not HTTP)
- Try a different browser
- Check browser console for geolocation errors

## Expected Flow

1. **Driver logs in** → Gets JWT token
2. **Driver updates location** → Saves to `driver_locations` table
3. **Admin checks Available tab** → Sees driver in list
4. **Admin assigns ride** → Driver gets notification
5. **Driver accepts/completes ride** → Status updates

## Quick Test Checklist

- [ ] Driver can login
- [ ] Driver can click "Get My Location"
- [ ] Browser asks for location permission
- [ ] Location auto-populates
- [ ] "Update Location to Server" works
- [ ] Success message appears
- [ ] Driver appears in Admin → Available tab
- [ ] Driver shows correct location coordinates
- [ ] "Last Seen" shows recent timestamp

Let me know what happens when you test this!




