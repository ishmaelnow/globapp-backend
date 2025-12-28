# Setup Frontend on Droplet - Copy & Paste Guide

## Prerequisites

- SSH access to your Droplet
- Domain `globapp.app` pointing to your Droplet IP
- Backend already running on port 8000

---

## Step 1: SSH into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

---

## Step 2: Pull Latest Code

```bash
cd ~/globapp-backend
git pull origin main
```

---

## Step 3: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verify Nginx is running:
```bash
sudo systemctl status nginx
```

---

## Step 4: Install Node.js (If Not Already Installed)

```bash
# Check if Node.js is installed
node --version

# If not installed:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

---

## Step 5: Build Frontend

```bash
cd ~/globapp-backend/frontend
npm install
npm run build
```

Wait for build to complete. You should see:
```
✓ built in X.XXs
```

---

## Step 6: Set Up Frontend Directory

```bash
# Create directory for Nginx to serve
sudo mkdir -p /var/www/globapp/frontend

# Copy built frontend files
sudo cp -r ~/globapp-backend/frontend/dist/* /var/www/globapp/frontend/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

Verify files are there:
```bash
ls -la /var/www/globapp/frontend/
# Should see index.html and assets/ folder
```

---

## Step 7: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/globapp
```

**Copy and paste this entire configuration:**

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API - Proxy to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin * always;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## Step 8: Enable Nginx Site

```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/globapp /etc/nginx/sites-enabled/

# Remove default site (optional but recommended)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If you see errors, check the configuration file for typos.

---

## Step 9: Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## Step 10: Set Up SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your email)
sudo certbot --nginx -d globapp.app -d www.globapp.app --email your-email@example.com --agree-tos --non-interactive

# Or interactive mode (recommended first time):
sudo certbot --nginx -d globapp.app -d www.globapp.app
```

Follow the prompts:
- Enter your email
- Agree to terms (Y)
- Choose whether to redirect HTTP to HTTPS (recommended: 2)

Certbot will automatically update your Nginx config with SSL.

---

## Step 11: Verify Backend is Running

```bash
# Check if backend is running
curl http://127.0.0.1:8000/api/v1/health

# Should return: {"ok":true}
```

If backend is not running, start it:

```bash
cd ~/globapp-backend
source venv/bin/activate  # If using virtual environment
uvicorn app:app --host 127.0.0.1 --port 8000 &
```

Or set up as a service (see Step 12).

---

## Step 12: Set Up Backend as Service (Optional but Recommended)

Create systemd service so backend starts automatically:

```bash
sudo nano /etc/systemd/system/globapp-backend.service
```

Paste this (adjust paths if needed):

```ini
[Unit]
Description=GlobApp Backend API
After=network.target

[Service]
User=root
WorkingDirectory=/root/globapp-backend
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/uvicorn app:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**If using virtual environment, change ExecStart to:**
```ini
ExecStart=/root/globapp-backend/venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable globapp-backend
sudo systemctl start globapp-backend
sudo systemctl status globapp-backend
```

---

## Step 13: Test Everything

### Test Backend API:
```bash
curl https://globapp.app/api/v1/health
# Should return: {"ok":true}
```

### Test Frontend:
1. Open browser
2. Visit: **https://globapp.app**
3. Should see your React app!

### Test from Browser Console:
1. Open https://globapp.app
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Should see: `API Base URL: /api/v1`
5. Try booking a ride - should work!

---

## Troubleshooting

### Frontend shows blank page:
```bash
# Check if files exist
ls -la /var/www/globapp/frontend/

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 502 Bad Gateway:
```bash
# Backend not running - start it
cd ~/globapp-backend
uvicorn app:app --host 127.0.0.1 --port 8000 &

# Or restart service
sudo systemctl restart globapp-backend
```

### API calls fail:
```bash
# Test backend directly
curl http://127.0.0.1:8000/api/v1/health

# Check Nginx proxy logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues:
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## Quick Commands Reference

```bash
# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart backend service
sudo systemctl restart globapp-backend

# Check backend status
sudo systemctl status globapp-backend

# View backend logs
sudo journalctl -u globapp-backend -f
```

---

## Updating Frontend (After Changes)

```bash
cd ~/globapp-backend/frontend
git pull origin main  # or frontend branch
npm install  # If dependencies changed
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

---

## Updating Backend (After Changes)

```bash
cd ~/globapp-backend
git pull origin main  # or backend branch
sudo systemctl restart globapp-backend
```

---

## Success Checklist

- [ ] Nginx installed and running
- [ ] Frontend built successfully
- [ ] Files copied to /var/www/globapp/frontend/
- [ ] Nginx configuration created and enabled
- [ ] SSL certificate installed
- [ ] Backend running on port 8000
- [ ] Can access https://globapp.app
- [ ] Frontend loads correctly
- [ ] API calls work (no CORS errors)

---

## You're Done! 🎉

Visit **https://globapp.app** and your app should work!

Everything runs on the same domain, so no CORS issues.




