# Debug What's Not Working

## Questions to Answer

### Issue 1: Driver Cannot Update Location

**Check:**
1. Is driver logged in? (Do they have a JWT token?)
2. What error appears in browser console?
3. What error appears in Network tab?

**Possible Issues:**
- Driver not logged in → No JWT token → 401 Unauthorized
- Wrong endpoint URL → 404 Not Found
- Missing Authorization header → 401 Unauthorized
- Database error → 500 Internal Server Error

**Check Browser Console (F12):**
- Look for errors when clicking "Update Location"
- Check Network tab → Click failed request → See error response

**Check Backend Logs (On Droplet):**
```bash
sudo journalctl -u globapp-api -f
```
Then try updating location and see what error appears.

---

### Issue 2: Admin Cannot Assign Ride

**Check:**
1. Is admin API key being sent?
2. Are there any rides to assign? (Check "Rides" tab)
3. Are there any available drivers? (Check "Available" tab)
4. What error appears in browser console?

**Possible Issues:**
- No rides with status "requested" → Nothing to assign
- No available drivers → No drivers in dropdown
- Admin API key not sent → 401 Unauthorized
- Driver not active → 403 Forbidden
- Ride already assigned → 400 Bad Request

**Check Browser Console (F12):**
- Look for errors when clicking "Assign Ride"
- Check Network tab → Click failed request → See error response

**Check:**
- Are there rides in "Rides" tab?
- Are there drivers in "Available" tab?
- Are dropdowns populated?

---

## Diagnostic Steps

### Step 1: Check Driver Login

**Test:**
1. Go to driver portal: `https://globapp.app/driver`
2. Try to login with a driver PIN
3. Does login work?
4. After login, check browser localStorage:
   - F12 → Application → Local Storage
   - Look for `driver_auth` key
   - Should contain `access_token` and `refresh_token`

**If login fails:**
- Check if driver exists in database
- Check if PIN is correct
- Check backend logs for errors

---

### Step 2: Check Driver Location Update

**Test:**
1. Login as driver
2. Go to "Update Location" tab
3. Enter lat/lng (e.g., 40.7128, -74.0060)
4. Click "Update Location"
5. Check browser console for errors
6. Check Network tab for failed request

**What to look for:**
- Request URL: Should be `PUT /api/v1/driver/location`
- Request Headers: Should have `Authorization: Bearer <token>`
- Response: Should be 200 OK or show error

---

### Step 3: Check Admin Assignment

**Test:**
1. Go to admin dashboard: `https://globapp.app/admin`
2. Go to "Rides" tab
3. Are there any rides listed?
4. Go to "Available" tab
5. Are there any drivers listed?
6. Try to assign:
   - Select a ride from dropdown
   - Select a driver from dropdown
   - Click "Assign Ride"
7. Check browser console for errors
8. Check Network tab for failed request

**What to look for:**
- Request URL: Should be `POST /api/v1/dispatch/rides/{ride_id}/assign`
- Request Headers: Should have `X-API-Key: admincan`
- Response: Should be 200 OK or show error

---

## Common Issues

### Issue: Driver Not Logged In
**Symptom:** Location update fails with 401
**Fix:** Driver must login first to get JWT token

### Issue: No Available Drivers
**Symptom:** Dropdown is empty
**Fix:** 
- Driver must update location within last 5 minutes
- Driver must have `is_active = true`
- Check "Presence" tab to see driver status

### Issue: No Rides to Assign
**Symptom:** Dropdown is empty
**Fix:** 
- Rider must book a ride first
- Ride must have status "requested"
- Check "Rides" tab to see available rides

### Issue: Admin API Key Not Sent
**Symptom:** Assignment fails with 401
**Fix:**
- Check if admin API key is embedded in build
- Check browser console for "Admin API Key configured: Yes"
- Clear localStorage and hard refresh

---

## What I Need From You

Please provide:

1. **For driver location update:**
   - What error appears in browser console?
   - What error appears in Network tab?
   - Is driver logged in? (Check localStorage)

2. **For ride assignment:**
   - What error appears in browser console?
   - What error appears in Network tab?
   - Are there rides in "Rides" tab?
   - Are there drivers in "Available" tab?

3. **Backend logs:**
   - On Droplet: `sudo journalctl -u globapp-api -n 50`
   - What errors appear when you try these actions?

With this information, I can identify the exact issue and fix it.




