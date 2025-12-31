# Find What's Actually Serving Rider App

## Check All Nginx Configs

**On your Droplet:**

```bash
# Check all enabled sites
ls -la /etc/nginx/sites-enabled/

# Check default config (might be serving rider)
sudo cat /etc/nginx/sites-enabled/default

# Check if there's a globapp config
ls -la /etc/nginx/sites-available/ | grep globapp

# Check main nginx config for includes
sudo grep -r "rider.globapp.app" /etc/nginx/

# Check what server block is handling the request
sudo nginx -T | grep -A 20 "rider.globapp.app"
```

## Most Likely: Certbot Created Default Config

**Certbot might have modified the default config. Check:**

```bash
sudo cat /etc/nginx/sites-enabled/default
```

## Fix: Create Proper Config and Enable It

```bash
# Create the config file
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

    # SSL certificates
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

# Enable it
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```
