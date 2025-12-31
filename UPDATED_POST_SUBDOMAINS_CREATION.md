# Updated Steps Post Subdomains Creation

**Date:** After subdomains have been created

**Subdomains Created:**
- ✅ `rider.globapp.app`
- ✅ `driver.globapp.app`
- ✅ `admin.globapp.app`

**Current Status on Droplet:**
- ✅ Directories exist: `/var/www/globapp/rider`, `driver`, `admin`
- ⚠️ Directories are **empty** (need to deploy files)
- ⚠️ Permissions are `root:root` (need to change to `www-data:www-data`)

---

## 📋 Quick Summary

**What's Done:**
- DNS records created
- Directories created on Droplet

**What's Next:**
1. Pull code from Git
2. Build apps
3. Deploy files
4. Fix permissions
5. Configure Nginx
6. Install SSL
7. Update CORS
8. Test

---

## Step-by-Step Instructions

### Step 1: SSH into Droplet

```bash
ssh ishmael@YOUR_DROPLET_IP
# or
ssh root@YOUR_DROPLET_IP
```

---

### Step 2: Pull Latest Code

```bash
cd ~/globapp-backend
```

**If you see "divergent branches" error, choose one:**

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

**Option C: Force pull (if you want to discard local changes):**
```bash
git fetch origin
git reset --hard origin/main
```

**⚠️ Warning:** Option C will discard any local changes on the Droplet.

**After pulling, verify apps exist:**

```bash
ls -d rider-app driver-app admin-app
```

**Expected:** Should see all three directories.

**If apps don't exist in Git yet:**
- Make sure you've committed and pushed the separate apps from your local machine
- Or use the alternative method (build locally and upload)

---

### Step 3: Build Rider App

```bash
cd ~/globapp-backend/rider-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
```

**Verify:**

```bash
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

### Step 4: Build Driver App

```bash
cd ~/globapp-backend/driver-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/driver/
```

**Verify:**

```bash
ls -la /var/www/globapp/driver/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

### Step 5: Build Admin App

```bash
cd ~/globapp-backend/admin-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
```

**Verify:**

```bash
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

### Step 6: Fix Permissions

```bash
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/admin
```

**Verify:**

```bash
ls -la /var/www/globapp/
```

**Expected:** All directories owned by `www-data:www-data`

---

### Step 7: Configure Nginx

**Create config for Rider:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste:**

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Create config for Driver:**

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste (same as above, change `rider` to `driver`):**

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Create config for Admin:**

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste (same as above, change `driver` to `admin`):**

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 8: Enable Sites and Reload

```bash
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Expected:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`

---

### Step 9: Install SSL Certificates

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d rider.globapp.app
sudo certbot --nginx -d driver.globapp.app
sudo certbot --nginx -d admin.globapp.app
```

**Follow prompts:** Email → Agree → Redirect HTTP to HTTPS

---

### Step 10: Update Backend CORS

```bash
cd ~/globapp-backend
nano app.py
```

**Find `allow_origins` and add:**

```python
allow_origins=[
    "https://globapp.app",
    "https://rider.globapp.app",      # ← ADD
    "https://driver.globapp.app",     # ← ADD
    "https://admin.globapp.app",      # ← ADD
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
],
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Restart backend:**

```bash
sudo systemctl restart globapp-api
```

---

### Step 11: Test

**Visit:**
- https://rider.globapp.app
- https://driver.globapp.app
- https://admin.globapp.app

**Expected:** All should load with green padlock.

---

## ✅ Checklist

- [ ] Code pulled from Git
- [ ] Rider app built and deployed
- [ ] Driver app built and deployed
- [ ] Admin app built and deployed
- [ ] Permissions fixed (www-data:www-data)
- [ ] Nginx configs created
- [ ] Nginx sites enabled
- [ ] SSL certificates installed
- [ ] Backend CORS updated
- [ ] All subdomains tested

---

## Troubleshooting

### Build Fails

```bash
node --version  # Check Node.js installed
npm --version   # Check npm installed
```

**If missing:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 500 Error

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 3-5
- Wrong permissions → Re-do Step 6

### CORS Errors

**Check backend CORS includes subdomains:**

```bash
cd ~/globapp-backend
grep -A 10 "allow_origins" app.py
```

**If missing:** Re-do Step 10

---

## Quick Commands Reference

**Check files:**
```bash
ls -la /var/www/globapp/rider/
```

**Fix permissions:**
```bash
sudo chown -R www-data:www-data /var/www/globapp
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

---

**Start with Step 1 and follow through to Step 11!**

