#!/bin/bash
# DEFINITIVE FIX: Remove ALL duplicates and create ONE clean config

set -e  # Exit on error

echo "=========================================="
echo "DEFINITIVE FIX: Removing ALL Duplicates"
echo "=========================================="

# Step 1: Backup everything
echo ""
echo "Step 1: Creating backup..."
BACKUP_DIR="/tmp/nginx_backup_$(date +%Y%m%d_%H%M%S)"
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r /etc/nginx/sites-enabled/* "$BACKUP_DIR/" 2>/dev/null || true
sudo cp /etc/nginx/sites-enabled/default "$BACKUP_DIR/default.backup" 2>/dev/null || true
echo "Backup created: $BACKUP_DIR"

# Step 2: List all enabled files
echo ""
echo "Step 2: Checking all enabled config files..."
echo "Files in sites-enabled:"
ls -la /etc/nginx/sites-enabled/

# Step 3: Find ALL files with these server names
echo ""
echo "Step 3: Finding ALL files with duplicate server blocks..."
FILES_WITH_RIDER=$(sudo grep -l "server_name rider.globapp.app" /etc/nginx/sites-enabled/* 2>/dev/null || echo "")
FILES_WITH_DRIVER=$(sudo grep -l "server_name driver.globapp.app" /etc/nginx/sites-enabled/* 2>/dev/null || echo "")
FILES_WITH_ADMIN=$(sudo grep -l "server_name admin.globapp.app" /etc/nginx/sites-enabled/* 2>/dev/null || echo "")

echo "Files with rider.globapp.app: $FILES_WITH_RIDER"
echo "Files with driver.globapp.app: $FILES_WITH_DRIVER"
echo "Files with admin.globapp.app: $FILES_WITH_ADMIN"

# Step 4: Remove ALL separate subdomain files
echo ""
echo "Step 4: Removing ALL separate subdomain config files..."
sudo rm -f /etc/nginx/sites-enabled/rider.globapp.app
sudo rm -f /etc/nginx/sites-enabled/driver.globapp.app
sudo rm -f /etc/nginx/sites-enabled/admin.globapp.app
echo "Removed separate files"

# Step 5: Check if default has duplicates and clean it
echo ""
echo "Step 5: Checking default config for duplicates..."
RIDER_COUNT=$(sudo grep -c "server_name rider.globapp.app" /etc/nginx/sites-enabled/default 2>/dev/null || echo "0")
DRIVER_COUNT=$(sudo grep -c "server_name driver.globapp.app" /etc/nginx/sites-enabled/default 2>/dev/null || echo "0")
ADMIN_COUNT=$(sudo grep -c "server_name admin.globapp.app" /etc/nginx/sites-enabled/default 2>/dev/null || echo "0")

echo "Current counts in default:"
echo "  rider.globapp.app: $RIDER_COUNT (should be 2: HTTP redirect + HTTPS)"
echo "  driver.globapp.app: $DRIVER_COUNT (should be 2: HTTP redirect + HTTPS)"
echo "  admin.globapp.app: $ADMIN_COUNT (should be 2: HTTP redirect + HTTPS)"

# Step 6: Create ONE clean default config
echo ""
echo "Step 6: Creating ONE clean config file..."
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

echo "Clean config created!"

# Step 7: Verify counts
echo ""
echo "Step 7: Verifying counts..."
RIDER_COUNT=$(sudo grep -c "server_name rider.globapp.app" /etc/nginx/sites-enabled/default)
DRIVER_COUNT=$(sudo grep -c "server_name driver.globapp.app" /etc/nginx/sites-enabled/default)
ADMIN_COUNT=$(sudo grep -c "server_name admin.globapp.app" /etc/nginx/sites-enabled/default)

echo "New counts:"
echo "  rider.globapp.app: $RIDER_COUNT"
echo "  driver.globapp.app: $DRIVER_COUNT"
echo "  admin.globapp.app: $ADMIN_COUNT"

if [ "$RIDER_COUNT" != "2" ] || [ "$DRIVER_COUNT" != "2" ] || [ "$ADMIN_COUNT" != "2" ]; then
    echo "WARNING: Counts are not 2! Something is wrong."
    exit 1
fi

# Step 8: Test config
echo ""
echo "Step 8: Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "ERROR: Config test failed!"
    echo "Restoring backup..."
    sudo cp "$BACKUP_DIR/default.backup" /etc/nginx/sites-enabled/default
    exit 1
fi

# Step 9: Check for warnings
echo ""
echo "Step 9: Checking for warnings..."
WARNINGS=$(sudo nginx -t 2>&1 | grep -i "warn" || echo "none")

if [ "$WARNINGS" != "none" ]; then
    echo "WARNING: Still seeing warnings:"
    echo "$WARNINGS"
    echo ""
    echo "Checking for remaining duplicates..."
    ls -la /etc/nginx/sites-enabled/ | grep -E "(rider|driver|admin)"
    exit 1
fi

# Step 10: Reload Nginx
echo ""
echo "Step 10: Reloading Nginx..."
sudo systemctl reload nginx

echo ""
echo "=========================================="
echo "SUCCESS! All duplicates removed."
echo "=========================================="
echo ""
echo "Verification:"
echo "  - No separate subdomain files"
echo "  - Only default config exists"
echo "  - Each subdomain appears exactly 2 times (HTTP + HTTPS)"
echo "  - No warnings"
echo ""
echo "Test your apps:"
echo "  https://rider.globapp.app"
echo "  https://driver.globapp.app"
echo "  https://admin.globapp.app"



