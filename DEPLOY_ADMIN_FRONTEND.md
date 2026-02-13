# Deploy Admin Frontend with Auto-Assignment UI

## Overview

After deploying the backend auto-assignment feature, you need to rebuild and deploy the admin frontend to show the new UI controls.

---

## Step 1: Verify Frontend Code is Pushed

**On your local machine:**

```bash
# Check git status
git status

# Should show no uncommitted changes for admin-app
```

**If you see uncommitted changes:**
```bash
git add admin-app/
git commit -m "Add auto-assignment UI to admin dashboard"
git push origin main
```

---

## Step 2: SSH into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

---

## Step 3: Pull Latest Code

**On your Droplet:**

```bash
cd ~/globapp-backend

# Pull latest code (includes both backend and admin-app frontend changes)
git pull origin main

# Verify admin-app changes are there
grep -n "auto-assign" admin-app/src/components/AdminDashboard.jsx | head -3
```

**Expected:** Should see lines with `autoAssignRide`, `getAutoAssignmentSetting`, etc.

---

## Step 3.5: Restart Backend (REQUIRED for Backend Changes)

**⚠️ IMPORTANT:** After pulling code, you MUST restart the backend to load the new auto-assignment endpoints.

**On your Droplet:**

```bash
# Restart backend service (loads new app.py with auto-assignment endpoints)
sudo systemctl restart globapp-api

# Wait a few seconds for it to start
sleep 3

# Verify backend started successfully
sudo systemctl status globapp-api
```

**Expected:** Should show "active (running)" in green.

**Why this is needed:** The backend auto-assignment endpoints won't exist until you restart the service.

---

## Step 4: Build Admin App

**On your Droplet:**

```bash
# IMPORTANT: Navigate to admin-app directory first!
cd ~/globapp-backend/admin-app

# Verify you're in the right directory (should see package.json)
ls -la package.json

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Verify build succeeded (dist/ should be in admin-app directory)
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder in `dist/` directory.

**⚠️ Common Mistake:** Make sure you're in `~/globapp-backend/admin-app/` directory, NOT `~/globapp-backend/`!

**If build fails:**
- Check Node.js version: `node --version` (should be 16+)
- Check npm version: `npm --version`
- Install Node.js if needed:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

---

## Step 5: Deploy Admin App to Web Directory

**On your Droplet:**

```bash
# Make sure you're still in admin-app directory
cd ~/globapp-backend/admin-app

# Verify dist/ exists
ls -la dist/ | head -5

# Copy built files to web directory (from admin-app/dist/)
sudo cp -r dist/* /var/www/globapp/admin/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/admin

# Verify files were copied
ls -la /var/www/globapp/admin/ | head -10
```

**Expected:** Should see `index.html` and `assets/` folder.

**⚠️ Important:** The `dist/` folder is inside `admin-app/` directory, so make sure you're in `~/globapp-backend/admin-app/` when running the copy command!

---

## Step 6: Reload Nginx (if needed)

**On your Droplet:**

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx (to serve new files)
sudo systemctl reload nginx

# Verify Nginx is running
sudo systemctl status nginx
```

**Expected:** Nginx should reload successfully.

---

## Step 7: Test Admin App

**Open in browser:**

1. Visit: `https://admin.globapp.app`
2. Log in with your admin API key
3. Navigate to **Settings** tab
4. **Expected:** Should see "Auto-Assignment" toggle switch
5. Navigate to **Rides** tab
6. **Expected:** Should see "Auto-Assign" button on requested rides (if auto-assignment is enabled)

---

## ✅ Verification Checklist

- [ ] Code pulled from Git
- [ ] **Backend restarted** (to load auto-assignment endpoints)
- [ ] Admin app built successfully (`npm run build`)
- [ ] Files copied to `/var/www/globapp/admin/`
- [ ] Permissions set correctly (`www-data:www-data`)
- [ ] Nginx reloaded
- [ ] Admin app loads in browser
- [ ] Auto-assignment toggle appears in Settings tab
- [ ] Auto-Assign button appears on rides (when enabled)

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Check Node.js:**
```bash
node --version
npm --version
```

**If not installed or wrong version:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Clear npm cache and rebuild:**
```bash
cd ~/globapp-backend/admin-app
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Issue: Admin App Shows Old Version

**Clear browser cache:**
- Press `Ctrl+Shift+R` (hard refresh)
- Or open in incognito/private window

**Verify files are updated:**
```bash
# Check file modification time
ls -la /var/www/globapp/admin/index.html

# Should show recent timestamp
```

**Force reload Nginx:**
```bash
sudo systemctl reload nginx
```

---

### Issue: Auto-Assignment Toggle Not Showing

**Check browser console (F12):**
- Look for JavaScript errors
- Check Network tab for failed API calls

**Verify backend is running:**
```bash
sudo systemctl status globapp-api
```

**Test backend endpoint:**
```bash
curl -X GET https://globapp.app/api/v1/admin/settings/auto-assignment \
  -H "X-API-Key: YOUR_ADMIN_API_KEY"
```

**Expected:** Should return `{"enabled": false}` or `{"enabled": true}`

---

### Issue: Auto-Assign Button Not Showing

**Check if auto-assignment is enabled:**
1. Go to Settings tab
2. Toggle "Auto-Assignment" to ON
3. Go back to Rides tab
4. Button should appear on requested rides

**Verify ride status:**
- Button only shows on rides with status "requested"
- If ride is already assigned, button won't show

---

## 📚 Quick Reference

### File Locations:
- Admin app source: `~/globapp-backend/admin-app/`
- Admin app build: `~/globapp-backend/admin-app/dist/`
- Admin app deployed: `/var/www/globapp/admin/`

### Useful Commands:

**Rebuild admin app:**
```bash
cd ~/globapp-backend/admin-app
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
sudo chown -R www-data:www-data /var/www/globapp/admin
```

**Check admin app files:**
```bash
ls -la /var/www/globapp/admin/
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## ⏱️ Estimated Time

- **Step 1:** 1 minute (verify code pushed)
- **Step 2:** 1 minute (SSH into Droplet)
- **Step 3:** 1 minute (pull code)
- **Step 3.5:** 2 minutes (restart backend)
- **Step 4:** 5 minutes (build admin app)
- **Step 5:** 1 minute (deploy files)
- **Step 6:** 1 minute (reload Nginx)
- **Step 7:** 2 minutes (test in browser)

**Total:** ~14 minutes

---

**Follow these steps to deploy the updated admin frontend!** 🚀

