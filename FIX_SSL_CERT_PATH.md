# Fix SSL Certificate Path

## Find Actual Certificate Paths

**On your Droplet:**

```bash
# Check where certificates actually are
sudo certbot certificates

# List certificate files
sudo ls -la /etc/letsencrypt/live/

# Check if there's a shared certificate (common for multiple domains)
sudo ls -la /etc/letsencrypt/live/globapp.app/
```

## Most Likely: Shared Certificate

**Certbot often creates one certificate for multiple domains. Check:**

```bash
sudo certbot certificates
```

**If it shows one certificate for multiple domains (globapp.app, rider.globapp.app, etc.), use the main domain's certificate path:**

```nginx
ssl_certificate /etc/letsencrypt/live/globapp.app/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
```

## Fix Config with Correct Path

**After finding the correct path, update:**

```bash
# First, find the correct certificate path
CERT_PATH=$(sudo certbot certificates | grep -A 5 "rider.globapp.app" | grep "Certificate Path" | awk '{print $3}' | head -1 | xargs dirname 2>/dev/null || echo "/etc/letsencrypt/live/globapp.app")

# Or check manually
sudo certbot certificates
```

**Then create config with correct path:**

```bash
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

    # SSL certificates (use shared certificate if multiple domains)
    ssl_certificate /etc/letsencrypt/live/globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.app/privkey.pem;
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

# Enable and test
sudo ln -sf /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```



