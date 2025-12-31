# Complete Testing Guide for All Three Subdomains

## Pre-Testing Checklist

**On your Droplet, verify:**

```bash
# 1. Backend is running
sudo systemctl status globapp-api

# 2. Public API key is NOT set (or commented out)
grep GLOBAPP_PUBLIC_API_KEY ~/globapp-backend/.env

# 3. Latest code is pulled
cd ~/globapp-backend
git pull origin main

# 4. Rider app is rebuilt with latest changes
cd rider-app
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

## Test 1: HTTP Redirects (Should redirect to HTTPS)

**From your browser or Droplet:**

```bash
# Test HTTP redirects
curl -I http://rider.globapp.app
curl -I http://driver.globapp.app
curl -I http://admin.globapp.app
```

**Expected:** `301 Moved Permanently` → `Location: https://...`

## Test 2: HTTPS Apps Load

**Open in browser:**
- https://rider.globapp.app
- https://driver.globapp.app
- https://admin.globapp.app

**Expected:**
- ✅ Apps load (200 OK)
- ✅ Green padlock 🔒
- ✅ No SSL warnings

## Test 3: API Endpoints Work

**From Droplet:**

```bash
# Test GET endpoints (should work without API key)
curl https://rider.globapp.app/api/v1/health
curl https://driver.globapp.app/api/v1/health
curl https://admin.globapp.app/api/v1/health

# Expected: {"ok":true,"version":"v1",...}
```

## Test 4: POST Request (Ride Booking)

**From Droplet:**

```bash
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{
    "rider_name": "Test User",
    "rider_phone": "1234567890",
    "pickup": "123 Main Street",
    "dropoff": "456 Oak Avenue",
    "service_type": "economy"
  }'
```

**Expected:** 
- ✅ `200 OK` or `201 Created`
- ✅ Returns ride data with `ride_id`
- ✅ **NOT** `401 Unauthorized`

## Test 5: Browser Testing - Rider App

**Open:** https://rider.globapp.app

**Check:**
1. ✅ **No API key input field** - Should NOT see "API Key" button
2. ✅ **Console shows:** `Public API Key configured: No` (this is OK if backend doesn't require it)
3. ✅ **Fill out form:**
   - Name: Test User
   - Phone: 1234567890
   - Pickup: 123 Main St
   - Destination: 456 Oak Ave
   - Service Type: Economy
4. ✅ **Click "Book Now"**
5. ✅ **Expected:** Ride created successfully, NO "Invalid API key" error
6. ✅ **Check Network tab:** POST to `/api/v1/rides` should return `200` or `201` (NOT 401)

## Test 6: Browser Testing - Driver App

**Open:** https://driver.globapp.app

**Check:**
1. ✅ App loads
2. ✅ Login form appears
3. ✅ No API key input

## Test 7: Browser Testing - Admin App

**Open:** https://admin.globapp.app

**Check:**
1. ✅ App loads
2. ✅ Admin dashboard appears
3. ✅ API key input for admin (this is OK - admin endpoints need admin key)

## Test 8: Verify No API Key Required

**In browser console (F12) on rider.globapp.app:**

```javascript
// Check API key status
console.log('API Base URL:', window.location.origin + '/api/v1');
// Should show: /api/v1 (relative URL)

// Try API call
fetch('/api/v1/health')
  .then(r => r.json())
  .then(console.log);
// Should return: {"ok":true,"version":"v1",...}
```

## Success Criteria

✅ **All tests pass if:**
- HTTP redirects to HTTPS
- Apps load on HTTPS
- API endpoints respond (200 OK)
- POST requests work (200/201, NOT 401)
- No API key input in rider app
- No "Invalid API key" errors
- Ride booking works end-to-end

## If Tests Fail

### 401 Unauthorized Error

**Backend still requires API key:**

```bash
# Check if API key is set
grep GLOBAPP_PUBLIC_API_KEY ~/globapp-backend/.env

# If it's set, comment it out:
sed -i 's/^GLOBAPP_PUBLIC_API_KEY=/#GLOBAPP_PUBLIC_API_KEY=/' ~/globapp-backend/.env

# Restart backend
sudo systemctl restart globapp-api

# Test again
curl https://rider.globapp.app/api/v1/health
```

### 405 Not Allowed Error

**Nginx not proxying correctly:**

```bash
# Check Nginx config
sudo nginx -t

# Check if /api/ location exists
sudo grep -A 10 "location /api/" /etc/nginx/sites-enabled/default
```

### App Not Loading

**Check files are deployed:**

```bash
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/
```

## Quick Test Script

**Run this on your Droplet:**

```bash
echo "=== Testing All Subdomains ===" && \
echo "" && \
echo "1. HTTP Redirects:" && \
curl -sI http://rider.globapp.app | grep -E "HTTP|Location" && \
echo "" && \
echo "2. HTTPS Apps:" && \
curl -sI https://rider.globapp.app | grep -E "HTTP" && \
echo "" && \
echo "3. API Health:" && \
curl -s https://rider.globapp.app/api/v1/health && \
echo "" && \
echo "4. POST Request:" && \
curl -sX POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{"rider_name":"Test","rider_phone":"123","pickup":"123","dropoff":"456","service_type":"economy"}' | head -c 200 && \
echo "" && \
echo "=== Tests Complete ==="
```

---

**Ready to test!** 🚀

Run the tests and let me know the results!



