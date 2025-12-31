# Complete Nginx Config for All Three Subdomains

## Complete Config File

**Replace `/etc/nginx/sites-enabled/default` with this complete config:**

```nginx
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

# ============================================================
# Other existing server blocks (keep if they exist)
# ============================================================
# Add any other server blocks here (like api.globapp.app, globapp.app, etc.)
# Don't delete them, just make sure they're after the three above
```

## Installation Commands

**On your Droplet:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)

# Create the complete config
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

# If test passes, reload
sudo systemctl reload nginx

# Verify all three are working
curl -I https://rider.globapp.app
curl -I https://driver.globapp.app
curl -I https://admin.globapp.app
```

## Important Notes

1. **Keep Other Server Blocks**: If your default config has other server blocks (like `api.globapp.app`, `globapp.app`, etc.), you'll need to add them back. Check your backup:
   ```bash
   sudo cat /etc/nginx/sites-enabled/default.backup.* | grep -A 30 "api.globapp.app"
   ```

2. **Certificate Path**: Using `/etc/letsencrypt/live/globapp.app/` assuming shared certificate. If certificates are separate, update paths accordingly.

3. **Backend Port**: All three proxy to `http://localhost:8000` - make sure your backend is running on port 8000.

## After Installation

**Test all three subdomains:**

```bash
# Test HTTP redirects
curl -I http://rider.globapp.app
curl -I http://driver.globapp.app
curl -I http://admin.globapp.app

# Test HTTPS
curl -I https://rider.globapp.app
curl -I https://driver.globapp.app
curl -I https://admin.globapp.app

# Test API proxy
curl https://rider.globapp.app/api/v1/health
curl https://driver.globapp.app/api/v1/health
curl https://admin.globapp.app/api/v1/health
```

## If You Have Other Server Blocks

**If your default config has other blocks (like api.globapp.app), append them:**

```bash
# Check what else is in your backup
sudo grep -E "^server|^#.*===" /etc/nginx/sites-enabled/default.backup.* | head -20

# Then manually add those blocks to the new config
sudo nano /etc/nginx/sites-enabled/default
```



