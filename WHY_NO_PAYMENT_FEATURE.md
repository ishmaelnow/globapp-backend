# Why Payment Feature Isn't Showing - Troubleshooting Guide

## Possible Reasons

### 1. Frontend Not Rebuilt on Droplet ⚠️ (Most Likely)

**Problem:** The frontend code was updated, but the built files (`dist/`) weren't regenerated on the droplet.

**Solution:**
```bash
# On droplet
cd ~/globapp-backend/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

---

### 2. Backend Not Restarted ⚠️

**Problem:** Backend code updated but service not restarted.

**Solution:**
```bash
# On droplet
sudo systemctl restart globapp-api
# OR
sudo systemctl restart globapp-backend
```

**Check if running:**
```bash
sudo systemctl status globapp-api
curl http://localhost:8000/api/health
```

---

### 3. Files Not Pulled from Git ⚠️

**Problem:** Payment files don't exist on droplet.

**Check:**
```bash
cd ~/globapp-backend
ls -la pricing_engine.py payment_providers.py
ls -la frontend/src/components/PaymentSelection.jsx
```

**If missing:**
```bash
git pull origin frontend
```

---

### 4. Browser Cache 🗑️

**Problem:** Browser showing old cached version.

**Solution:**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache
- Or open in incognito/private window

---

### 5. Frontend Not Updated on Droplet ⚠️

**Problem:** Frontend source files updated but not rebuilt.

**Check:**
```bash
# On droplet - check if PaymentSelection.jsx exists
ls -la ~/globapp-backend/frontend/src/components/PaymentSelection.jsx

# If exists, rebuild:
cd ~/globapp-backend/frontend
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

---

## Complete Deployment Checklist

Run these commands on your droplet to ensure everything is deployed:

### Step 1: Verify Backend Files
```bash
cd ~/globapp-backend
git pull origin frontend
ls -la pricing_engine.py payment_providers.py requirements.txt
```

### Step 2: Install Backend Dependencies
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 3: Run Migrations
```bash
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

### Step 4: Restart Backend
```bash
sudo systemctl restart globapp-api
```

### Step 5: Verify Frontend Files
```bash
ls -la ~/globapp-backend/frontend/src/components/PaymentSelection.jsx
ls -la ~/globapp-backend/frontend/src/services/paymentService.js
```

### Step 6: Rebuild Frontend
```bash
cd ~/globapp-backend/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

### Step 7: Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R`
- Or use incognito mode

---

## Quick Test

### Test Backend Endpoint:
```bash
curl -X POST http://localhost:8000/api/v1/fare/estimate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{"pickup": "123 Main St", "dropoff": "456 Oak Ave"}'
```

**Expected:** Should return fare estimate with `quote_id` and `breakdown`

**If error:** Backend not updated or not restarted

### Test Frontend:
1. Go to your app: `https://globapp.app` (or your domain)
2. Go to booking page
3. Enter pickup/destination
4. Click "Get Price Estimate"
5. Fill form and click "Book Now"
6. **Should see:** Payment selection component appears

**If not showing:** Frontend not rebuilt or browser cache

---

## Most Common Issue

**90% of the time, it's:** Frontend not rebuilt on droplet

**Fix:**
```bash
cd ~/globapp-backend/frontend
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

Then hard refresh browser: `Ctrl + Shift + R`

---

## Where to Check

### On Droplet - Check Files Exist:
```bash
# Backend files
cd ~/globapp-backend
ls -la pricing_engine.py payment_providers.py

# Frontend files
ls -la frontend/src/components/PaymentSelection.jsx
ls -la frontend/src/services/paymentService.js

# Built frontend (what nginx serves)
ls -la /var/www/globapp/frontend/assets/ | grep -i payment
```

### Check Backend Running:
```bash
sudo systemctl status globapp-api
curl http://localhost:8000/api/v1/fare/estimate -H "X-API-Key: yesican" -X POST -d '{"pickup":"test","dropoff":"test"}'
```

### Check Frontend Built:
```bash
# Check if PaymentSelection is in built files
grep -r "PaymentSelection" /var/www/globapp/frontend/
```

---

## Step-by-Step Fix

**Run these commands in order:**

```bash
# 1. Pull latest code
cd ~/globapp-backend
git pull origin frontend

# 2. Install backend deps
source .venv/bin/activate
pip install -r requirements.txt

# 3. Restart backend
sudo systemctl restart globapp-api

# 4. Rebuild frontend
cd ~/globapp-backend/frontend
npm run build

# 5. Copy to nginx
sudo cp -r dist/* /var/www/globapp/frontend/

# 6. Reload nginx
sudo systemctl reload nginx

# 7. Test
curl http://localhost:8000/api/health
```

**Then in browser:**
- Hard refresh: `Ctrl + Shift + R`
- Go to booking page
- Should see payment feature!

---

## Still Not Working?

Share:
1. What you see (or don't see) in the UI
2. Any errors in browser console (F12)
3. Output of: `ls -la ~/globapp-backend/frontend/src/components/PaymentSelection.jsx`
4. Output of: `curl http://localhost:8000/api/v1/fare/estimate -H "X-API-Key: yesican" -X POST -d '{"pickup":"test","dropoff":"test"}'`







