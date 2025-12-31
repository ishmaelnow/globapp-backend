# Next Steps After DNS Setup - Subdomains Created ✅

**Status:** DNS records for subdomains have been successfully created!

**Subdomains Created:**
- ✅ `rider.globapp.app`
- ✅ `driver.globapp.app`
- ✅ `admin.globapp.app`

---

## Step 1: Wait for DNS Propagation (5-15 minutes)

DNS changes take time to propagate across the internet.

**Wait:** 5-15 minutes (sometimes up to 30 minutes)

**While waiting:** You can proceed with building your apps (Step 2).

---

## Step 2: Verify DNS is Working

**After waiting 5-15 minutes, verify DNS:**

### On Windows (PowerShell):

```powershell
# Check Rider subdomain
Resolve-DnsName rider.globapp.app

# Check Driver subdomain
Resolve-DnsName driver.globapp.app

# Check Admin subdomain
Resolve-DnsName admin.globapp.app
```

**Expected Output:** Should show your Droplet IP address.

**Example:**
```
Name           : rider.globapp.app
Type           : A
TTL            : 1800
Section        : Answer
NameHost       : 123.456.789.012  ← Your Droplet IP
```

### Online DNS Checker:

Visit these URLs to check globally:
- https://www.whatsmydns.net/#A/rider.globapp.app
- https://dnschecker.org/#A/rider.globapp.app

**Expected:** Should show your Droplet IP in most locations.

**If DNS is not resolving:** Wait a bit longer (up to 30 minutes), then try again.

---

## Step 3: Build Apps for Production (5 minutes)

**On your Windows machine (PowerShell):**

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

**Verify:** Check that three `dist/` folders were created:
- `rider-app/dist/`
- `driver-app/dist/`
- `admin-app/dist/`

**Expected Result:** Each `dist/` folder contains `index.html` and `assets/` folder.

---

## Step 4: Deploy Apps to Droplet (15 minutes)

### Step 4.1: SSH into Your Droplet

**From PowerShell or Terminal:**

```bash
ssh root@YOUR_DROPLET_IP
# or if you use a different user:
ssh ishmael@YOUR_DROPLET_IP
```

### Step 4.2: Create Directories

**On your Droplet:**

```bash
sudo mkdir -p /var/www/globapp/rider
sudo mkdir -p /var/www/globapp/driver
sudo mkdir -p /var/www/globapp/admin
```

### Step 4.3: Upload Built Apps

**From your Windows machine (PowerShell):**

Open a **new PowerShell window** (keep SSH session open):

```powershell
# Upload Rider App
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/

# Upload Driver App
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/

# Upload Admin App
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

**Alternative: Using Git (on Droplet)**

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

### Step 4.4: Set Permissions

**On your Droplet:**

```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

## Step 5: Configure Nginx (15 minutes)

### Step 5.1: Install Nginx (if not already installed)

**On your Droplet:**

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5.2: Create Nginx Config for Rider App

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

### Step 5.3: Create Nginx Config for Driver App

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

### Step 5.4: Create Nginx Config for Admin App

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

### Step 5.5: Enable Sites and Test

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

### Step 5.6: Reload Nginx

```bash
sudo systemctl reload nginx
```

**Verify Nginx is running:**

```bash
sudo systemctl status nginx
```

---

## Step 6: Set Up SSL Certificates (10 minutes)

### Step 6.1: Install Certbot

**On your Droplet:**

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 6.2: Get SSL Certificates

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

### Step 6.3: Verify Certificates

```bash
sudo certbot certificates
```

**Expected:** Should show all three certificates

### Step 6.4: Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

**Expected:** Should show renewal test successful

---

## Step 7: Update Backend CORS (5 minutes)

### Step 7.1: Edit Backend Configuration

**On your Droplet:**

```bash
cd ~/globapp-backend  # or wherever your backend code is
nano app.py  # or your preferred editor
```

### Step 7.2: Find CORS Section

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

### Step 7.3: Add Subdomains to CORS

**Update `allow_origins` to include:**

```python
allow_origins=[
    "https://globapp.app",           # Main domain
    "https://rider.globapp.app",      # ← ADD THIS
    "https://driver.globapp.app",     # ← ADD THIS
    "https://admin.globapp.app",      # ← ADD THIS
    "http://localhost:3001",         # Local dev - Rider
    "http://localhost:3002",         # Local dev - Driver
    "http://localhost:3003",         # Local dev - Admin
    # ... any other existing origins
],
```

**Save:** `Ctrl+X`, `Y`, `Enter`

### Step 7.4: Restart Backend

```bash
sudo systemctl restart globapp-api
# or however you restart your backend service
```

**Verify backend is running:**

```bash
sudo systemctl status globapp-api
```

---

## Step 8: Test Your Subdomains! (5 minutes)

### Step 8.1: Test Rider App

1. **Open browser:** `https://rider.globapp.app`
2. **Expected:** Rider booking interface loads
3. **Test:** Try typing in address autocomplete field
4. **Check:** Browser console (F12) - should see no CORS errors

### Step 8.2: Test Driver App

1. **Open browser:** `https://driver.globapp.app`
2. **Expected:** Driver login page loads
3. **Test:** Try logging in
4. **Check:** Should connect to backend successfully

### Step 8.3: Test Admin App

1. **Open browser:** `https://admin.globapp.app`
2. **Expected:** Admin dashboard loads
3. **Test:** Check if data loads
4. **Check:** Should connect to backend successfully

---

## ✅ Success Checklist

- [x] DNS records created (rider, driver, admin)
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

## 🎉 You're Done!

Once all steps are complete, you'll have:

✅ **Three working subdomains:**
- https://rider.globapp.app
- https://driver.globapp.app
- https://admin.globapp.app

✅ **All connecting to:** https://globapp.app/api/v1

✅ **SSL certificates:** Auto-renewing

✅ **Ready for production use!**

---

## Troubleshooting

### Subdomain Shows "Site can't be reached"

**Check:**
1. DNS propagation: Wait 15-30 minutes, verify with `Resolve-DnsName`
2. Nginx is running: `sudo systemctl status nginx`
3. Nginx configs are enabled: `ls -la /etc/nginx/sites-enabled/`

### 502 Bad Gateway

**Check:**
1. Backend is running: `sudo systemctl status globapp-api`
2. Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Backend is listening on port 8000: `sudo netstat -tlnp | grep 8000`

### CORS Errors

**Check:**
1. Backend CORS includes subdomains (Step 7)
2. Backend is restarted after CORS changes
3. Browser console for exact error message

### SSL Certificate Issues

**Check:**
1. Certificates installed: `sudo certbot certificates`
2. Nginx config: `sudo nginx -t`
3. Nginx reloaded: `sudo systemctl reload nginx`

---

## Quick Reference

### URLs:
- **Rider:** https://rider.globapp.app
- **Driver:** https://driver.globapp.app
- **Admin:** https://admin.globapp.app
- **Backend API:** https://globapp.app/api/v1

### File Locations (Droplet):
- Rider: `/var/www/globapp/rider/`
- Driver: `/var/www/globapp/driver/`
- Admin: `/var/www/globapp/admin/`

### Nginx Configs:
- `/etc/nginx/sites-available/rider.globapp.app`
- `/etc/nginx/sites-available/driver.globapp.app`
- `/etc/nginx/sites-available/admin.globapp.app`

---

**Next:** Start with Step 1 (wait for DNS propagation) or Step 3 (build apps) while waiting!




