# Troubleshooting: Driver and Admin Apps Not Working

## Quick Diagnostic Steps

Run these commands on your Droplet to identify the issue:

### Step 1: Verify Files Are Deployed

```bash
# Check if files exist in web directories
ls -la /var/www/globapp/driver/
ls -la /var/www/globapp/admin/
ls -la /var/www/globapp/rider/
```

**Expected:** All three should show `index.html` and `assets/` folder

**If empty or missing files:**
- Re-deploy the apps (see "Re-deploy Apps" section below)

---

### Step 2: Check Nginx Configuration

```bash
# Check if Nginx configs exist
ls -la /etc/nginx/sites-available/ | grep -E "(driver|admin|rider)"

# Check if sites are enabled
ls -la /etc/nginx/sites-enabled/ | grep -E "(driver|admin|rider)"

# Test Nginx configuration
sudo nginx -t
```

**Expected:** 
- Config files should exist in `sites-available`
- Symlinks should exist in `sites-enabled`
- `nginx -t` should show "test is successful"

**If configs are missing:** See "Set Up Nginx" section below

---

### Step 3: Check Nginx Status

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log
```

**Expected:** Nginx should be "active (running)"

**If errors in log:** Check the specific error message

---

### Step 4: Test HTTP Access

```bash
# Test if apps respond on HTTP (from Droplet)
curl -I http://localhost -H "Host: driver.globapp.app"
curl -I http://localhost -H "Host: admin.globapp.app"
curl -I http://localhost -H "Host: rider.globapp.app"
```

**Expected:** Should return `200 OK` or `301 Moved Permanently` (if SSL redirect is enabled)

---

### Step 5: Check DNS Resolution

**From your local machine (Windows PowerShell):**

```powershell
Resolve-DnsName driver.globapp.app
Resolve-DnsName admin.globapp.app
Resolve-DnsName rider.globapp.app
```

**Expected:** All should resolve to your Droplet IP address

**If DNS not resolving:** Wait 15-30 minutes or check DNS records in DigitalOcean

---

### Step 6: Check SSL Certificates

```bash
# Check if SSL certificates exist
sudo certbot certificates
```

**Expected:** Should show certificates for all three subdomains

**If missing:** See "Install SSL Certificates" section below

---

## Common Issues and Fixes

### Issue 1: Files Not Deployed

**Symptoms:** Empty directories or missing files

**Fix: Re-deploy Apps**

```bash
# Driver App
cd ~/globapp-backend/driver-app
npm run build
sudo cp -r dist/* /var/www/globapp/driver/
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver

# Admin App
cd ~/globapp-backend/admin-app
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/admin
```

---

### Issue 2: Nginx Not Configured

**Symptoms:** 404 errors, "Site can't be reached", or default Nginx page

**Fix: Set Up Nginx Configs**

```bash
# Create Nginx config for Driver App
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

**Create Nginx config for Admin App:**

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

**Enable sites:**

```bash
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Issue 3: Nginx Not Running

**Symptoms:** "Site can't be reached" or connection refused

**Fix:**

```bash
# Start Nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

### Issue 4: Permission Issues

**Symptoms:** 403 Forbidden errors

**Fix:**

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chown -R www-data:www-data /var/www/globapp/admin

# Fix permissions
sudo chmod -R 755 /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/admin

# Verify
ls -la /var/www/globapp/
```

---

### Issue 5: SSL Certificates Missing

**Symptoms:** HTTPS not working, browser security warnings

**Fix:**

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

---

### Issue 6: CORS Errors

**Symptoms:** Browser console shows CORS errors, API calls fail

**Fix:**

```bash
# Check backend CORS configuration
cd ~/globapp-backend
grep -A 15 "allow_origins" app.py

# Verify subdomains are listed:
# - "https://driver.globapp.app"
# - "https://admin.globapp.app"

# If missing, update app.py and restart backend
sudo systemctl restart globapp-api
```

---

### Issue 7: Backend Not Running

**Symptoms:** 502 Bad Gateway errors

**Fix:**

```bash
# Check backend status
sudo systemctl status globapp-api

# If not running, start it
sudo systemctl start globapp-api

# Check if backend is listening on port 8000
sudo netstat -tlnp | grep 8000
# or
sudo ss -tlnp | grep 8000
```

---

## Complete Re-deployment Checklist

If nothing works, follow this complete checklist:

- [ ] **Step 1:** Verify apps are built
  ```bash
  cd ~/globapp-backend/driver-app && ls -la dist/
  cd ~/globapp-backend/admin-app && ls -la dist/
  ```

- [ ] **Step 2:** Copy files to web directories
  ```bash
  sudo cp -r ~/globapp-backend/driver-app/dist/* /var/www/globapp/driver/
  sudo cp -r ~/globapp-backend/admin-app/dist/* /var/www/globapp/admin/
  ```

- [ ] **Step 3:** Set permissions
  ```bash
  sudo chown -R www-data:www-data /var/www/globapp/driver
  sudo chown -R www-data:www-data /var/www/globapp/admin
  sudo chmod -R 755 /var/www/globapp/driver
  sudo chmod -R 755 /var/www/globapp/admin
  ```

- [ ] **Step 4:** Create/verify Nginx configs (see Issue 2 above)

- [ ] **Step 5:** Enable sites and reload Nginx
  ```bash
  sudo ln -sf /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
  sudo ln -sf /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

- [ ] **Step 6:** Install SSL certificates (see Issue 5 above)

- [ ] **Step 7:** Verify backend CORS includes subdomains (see Issue 6 above)

- [ ] **Step 8:** Test in browser
  - http://driver.globapp.app (should work or redirect to HTTPS)
  - http://admin.globapp.app (should work or redirect to HTTPS)
  - https://driver.globapp.app (should work with SSL)
  - https://admin.globapp.app (should work with SSL)

---

## What Error Are You Seeing?

Please share:
1. **What happens when you visit the URLs?**
   - 404 Not Found?
   - 502 Bad Gateway?
   - Site can't be reached?
   - Default Nginx page?
   - Blank page?
   - CORS errors in browser console?

2. **Output of diagnostic commands:**
   ```bash
   ls -la /var/www/globapp/driver/
   ls -la /var/www/globapp/admin/
   ls -la /etc/nginx/sites-enabled/ | grep -E "(driver|admin)"
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Browser console errors (F12 → Console tab)**

This will help me provide a specific fix!



