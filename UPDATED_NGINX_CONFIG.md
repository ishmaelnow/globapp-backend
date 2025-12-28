# Updated Nginx Config - Complete File

## Your Updated Config File

Replace the contents of `/etc/nginx/sites-available/default` with this:

```nginx
##
# Minimal production default for GlobApp
##

# ------------------------------------------------------------
# 1) Default HTTP server (IP hits, unknown hosts)
# ------------------------------------------------------------
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    # Normalize /api -> /api/
    location = /api {
        return 301 /api/;
    }

    # Health: do NOT rate limit (monitors will hit this)
    location = /api/v1/health {
        proxy_pass http://127.0.0.1:8000/api/v1/health;

        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API over HTTP -> Uvicorn/FastAPI on localhost
    location /api/ {
        # Rate limiting (requires limit_req_zone in nginx.conf http{})
        limit_req zone=api_ratelimit burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://127.0.0.1:8000/api/;

        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Hardening
        client_max_body_size 10m;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Frontend - Serve React app (UPDATED)
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
}

# ------------------------------------------------------------
# 2) HTTPS server for your domain (globapp.app + www)
# ------------------------------------------------------------
server {
    listen 443 ssl;
    listen [::]:443 ssl ipv6only=on;

    server_name globapp.app www.globapp.app;

    root /var/www/globapp/frontend;  # CHANGED: was /var/www/html
    index index.html index.htm index.nginx-debian.html;

    # --- SSL (Certbot-managed paths) ---
    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Normalize /api -> /api/
    location = /api {
        return 301 /api/;
    }

    # Health: do NOT rate limit (monitors will hit this)
    location = /api/v1/health {
        proxy_pass http://127.0.0.1:8000/api/v1/health;

        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API over HTTPS -> Uvicorn/FastAPI on localhost
    location /api/ {
        # Rate limiting
        limit_req zone=api_ratelimit burst=20 nodelay;
        limit_req_status 429;

        proxy_pass http://127.0.0.1:8000/api/;

        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Hardening
        client_max_body_size 10m;
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Frontend - Serve React app (UPDATED)
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
}

# ------------------------------------------------------------
# 3) HTTP -> HTTPS redirect for your domain
# ------------------------------------------------------------
server {
    listen 80;
    listen [::]:80;

    server_name globapp.app www.globapp.app;

    return 301 https://$host$request_uri;
}
```

## Changes Made

1. **HTTPS server block (port 443):**
   - Changed `root /var/www/html;` → `root /var/www/globapp/frontend;`
   - Changed `location /` from `try_files $uri $uri/ =404;` → `try_files $uri $uri/ /index.html;`

2. **HTTP default server block:**
   - Updated `location /` to serve React frontend (for IP access, though HTTPS is preferred)

## Quick Update Steps

### Option 1: Edit and Update (Recommended)

```bash
# 1. Backup your current config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 2. Edit the file
sudo nano /etc/nginx/sites-available/default

# 3. Make these changes:
#    - In HTTPS server block: Change root to /var/www/globapp/frontend
#    - In HTTPS server block: Change location / to use try_files with /index.html
#    - In HTTP default server block: Update location / similarly

# 4. Test
sudo nginx -t

# 5. Reload
sudo systemctl reload nginx
```

### Option 2: Specific Changes Only

Just change these two things in the HTTPS server block:

**Change 1:** Line with `root`
```nginx
# OLD:
root /var/www/html;

# NEW:
root /var/www/globapp/frontend;
```

**Change 2:** The `location /` block
```nginx
# OLD:
location / {
    try_files $uri $uri/ =404;
}

# NEW:
location / {
    root /var/www/globapp/frontend;
    try_files $uri $uri/ /index.html;
    index index.html;
}
```

## After Updating

1. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

2. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

3. **Verify frontend files exist:**
   ```bash
   ls -la /var/www/globapp/frontend/
   # Should see index.html and assets/ folder
   ```

4. **Test:**
   ```bash
   curl https://globapp.app/
   # Should return HTML content
   ```

## Important Notes

- ✅ Keep all your existing `/api/` configurations (they're perfect!)
- ✅ Keep your rate limiting (good security!)
- ✅ Keep your SSL configuration
- ✅ Only change the `location /` block and `root` directive
- ✅ Make sure frontend files are in `/var/www/globapp/frontend/` before reloading

## You're Ready!

Just update those two things in your config file and reload Nginx!




