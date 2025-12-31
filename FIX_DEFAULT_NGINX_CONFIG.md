# Fix Default Nginx Config - Add /api/ Location

## Issue Found
The default config has `rider.globapp.app` but is missing the `/api/` location block that proxies to the backend.

## Fix: Add /api/ Location to Default Config

**On your Droplet:**

```bash
# Edit the default config
sudo nano /etc/nginx/sites-enabled/default
```

**Find the `rider.globapp.app` HTTPS server block (around line with `# 6) rider.globapp.app`) and add the `/api/` location:**

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;

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

    # ADD THIS BLOCK:
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
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Then:**

```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## Alternative: Use sed to Add It

**If you prefer command line:**

```bash
# Backup default
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Add /api/ location block after the location / block for rider.globapp.app
sudo sed -i '/server_name rider.globapp.app;/,/^}$/ {
    /location \/ {/,/^    }$/ {
        /^    }$/a\
\
    location /api/ {\
        proxy_pass http://localhost:8000;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection '\''upgrade'\'';\
        proxy_set_header Host $host;\
        proxy_cache_bypass $http_upgrade;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }
    }
}' /etc/nginx/sites-enabled/default

# Test
sudo nginx -t
sudo systemctl reload nginx
```

## Or: Remove from Default and Use Separate File

**If you prefer to use the separate file:**

```bash
# Remove rider.globapp.app from default
sudo nano /etc/nginx/sites-enabled/default
# Delete the # 6) rider.globapp.app section (both HTTP and HTTPS blocks)

# Enable the separate file
sudo ln -sf /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/

# Test
sudo nginx -t
sudo systemctl reload nginx
```



