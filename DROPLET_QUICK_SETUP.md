# Quick Setup: Frontend on Droplet

## What You Need to Do

### On Your Droplet (SSH in):

```bash
# 1. Go to your project
cd ~/globapp-backend

# 2. Pull latest code (includes frontend)
git pull origin main

# 3. Install Nginx
sudo apt update
sudo apt install nginx -y

# 4. Build frontend
cd frontend
npm install
npm run build

# 5. Create directory for Nginx to serve
sudo mkdir -p /var/www/globapp/frontend
sudo cp -r dist/* /var/www/globapp/frontend/

# 6. Configure Nginx (see next section)
```

### Configure Nginx:

```bash
sudo nano /etc/nginx/sites-available/globapp
```

Paste this (replace with your actual setup):

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/globapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default
sudo nginx -t  # Test config
sudo systemctl restart nginx
```

### Set Up SSL:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d globapp.app -d www.globapp.app
```

### Update Frontend API URL:

Since everything is on same domain, change frontend config:

```bash
cd ~/globapp-backend/frontend/src/config
nano api.js
```

Change to:
```javascript
const BASE_URL = '/api/v1';  // Relative URL!
```

Rebuild:
```bash
cd ~/globapp-backend/frontend
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

Done! Visit https://globapp.app ✅




