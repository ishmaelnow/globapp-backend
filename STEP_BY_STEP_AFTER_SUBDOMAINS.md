# Step-by-Step Instructions After Subdomains Created

**Subdomains Created:**
- ✅ `rider.globapp.app`
- ✅ `driver.globapp.app`
- ✅ `admin.globapp.app`

**Current Status:** DNS configured, ready to deploy apps.

---

## 📋 Complete Step-by-Step Guide

Follow these steps in order to deploy your apps to the subdomains:

---

## Step 1: SSH into Your Droplet

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

## Step 2: Check Current State

**On your Droplet:**

```bash
# Check what's in the directories
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/

# Check permissions
ls -la /var/www/globapp/
```

**Current State:** 
- ✅ Directories exist (`rider`, `driver`, `admin`)
- ⚠️ Directories are **empty** (no files yet)
- ⚠️ Permissions are wrong (owned by `root:root`, should be `www-data:www-data`)

**This is expected!** We'll build and deploy files in the next steps, then fix permissions.

---

## Step 3: Pull Latest Code from Git

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

**Verify code is updated:**

```bash
ls -la rider-app/
ls -la driver-app/
ls -la admin-app/
```

**Expected:** Should see the app directories with source code.

**Verify the separate apps exist:**

```bash
ls -d rider-app driver-app admin-app
```

**Expected:** Should see all three directories listed.

---

## Step 4: Build and Deploy Apps (Git Method)

**On your Droplet:**

**Important:** Make sure you're in the project root directory first:

```bash
cd ~/globapp-backend
# or wherever your Git repository is located

# Verify the separate apps exist
ls -d rider-app driver-app admin-app
```

**Expected:** Should see all three directories listed.

### Build Rider App

```bash
cd ~/globapp-backend/rider-app

# Install dependencies (if not already installed)
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder in `dist/` directory.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Verify files were copied
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder (not empty anymore!).

### Build Driver App

```bash
cd ~/globapp-backend/driver-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder in `dist/` directory.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Verify files were copied
ls -la /var/www/globapp/driver/
```

**Expected:** Should see `index.html` and `assets/` folder (not empty anymore!).

### Build Admin App

```bash
cd ~/globapp-backend/admin-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder in `dist/` directory.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Verify files were copied
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder (not empty anymore!).

**Note:** If `npm install` fails, you may need to install Node.js and npm on the Droplet first:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify all apps are deployed:**

```bash
ls -la /var/www/globapp/
```

**Expected:** Should see `rider`, `driver`, `admin`, and `frontend` directories.

**Check that directories are no longer empty:**

```bash
ls -la /var/www/globapp/rider/ | head -10
ls -la /var/www/globapp/driver/ | head -10
ls -la /var/www/globapp/admin/ | head -10
```

**Expected:** Should see `index.html` and `assets/` folder in each directory.

---

## Step 5: Set File Permissions

**On your Droplet:**

**Current Issue:** Directories are owned by `root:root`, but Nginx needs `www-data:www-data` to serve files.

**Fix ownership for all three app directories:**

```bash
# Fix ownership for rider app
sudo chown -R www-data:www-data /var/www/globapp/rider

# Fix ownership for driver app
sudo chown -R www-data:www-data /var/www/globapp/driver

# Fix ownership for admin app
sudo chown -R www-data:www-data /var/www/globapp/admin

# Set correct permissions
sudo chmod -R 755 /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/admin
```

**Verify permissions:**

```bash
ls -la /var/www/globapp/
```

**Expected:** All directories (`rider`, `driver`, `admin`, `frontend`) should be owned by `www-data:www-data`

**Example output:**
```
drwxr-xr-x 6 www-data www-data 4096 Dec 29 10:59 .
drwxr-xr-x 2 www-data www-data 4096 Dec 29 10:59 admin
drwxr-xr-x 2 www-data www-data 4096 Dec 29 10:59 driver
drwxr-xr-x 3 www-data www-data 4096 Dec 27 06:19 frontend
drwxr-xr-x 2 www-data www-data 4096 Dec 29 10:59 rider
```

**If permissions are still wrong, fix all at once:**

```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

**Verify files inside directories also have correct permissions:**

```bash
ls -la /var/www/globapp/rider/ | head -5
ls -la /var/www/globapp/driver/ | head -5
ls -la /var/www/globapp/admin/ | head -5
```

**Expected:** Files should be owned by `www-data:www-data`

---

---

## Step 6: Install Nginx (if not already installed)

**On your Droplet:**

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Verify Nginx is running:**

```bash
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green.

---

---

## Step 7: Create Nginx Configuration for Rider App

**On your Droplet:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste this exact configuration:**

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

---

---

## Step 8: Create Nginx Configuration for Driver App

**On your Droplet:**

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste this exact configuration:**

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

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

---

## Step 9: Create Nginx Configuration for Admin App

**On your Droplet:**

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste this exact configuration:**

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

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

---

## Step 10: Enable Nginx Sites

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

**If test fails:** Check the error message and fix any issues in the config files.

---

---

## Step 11: Reload Nginx

**On your Droplet:**

```bash
sudo systemctl reload nginx
```

**Verify Nginx is running:**

```bash
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green.

---

---

## Step 12: Test HTTP (Before SSL)

**Open browser and test:**

1. **Visit:** `http://rider.globapp.app` (note: HTTP, not HTTPS)
2. **Expected:** Should see your Rider app (may show "Not Secure" - that's OK for now)
3. **Test:** Try `http://driver.globapp.app` and `http://admin.globapp.app`

**If you see 500 error:** Check Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

**If you see "Site can't be reached":** Wait a few more minutes for DNS propagation.

---

---

## Step 13: Install SSL Certificates (HTTPS)

**On your Droplet:**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### Get Certificate for Rider App

```bash
sudo certbot --nginx -d rider.globapp.app
```

**Follow prompts:**
1. Enter email address → Press Enter
2. Agree to terms → Type `A` and press Enter
3. Share email (optional) → Type `Y` or `N` and press Enter
4. Redirect HTTP to HTTPS → Type `2` and press Enter (recommended)

**Expected:** "Successfully deployed certificate"

### Get Certificate for Driver App

```bash
sudo certbot --nginx -d driver.globapp.app
```

**Follow prompts:** Same as above

### Get Certificate for Admin App

```bash
sudo certbot --nginx -d admin.globapp.app
```

**Follow prompts:** Same as above

**Verify certificates:**

```bash
sudo certbot certificates
```

**Expected:** Should show all three certificates.

---

---

## Step 14: Update Backend CORS Configuration

**On your Droplet:**

```bash
cd ~/globapp-backend  # or wherever your backend code is
nano app.py  # or your preferred editor
```

**Find CORS section (look for `allow_origins`):**

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

**Add subdomains to `allow_origins`:**

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

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Restart backend:**

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

---

## Step 15: Test All Subdomains

### Test Rider App

1. **Open browser:** `https://rider.globapp.app`
2. **Expected:**
   - ✅ No errors
   - ✅ Rider booking interface loads
   - ✅ Green padlock in address bar
3. **Test:** Try typing in address autocomplete field
4. **Check:** Browser console (F12) - should see no CORS errors

### Test Driver App

1. **Open browser:** `https://driver.globapp.app`
2. **Expected:**
   - ✅ No errors
   - ✅ Driver login page loads
   - ✅ Green padlock in address bar
3. **Test:** Try logging in

### Test Admin App

1. **Open browser:** `https://admin.globapp.app`
2. **Expected:**
   - ✅ No errors
   - ✅ Admin dashboard loads
   - ✅ Green padlock in address bar
3. **Test:** Check if data loads

---

## ✅ Final Checklist

- [ ] **Step 1:** SSH into Droplet
- [ ] **Step 2:** Checked current state and cleaned up (if needed)
- [ ] **Step 3:** Pulled latest code from Git
- [ ] **Step 4:** Apps built and deployed (Git method)
- [ ] **Step 5:** File permissions set correctly (www-data:www-data)
- [ ] **Step 6:** Nginx installed
- [ ] **Step 7:** Nginx config created for Rider app
- [ ] **Step 8:** Nginx config created for Driver app
- [ ] **Step 9:** Nginx config created for Admin app
- [ ] **Step 10:** Nginx sites enabled and tested
- [ ] **Step 11:** Nginx reloaded
- [ ] **Step 12:** HTTP tested (apps load)
- [ ] **Step 13:** SSL certificates installed
- [ ] **Step 14:** Backend CORS updated
- [ ] **Step 15:** All subdomains tested (HTTPS working)

---

## 🎉 Success!

Once all steps are complete, you'll have:

✅ **Three working subdomains with HTTPS:**
- https://rider.globapp.app
- https://driver.globapp.app
- https://admin.globapp.app

✅ **All connecting to:** https://globapp.app/api/v1

✅ **SSL certificates:** Auto-renewing

✅ **Ready for production use!**

---

## Troubleshooting

### If You See 500 Error:

**Check Nginx error logs:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not uploaded → Re-do Step 4
- Wrong permissions → Re-do Step 5
- Missing index.html → Re-do Step 4

### If You See "Site can't be reached":

**Check DNS:**

```powershell
# On Windows
Resolve-DnsName rider.globapp.app
```

**Expected:** Should show your Droplet IP

**If not:** Wait 15-30 minutes for DNS propagation

### If You See SSL Error:

**Check certificates:**

```bash
sudo certbot certificates
```

**If missing:** Re-do Step 13

### If You See CORS Errors:

**Check backend CORS:**

```bash
# On Droplet
cd ~/globapp-backend
grep -A 10 "allow_origins" app.py
```

**Verify subdomains are listed:** Should see `rider.globapp.app`, `driver.globapp.app`, `admin.globapp.app`

**If missing:** Re-do Step 14

---

## Quick Reference

### File Locations (Droplet):
- Rider: `/var/www/globapp/rider/`
- Driver: `/var/www/globapp/driver/`
- Admin: `/var/www/globapp/admin/`

### Nginx Configs:
- `/etc/nginx/sites-available/rider.globapp.app`
- `/etc/nginx/sites-available/driver.globapp.app`
- `/etc/nginx/sites-available/admin.globapp.app`

### Useful Commands:

**Check Nginx status:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Check backend status:**
```bash
sudo systemctl status globapp-api
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Restart backend:**
```bash
sudo systemctl restart globapp-api
```

---

## Estimated Time

- **Step 1:** 1 minute (SSH into Droplet)
- **Step 2:** 2 minutes (check current state, clean up if needed)
- **Step 3:** 2 minutes (pull code from Git)
- **Step 4:** 15 minutes (build apps on Droplet)
- **Step 5:** 1 minute (set permissions)
- **Steps 6-11:** 15 minutes (Nginx setup)
- **Step 12:** 2 minutes (test HTTP)
- **Step 13:** 10 minutes (SSL certificates)
- **Step 14:** 5 minutes (update CORS)
- **Step 15:** 5 minutes (testing)

**Total:** ~57 minutes

---

---

## Alternative: Build Locally and Upload (SCP Method)

**If you prefer to build locally and upload:**

### Step 1: Build Apps Locally

**On your Windows machine (PowerShell):**

```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project

cd rider-app
npm run build
cd ..

cd driver-app
npm run build
cd ..

cd admin-app
npm run build
cd ..
```

### Step 2: Upload via SCP

**From PowerShell:**

```powershell
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

**Then continue with Step 5 (Set File Permissions) and beyond.**

---

**Follow these steps in order, and you'll have your subdomains working!**

**Recommended:** Use Git method (Steps 1-4) as it's easier to update in the future - just `git pull` and rebuild!

