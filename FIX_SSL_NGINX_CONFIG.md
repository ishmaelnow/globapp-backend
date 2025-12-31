# Fix SSL Nginx Config - Missing HTTPS Block

## Issue
Nginx config only shows HTTP (port 80), but you're accessing via HTTPS. SSL certificates are installed, but the HTTPS server block might be missing or in wrong location.

## Check What's Actually Enabled

**On your Droplet:**

```bash
# Check what's in sites-enabled
ls -la /etc/nginx/sites-enabled/ | grep rider

# Check if Certbot created a separate file
ls -la /etc/nginx/sites-available/ | grep rider

# Check the actual enabled config
sudo cat /etc/nginx/sites-enabled/rider.globapp.app

# Check if SSL certificates exist
sudo certbot certificates | grep rider
```

## Most Likely Fix

**Certbot should have modified the config to add SSL. Let's recreate it properly:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-available/rider.globapp.app.backup

# Create complete config with SSL
sudo tee /etc/nginx/sites-available/rider.globapp.app > /dev/null << 'EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name rider.globapp.app;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name rider.globapp.app;

    # SSL certificates (Certbot will have created these)
    ssl_certificate /etc/letsencrypt/live/rider.globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rider.globapp.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/globapp/rider;
    index index.html;

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
EOF

# Test config
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

## Alternative: Let Certbot Reconfigure

**If certificates exist but config is wrong:**

```bash
# Re-run Certbot to fix the config
sudo certbot --nginx -d rider.globapp.app --reinstall
```

**Then manually add the /api/ location block if Certbot removes it:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
# Add the /api/ location block to the SSL server block
sudo nginx -t
sudo systemctl reload nginx
```



