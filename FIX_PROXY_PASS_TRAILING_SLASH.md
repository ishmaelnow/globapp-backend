# Fix Nginx proxy_pass Trailing Slash Issue

## 🔴 Problem
Backend is running, Nginx config looks correct, but API requests return 404.

## ✅ Solution: Fix proxy_pass Trailing Slash

The issue is likely with how Nginx handles the `proxy_pass` directive. When you have:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
}
```

Nginx passes the full path including `/api/` to the backend. But if your backend expects paths without the `/api/` prefix, or if there's a path mismatch, you'll get 404.

### Option 1: Add Trailing Slash to proxy_pass (Recommended)

**On your droplet, edit Nginx config:**
```bash
sudo nano /etc/nginx/sites-enabled/default
```

**Find all `location /api/` blocks and change:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;  # ❌ Without trailing slash
}
```

**To:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000/;  # ✅ With trailing slash
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**What this does:**
- Request: `https://admin.globapp.org/api/v1/health`
- Nginx strips `/api/` and proxies: `http://127.0.0.1:8000/v1/health`
- But your backend expects: `/api/v1/health`

**Wait, that's wrong!** Your backend expects `/api/v1/health`, so we need to keep `/api/` in the path.

### Option 2: Keep Path As-Is (Correct for Your Setup)

Your current config should work:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;  # ✅ This is correct
}
```

This means:
- Request: `https://admin.globapp.org/api/v1/health`
- Nginx proxies: `http://127.0.0.1:8000/api/v1/health` ✅

### Option 3: Test What Backend Actually Receives

**On droplet, check Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Then from your local machine, make a request:**
```powershell
Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET
```

**Watch the Nginx error log to see what's happening.**

### Option 4: Test Directly Through Nginx

**On droplet:**
```bash
# Test from droplet itself
curl -H "Host: admin.globapp.org" http://localhost/api/v1/health

# Or test HTTPS
curl https://admin.globapp.org/api/v1/health
```

## 🔍 Debugging Steps

### Step 1: Check Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

Make a request from your mobile app or local machine, and see what Nginx logs.

### Step 2: Check Backend Logs
```bash
sudo journalctl -u globapp-api -f
```

Make a request and see if it reaches the backend.

### Step 3: Test Different Endpoints
```bash
# On droplet
curl https://admin.globapp.org/api/v1/health
curl https://admin.globapp.org/api/v1/info
curl https://admin.globapp.org/api/v1/drivers -H "X-API-Key: test"
```

### Step 4: Check for Multiple Server Blocks

**Check if there are conflicting server blocks:**
```bash
sudo grep -n "server_name" /etc/nginx/sites-enabled/default
```

**Check which server block is matching:**
```bash
sudo nginx -T | grep -A 5 "server_name admin.globapp.org"
```

## ✅ Most Likely Fix

Since your backend expects `/api/v1/health` and your Nginx config has `location /api/` with `proxy_pass http://127.0.0.1:8000`, the config should be correct.

**Try reloading Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Then test:**
```bash
curl https://admin.globapp.org/api/v1/health
```

If it still doesn't work, check:
1. Are there multiple server blocks for `admin.globapp.org`?
2. Is there a default server block catching the request first?
3. Check Nginx error logs for clues

## 📝 Quick Test Script

```bash
# On droplet
echo "Testing backend directly..."
curl http://localhost:8000/api/v1/health

echo -e "\nTesting through Nginx..."
curl https://admin.globapp.org/api/v1/health

echo -e "\nChecking Nginx config..."
sudo nginx -t

echo -e "\nReloading Nginx..."
sudo systemctl reload nginx

echo -e "\nTesting again..."
curl https://admin.globapp.org/api/v1/health
```










