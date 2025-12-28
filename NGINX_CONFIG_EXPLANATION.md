# Nginx Configuration - One File for Everything

## Answer: Modify Your Existing Config, Don't Create a New One

You can have **multiple Nginx config files**, but for your setup, you want **ONE config file** that handles both frontend and backend on the same domain.

---

## Current Setup (What You Probably Have)

Your existing Nginx config probably looks something like this:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Updated Config (Add Frontend to Existing)

**Just ADD the frontend location block** to your existing config:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend - Serve React app (ADD THIS)
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API - Proxy to FastAPI (YOU ALREADY HAVE THIS)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint (OPTIONAL - ADD IF YOU WANT)
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

---

## How to Update Your Existing Config

### Step 1: Find Your Current Config

```bash
# List all Nginx configs
ls -la /etc/nginx/sites-available/

# Your config is probably named something like:
# - globapp
# - default
# - globapp-backend
# - or similar
```

### Step 2: Edit Your Existing Config

```bash
# Edit your existing config file
sudo nano /etc/nginx/sites-available/globapp
# (or whatever your config file is named)
```

### Step 3: Add Frontend Location Block

**Find this section** (you probably have it):
```nginx
location /api/ {
    ...
}
```

**Add this BEFORE the `/api/` location block:**
```nginx
# Frontend - Serve React app
location / {
    root /var/www/globapp/frontend;
    try_files $uri $uri/ /index.html;
    index index.html;
}
```

### Step 4: Save and Reload

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

---

## Important: Location Block Order

Nginx processes location blocks in a specific order. The `/` location should come **AFTER** more specific paths, but in practice, having `/` first works fine because `/api/` is more specific.

**Recommended order:**
1. Specific paths first (`/api/`, `/health`)
2. Root path last (`/`)

But your config will work fine either way!

---

## Complete Example Config

Here's what your **complete** config should look like:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API - Proxy to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check (optional)
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

---

## If You Have SSL (HTTPS)

If Certbot already set up SSL, your config might look like:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name globapp.app www.globapp.app;

    ssl_certificate /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;

    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API - Proxy to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Just add the frontend `location /` block** to your existing SSL config!

---

## Multiple Config Files?

You CAN have multiple config files, but you typically don't need to:

**Multiple files are useful for:**
- Different domains (globapp.com, api.globapp.com)
- Different apps on same server
- Testing/staging environments

**For your case:**
- ✅ ONE config file (modify existing)
- ✅ Same domain (`globapp.app`)
- ✅ Frontend + Backend together

---

## Quick Steps Summary

1. **Find your existing config:**
   ```bash
   ls /etc/nginx/sites-available/
   ```

2. **Edit it:**
   ```bash
   sudo nano /etc/nginx/sites-available/globapp
   ```

3. **Add frontend location block** (before or after `/api/`)

4. **Test and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## That's It!

You don't need a new config file - just **modify your existing one** to add the frontend location block!




