# Subdomain Setup Guide

## 🎯 Goal
Set up three subdomains for your separate React apps:
- **rider.globapp.app** → Rider App
- **driver.globapp.app** → Driver App
- **admin.globapp.app** → Admin App

All apps connect to the same backend API at `https://globapp.app/api/v1`

---

## 📋 Prerequisites

- ✅ Domain: `globapp.app` (already configured)
- ✅ Backend: Running at `https://globapp.app/api/v1`
- ✅ Three React apps built and ready (`rider-app`, `driver-app`, `admin-app`)

---

## Step 1: DNS Configuration (DigitalOcean)

### Option A: Using DigitalOcean DNS (Recommended)

1. **Go to DigitalOcean Dashboard**
   - Navigate to: **Networking** → **Domains**
   - Click on `globapp.app`

2. **Add A Records for Each Subdomain**
   
   Add these three records:
   
   | Type | Hostname | Value | TTL |
   |------|----------|-------|-----|
   | A | `rider` | `YOUR_DROPLET_IP` | 3600 |
   | A | `driver` | `YOUR_DROPLET_IP` | 3600 |
   | A | `admin` | `YOUR_DROPLET_IP` | 3600 |
   
   **Note:** If using App Platform instead of Droplet, use CNAME records pointing to your app's domain.

3. **Wait for DNS Propagation**
   - Usually takes 5-15 minutes
   - Verify with: `nslookup rider.globapp.app`

---

## Step 2: Determine Your Setup Type

### Are you using a Droplet (VPS) or App Platform?

**Check:** How is your backend currently deployed?
- **Droplet**: You SSH into a server and manage it yourself
- **App Platform**: Managed service, no SSH needed

---

## Step 3A: Deployment on Droplet (VPS)

If you're using a Droplet, follow these steps:

### 3A.1: Build All Three Apps Locally

On your **Windows machine**:

```powershell
# Build Rider App
cd rider-app
npm run build
# Creates: rider-app/dist/

# Build Driver App
cd ..\driver-app
npm run build
# Creates: driver-app/dist/

# Build Admin App
cd ..\admin-app
npm run build
# Creates: admin-app/dist/
```

### 3A.2: Upload Built Apps to Droplet

**Option 1: Using SCP (from PowerShell)**

```powershell
# Upload Rider App
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/

# Upload Driver App
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/

# Upload Admin App
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

**Option 2: Using Git (Recommended)**

SSH into your Droplet:

```bash
ssh root@YOUR_DROPLET_IP

# Create directories
sudo mkdir -p /var/www/globapp/{rider,driver,admin}

# Pull latest code
cd ~/globapp-backend
git pull origin main

# Build Rider App
cd rider-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/rider/

# Build Driver App
cd ../driver-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/driver/

# Build Admin App
cd ../admin-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/admin/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp
```

### 3A.3: Install Nginx (if not already installed)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3A.4: Configure Nginx for Subdomains

Create three Nginx configuration files:

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Rider App Config:**

```nginx
server {
    listen 80;
    server_name rider.globapp.app;

    # Serve Rider App
    root /var/www/globapp/rider;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
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

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Driver App Config:**

```nginx
server {
    listen 80;
    server_name driver.globapp.app;

    # Serve Driver App
    root /var/www/globapp/driver;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
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

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Admin App Config:**

```nginx
server {
    listen 80;
    server_name admin.globapp.app;

    # Serve Admin App
    root /var/www/globapp/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
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

### 3A.5: Enable Sites and Test

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3A.6: Set Up SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificates for all three subdomains
sudo certbot --nginx -d rider.globapp.app
sudo certbot --nginx -d driver.globapp.app
sudo certbot --nginx -d admin.globapp.app

# Auto-renewal is set up automatically
```

---

## Step 3B: Deployment on App Platform

If you're using DigitalOcean App Platform, create three separate apps:

### 3B.1: Create Rider App

1. **Go to DigitalOcean App Platform**
   - Click **"Create App"**
   - Connect your GitHub repository

2. **Configure Rider App**
   - **Name**: `globapp-rider`
   - **Source Directory**: `/rider-app`
   - **Type**: Static Site
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variables** (Build Time)
   - `VITE_API_BASE_URL` = `https://globapp.app/api/v1`
   - `VITE_PUBLIC_API_KEY` = `yesican`

4. **Configure Domain**
   - Go to **Settings** → **Domains**
   - Add custom domain: `rider.globapp.app`
   - Follow DNS setup instructions

5. **Deploy**

### 3B.2: Create Driver App

Repeat steps above with:
- **Name**: `globapp-driver`
- **Source Directory**: `/driver-app`
- **Environment Variables**:
  - `VITE_API_BASE_URL` = `https://globapp.app/api/v1`
- **Domain**: `driver.globapp.app`

### 3B.3: Create Admin App

Repeat steps above with:
- **Name**: `globapp-admin`
- **Source Directory**: `/admin-app`
- **Environment Variables**:
  - `VITE_API_BASE_URL` = `https://globapp.app/api/v1`
  - `VITE_ADMIN_API_KEY` = `admincan`
- **Domain**: `admin.globapp.app`

---

## Step 4: Update Backend CORS Configuration

Your backend needs to allow requests from the new subdomains.

### On Your Droplet (or App Platform):

Edit `app.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://globapp.app",           # Main domain
        "https://rider.globapp.app",     # Rider subdomain
        "https://driver.globapp.app",    # Driver subdomain
        "https://admin.globapp.app",     # Admin subdomain
        "http://localhost:3001",         # Local dev - Rider
        "http://localhost:3002",         # Local dev - Driver
        "http://localhost:3003",         # Local dev - Admin
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Restart backend:**
```bash
sudo systemctl restart globapp-api
# or however you restart your backend
```

---

## Step 5: Update Environment Variables for Production

### For Droplet Deployment:

Update `.env` files on the Droplet (or set in build process):

**rider-app/.env.production:**
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
VITE_PUBLIC_API_KEY=yesican
```

**driver-app/.env.production:**
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
```

**admin-app/.env.production:**
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
VITE_ADMIN_API_KEY=admincan
```

### For App Platform:

Set these in the App Platform dashboard under **Settings** → **App-Level Environment Variables** (Build Time).

---

## Step 6: Test Your Subdomains

After DNS propagation (5-15 minutes):

1. **Test Rider App**
   - Visit: `https://rider.globapp.app`
   - Should load the booking interface
   - Try booking a ride

2. **Test Driver App**
   - Visit: `https://driver.globapp.app`
   - Should show login page
   - Try logging in

3. **Test Admin App**
   - Visit: `https://admin.globapp.app`
   - Should load admin dashboard

**Check Browser Console (F12)** for any CORS or API errors.

---

## Troubleshooting

### DNS Not Resolving
- Wait 15-30 minutes for DNS propagation
- Check DNS records: `nslookup rider.globapp.app`
- Verify A records point to correct IP

### 502 Bad Gateway
- Check if backend is running: `sudo systemctl status globapp-api`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify backend is listening on port 8000

### CORS Errors
- Verify backend CORS includes all subdomains
- Check browser console for exact error
- Ensure backend is restarted after CORS changes

### SSL Certificate Issues
- Run: `sudo certbot certificates` to check certificates
- Renew if needed: `sudo certbot renew`

---

## Quick Reference

### URLs:
- **Rider**: `https://rider.globapp.app`
- **Driver**: `https://driver.globapp.app`
- **Admin**: `https://admin.globapp.app`
- **Backend API**: `https://globapp.app/api/v1`

### File Locations (Droplet):
- Rider: `/var/www/globapp/rider/`
- Driver: `/var/www/globapp/driver/`
- Admin: `/var/www/globapp/admin/`

### Nginx Configs:
- `/etc/nginx/sites-available/rider.globapp.app`
- `/etc/nginx/sites-available/driver.globapp.app`
- `/etc/nginx/sites-available/admin.globapp.app`

---

## Next Steps

1. ✅ Set up DNS records
2. ✅ Deploy apps (Droplet or App Platform)
3. ✅ Configure SSL certificates
4. ✅ Update backend CORS
5. ✅ Test all subdomains
6. ✅ Monitor for errors

**You're all set!** 🎉




