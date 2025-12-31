# Corrected Steps Post Subdomain Part 2

**Purpose:** Complete guide to deploy your three React apps to subdomains after DNS records have been created.

**Subdomains:**
- ✅ `rider.globapp.app` → Rider App
- ✅ `driver.globapp.app` → Driver App
- ✅ `admin.globapp.app` → Admin App

**Current Status:**
- ✅ DNS records created
- ✅ Directories exist on Droplet (`/var/www/globapp/rider`, `driver`, `admin`)
- ⚠️ Directories are empty (need to deploy files)
- ⚠️ Permissions need fixing (`root:root` → `www-data:www-data`)

---

## 📋 Step-by-Step Instructions

---

## Step 1: SSH into Your Droplet

```bash
ssh ishmael@YOUR_DROPLET_IP
# or
ssh root@YOUR_DROPLET_IP
```

**Replace `YOUR_DROPLET_IP` with your actual DigitalOcean Droplet IP address.**

---

## Step 2: Pull Latest Code from Git

**On your Droplet:**

```bash
cd ~/globapp-backend
```

### Handle Divergent Branches (If You See This Error)

**If you see "divergent branches" error when running `git pull`, use one of these:**

**Option A: Merge (Recommended - Safest):**
```bash
git config pull.rebase false
git pull origin main
```

**Option B: Force Pull (Use Remote Version - Discards Local Changes):**
```bash
git fetch origin
git reset --hard origin/main
```

**⚠️ Warning:** Option B will discard any local changes on the Droplet. Only use if you're sure.

**If no error, just pull normally:**
```bash
git pull origin main
```

**Verify apps exist:**

```bash
ls -d rider-app driver-app admin-app
```

**Expected:** Should see all three directories listed.

**If apps don't exist:** Make sure you've committed and pushed the separate apps to Git from your local machine.

---

## Step 3: Build and Deploy Rider App

**On your Droplet:**

```bash
cd ~/globapp-backend/rider-app

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
sudo cp -r dist/* /var/www/globapp/rider/

# Verify files were copied
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder (directory is no longer empty!).

---

## Step 4: Build and Deploy Driver App

**On your Droplet:**

```bash
cd ~/globapp-backend/driver-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Verify files were copied
ls -la /var/www/globapp/driver/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 5: Build and Deploy Admin App

**On your Droplet:**

```bash
cd ~/globapp-backend/admin-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Verify files were copied
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 6: Fix File Permissions

**On your Droplet:**

**Current Issue:** Files are owned by `root:root`, but Nginx needs `www-data:www-data` to serve them.

```bash
# Fix ownership for all three apps
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chown -R www-data:www-data /var/www/globapp/driver
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

---

## Step 7: Install Nginx (if not already installed)

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

## Step 8: Create Nginx Configuration for Rider App

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

## Step 9: Create Nginx Configuration for Driver App

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

## Step 10: Create Nginx Configuration for Admin App

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

## Step 11: Enable Nginx Sites and Test

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

## Step 12: Reload Nginx

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

## Step 13: Test HTTP (Before SSL)

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

## Step 14: Install SSL Certificates (HTTPS)

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

## Step 15: Update Backend CORS Configuration

**On your Droplet:**

```bash
cd ~/globapp-backend
nano app.py
# or your preferred editor
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

## Step 16: Test All Subdomains

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
- [ ] **Step 2:** Pulled latest code (handled divergent branches if needed)
- [ ] **Step 3:** Built and deployed Rider app
- [ ] **Step 4:** Built and deployed Driver app
- [ ] **Step 5:** Built and deployed Admin app
- [ ] **Step 6:** File permissions fixed (www-data:www-data)
- [ ] **Step 7:** Nginx installed
- [ ] **Step 8:** Nginx config created for Rider app
- [ ] **Step 9:** Nginx config created for Driver app
- [ ] **Step 10:** Nginx config created for Admin app
- [ ] **Step 11:** Nginx sites enabled and tested
- [ ] **Step 12:** Nginx reloaded
- [ ] **Step 13:** HTTP tested (apps load)
- [ ] **Step 14:** SSL certificates installed
- [ ] **Step 15:** Backend CORS updated
- [ ] **Step 16:** All subdomains tested (HTTPS working)

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

### Git Divergent Branches

**If you see "divergent branches" error:**

**Option A: Merge (Recommended):**
```bash
git config pull.rebase false
git pull origin main
```

**Option B: Force Pull (Discards Local Changes):**
```bash
git fetch origin
git reset --hard origin/main
```

### Build Fails

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

### 500 Error

**Check Nginx error logs:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 3-5
- Wrong permissions → Re-do Step 6
- Missing index.html → Re-do Steps 3-5

### CORS Errors

**Check backend CORS:**

```bash
cd ~/globapp-backend
grep -A 10 "allow_origins" app.py
```

**Verify subdomains are listed:** Should see `rider.globapp.app`, `driver.globapp.app`, `admin.globapp.app`

**If missing:** Re-do Step 15

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

**Check files:**
```bash
ls -la /var/www/globapp/rider/
```

**Fix permissions:**
```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

**Check Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**View logs:**
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

**Follow these steps in order to deploy your apps to the subdomains!**




