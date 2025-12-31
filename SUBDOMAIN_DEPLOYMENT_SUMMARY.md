# Subdomain Deployment - Quick Start Guide

## 🎯 What We're Setting Up

Three subdomains for your separate React apps:
- **rider.globapp.app** → Rider App (Booking functionality)
- **driver.globapp.app** → Driver App (Driver Portal)
- **admin.globapp.app** → Admin App (Admin Dashboard)

All connect to: `https://globapp.app/api/v1`

---

## ✅ What's Already Done

- ✅ Three React apps created (`rider-app`, `driver-app`, `admin-app`)
- ✅ All apps configured with correct API endpoints
- ✅ Environment variables set up
- ✅ Apps tested locally (ports 3001, 3002, 3003)

---

## 📋 Step-by-Step Deployment

### Step 1: Set Up DNS Records (5 minutes)

**In DigitalOcean Dashboard:**

1. Go to **Networking** → **Domains** → `globapp.app`
2. Add three **A Records**:

   | Hostname | Type | Value | TTL |
   |----------|------|-------|-----|
   | `rider` | A | `YOUR_DROPLET_IP` | 3600 |
   | `driver` | A | `YOUR_DROPLET_IP` | 3600 |
   | `admin` | A | `YOUR_DROPLET_IP` | 3600 |

3. **Wait 5-15 minutes** for DNS propagation

**Verify:**
```powershell
nslookup rider.globapp.app
```

---

### Step 2: Build All Apps (5 minutes)

**On your Windows machine:**

```powershell
# Build Rider App
cd rider-app
npm run build
cd ..

# Build Driver App
cd driver-app
npm run build
cd ..

# Build Admin App
cd admin-app
npm run build
cd ..
```

**Or use the build script:** See `BUILD_ALL_APPS.md`

**Output:** Three `dist/` folders ready to deploy

---

### Step 3: Deploy to Droplet (10 minutes)

**SSH into your Droplet:**

```bash
ssh root@YOUR_DROPLET_IP
```

**Create directories:**

```bash
sudo mkdir -p /var/www/globapp/{rider,driver,admin}
```

**Upload built apps:**

From your Windows machine (PowerShell):

```powershell
# Upload Rider App
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/

# Upload Driver App
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/

# Upload Admin App
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

**Set permissions:**

```bash
sudo chown -R www-data:www-data /var/www/globapp
```

---

### Step 4: Configure Nginx (10 minutes)

**Create three Nginx config files:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste this (repeat for driver and admin):**

```nginx
server {
    listen 80;
    server_name rider.globapp.app;

    root /var/www/globapp/rider;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable sites:**

```bash
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 5: Set Up SSL Certificates (5 minutes)

```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d rider.globapp.app
sudo certbot --nginx -d driver.globapp.app
sudo certbot --nginx -d admin.globapp.app
```

**Auto-renewal is set up automatically!**

---

### Step 6: Update Backend CORS (5 minutes)

**Edit backend `app.py`:**

```python
allow_origins=[
    "https://globapp.app",
    "https://rider.globapp.app",     # ← ADD
    "https://driver.globapp.app",    # ← ADD
    "https://admin.globapp.app",     # ← ADD
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
]
```

**Restart backend:**

```bash
sudo systemctl restart globapp-api
```

---

### Step 7: Test! (2 minutes)

1. **Visit:** `https://rider.globapp.app`
2. **Visit:** `https://driver.globapp.app`
3. **Visit:** `https://admin.globapp.app`

**Check browser console (F12)** for any errors.

---

## 📚 Detailed Guides

- **Full Setup:** See `SUBDOMAIN_SETUP.md`
- **Build Instructions:** See `BUILD_ALL_APPS.md`
- **Troubleshooting:** See `SUBDOMAIN_SETUP.md` → Troubleshooting section

---

## 🚀 Quick Commands Reference

### Build Apps
```powershell
cd rider-app && npm run build && cd ..
cd driver-app && npm run build && cd ..
cd admin-app && npm run build && cd ..
```

### Upload to Droplet
```powershell
scp -r rider-app\dist\* root@DROPLET_IP:/var/www/globapp/rider/
scp -r driver-app\dist\* root@DROPLET_IP:/var/www/globapp/driver/
scp -r admin-app\dist\* root@DROPLET_IP:/var/www/globapp/admin/
```

### Nginx Commands
```bash
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Reload Nginx
sudo systemctl status nginx      # Check status
```

### Backend Commands
```bash
sudo systemctl restart globapp-api    # Restart backend
sudo systemctl status globapp-api     # Check status
```

---

## ✅ Checklist

- [ ] DNS records added (rider, driver, admin)
- [ ] All apps built (`dist/` folders created)
- [ ] Apps uploaded to Droplet
- [ ] Nginx configs created and enabled
- [ ] SSL certificates installed
- [ ] Backend CORS updated
- [ ] All subdomains tested and working

---

## 🎉 You're Done!

Your three apps are now live on:
- **Rider:** https://rider.globapp.app
- **Driver:** https://driver.globapp.app
- **Admin:** https://admin.globapp.app

All connecting to: https://globapp.app/api/v1

---

## Need Help?

**Common Issues:**
- **DNS not resolving:** Wait 15-30 minutes, check records
- **502 Bad Gateway:** Check backend is running
- **CORS errors:** Verify backend CORS includes subdomains
- **SSL issues:** Run `sudo certbot certificates` to check

**See:** `SUBDOMAIN_SETUP.md` for detailed troubleshooting.




