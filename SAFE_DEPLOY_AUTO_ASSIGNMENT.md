# 🛡️ SAFE Deployment Plan: Auto-Assignment Feature

## ⚠️ IMPORTANT: Safety First

This deployment plan is designed to be **safe and non-breaking**. We will:
- ✅ Only deploy backend changes (`app.py`)
- ✅ Test before and after deployment
- ✅ Have a rollback plan ready
- ✅ Deploy incrementally with verification at each step
- ❌ **NOT deploy** frontend/mobile changes (those stay local for now)

---

## 📋 Pre-Deployment Checklist

Before starting, verify:

- [ ] `app.py` is committed to Git (✅ Already done - git status shows clean)
- [ ] You have SSH access to your Droplet
- [ ] You know your Droplet IP address
- [ ] You have your admin API key ready (for testing)
- [ ] You can access your database (for creating the table)

---

## 🔍 Step 1: Verify Current State (SAFETY CHECK)

**On your Droplet:**

```bash
# SSH into Droplet
ssh root@YOUR_DROPLET_IP
# or ssh ishmael@YOUR_DROPLET_IP

# Navigate to backend
cd ~/globapp-backend

# Check current git status
git status

# Check current backend version
grep -n "Auto-Assignment" app.py || echo "Auto-assignment NOT in current version"

# Check if backend is running
sudo systemctl status globapp-api
```

**Expected:**
- Git status shows you're on `main` branch
- Auto-assignment code is NOT in current version (we're about to add it)
- Backend service is running

**If backend is NOT running:** Start it first:
```bash
sudo systemctl start globapp-api
sudo systemctl status globapp-api
```

---

## 🔍 Step 2: Backup Current Backend (SAFETY CHECK)

**On your Droplet:**

```bash
# Create backup of current app.py
cp app.py app.py.backup.$(date +%Y%m%d_%H%M%S)

# Verify backup was created
ls -lh app.py.backup.*

# Also backup the service file (if you have custom service config)
sudo cp /etc/systemd/system/globapp-api.service /etc/systemd/system/globapp-api.service.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No custom service file to backup"
```

**Expected:** Backup files created successfully.

**This gives us a rollback path if something goes wrong!**

---

## 🔍 Step 3: Test Current Backend (BASELINE TEST)

**On your Droplet or from your local machine:**

```bash
# Test that existing endpoints still work
curl -X GET https://globapp.app/api/v1/dispatch/rides?status=requested \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Expected:** Should return list of rides (or empty array).

**If this fails:** Stop deployment and fix existing issues first!

---

## 📥 Step 4: Pull Latest Code (CAREFULLY)

**On your Droplet:**

```bash
# Make sure we're on main branch
git checkout main

# Pull latest code
git pull origin main

# Verify what changed
git log --oneline -5

# Check if auto-assignment code is now present
grep -n "auto-assign" app.py | head -5
```

**Expected:**
- Code pulls successfully
- You see auto-assignment endpoints in `app.py`
- No merge conflicts

**If there are merge conflicts:** 
```bash
# DO NOT force merge! Check what's conflicting:
git status
# Then either resolve conflicts or abort:
git merge --abort
```

---

## 🗄️ Step 5: Create Database Table (SAFE - Won't Break Anything)

**On your Droplet:**

```bash
# Connect to database
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db"
```

**In PostgreSQL prompt:**

```sql
-- Check if table already exists (safe check)
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'app_settings'
);

-- If it returns 'f' (false), create the table:
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(255) PRIMARY KEY,
    value BOOLEAN NOT NULL,
    updated_at_utc TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create index (safe - won't break if exists)
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Insert default value (safe - won't duplicate if exists)
INSERT INTO app_settings (key, value) 
VALUES ('auto_assignment_enabled', false) 
ON CONFLICT (key) DO NOTHING;

-- Verify table was created/updated
SELECT * FROM app_settings;

-- Exit PostgreSQL
\q
```

**Expected:**
- Table created successfully (or already exists - that's OK!)
- One row with `auto_assignment_enabled: false`

**If this fails:** Check database connection and credentials.

---

## 🔄 Step 6: Restart Backend (REQUIRED - Code Won't Load Without This!)

**⚠️ CRITICAL:** After pulling new code, you MUST restart the backend service. Python/FastAPI loads code into memory at startup, so new code won't be active until restart.

**On your Droplet:**

```bash
# Check backend logs BEFORE restart (to see current state)
sudo journalctl -u globapp-api -n 20 --no-pager

# Restart backend (this loads the new code from app.py)
sudo systemctl restart globapp-api

# Wait 3 seconds for it to start
sleep 3

# Check if it started successfully
sudo systemctl status globapp-api
```

**Why restart is required:**
- Python applications load code when they start
- New endpoints won't exist until restart
- Existing endpoints will keep using old code until restart
- Restart loads the new `app.py` with auto-assignment endpoints

**Expected:**
- Service shows "active (running)" in green
- No error messages in status

**If backend fails to start:**

```bash
# Check detailed error logs
sudo journalctl -u globapp-api -n 50 --no-pager

# Common issues:
# 1. Syntax error in app.py → Check the error, fix code, commit, pull again
# 2. Missing dependency → pip install -r requirements.txt
# 3. Database connection → Check .env file

# If you need to rollback:
cp app.py.backup.* app.py
sudo systemctl restart globapp-api
```

---

## ✅ Step 7: Verify Backend Started Correctly

**On your Droplet:**

```bash
# Check backend logs for errors
sudo journalctl -u globapp-api -n 30 --no-pager | grep -i error || echo "No errors found"

# Check if backend is responding
curl -s http://localhost:8000/docs > /dev/null && echo "Backend is responding" || echo "Backend not responding"
```

**Expected:**
- No errors in logs
- Backend is responding

**If errors found:** Check the error message and fix before proceeding.

---

## 🧪 Step 8: Test Existing Endpoints (VERIFY NOTHING BROKE)

**From your local machine or Droplet:**

```bash
# Test existing endpoints still work
curl -X GET https://globapp.app/api/v1/dispatch/rides?status=requested \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"

# Test manual assignment still works (if you have a test ride)
# curl -X POST https://globapp.app/api/v1/dispatch/rides/{RIDE_ID}/assign \
#   -H "X-API-Key: YOUR_ADMIN_API_KEY" \
#   -H "Content-Type: application/json" \
#   -d '{"driver_id": "DRIVER_ID"}'
```

**Expected:**
- Existing endpoints return same responses as before
- No new errors

**If existing endpoints break:** Rollback immediately (see Step 10).

---

## 🆕 Step 9: Test New Auto-Assignment Endpoints

**From your local machine or Droplet:**

```bash
# Test 1: Get auto-assignment setting (should return disabled by default)
curl -X GET https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Expected Response:**
```json
{
  "enabled": false
}
```

**If this works:** ✅ Auto-assignment endpoints are deployed!

```bash
# Test 2: Try to enable auto-assignment (optional - just to verify endpoint works)
curl -X PUT https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**Expected Response:**
```json
{
  "enabled": true
}
```

**Test 3: Try auto-assign endpoint (should fail because no ride, but endpoint should exist)**
```bash
curl -X POST https://globapp.app/api/v1/dispatch/rides/00000000-0000-0000-0000-000000000000/auto-assign \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Expected:** Should return 404 (ride not found) or 400 (auto-assignment disabled), NOT 404 (endpoint not found).

**If endpoints don't exist:** Check if code pulled correctly (re-do Step 4).

---

## ✅ Step 10: Final Verification

**Checklist:**

- [ ] Backend is running (`sudo systemctl status globapp-api`)
- [ ] Existing endpoints still work (Step 8)
- [ ] New auto-assignment endpoints exist (Step 9)
- [ ] Database table exists (`SELECT * FROM app_settings;`)
- [ ] No errors in logs (`sudo journalctl -u globapp-api -n 50`)

**If all checks pass:** ✅ **Deployment successful!**

---

## 🔄 Rollback Plan (If Something Goes Wrong)

**If you need to rollback:**

```bash
# On your Droplet:

# 1. Stop backend
sudo systemctl stop globapp-api

# 2. Restore backup
cd ~/globapp-backend
cp app.py.backup.* app.py

# 3. Restart backend
sudo systemctl start globapp-api

# 4. Verify it's working
sudo systemctl status globapp-api
curl -X GET https://globapp.app/api/v1/dispatch/rides?status=requested \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Note:** The database table (`app_settings`) is safe to leave - it won't break anything if it exists but isn't used.

---

## 🎯 What We're NOT Deploying (Safety)

**We are intentionally NOT deploying:**
- ❌ Mobile app changes (`mobile-app/` directory)
- ❌ Frontend changes (unless specifically requested)
- ❌ Any uncommitted changes

**These stay on your local machine for now.**

---

## 📊 Deployment Summary

**What gets deployed:**
- ✅ Backend code (`app.py`) with auto-assignment endpoints
- ✅ Database table (`app_settings`) for settings storage

**What doesn't change:**
- ✅ Existing endpoints (they keep working)
- ✅ Existing functionality (nothing breaks)
- ✅ Frontend/mobile apps (they stay as-is)

**Risk level:** 🟢 **LOW**
- New endpoints are additive (don't modify existing code)
- Default behavior is disabled (won't auto-assign unless enabled)
- Database table is optional (code handles missing table gracefully)

---

## ⏱️ Estimated Time

- **Step 1:** 2 minutes (verify current state)
- **Step 2:** 1 minute (backup)
- **Step 3:** 2 minutes (baseline test)
- **Step 4:** 2 minutes (pull code)
- **Step 5:** 3 minutes (create database table)
- **Step 6:** 2 minutes (restart backend)
- **Step 7:** 1 minute (verify startup)
- **Step 8:** 2 minutes (test existing endpoints)
- **Step 9:** 3 minutes (test new endpoints)
- **Step 10:** 2 minutes (final verification)

**Total:** ~20 minutes

---

## 🆘 Need Help?

**If something goes wrong:**

1. **Don't panic** - We have a rollback plan (Step 10)
2. **Check logs:** `sudo journalctl -u globapp-api -n 100 --no-pager`
3. **Verify code:** `grep -n "auto-assign" app.py` (should show endpoints)
4. **Test database:** `psql "postgresql://..." -c "SELECT * FROM app_settings;"`
5. **Rollback if needed:** Follow Step 10

---

**Follow these steps carefully, and your deployment will be safe!** 🛡️

