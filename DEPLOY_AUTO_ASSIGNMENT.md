# Deploy Auto-Assignment Changes to Droplet

## Overview

After implementing the auto-assignment feature, you need to deploy the changes to your DigitalOcean Droplet. This guide walks you through the deployment process.

---

## Prerequisites

- ✅ Auto-assignment code is in `app.py` (already done)
- ✅ Changes are committed to Git
- ✅ SSH access to your Droplet

---

## Step-by-Step Deployment

### Step 1: Commit and Push Changes to Git

**On your local machine (PowerShell):**

```powershell
# Navigate to project directory
cd C:\Users\koshi\cursor-apps\flask-react-project

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Add auto-assignment feature"

# Push to remote repository
git push origin main
# or git push origin master (depending on your branch name)
```

**Expected:** Changes should push successfully to GitHub.

---

### Step 2: SSH into Your Droplet

**From PowerShell:**

```bash
ssh root@YOUR_DROPLET_IP
# or if you use a different user:
ssh ishmael@YOUR_DROPLET_IP
```

**Replace `YOUR_DROPLET_IP` with your actual DigitalOcean Droplet IP address.**

**If you don't know your Droplet IP:**
1. Log into DigitalOcean: https://cloud.digitalocean.com
2. Go to Droplets
3. Click on your Droplet
4. Copy the IPv4 address

---

### Step 3: Pull Latest Code from Git

**On your Droplet:**

```bash
# Navigate to your project directory
cd ~/globapp-backend
# or wherever your Git repository is located

# Pull latest code
git pull origin main
# or git pull origin master (depending on your branch name)
```

**Expected:** Code should pull successfully.

**Verify the changes are there:**

```bash
# Check if auto-assignment endpoints exist in app.py
grep -n "auto-assign" app.py
```

**Expected:** Should see lines with `/api/v1/dispatch/rides/{ride_id}/auto-assign` and related endpoints.

---

### Step 4: Create Database Table (if not exists)

**The auto-assignment feature uses the `app_settings` table. Create it if it doesn't exist:**

**On your Droplet:**

```bash
# Connect to PostgreSQL
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db"
```

**In PostgreSQL prompt:**

```sql
-- Create app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(255) PRIMARY KEY,
    value BOOLEAN NOT NULL,
    updated_at_utc TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Insert default value (disabled by default)
INSERT INTO app_settings (key, value) 
VALUES ('auto_assignment_enabled', false) 
ON CONFLICT (key) DO NOTHING;

-- Verify table was created
SELECT * FROM app_settings;

-- Exit PostgreSQL
\q
```

**Expected:** Should see the `app_settings` table with one row (`auto_assignment_enabled: false`).

**Alternative: One-liner command (if you prefer):**

```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "CREATE TABLE IF NOT EXISTS app_settings (key VARCHAR(255) PRIMARY KEY, value BOOLEAN NOT NULL, updated_at_utc TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()); INSERT INTO app_settings (key, value) VALUES ('auto_assignment_enabled', false) ON CONFLICT (key) DO NOTHING; CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);"
```

---

### Step 5: Restart Backend Service

**On your Droplet:**

```bash
# Restart the backend service
sudo systemctl restart globapp-api
# or if using a different service name:
# sudo systemctl restart your-backend-service-name
```

**Verify backend is running:**

```bash
# Check service status
sudo systemctl status globapp-api
```

**Expected:** Should show "active (running)" in green.

**Check backend logs (optional):**

```bash
# View recent logs
sudo journalctl -u globapp-api -n 50 --no-pager
# or if using different logging:
# tail -f /var/log/globapp-api.log
```

**Expected:** Should see no errors related to auto-assignment endpoints.

---

### Step 6: Test Auto-Assignment Endpoints

**Test from your local machine (PowerShell) or on the Droplet:**

**1. Get current auto-assignment setting:**

```bash
curl -X GET https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Expected Response:**
```json
{
  "enabled": false
}
```

**2. Enable auto-assignment (optional - for testing):**

```bash
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

**3. Test auto-assign endpoint (if you have a test ride):**

```bash
curl -X POST https://globapp.app/api/v1/dispatch/rides/{RIDE_ID}/auto-assign \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Replace `{RIDE_ID}` with an actual ride ID from your database.**

**Expected Response (if successful):**
```json
{
  "ok": true,
  "ride_id": "uuid",
  "assigned_driver_id": "uuid",
  "assigned_at_utc": "2025-01-XX...",
  "status": "assigned",
  "driver_name": "John Doe",
  "distance_miles": 2.5,
  "pickup_coords": {
    "lat": 32.7767,
    "lng": -96.7970
  }
}
```

---

## ✅ Deployment Checklist

- [ ] **Step 1:** Changes committed and pushed to Git
- [ ] **Step 2:** SSH into Droplet
- [ ] **Step 3:** Pulled latest code from Git
- [ ] **Step 4:** Created `app_settings` table (if needed)
- [ ] **Step 5:** Restarted backend service
- [ ] **Step 6:** Tested auto-assignment endpoints

---

## 🎉 Success!

Once all steps are complete:

✅ **Auto-assignment feature is deployed**
✅ **Backend is running with new endpoints**
✅ **Database table is ready**
✅ **Feature can be enabled/disabled via API**

---

## 🔄 Future Updates

When you make changes to the auto-assignment feature in the future:

```bash
# SSH into Droplet
ssh root@YOUR_DROPLET_IP

# Pull latest code
cd ~/globapp-backend
git pull origin main

# Restart backend
sudo systemctl restart globapp-api

# Verify it's running
sudo systemctl status globapp-api
```

---

## 🐛 Troubleshooting

### Issue: Git Pull Fails

**Check if you have uncommitted changes on the Droplet:**

```bash
cd ~/globapp-backend
git status
```

**If there are uncommitted changes:**

```bash
# Stash changes (saves them temporarily)
git stash

# Pull latest code
git pull origin main

# Apply stashed changes (if needed)
git stash pop
```

**Or discard local changes (if you don't need them):**

```bash
git reset --hard origin/main
git pull origin main
```

---

### Issue: Backend Won't Start

**Check backend logs:**

```bash
sudo journalctl -u globapp-api -n 100 --no-pager
```

**Common issues:**
- **Syntax error in app.py** → Check the error message, fix the code, commit, push, pull again
- **Missing dependencies** → Install them: `pip install -r requirements.txt`
- **Database connection error** → Check database credentials in `.env` file

---

### Issue: Database Table Already Exists

**If you get "relation already exists" error:**

```bash
# This is OK! The table already exists, skip Step 4
# Just verify it has the right structure:
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "SELECT * FROM app_settings;"
```

**Expected:** Should show at least one row with `auto_assignment_enabled`.

---

### Issue: API Endpoints Return 404

**Check if endpoints are in app.py:**

```bash
cd ~/globapp-backend
grep -n "auto-assign" app.py
```

**If endpoints are missing:**
- Code didn't pull correctly → Re-do Step 3
- Check if you're on the right branch → `git branch`

**If endpoints exist but return 404:**
- Backend might not have restarted → Re-do Step 5
- Check backend logs for errors

---

### Issue: Auto-Assignment Returns "Disabled" Error

**This is expected if auto-assignment is disabled!**

**Enable it:**

```bash
curl -X PUT https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**Or set environment variable (requires restart):**

```bash
# On Droplet, edit .env file
nano ~/globapp-backend/.env

# Add this line:
GLOBAPP_AUTO_ASSIGNMENT_ENABLED=true

# Save and restart backend
sudo systemctl restart globapp-api
```

---

## 📚 Quick Reference

### File Locations (on Droplet):
- Backend code: `~/globapp-backend/`
- Backend service: `globapp-api` (systemd service)
- Database: PostgreSQL at `127.0.0.1:5432`

### Useful Commands:

**Check backend status:**
```bash
sudo systemctl status globapp-api
```

**Restart backend:**
```bash
sudo systemctl restart globapp-api
```

**View backend logs:**
```bash
sudo journalctl -u globapp-api -n 50 --no-pager
sudo journalctl -u globapp-api -f  # Follow logs in real-time
```

**Check database:**
```bash
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "SELECT * FROM app_settings;"
```

**Test API endpoints:**
```bash
curl -X GET https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

---

## ⏱️ Estimated Time

- **Step 1:** 2 minutes (commit and push)
- **Step 2:** 1 minute (SSH into Droplet)
- **Step 3:** 1 minute (pull code)
- **Step 4:** 2 minutes (create database table)
- **Step 5:** 1 minute (restart backend)
- **Step 6:** 3 minutes (test endpoints)

**Total:** ~10 minutes

---

**Follow these steps in order, and your auto-assignment feature will be deployed!** 🚀































