# Clean Nginx Config - Remove Duplicates

## Step 1: Check What Other Server Blocks Exist

**Before creating clean config, check what else is in your current config:**

```bash
# Check for other server blocks (like api.globapp.app, globapp.app, etc.)
sudo grep -E "^server|^#.*===" /etc/nginx/sites-enabled/default | head -50

# Check for api.globapp.app
sudo grep -A 20 "api.globapp.app" /etc/nginx/sites-enabled/default

# Check for main globapp.app
sudo grep -A 20 "server_name globapp.app" /etc/nginx/sites-enabled/default
```

## Step 2: Create Clean Config

**Run this to create a clean config with only the three subdomains:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.clean.$(date +%Y%m%d_%H%M%S)

# Create clean config
sudo tee /etc/nginx/sites-enabled/default > /dev/null << 'NGINX_EOF'
# ============================================================
# HTTP to HTTPS Redirects
# ============================================================

# Rider App - HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name rider.globapp.app;
    return 301 https://$host$request_uri;
}

# Driver App - HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name driver.globapp.app;
    return 301 https://$host$request_uri;
}

# Admin App - HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name admin.globapp.app;
    return 301 https://$host$request_uri;
}

# ============================================================
# HTTPS Server Blocks
# ============================================================

# Rider App - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name rider.globapp.app;

    root /var/www/globapp/rider;
    index index.html;

    # SSL certificates (shared certificate for all globapp.app subdomains)
    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
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

# Driver App - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name driver.globapp.app;

    root /var/www/globapp/driver;
    index index.html;

    # SSL certificates (shared certificate for all globapp.app subdomains)
    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
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

# Admin App - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name admin.globapp.app;

    root /var/www/globapp/admin;
    index index.html;

    # SSL certificates (shared certificate for all globapp.app subdomains)
    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
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
NGINX_EOF

# Test config
sudo nginx -t
```

## Step 3: Add Back Other Server Blocks (If Needed)

**If you have other server blocks (like api.globapp.app, globapp.app), add them back:**

```bash
# Check what other blocks you had
sudo grep -A 30 "api.globapp.app" /etc/nginx/sites-enabled/default.backup.clean.*

# If you have api.globapp.app or other blocks, add them to the config
sudo nano /etc/nginx/sites-enabled/default
# Add the other server blocks after the three subdomains
```

## Step 4: Reload Nginx

```bash
# If test passed, reload
sudo systemctl reload nginx

# Verify no conflicts
sudo nginx -t

# Should show NO warnings now!
```

## Verify All Three Work

```bash
# Test API proxy
curl https://rider.globapp.app/api/v1/health
curl https://driver.globapp.app/api/v1/health
curl https://admin.globapp.app/api/v1/health
```



