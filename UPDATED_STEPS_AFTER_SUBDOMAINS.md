# Updated Steps After Subdomains Created

**Subdomains Created:**
- ✅ `rider.globapp.app`
- ✅ `driver.globapp.app`
- ✅ `admin.globapp.app`

**Current Status:** 
- ✅ DNS configured
- ✅ Directories exist on Droplet (`/var/www/globapp/rider`, `driver`, `admin`)
- ⚠️ Directories are empty (need to deploy files)
- ⚠️ Permissions need fixing (currently `root:root`, should be `www-data:www-data`)

---

## 📋 Complete Step-by-Step Guide

Follow these steps in order to deploy your apps to the subdomains:

---

## Step 1: SSH into Your Droplet

**From PowerShell:**

```bash
ssh ishmael@YOUR_DROPLET_IP
# or
ssh root@YOUR_DROPLET_IP
```

**Replace `YOUR_DROPLET_IP` with your actual DigitalOcean Droplet IP address.**

**If you don't know your Droplet IP:**
1. Log into DigitalOcean: https://cloud.digitalocean.com
2. Go to Droplets
3. Click on your Droplet
4. Copy the IPv4 address

---

## Step 2: Verify Current State

**On your Droplet:**

```bash
# Check directories exist
ls -la /var/www/globapp/

# Check if directories are empty
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/
```

**Expected:** 
- Directories exist: `rider`, `driver`, `admin`, `frontend`
- Directories are empty (only showing `.` and `..`)
- Permissions are `root:root` (will fix later)

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

**If you see "divergent branches" error:**

Git is asking how to reconcile differences between local and remote branches.

**Option A: Merge (Recommended - safest):**
```bash
git config pull.rebase false
git pull origin main
```

**Option B: Rebase (if you want linear history):**
```bash
git config pull.rebase true
git pull origin main
```

**Option C: Force pull (discards local changes on Droplet):**
```bash
git fetch origin
git reset --hard origin/main
```

**⚠️ Warning:** Option C will discard any local changes on the Droplet. Only use if you're sure you want to overwrite local changes.

**Expected:** Code should pull successfully.

**Verify code is updated:**

```bash
# Check that separate apps exist
ls -d rider-app driver-app admin-app

# Verify source code exists
ls -la rider-app/
ls -la driver-app/
ls -la admin-app/
```

**Expected:** Should see all three app directories with source code.

**If apps don't exist:** Make sure you've committed and pushed the separate apps to your Git repository.

---

## Step 4: Build and Deploy Rider App

**On your Droplet:**

```bash
# Navigate to rider app
cd ~/globapp-backend/rider-app

# Install dependencies
npm install

# Build for production
npm run build
```

**Verify build succeeded:**

```bash
# Check dist folder was created
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder in `dist/` directory.

**Deploy built files:**

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Verify files were copied
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder (directory is no longer empty!).

---

## Step 5: Build and Deploy Driver App

**On your Droplet:**

```bash
# Navigate to driver app
cd ~/globapp-backend/driver-app

# Install dependencies
npm install

# Build for production
npm run build
```

**Verify build succeeded:**

```bash
# Check dist folder was created
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

**Deploy built files:**

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Verify files were copied
ls -la /var/www/globapp/driver/
```

**Expected:** Should see `index.html` and `assets/` folder (directory is no longer empty!).

---

## Step 6: Build and Deploy Admin App

**On your Droplet:**

```bash
# Navigate to admin app
cd ~/globapp-backend/admin-app

# Install dependencies
npm install

# Build for production
npm run build
```

**Verify build succeeded:**

```bash
# Check dist folder was created
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

**Deploy built files:**

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Verify files were copied
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder (directory is no longer empty!).

---

## Step 7: Set File Permissions

**On your Droplet:**

**Current Issue:** Files are owned by `root:root`, but Nginx needs `www-data:www-data` to serve them.

**Fix ownership:**

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
# Check directory ownership
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

**Verify files inside also have correct permissions:**

```bash
ls -la /var/www/globapp/rider/ | head -5
ls -la /var/www/globapp/driver/ | head -5
ls -la /var/www/globapp/admin/ | head -5
```

**Expected:** Files should be owned by `www-data:www-data`

---

## Step 8: Install Nginx (if not already installed)

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

## Step 9: Create Nginx Configuration for Rider App

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

## Step 10: Create Nginx Configuration for Driver App

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

## Step 11: Create Nginx Configuration for Admin App

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

## Step 12: Enable Nginx Sites

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

## Step 13: Reload Nginx

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

## Step 14: Test HTTP (Before SSL)

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

## Step 15: Install SSL Certificates (HTTPS)

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

**Expected:** Should show all three certificates with expiration dates.

---

## Step 16: Update Backend CORS Configuration

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

## Step 17: Test All Subdomains

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

## ✅ Complete Checklist

- [ ] **Step 1:** SSH into Droplet
- [ ] **Step 2:** Verified current state (directories exist, empty)
- [ ] **Step 3:** Pulled latest code from Git
- [ ] **Step 4:** Built and deployed Rider app
- [ ] **Step 5:** Built and deployed Driver app
- [ ] **Step 6:** Built and deployed Admin app
- [ ] **Step 7:** File permissions set correctly (www-data:www-data)
- [ ] **Step 8:** Nginx installed
- [ ] **Step 9:** Nginx config created for Rider app
- [ ] **Step 10:** Nginx config created for Driver app
- [ ] **Step 11:** Nginx config created for Admin app
- [ ] **Step 12:** Nginx sites enabled and tested
- [ ] **Step 13:** Nginx reloaded
- [ ] **Step 14:** HTTP tested (apps load)
- [ ] **Step 15:** SSL certificates installed
- [ ] **Step 16:** Backend CORS updated
- [ ] **Step 17:** All subdomains tested (HTTPS working)

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

### If Build Fails

**Check Node.js is installed:**

```bash
node --version
npm --version
```

**If not installed:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### If You See 500 Error

**Check Nginx error logs:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 4-6
- Wrong permissions → Re-do Step 7
- Missing index.html → Re-do Steps 4-6

### If You See "Site can't be reached"

**Check DNS:**

```powershell
# On Windows
Resolve-DnsName rider.globapp.app
```

**Expected:** Should show your Droplet IP

**If not:** Wait 15-30 minutes for DNS propagation

### If You See SSL Error

**Check certificates:**

```bash
sudo certbot certificates
```

**If missing:** Re-do Step 15

### If You See CORS Errors

**Check backend CORS:**

```bash
cd ~/globapp-backend
grep -A 10 "allow_origins" app.py
```

**Verify subdomains are listed:** Should see `rider.globapp.app`, `driver.globapp.app`, `admin.globapp.app`

**If missing:** Re-do Step 16

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

**Fix permissions:**
```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

## Estimated Time

- **Step 1:** 1 minute (SSH)
- **Step 2:** 1 minute (verify state)
- **Step 3:** 2 minutes (pull code)
- **Steps 4-6:** 15 minutes (build and deploy apps)
- **Step 7:** 1 minute (fix permissions)
- **Steps 8-13:** 15 minutes (Nginx setup)
- **Step 14:** 2 minutes (test HTTP)
- **Step 15:** 10 minutes (SSL certificates)
- **Step 16:** 5 minutes (update CORS)
- **Step 17:** 5 minutes (testing)

**Total:** ~57 minutes

---

**Follow these steps in order, and you'll have your subdomains working!**

**Current State:** Directories exist but are empty - start with Step 3 (Pull Code) and continue from there.

