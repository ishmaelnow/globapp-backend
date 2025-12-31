# Subdomain Setup Guide - Step by Step

**Goal:** Create three subdomains for your React apps:
- `rider.globapp.app` → Rider App
- `driver.globapp.app` → Driver App
- `admin.globapp.app` → Admin App

**⚠️ Important:** Your domain `globapp.app` is registered with **NameCheap**.

**DNS Records Location:**
- If your domain uses **NameCheap nameservers** → Add DNS records in NameCheap
- If your domain uses **DigitalOcean nameservers** → Add DNS records in DigitalOcean

**See:** `SUBDOMAIN_SETUP_NAMECHEAP_DOMAIN.md` for detailed DNS setup instructions based on where your nameservers point.

---

## Prerequisites Checklist

Before starting, make sure you have:
- [x] Domain `globapp.app` registered (with NameCheap)
- [x] Backend running at `https://globapp.app/api/v1`
- [x] Three React apps built and ready (`rider-app`, `driver-app`, `admin-app`)
- [x] Access to DigitalOcean dashboard (for Droplet management)
- [x] Access to NameCheap (for DNS if using NameCheap nameservers)
- [x] SSH access to your Droplet (if deploying there)

---

## Part 1: DNS Configuration (5 minutes)

**⚠️ First, check where your DNS is managed:**

1. Log into NameCheap → Domain List → Manage → Check Nameservers
2. If nameservers are NameCheap → Follow `SUBDOMAIN_SETUP_NAMECHEAP_DOMAIN.md` Part 2
3. If nameservers are DigitalOcean → Follow `SUBDOMAIN_SETUP_NAMECHEAP_DOMAIN.md` Part 3

**Or follow the instructions below if using DigitalOcean DNS:**

### Step 1.1: Access DigitalOcean DNS

1. **Log into DigitalOcean**
   - Go to: https://cloud.digitalocean.com
   - Navigate to: **Networking** → **Domains**
   - Click on: **`globapp.app`**

### Step 1.2: Add A Records

You'll add **three A records**, one for each subdomain.

**For Rider App:**
1. Click **"Create new record"** or **"Add record"**
2. Fill in:
   - **Type:** `A`
   - **Hostname:** `rider`
   - **Value:** `YOUR_DROPLET_IP` (the IP address of your Droplet)
   - **TTL:** `3600` (or leave default)
3. Click **"Create Record"**

**For Driver App:**
1. Click **"Create new record"**
2. Fill in:
   - **Type:** `A`
   - **Hostname:** `driver`
   - **Value:** `YOUR_DROPLET_IP` (same IP as above)
   - **TTL:** `3600`
3. Click **"Create Record"**

**For Admin App:**
1. Click **"Create new record"**
2. Fill in:
   - **Type:** `A`
   - **Hostname:** `admin`
   - **Value:** `YOUR_DROPLET_IP` (same IP as above)
   - **TTL:** `3600`
3. Click **"Create Record"**

### Step 1.3: Verify DNS Records

Your DNS table should now show:

| Type | Hostname | Value | TTL |
|------|----------|-------|-----|
| A | `rider` | `YOUR_DROPLET_IP` | 3600 |
| A | `driver` | `YOUR_DROPLET_IP` | 3600 |
| A | `admin` | `YOUR_DROPLET_IP` | 3600 |

### Step 1.4: Wait for DNS Propagation

- **Wait time:** 5-15 minutes (sometimes up to 30 minutes)
- **Verify:** Run this command on your computer:

```powershell
nslookup rider.globapp.app
nslookup driver.globapp.app
nslookup admin.globapp.app
```

**Expected output:** Should show your Droplet IP address

**If using Windows PowerShell:**
```powershell
Resolve-DnsName rider.globapp.app
Resolve-DnsName driver.globapp.app
Resolve-DnsName admin.globapp.app
```

---

## Part 2: Build Apps for Production (5 minutes)

### Step 2.1: Build Rider App

**On your Windows machine (PowerShell):**

```powershell
cd rider-app
npm run build
cd ..
```

**Verify:** Check that `rider-app/dist/` folder was created with files inside.

### Step 2.2: Build Driver App

```powershell
cd driver-app
npm run build
cd ..
```

**Verify:** Check that `driver-app/dist/` folder was created.

### Step 2.3: Build Admin App

```powershell
cd admin-app
npm run build
cd ..
```

**Verify:** Check that `admin-app/dist/` folder was created.

**Expected Result:** Three `dist/` folders ready to deploy:
- `rider-app/dist/`
- `driver-app/dist/`
- `admin-app/dist/`

---

## Part 3: Deploy to Droplet (15 minutes)

### Step 3.1: SSH into Your Droplet

**From PowerShell or Terminal:**

```bash
ssh root@YOUR_DROPLET_IP
# or if you use a different user:
ssh ishmael@YOUR_DROPLET_IP
```

### Step 3.2: Create Directories

**On your Droplet:**

```bash
sudo mkdir -p /var/www/globapp/rider
sudo mkdir -p /var/www/globapp/driver
sudo mkdir -p /var/www/globapp/admin
```

### Step 3.3: Upload Built Apps

**Option A: Using SCP (from your Windows machine)**

Open a **new PowerShell window** (keep SSH session open):

```powershell
# Upload Rider App
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/

# Upload Driver App
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/

# Upload Admin App
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

**Option B: Using Git (on Droplet)**

If your code is in a Git repository:

```bash
# On Droplet
cd ~/globapp-backend  # or wherever your repo is
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
```

### Step 3.4: Set Permissions

**On your Droplet:**

```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

## Part 4: Configure Nginx (15 minutes)

### Step 4.1: Install Nginx (if not already installed)

**On your Droplet:**

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4.2: Create Nginx Config for Rider App

**On your Droplet:**

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste this configuration:**

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

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4.3: Create Nginx Config for Driver App

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name driver.globapp.app;

    root /var/www/globapp/driver;
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
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 4.4: Create Nginx Config for Admin App

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name admin.globapp.app;

    root /var/www/globapp/admin;
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
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 4.5: Enable Sites

**On your Droplet:**

```bash
# Create symbolic links
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t
```

**Expected output:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`

### Step 4.6: Reload Nginx

```bash
sudo systemctl reload nginx
```

**Verify Nginx is running:**

```bash
sudo systemctl status nginx
```

---

## Part 5: Set Up SSL Certificates (10 minutes)

### Step 5.1: Install Certbot

**On your Droplet:**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 5.2: Get SSL Certificates

**Get certificate for Rider App:**

```bash
sudo certbot --nginx -d rider.globapp.app
```

**Follow prompts:**
- Enter email address (for renewal notices)
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

**Get certificate for Driver App:**

```bash
sudo certbot --nginx -d driver.globapp.app
```

**Get certificate for Admin App:**

```bash
sudo certbot --nginx -d admin.globapp.app
```

**Note:** Certbot automatically updates your Nginx configs to use HTTPS!

### Step 5.3: Verify Certificates

```bash
sudo certbot certificates
```

**Expected:** Should show all three certificates

### Step 5.4: Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

**Expected:** Should show renewal test successful

---

## Part 6: Update Backend CORS (5 minutes)

### Step 6.1: Edit Backend Configuration

**On your Droplet:**

```bash
cd ~/globapp-backend  # or wherever your backend code is
nano app.py  # or your preferred editor
```

### Step 6.2: Find CORS Section

Look for something like:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://globapp.app",
        # ... other origins
    ],
    ...
)
```

### Step 6.3: Add Subdomains to CORS

**Update `allow_origins` to include:**

```python
allow_origins=[
    "https://globapp.app",           # Main domain
    "https://rider.globapp.app",      # ← ADD THIS
    "https://driver.globapp.app",     # ← ADD THIS
    "https://admin.globapp.app",      # ← ADD THIS
    "http://localhost:3001",          # Local dev - Rider
    "http://localhost:3002",          # Local dev - Driver
    "http://localhost:3003",         # Local dev - Admin
    # ... any other existing origins
],
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 6.4: Restart Backend

```bash
sudo systemctl restart globapp-api
# or however you restart your backend service
```

**Verify backend is running:**

```bash
sudo systemctl status globapp-api
```

---

## Part 7: Test Your Subdomains (5 minutes)

### Step 7.1: Test Rider App

1. **Open browser:** `https://rider.globapp.app`
2. **Expected:** Rider booking interface loads
3. **Test:** Try typing in address autocomplete field
4. **Check:** Browser console (F12) - should see no CORS errors

### Step 7.2: Test Driver App

1. **Open browser:** `https://driver.globapp.app`
2. **Expected:** Driver login page loads
3. **Test:** Try logging in
4. **Check:** Should connect to backend successfully

### Step 7.3: Test Admin App

1. **Open browser:** `https://admin.globapp.app`
2. **Expected:** Admin dashboard loads
3. **Test:** Check if data loads
4. **Check:** Should connect to backend successfully

---

## Troubleshooting

### DNS Not Resolving

**Symptoms:** Subdomain shows "Site can't be reached" or DNS error

**Solutions:**
1. Wait longer (up to 30 minutes for DNS propagation)
2. Check DNS records in DigitalOcean dashboard
3. Verify A records point to correct Droplet IP
4. Try: `nslookup rider.globapp.app` to check DNS

### 502 Bad Gateway

**Symptoms:** Subdomain loads but shows "502 Bad Gateway"

**Solutions:**
1. Check if backend is running:
   ```bash
   sudo systemctl status globapp-api
   ```
2. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```
3. Verify backend is listening on port 8000:
   ```bash
   sudo netstat -tlnp | grep 8000
   ```

### CORS Errors

**Symptoms:** Browser console shows CORS errors when making API calls

**Solutions:**
1. Verify backend CORS includes subdomains (Part 6)
2. Restart backend after CORS changes
3. Check browser console for exact error message
4. Verify backend is running: `sudo systemctl status globapp-api`

### SSL Certificate Issues

**Symptoms:** Browser shows "Not Secure" or certificate error

**Solutions:**
1. Check certificates: `sudo certbot certificates`
2. Renew if needed: `sudo certbot renew`
3. Verify Nginx config: `sudo nginx -t`
4. Reload Nginx: `sudo systemctl reload nginx`

### Files Not Found (404)

**Symptoms:** Subdomain loads but shows blank page or 404

**Solutions:**
1. Verify files are uploaded:
   ```bash
   ls -la /var/www/globapp/rider/
   ```
2. Check file permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/globapp
   ```
3. Verify Nginx root path is correct in config files

---

## Quick Reference

### URLs After Setup
- **Rider:** https://rider.globapp.app
- **Driver:** https://driver.globapp.app
- **Admin:** https://admin.globapp.app
- **Backend API:** https://globapp.app/api/v1

### File Locations on Droplet
- **Rider files:** `/var/www/globapp/rider/`
- **Driver files:** `/var/www/globapp/driver/`
- **Admin files:** `/var/www/globapp/admin/`
- **Nginx configs:** `/etc/nginx/sites-available/`

### Useful Commands

**Check Nginx status:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Check backend status:**
```bash
sudo systemctl status globapp-api
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Reload Nginx:**
```bash
sudo systemctl reload nginx
```

**Restart backend:**
```bash
sudo systemctl restart globapp-api
```

---

## Checklist

- [ ] DNS records added (rider, driver, admin)
- [ ] DNS propagation verified (nslookup works)
- [ ] All apps built (`dist/` folders created)
- [ ] Apps uploaded to Droplet
- [ ] File permissions set correctly
- [ ] Nginx configs created for all three subdomains
- [ ] Nginx configs enabled and tested
- [ ] SSL certificates installed for all subdomains
- [ ] Backend CORS updated with subdomains
- [ ] Backend restarted
- [ ] All subdomains tested and working

---

## 🎉 Success!

Once all steps are complete, you'll have:

✅ **Three working subdomains:**
- https://rider.globapp.app
- https://driver.globapp.app
- https://admin.globapp.app

✅ **All connecting to:** https://globapp.app/api/v1

✅ **SSL certificates:** Auto-renewing

✅ **Ready for production use!**

---

## Need Help?

If you encounter issues not covered here:
1. Check browser console (F12) for errors
2. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify backend is running: `sudo systemctl status globapp-api`
4. Check DNS: `nslookup rider.globapp.app`

