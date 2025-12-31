# Test API Endpoints Correctly

## Issue
`curl -I` sends HEAD requests, but `/api/v1/health` only allows GET.

## Correct Test Commands

**Test with GET instead of HEAD:**

```bash
# Test API endpoints with GET (not HEAD)
curl https://rider.globapp.app/api/v1/health
curl https://driver.globapp.app/api/v1/health
curl https://admin.globapp.app/api/v1/health

# Test POST endpoint (create ride)
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{"rider_name":"Test","rider_phone":"1234567890","pickup":"123 Main St","dropoff":"456 Oak Ave","service_type":"economy"}'
```

## Current Status Summary

✅ **HTTP to HTTPS redirects:** Working (301)
✅ **HTTPS serving apps:** Working (200)
✅ **SSL certificates:** Working
⚠️ **API proxy:** Working but HEAD not allowed (405 on HEAD, but GET should work)

## Verify API Proxy is Working

**The 405 with `allow: GET` means:**
- Nginx IS proxying to backend ✅
- Backend IS responding ✅
- Just need to use GET instead of HEAD ✅

**Test with GET:**
```bash
curl https://rider.globapp.app/api/v1/health
```

**Expected:** Should return `{"ok": true, "version": "v1", ...}`

## Test POST Request

**Test the actual POST that was failing:**

```bash
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-if-needed" \
  -d '{
    "rider_name": "Test User",
    "rider_phone": "1234567890",
    "pickup": "123 Main Street",
    "dropoff": "456 Oak Avenue",
    "service_type": "economy"
  }'
```

**If this works, the 405 error in browser should be resolved!**



