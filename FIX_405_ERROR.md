# Fix 405 Not Allowed Error

## Issue
POST request to `/api/v1/rides` returns `405 Not Allowed`

## Root Cause
The Nginx configuration might not be correctly proxying POST requests, or there's a CORS preflight issue.

## Solution

### Step 1: Check Nginx Configuration

**On your Droplet, verify the Nginx config:**

```bash
# Check the rider app Nginx config
sudo cat /etc/nginx/sites-available/rider.globapp.app
```

**Expected config should have:**

```nginx
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

### Step 2: Fix Nginx Config (If Missing Methods)

**Update the Nginx config to explicitly allow all methods:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Make sure the `/api/` location block includes:**

```nginx
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
    
    # Explicitly allow all HTTP methods
    proxy_method POST;
    proxy_method GET;
    proxy_method PUT;
    proxy_method DELETE;
    proxy_method OPTIONS;
    proxy_method PATCH;
}
```

**Actually, don't use proxy_method - that's wrong. Instead, ensure CORS is handled:**

### Step 3: Check Backend is Running

```bash
# Check if backend is running on port 8000
sudo netstat -tlnp | grep 8000
# or
sudo ss -tlnp | grep 8000

# Check backend service status
sudo systemctl status globapp-api
```

### Step 4: Test Backend Directly

**Test if backend responds:**

```bash
# Test backend health endpoint
curl http://localhost:8000/api/v1/health

# Test POST endpoint directly (bypassing Nginx)
curl -X POST http://localhost:8000/api/v1/rides \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key-if-needed" \
  -d '{"rider_name":"Test","rider_phone":"1234567890","pickup":"123 Main St","dropoff":"456 Oak Ave","service_type":"economy"}'
```

### Step 5: Check CORS Preflight

**405 errors can be caused by CORS preflight (OPTIONS) failing.**

**Verify backend CORS allows POST:**

The backend CORS config should already allow POST. Check:

```bash
cd ~/globapp-backend
grep -A 10 "allow_methods" app.py
```

**Should show:**
```python
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
```

### Step 6: Check Nginx Error Logs

```bash
# Check Nginx error logs for details
sudo tail -50 /var/log/nginx/error.log

# Check access logs
sudo tail -20 /var/log/nginx/access.log | grep rides
```

### Step 7: Reload Nginx

**After any config changes:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Most Likely Fix

**The issue is probably that Nginx isn't correctly proxying to the backend. Try this:**

```bash
# Update rider Nginx config
sudo tee /etc/nginx/sites-available/rider.globapp.app > /dev/null << 'EOF'
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
EOF

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

**If SSL is configured, update the HTTPS version too:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
# Make sure the /api/ location block is correct
sudo nginx -t
sudo systemctl reload nginx
```

## Quick Diagnostic Commands

```bash
# 1. Check backend is running
sudo systemctl status globapp-api

# 2. Test backend directly
curl http://localhost:8000/api/v1/health

# 3. Check Nginx config
sudo nginx -t

# 4. Check Nginx logs
sudo tail -20 /var/log/nginx/error.log

# 5. Test through Nginx
curl -X POST http://localhost/api/v1/rides \
  -H "Host: rider.globapp.app" \
  -H "Content-Type: application/json" \
  -d '{"rider_name":"Test","rider_phone":"123","pickup":"123","dropoff":"456","service_type":"economy"}'
```



