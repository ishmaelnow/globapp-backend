# Fix 500 Error & Complete Deployment - Step by Step

**Current Issue:** 500 Internal Server Error on `rider.globapp.app`

**What This Means:** 
- ✅ DNS is working (you can reach the subdomain)
- ✅ Nginx is running (showing nginx/1.24.0)
- ❌ Nginx can't serve the files (missing files, wrong permissions, or config issue)

---

## 🔍 Step 1: Diagnose the Problem

**SSH into your Droplet:**

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

### Check 1: Are Files Uploaded?

```bash
# Check if files exist
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder in each directory.

**If files are missing:** Go to Step 2 (Build & Deploy Apps)

**If files exist:** Continue to Check 2

### Check 2: Check File Permissions

```bash
# Check permissions
ls -la /var/www/globapp/
```

**Expected:** Files should be owned by `www-data:www-data`

**If wrong permissions:** Run this:
```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

### Check 3: Check Nginx Error Logs

```bash
# View recent errors
sudo tail -n 50 /var/log/nginx/error.log
```

**Look for errors like:**
- `No such file or directory` → Files missing
- `Permission denied` → Wrong permissions
- `directory index of` → Missing index.html

**This will tell you exactly what's wrong!**

### Check 4: Verify Nginx Config

```bash
# Check Nginx config for rider
sudo cat /etc/nginx/sites-available/rider.globapp.app
```

**Expected:** Should show `root /var/www/globapp/rider;`

**If config is wrong:** Go to Step 3 (Configure Nginx)

---

## 📦 Step 2: Build Apps for Production

**On your Windows machine (PowerShell):**

```powershell
# Build Rider App
cd rider-app
npm run build
cd ..

# Build Driver App
cd driver-app
npm run build
cd ..

# Build Admin App
cd admin-app
npm run build
cd ..
```

**Verify:** Check that three `dist/` folders were created:
- `rider-app/dist/` - Should contain `index.html` and `assets/` folder
- `driver-app/dist/` - Should contain `index.html` and `assets/` folder
- `admin-app/dist/` - Should contain `index.html` and `assets/` folder

**Expected Result:** Each `dist/` folder contains production-ready files.

---

## 📤 Step 3: Deploy Apps to Droplet

### Step 3.1: Create Directories (if not exist)

**On your Droplet:**

```bash
sudo mkdir -p /var/www/globapp/rider
sudo mkdir -p /var/www/globapp/driver
sudo mkdir -p /var/www/globapp/admin
```

### Step 3.2: Upload Built Apps

**From your Windows machine (PowerShell - new window):**

```powershell
# Upload Rider App
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/

# Upload Driver App
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/

# Upload Admin App
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

**Replace `YOUR_DROPLET_IP` with your actual Droplet IP address.**

**Alternative: Using Git (on Droplet)**

If your code is in a Git repository:

```bash
# On Droplet
cd ~/globapp-backend  # or wherever your repo is
git pull origin main

# Build Rider App
cd rider-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/rider/

# Build Driver App
cd ../driver-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/driver/

# Build Admin App
cd ../admin-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
```

### Step 3.3: Set File Permissions

**On your Droplet:**

```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

### Step 3.4: Verify Files Are Uploaded

**On your Droplet:**

```bash
# Check files exist
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/

# Check index.html exists
ls -la /var/www/globapp/rider/index.html
ls -la /var/www/globapp/driver/index.html
ls -la /var/www/globapp/admin/index.html
```

**Expected:** Should see `index.html` and `assets/` folder in each directory.

---

## ⚙️ Step 4: Configure Nginx

### Step 4.1: Install Nginx (if not already installed)

**On your Droplet:**

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4.2: Create Nginx Config for Rider App

**On your Droplet:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name rider.globapp.app;

    root /var/www/globapp/rider;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4.3: Create Nginx Config for Driver App

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name driver.globapp.app;

    root /var/www/globapp/driver;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 4.4: Create Nginx Config for Admin App

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name admin.globapp.app;

    root /var/www/globapp/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 4.5: Enable Sites and Test

**On your Droplet:**

```bash
# Create symbolic links to enable sites
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t
```

**Expected output:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`

**If test fails:** Check the error message and fix any issues.

### Step 4.6: Reload Nginx

```bash
sudo systemctl reload nginx
```

**Verify Nginx is running:**

```bash
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green.

---

## 🔒 Step 5: Set Up SSL Certificates (HTTPS)

### Step 5.1: Install Certbot

**On your Droplet:**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Step 5.2: Get SSL Certificate for Rider App

**On your Droplet:**

```bash
sudo certbot --nginx -d rider.globapp.app
```

**Follow the prompts:**

1. **Enter email address** (for renewal notices)
   - Type your email and press Enter

2. **Agree to terms**
   - Type `A` and press Enter (to agree)

3. **Share email with EFF** (optional)
   - Type `Y` or `N` and press Enter (your choice)

4. **Redirect HTTP to HTTPS**
   - Type `2` and press Enter (recommended - redirects HTTP to HTTPS)

**Expected output:** Should show "Successfully deployed certificate"

### Step 5.3: Get SSL Certificate for Driver App

```bash
sudo certbot --nginx -d driver.globapp.app
```

**Follow prompts:** Same as above

### Step 5.4: Get SSL Certificate for Admin App

```bash
sudo certbot --nginx -d admin.globapp.app
```

**Follow prompts:** Same as above

**Note:** Certbot automatically updates your Nginx configs to use HTTPS!

### Step 5.5: Verify Certificates

**On your Droplet:**

```bash
sudo certbot certificates
```

**Expected:** Should show all three certificates with expiration dates.

---

## 🔧 Step 6: Update Backend CORS Configuration

### Step 6.1: Edit Backend Configuration

**On your Droplet:**

```bash
cd ~/globapp-backend  # or wherever your backend code is
nano app.py  # or your preferred editor
```

### Step 6.2: Find CORS Section

Look for something like:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://globapp.app",
        # ... other origins
    ],
    ...
)
```

### Step 6.3: Add Subdomains to CORS

**Update `allow_origins` to include:**

```python
allow_origins=[
    "https://globapp.app",           # Main domain
    "https://rider.globapp.app",      # ← ADD THIS
    "https://driver.globapp.app",     # ← ADD THIS
    "https://admin.globapp.app",      # ← ADD THIS
    "http://localhost:3001",         # Local dev - Rider
    "http://localhost:3002",         # Local dev - Driver
    "http://localhost:3003",        # Local dev - Admin
    # ... any other existing origins
],
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Step 6.4: Restart Backend

```bash
sudo systemctl restart globapp-api
# or however you restart your backend service
```

**Verify backend is running:**

```bash
sudo systemctl status globapp-api
```

**Expected:** Should show "active (running)" in green.

---

## ✅ Step 7: Test Your Subdomains!

### Step 7.1: Test Rider App

1. **Open browser:** `https://rider.globapp.app`
2. **Expected:** 
   - ✅ No 500 error
   - ✅ Rider booking interface loads
   - ✅ Green padlock in address bar
3. **Test:** Try typing in address autocomplete field
4. **Check:** Browser console (F12) - should see no errors
5. **Verify:** API calls should succeed

### Step 7.2: Test Driver App

1. **Open browser:** `https://driver.globapp.app`
2. **Expected:**
   - ✅ No 500 error
   - ✅ Driver login page loads
   - ✅ Green padlock in address bar
3. **Test:** Try logging in
4. **Check:** Should connect to backend successfully

### Step 7.3: Test Admin App

1. **Open browser:** `https://admin.globapp.app`
2. **Expected:**
   - ✅ No 500 error
   - ✅ Admin dashboard loads
   - ✅ Green padlock in address bar
3. **Test:** Check if data loads
4. **Check:** Should connect to backend successfully

---

## 🔍 Troubleshooting 500 Error

### If 500 Error Persists:

**Check 1: View Nginx Error Logs**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Then refresh the page in browser.** You'll see the exact error.

**Common errors and fixes:**

**Error: "No such file or directory"**
- **Fix:** Files not uploaded → Go to Step 2-3 (Build & Deploy)

**Error: "Permission denied"**
- **Fix:** Run: `sudo chown -R www-data:www-data /var/www/globapp`

**Error: "directory index of"**
- **Fix:** Missing `index.html` → Upload files again (Step 3)

**Error: "upstream" or "connection refused"**
- **Fix:** Backend not running → `sudo systemctl restart globapp-api`

**Check 2: Verify Files Exist**

```bash
# Check files
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/

# Check index.html specifically
cat /var/www/globapp/rider/index.html | head -20
```

**Expected:** Should see HTML content starting with `<!DOCTYPE html>` or `<html>`

**Check 3: Verify Nginx Config**

```bash
# Check config
sudo cat /etc/nginx/sites-available/rider.globapp.app

# Test config
sudo nginx -t
```

**Expected:** Should show `root /var/www/globapp/rider;` and test should pass

**Check 4: Check File Permissions**

```bash
ls -la /var/www/globapp/
```

**Expected:** Should show `www-data www-data` as owner

**If wrong:** Run:
```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

**Check 5: Reload Nginx**

```bash
sudo systemctl reload nginx
sudo systemctl status nginx
```

---

## ✅ Complete Checklist

- [ ] **Step 1:** Diagnosed the problem (checked files, permissions, logs)
- [ ] **Step 2:** Built all apps (`dist/` folders created)
- [ ] **Step 3:** Deployed apps to Droplet (`/var/www/globapp/`)
- [ ] **Step 3.3:** Set file permissions correctly
- [ ] **Step 4:** Configured Nginx for all three subdomains
- [ ] **Step 4.5:** Enabled sites and tested Nginx config
- [ ] **Step 4.6:** Reloaded Nginx
- [ ] **Step 5:** Installed SSL certificates (HTTPS)
- [ ] **Step 6:** Updated backend CORS with subdomains
- [ ] **Step 6.4:** Restarted backend
- [ ] **Step 7:** Tested all subdomains (no 500 errors)

---

## 🎉 Success!

Once all steps are complete, you'll have:

✅ **Three working subdomains with HTTPS:**
- https://rider.globapp.app (no 500 errors)
- https://driver.globapp.app (no 500 errors)
- https://admin.globapp.app (no 500 errors)

✅ **All connecting to:** https://globapp.app/api/v1

✅ **SSL certificates:** Auto-renewing

✅ **Ready for production use!**

---

## Quick Reference

### URLs After Setup:
- **Rider:** https://rider.globapp.app
- **Driver:** https://driver.globapp.app
- **Admin:** https://admin.globapp.app
- **Backend API:** https://globapp.app/api/v1

### File Locations (Droplet):
- Rider: `/var/www/globapp/rider/`
- Driver: `/var/www/globapp/driver/`
- Admin: `/var/www/globapp/admin/`

### Nginx Configs:
- `/etc/nginx/sites-available/rider.globapp.app`
- `/etc/nginx/sites-available/driver.globapp.app`
- `/etc/nginx/sites-available/admin.globapp.app`

### Useful Commands:

**Check Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Check files:**
```bash
ls -la /var/www/globapp/rider/
```

**Check Nginx status:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Fix permissions:**
```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

## Priority Order

**If you're seeing 500 error right now:**

1. **First:** Complete Step 1 (Diagnose) - Check error logs to see exact problem
2. **Then:** Complete Steps 2-3 (Build & Deploy) - Upload files if missing
3. **Then:** Complete Step 4 (Configure Nginx) - Set up web server
4. **Finally:** Complete Steps 5-7 (SSL, CORS, Testing)

**Start with Step 1 to see what's causing the 500 error!**

---

**The 500 error will be fixed once files are uploaded and Nginx is configured correctly.**




