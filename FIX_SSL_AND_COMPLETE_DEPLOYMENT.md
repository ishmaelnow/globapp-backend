# Fix SSL Error & Complete Deployment - Step by Step

**Current Issue:** SSL certificate error (`NET::ERR_CERT_COMMON_NAME_INVALID`) when accessing `rider.globapp.app`

**What This Means:** DNS is working, but SSL certificates need to be set up for HTTPS.

---

## 📋 Quick Status Check

**What's Done:**
- ✅ DNS records created (rider, driver, admin)
- ✅ DNS is resolving (you can reach the subdomain)

**What's Needed:**
- ⚠️ SSL certificates for HTTPS
- ⚠️ Apps deployed to Droplet
- ⚠️ Nginx configured
- ⚠️ Backend CORS updated

---

## Step-by-Step Instructions

### Step 1: Verify Current Setup

**First, let's check what's already done:**

**On your Droplet (SSH in):**

```bash
# Check if apps are deployed
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/

# Check if Nginx configs exist
ls -la /etc/nginx/sites-available/ | grep globapp

# Check if Nginx is running
sudo systemctl status nginx
```

**Expected Results:**
- If files exist in `/var/www/globapp/` → Apps are deployed ✅
- If Nginx configs exist → Nginx is configured ✅
- If Nginx is running → Web server is active ✅

---

## Step 2: Build Apps for Production (If Not Done)

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

---

## Step 3: Deploy Apps to Droplet (If Not Done)

### Step 3.1: SSH into Your Droplet

**From PowerShell:**

```bash
ssh root@YOUR_DROPLET_IP
# or if you use a different user:
ssh ishmael@YOUR_DROPLET_IP
```

### Step 3.2: Create Directories

**On your Droplet:**

```bash
sudo mkdir -p /var/www/globapp/rider
sudo mkdir -p /var/www/globapp/driver
sudo mkdir -p /var/www/globapp/admin
```

### Step 3.3: Upload Built Apps

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

### Step 3.4: Set File Permissions

**On your Droplet:**

```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

**Verify files are uploaded:**

```bash
ls -la /var/www/globapp/rider/
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder in each directory.

---

## Step 4: Configure Nginx (If Not Done)

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

## Step 5: Set Up SSL Certificates (FIX SSL ERROR) 🔒

**This step fixes the SSL certificate error you're seeing.**

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

**Expected:** Should show all three certificates with expiration dates (90 days from now).

### Step 5.6: Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

**Expected:** Should show renewal test successful.

**Note:** Certificates auto-renew automatically. No action needed.

---

## Step 6: Update Backend CORS Configuration

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

## Step 7: Test Your Subdomains! ✅

### Step 7.1: Test Rider App

1. **Open browser:** `https://rider.globapp.app`
2. **Expected:** 
   - ✅ No SSL error
   - ✅ Rider booking interface loads
   - ✅ Green padlock in address bar
3. **Test:** Try typing in address autocomplete field
4. **Check:** Browser console (F12) - should see no CORS errors
5. **Verify:** API calls should succeed

### Step 7.2: Test Driver App

1. **Open browser:** `https://driver.globapp.app`
2. **Expected:**
   - ✅ No SSL error
   - ✅ Driver login page loads
   - ✅ Green padlock in address bar
3. **Test:** Try logging in
4. **Check:** Should connect to backend successfully

### Step 7.3: Test Admin App

1. **Open browser:** `https://admin.globapp.app`
2. **Expected:**
   - ✅ No SSL error
   - ✅ Admin dashboard loads
   - ✅ Green padlock in address bar
3. **Test:** Check if data loads
4. **Check:** Should connect to backend successfully

---

## ✅ Complete Checklist

- [ ] Apps built (`dist/` folders created)
- [ ] Apps uploaded to Droplet (`/var/www/globapp/`)
- [ ] File permissions set correctly
- [ ] Nginx configs created for all three subdomains
- [ ] Nginx configs enabled and tested
- [ ] SSL certificates installed for all subdomains (FIXES SSL ERROR)
- [ ] Backend CORS updated with subdomains
- [ ] Backend restarted
- [ ] All subdomains tested and working (no SSL errors)

---

## Troubleshooting SSL Error

### If SSL Error Persists After Step 5:

**Check 1: Verify Certificates**

```bash
sudo certbot certificates
```

**Expected:** Should show certificates for all three subdomains.

**Check 2: Verify Nginx Config**

```bash
sudo nginx -t
```

**Expected:** Should show "test is successful"

**Check 3: Check Nginx Config Files**

```bash
sudo cat /etc/nginx/sites-available/rider.globapp.app
```

**Expected:** Should show SSL configuration with `listen 443 ssl;` and certificate paths.

**Check 4: Reload Nginx**

```bash
sudo systemctl reload nginx
```

**Check 5: Clear Browser Cache**

- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or try incognito/private window

**Check 6: Verify DNS**

```powershell
# On Windows
Resolve-DnsName rider.globapp.app
```

**Expected:** Should show your Droplet IP.

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
sudo tail -f /var/log/nginx/access.log
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Restart backend:**
```bash
sudo systemctl restart globapp-api
```

**Check SSL certificates:**
```bash
sudo certbot certificates
```

---

## 🎉 Success!

Once all steps are complete, you'll have:

✅ **Three working subdomains with HTTPS:**
- https://rider.globapp.app (no SSL errors)
- https://driver.globapp.app (no SSL errors)
- https://admin.globapp.app (no SSL errors)

✅ **All connecting to:** https://globapp.app/api/v1

✅ **SSL certificates:** Auto-renewing

✅ **Ready for production use!**

---

## Estimated Time

- **Step 2:** 5 minutes (build apps)
- **Step 3:** 15 minutes (deploy to Droplet)
- **Step 4:** 15 minutes (configure Nginx)
- **Step 5:** 10 minutes (SSL certificates - FIXES YOUR ERROR)
- **Step 6:** 5 minutes (update CORS)
- **Step 7:** 5 minutes (testing)

**Total:** ~55 minutes

---

## Priority Order

**If you're seeing the SSL error right now:**

1. **First:** Complete Step 5 (SSL Certificates) - This fixes your current error
2. **Then:** Complete Steps 2-4 if not done (Build, Deploy, Nginx)
3. **Finally:** Complete Steps 6-7 (CORS, Testing)

**Start with Step 5 if you just need to fix the SSL error quickly!**

---

**The SSL error will be fixed once you complete Step 5 (SSL Certificates).**




