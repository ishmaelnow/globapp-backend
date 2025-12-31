# Post Git Pull Failure - Next Steps

**Current Situation:** Git pull failed with "divergent branches" error on your Droplet.

**You are here:** `~/globapp-backend` on your DigitalOcean Droplet

---

## Step 1: Fix the Divergent Branches Error

**You have two options. Choose ONE:**

### Option A: Merge (Recommended - Safest)

**Keeps both local and remote changes:**

```bash
git config pull.rebase false
git pull origin main
```

**Use this if:** You want to keep any local changes on the Droplet.

---

### Option B: Force Pull (Use Remote Version Only)

**Discards local changes, uses only remote code:**

```bash
git fetch origin
git reset --hard origin/main
```

**⚠️ WARNING:** This will DELETE any local changes on the Droplet.

**Use this if:** You're certain all important code is on GitHub and you want the Droplet to match GitHub exactly.

---

## Step 2: Verify Apps Are Present

**After fixing Git, check that apps exist:**

```bash
ls -d rider-app driver-app admin-app
```

**Expected output:**
```
rider-app  driver-app  admin-app
```

**If apps don't exist:** You need to commit and push them from your local machine first.

**On your local machine (Windows):**
```bash
cd C:\Users\koshi\cursor-apps\flask-react-project
git add rider-app driver-app admin-app
git commit -m "Add separate apps for deployment"
git push origin main
```

**Then go back to Droplet and pull again:**
```bash
git pull origin main
```

---

## Step 3: Build Rider App

```bash
cd ~/globapp-backend/rider-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 4: Deploy Rider App

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Verify files were copied
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder (directory is no longer empty!).

---

## Step 5: Build Driver App

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

---

## Step 6: Deploy Driver App

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Verify files were copied
ls -la /var/www/globapp/driver/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 7: Build Admin App

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

---

## Step 8: Deploy Admin App

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Verify files were copied
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 9: Fix File Permissions

**Files need correct ownership for Nginx to serve them:**

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

**Expected:** All directories (`rider`, `driver`, `admin`) should be owned by `www-data:www-data`

---

## Step 10: Check Nginx Configuration

**Check if Nginx configs already exist:**

```bash
ls -la /etc/nginx/sites-available/ | grep globapp
```

**If configs exist:** Skip to Step 11.

**If configs don't exist:** Create them (see Step 10A below).

---

## Step 10A: Create Nginx Configurations (If Needed)

### Create Rider Config

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste this:**

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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Create Driver Config

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste this:**

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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Create Admin Config

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste this:**

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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Enable Sites

```bash
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/
```

---

## Step 11: Test and Reload Nginx

```bash
# Test Nginx configuration
sudo nginx -t
```

**Expected:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`

**If test fails:** Check the error message and fix any issues.

```bash
# Reload Nginx
sudo systemctl reload nginx

# Verify Nginx is running
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green.

---

## Step 12: Test HTTP (Before SSL)

**Open browser and test:**

1. Visit: `http://rider.globapp.app`
2. Visit: `http://driver.globapp.app`
3. Visit: `http://admin.globapp.app`

**Expected:** Apps should load (may show "Not Secure" - that's OK for now).

**If you see 500 error:** Check logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 3-8
- Wrong permissions → Re-do Step 9
- Missing index.html → Re-do Steps 3-8

---

## Step 13: Install SSL Certificates

```bash
# Install Certbot if not installed
sudo apt install certbot python3-certbot-nginx -y

# Get certificate for Rider
sudo certbot --nginx -d rider.globapp.app

# Get certificate for Driver
sudo certbot --nginx -d driver.globapp.app

# Get certificate for Admin
sudo certbot --nginx -d admin.globapp.app
```

**For each certificate:**
1. Enter email → Press Enter
2. Agree to terms → Type `A` and press Enter
3. Share email (optional) → Type `Y` or `N` and press Enter
4. Redirect HTTP to HTTPS → Type `2` and press Enter

**Verify certificates:**

```bash
sudo certbot certificates
```

**Expected:** Should show all three certificates with expiration dates.

---

## Step 14: Update Backend CORS

```bash
cd ~/globapp-backend
nano app.py
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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

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

## Step 15: Test HTTPS

**Open browser and test:**

1. Visit: `https://rider.globapp.app`
2. Visit: `https://driver.globapp.app`
3. Visit: `https://admin.globapp.app`

**Expected:**
- ✅ Apps load correctly
- ✅ Green padlock in address bar
- ✅ No CORS errors in browser console (F12)

---

## ✅ Complete Checklist

- [ ] **Step 1:** Fixed divergent branches (chose Option A or B)
- [ ] **Step 2:** Verified apps exist (`rider-app`, `driver-app`, `admin-app`)
- [ ] **Step 3:** Built Rider app
- [ ] **Step 4:** Deployed Rider app
- [ ] **Step 5:** Built Driver app
- [ ] **Step 6:** Deployed Driver app
- [ ] **Step 7:** Built Admin app
- [ ] **Step 8:** Deployed Admin app
- [ ] **Step 9:** Fixed file permissions
- [ ] **Step 10:** Checked/created Nginx configs
- [ ] **Step 11:** Tested and reloaded Nginx
- [ ] **Step 12:** Tested HTTP (apps load)
- [ ] **Step 13:** Installed SSL certificates
- [ ] **Step 14:** Updated backend CORS
- [ ] **Step 15:** Tested HTTPS (all working)

---

## 🎯 Quick Start - What to Do Right Now

**You're currently on your Droplet at `~/globapp-backend`.**

**Run these commands:**

```bash
# Fix divergent branches
git config pull.rebase false
git pull origin main

# Verify apps exist
ls -d rider-app driver-app admin-app
```

**Then continue with Steps 3-15 above.**

---

## Troubleshooting

### If Apps Don't Exist After Pull

**On your local machine (Windows):**

```bash
cd C:\Users\koshi\cursor-apps\flask-react-project
git add rider-app driver-app admin-app
git commit -m "Add separate apps for deployment"
git push origin main
```

**Then on Droplet:**

```bash
git pull origin main
```

### If Build Fails

**Check Node.js:**

```bash
node --version
npm --version
```

**If not installed:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### If 500 Error

**Check Nginx logs:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 3-8
- Wrong permissions → Re-do Step 9
- Missing index.html → Re-do Steps 3-8

### If CORS Errors

**Check backend CORS:**

```bash
cd ~/globapp-backend
grep -A 10 "allow_origins" app.py
```

**Verify subdomains are listed:** Should see `rider.globapp.app`, `driver.globapp.app`, `admin.globapp.app`

**If missing:** Re-do Step 14

---

**Follow these steps in order starting from Step 1!**




