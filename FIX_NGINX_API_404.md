# Fix 404 API Error - Server Configuration

## 🔴 Problem
Mobile app (and direct API calls) getting 404 errors when accessing:
- `https://admin.globapp.org/api/v1/health`
- `https://admin.globapp.org/api/v1/drivers`
- etc.

**But web apps work** because they use relative URLs (`/api/v1`) which resolve to the same domain.

## ✅ Solution: Fix Nginx Configuration on Droplet

### Step 1: SSH into Droplet
```bash
ssh ishmael@157.245.231.224
```

### Step 2: Check Current Nginx Configuration
```bash
# Check what server_name entries exist
sudo grep "server_name" /etc/nginx/sites-enabled/default

# Check if /api/ location blocks exist
sudo grep -A 5 "location /api/" /etc/nginx/sites-enabled/default
```

### Step 3: Verify Backend is Running
```bash
# Check if backend service is running
sudo systemctl status globapp-api

# If not running, start it:
sudo systemctl start globapp-api
sudo systemctl enable globapp-api

# Check if backend is listening on port 8000
sudo netstat -tlnp | grep 8000
# Should show: tcp 0 0 127.0.0.1:8000 ... python or uvicorn
```

### Step 4: Test Backend Directly (Bypass Nginx)
```bash
# Test backend directly
curl http://localhost:8000/api/v1/health

# Expected: {"ok":true,"version":"v1",...}
```

### Step 5: Check Nginx Config for admin.globapp.org

**View the admin server block:**
```bash
sudo grep -A 30 "server_name admin.globapp.org" /etc/nginx/sites-enabled/default
```

**It should look like this:**
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name admin.globapp.org;

    root /var/www/globapp/admin;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/globapp.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.org/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend - THIS IS CRITICAL!
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

### Step 6: If `/api/` Location Block is Missing

**Add it manually:**
```bash
# Backup config first
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Edit config
sudo nano /etc/nginx/sites-enabled/default
```

**Find the `admin.globapp.org` server block and add the `/api/` location block after `location / { ... }`:**

```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Add this block:
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
```

### Step 7: If Still Using `.app` Domain Names

**Update all `.app` to `.org`:**
```bash
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default
```

### Step 8: Test and Reload Nginx
```bash
# Test configuration syntax
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 9: Test API Endpoint
```bash
# From droplet, test API through Nginx
curl https://admin.globapp.org/api/v1/health

# Expected: {"ok":true,"version":"v1",...}
```

### Step 10: Test from Your Local Machine
```powershell
# From Windows PowerShell
Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET
```

## 🔍 Common Issues

### Issue 1: Backend Not Running
**Symptom:** `curl http://localhost:8000/api/v1/health` fails
**Fix:**
```bash
sudo systemctl start globapp-api
sudo systemctl status globapp-api
```

### Issue 2: Wrong Domain in Nginx Config
**Symptom:** Nginx config has `admin.globapp.app` instead of `admin.globapp.org`
**Fix:**
```bash
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Issue 3: Missing `/api/` Location Block
**Symptom:** `location /api/` block doesn't exist in Nginx config
**Fix:** Add the `/api/` location block as shown in Step 6

### Issue 4: Backend Listening on Wrong Interface
**Symptom:** Backend only listening on `127.0.0.1:8000` but Nginx can't reach it
**Fix:** Check backend config - should listen on `127.0.0.1:8000` (localhost) which is correct for Nginx proxy

## ✅ Verification Checklist

After fixing, verify:
- [ ] Backend service is running: `sudo systemctl status globapp-api`
- [ ] Backend responds: `curl http://localhost:8000/api/v1/health`
- [ ] Nginx config has `server_name admin.globapp.org;`
- [ ] Nginx config has `location /api/` block
- [ ] Nginx test passes: `sudo nginx -t`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] API works through Nginx: `curl https://admin.globapp.org/api/v1/health`
- [ ] Mobile app can connect (test after fixing)

## 📝 Quick Fix Script

If you want to quickly check and fix common issues:

```bash
# SSH into droplet first, then run:

# 1. Check backend
sudo systemctl status globapp-api || sudo systemctl start globapp-api

# 2. Update domain names
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default

# 3. Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# 4. Test API
curl https://admin.globapp.org/api/v1/health
```

---

**Once Nginx is fixed, the mobile app should work!** 🎯










