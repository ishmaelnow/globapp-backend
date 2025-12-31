# Quick Fix: Driver and Admin Apps Not Working

## Step-by-Step Fix

### Step 1: Verify Files Are Deployed ✅

```bash
# Check if files are in web directories
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/
ls -la /var/www/globapp/rider/
```

**If directories are empty or missing files, run:**

```bash
# Re-deploy Driver App
cd ~/globapp-backend/driver-app
npm run build
sudo cp -r dist/* /var/www/globapp/driver/
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver

# Re-deploy Admin App
cd ~/globapp-backend/admin-app
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/admin
```

---

### Step 2: Check Nginx Configuration ✅

```bash
# Check if Nginx configs exist
ls -la /etc/nginx/sites-available/ | grep -E "(driver|admin|rider)"

# Check if sites are enabled
ls -la /etc/nginx/sites-enabled/ | grep -E "(driver|admin|rider)"
```

**If configs are missing, create them:**

#### Create Driver Config:

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste:**

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

#### Create Admin Config:

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste:**

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

---

### Step 3: Enable Sites and Reload Nginx ✅

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green

---

### Step 4: Test HTTP Access ✅

**From your browser, visit:**
- `http://driver.globapp.app`
- `http://admin.globapp.app`

**Expected:** Apps should load (may show "Not Secure" - that's OK for now)

**If you see errors, check logs:**
```bash
sudo tail -20 /var/log/nginx/error.log
```

---

### Step 5: Install SSL Certificates ✅

**Once HTTP works, install SSL:**

```bash
# Install Certbot if not installed
sudo apt install certbot python3-certbot-nginx -y

# Get certificate for Driver
sudo certbot --nginx -d driver.globapp.app

# Get certificate for Admin
sudo certbot --nginx -d admin.globapp.app

# Verify certificates
sudo certbot certificates
```

**Follow prompts:**
1. Enter email → Press Enter
2. Agree to terms → Type `A` and press Enter
3. Share email (optional) → Type `Y` or `N` and press Enter
4. Redirect HTTP to HTTPS → Type `2` and press Enter (recommended)

---

### Step 6: Test HTTPS Access ✅

**From your browser, visit:**
- `https://driver.globapp.app`
- `https://admin.globapp.app`

**Expected:** Apps should load with green padlock 🔒

---

## Quick Diagnostic Commands

**Run these to see what's wrong:**

```bash
# 1. Check files
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/

# 2. Check Nginx configs
ls -la /etc/nginx/sites-enabled/ | grep -E "(driver|admin)"

# 3. Test Nginx
sudo nginx -t

# 4. Check Nginx status
sudo systemctl status nginx

# 5. Check error logs
sudo tail -20 /var/log/nginx/error.log
```

---

## Most Common Issues

1. **Files not deployed** → Re-deploy (Step 1)
2. **Nginx not configured** → Create configs (Step 2)
3. **Sites not enabled** → Enable sites (Step 3)
4. **Nginx not reloaded** → Reload Nginx (Step 3)
5. **SSL not installed** → Install certificates (Step 5)

---

## Complete Fix (All-in-One)

**If you want to fix everything at once:**

```bash
# 1. Re-deploy apps
cd ~/globapp-backend/driver-app && npm run build && sudo cp -r dist/* /var/www/globapp/driver/ && sudo chown -R www-data:www-data /var/www/globapp/driver
cd ~/globapp-backend/admin-app && npm run build && sudo cp -r dist/* /var/www/globapp/admin/ && sudo chown -R www-data:www-data /var/www/globapp/admin

# 2. Create Nginx configs (use nano commands above)

# 3. Enable and reload
sudo ln -sf /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. Install SSL
sudo certbot --nginx -d driver.globapp.app --non-interactive --agree-tos --email your-email@example.com --redirect
sudo certbot --nginx -d admin.globapp.app --non-interactive --agree-tos --email your-email@example.com --redirect
```

---

**Follow these steps in order, and your apps should work!** 🚀



