# Check Nginx Configuration on Droplet

## Issue
The API endpoints are returning 404, even though web apps work. This suggests Nginx might still be configured for `globapp.app` instead of `globapp.org`.

## Check Nginx Configuration

**SSH into your droplet:**
```bash
ssh ishmael@157.245.231.224
```

**Check current Nginx config:**
```bash
sudo cat /etc/nginx/sites-enabled/default | grep -i "server_name"
```

**Look for:**
- `server_name admin.globapp.org;` ✅ (correct)
- `server_name admin.globapp.app;` ❌ (needs update)

**Check if `/api/` location blocks exist:**
```bash
sudo grep -A 10 "location /api/" /etc/nginx/sites-enabled/default
```

## If Nginx Still Has `.app` Domains

**Update all `.app` to `.org`:**
```bash
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Verify Backend is Running

```bash
# Check if backend service is running
sudo systemctl status globapp-api

# Check if backend is listening on port 8000
sudo netstat -tlnp | grep 8000
# or
sudo ss -tlnp | grep 8000
```

## Test API Directly on Droplet

```bash
# Test backend directly (bypassing Nginx)
curl http://localhost:8000/api/v1/health

# Test through Nginx
curl https://admin.globapp.org/api/v1/health
```

## Expected Nginx Config for admin.globapp.org

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name admin.globapp.org;

    root /var/www/globapp/admin;
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/globapp.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/globapp.org/privkey.pem;
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
```

## Next Steps

1. Check Nginx config on droplet
2. Update if still using `.app` domains
3. Verify backend is running
4. Test API endpoints
5. Rebuild mobile app APK once API works










