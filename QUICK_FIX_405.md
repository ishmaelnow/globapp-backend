# Quick Fix: 405 Not Allowed Error

## Most Likely Causes

1. **Backend not running** on port 8000
2. **Nginx SSL config** might have different proxy settings
3. **Backend route** not matching correctly

## Quick Diagnostic (Run on Droplet)

```bash
# 1. Check if backend is running
sudo systemctl status globapp-api

# 2. Check if port 8000 is listening
sudo netstat -tlnp | grep 8000
# or
sudo ss -tlnp | grep 8000

# 3. Test backend directly (bypass Nginx)
curl http://localhost:8000/api/v1/health

# 4. Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log

# 5. Check the actual Nginx config (might be different if SSL was added)
sudo cat /etc/nginx/sites-available/rider.globapp.app
```

## Most Common Fix

**If backend isn't running:**

```bash
# Start backend
sudo systemctl start globapp-api

# Enable on boot
sudo systemctl enable globapp-api

# Check status
sudo systemctl status globapp-api
```

**If SSL config is different, update it:**

```bash
# Check SSL version of config
sudo cat /etc/nginx/sites-available/rider.globapp.app

# If /api/ location is missing or wrong, fix it:
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Make sure the `/api/` location block exists and proxies correctly:**

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

**Then reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Test After Fix

**From browser console, try again:**
- The POST request should now work
- Check Network tab to see if request goes through



