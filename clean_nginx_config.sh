#!/bin/bash
# Clean Nginx Config - Remove Duplicates and Create Clean Version

# Backup current config
BACKUP_FILE="/etc/nginx/sites-enabled/default.backup.clean.$(date +%Y%m%d_%H%M%S)"
sudo cp /etc/nginx/sites-enabled/default "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

# Check for other server blocks
echo "Checking for other server blocks..."
OTHER_BLOCKS=$(sudo grep -E "server_name (api|globapp\.app|www\.globapp)" /etc/nginx/sites-enabled/default | head -10)
if [ ! -z "$OTHER_BLOCKS" ]; then
    echo "Found other server blocks. Please check backup and add them manually if needed."
    echo "$OTHER_BLOCKS"
fi

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

echo "Clean config created!"
echo "Testing configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Config test passed! Reloading Nginx..."
    sudo systemctl reload nginx
    echo "Done! No duplicates - clean config is active."
else
    echo "Config test failed! Check errors above."
fi



