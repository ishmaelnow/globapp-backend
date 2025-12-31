# Check Nginx SSL Config for 405 Error

## Issue
Backend is running, but POST requests return 405. Since you're using HTTPS, Certbot may have modified the Nginx config.

## Check SSL Version of Config

**On your Droplet, run:**

```bash
# Check if there's an SSL version (Certbot modifies the config)
sudo cat /etc/nginx/sites-available/rider.globapp.app | grep -A 30 "listen 443"
```

**Or view the full config:**

```bash
sudo cat /etc/nginx/sites-available/rider.globapp.app
```

## Expected SSL Config Should Have

```nginx
server {
    listen 443 ssl;
    server_name rider.globapp.app;
    
    # SSL certificates (added by Certbot)
    ssl_certificate /etc/letsencrypt/live/rider.globapp.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rider.globapp.app/privkey.pem;
    
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

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name rider.globapp.app;
    return 301 https://$server_name$request_uri;
}
```

## If /api/ Location is Missing in SSL Config

**Fix it:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Make sure the `location /api/` block exists in the SSL server block (listen 443).**

**Then:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Test Backend Directly

**Test if backend accepts POST:**

```bash
curl -X POST http://localhost:8000/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{"rider_name":"Test","rider_phone":"1234567890","pickup":"123 Main St","dropoff":"456 Oak Ave","service_type":"economy"}'
```

**If this works, the issue is Nginx. If it fails, the issue is backend.**



