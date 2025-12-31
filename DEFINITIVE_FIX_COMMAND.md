# DEFINITIVE FIX - Copy and Paste This

## One Command to Fix Everything

**Run this complete command on your Droplet:**

```bash
# Backup, remove ALL duplicates, create clean config, test, and reload
sudo cp /etc/nginx/sites-enabled/default /tmp/nginx_default_backup_$(date +%Y%m%d_%H%M%S) && \
sudo rm -f /etc/nginx/sites-enabled/rider.globapp.app /etc/nginx/sites-enabled/driver.globapp.app /etc/nginx/sites-enabled/admin.globapp.app && \
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

    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

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

# Driver App - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name driver.globapp.app;

    root /var/www/globapp/driver;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

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

# Admin App - HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name admin.globapp.app;

    root /var/www/globapp/admin;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

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
NGINX_EOF
sudo nginx -t && sudo systemctl reload nginx && echo "SUCCESS! No duplicates." || echo "FAILED! Check errors above."
```

## What This Does

1. **Backs up** current config
2. **Removes** ALL separate subdomain files (rider.globapp.app, driver.globapp.app, admin.globapp.app)
3. **Creates** ONE clean default config with all three subdomains
4. **Tests** config
5. **Reloads** Nginx if test passes

## After Running

**Verify no warnings:**
```bash
sudo nginx -t
```

**Should show:** `nginx: configuration file /etc/nginx/nginx.conf test is successful` with **NO warnings**

**If you still see warnings, run:**
```bash
# Check what files still exist
ls -la /etc/nginx/sites-enabled/

# Check for any remaining duplicates
sudo grep -r "server_name rider.globapp.app" /etc/nginx/sites-enabled/
sudo grep -r "server_name driver.globapp.app" /etc/nginx/sites-enabled/
sudo grep -r "server_name admin.globapp.app" /etc/nginx/sites-enabled/
```

**Each should show exactly 2 matches** (one HTTP redirect + one HTTPS block) **in the default file only**.



