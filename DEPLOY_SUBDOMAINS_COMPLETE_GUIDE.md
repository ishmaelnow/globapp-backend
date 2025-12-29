# Complete Guide: Deploy 3 React Apps to Subdomains

## 🎯 Goal
Deploy three React apps to separate subdomains:
- **admin.globapp.app** → Admin Dashboard
- **driver.globapp.app** → Driver Portal  
- **rider.globapp.app** → Rider App

All connecting to: `https://globapp.app/api/v1`

---

## ✅ Prerequisites Checklist

- [ ] DNS records created for subdomains (rider, driver, admin)
- [ ] SSH access to your Droplet
- [ ] Node.js installed on Droplet (for building apps)
- [ ] Nginx installed on Droplet
- [ ] Backend API running on Droplet

---

## 📋 Step-by-Step Deployment

### Step 1: Update Backend CORS (Already Done ✅)

The backend CORS has been updated in `app.py` to include all three subdomains:
- `https://rider.globapp.app`
- `https://driver.globapp.app`
- `https://admin.globapp.app`

**Next:** Commit and push this change, then restart backend on Droplet.

---

### Step 2: SSH into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

**Find your Droplet IP:**
1. Go to https://cloud.digitalocean.com
2. Click on your Droplet
3. Copy the IPv4 address

---

### Step 3: Pull Latest Code

```bash
cd ~/globapp-backend
git pull origin main
```

**Verify apps exist:**
```bash
ls -d rider-app driver-app admin-app
```

**Expected:** Should see all three directories.

---

### Step 4: Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

---

### Step 5: Create Web Directories

```bash
sudo mkdir -p /var/www/globapp/{rider,driver,admin}
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

### Step 6: Build and Deploy Rider App

```bash
cd ~/globapp-backend/rider-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/

# Copy to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider

# Verify files
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

### Step 7: Build and Deploy Driver App

```bash
cd ~/globapp-backend/driver-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/

# Copy to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver

# Verify files
ls -la /var/www/globapp/driver/
```

---

### Step 8: Build and Deploy Admin App

```bash
cd ~/globapp-backend/admin-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/

# Copy to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/admin

# Verify files
ls -la /var/www/globapp/admin/
```

---

### Step 9: Install Nginx (if not installed)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

---

### Step 10: Create Nginx Config for Rider App

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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 11: Create Nginx Config for Driver App

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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 12: Create Nginx Config for Admin App

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

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 13: Enable Nginx Sites

```bash
# Create symbolic links to enable sites
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t
```

**Expected:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`

**If test fails:** Check error message and fix config files.

---

### Step 14: Reload Nginx

```bash
sudo systemctl reload nginx
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green.

---

### Step 15: Test HTTP (Before SSL)

**Open browser and test:**
1. Visit: `http://rider.globapp.app` (note: HTTP, not HTTPS)
2. Visit: `http://driver.globapp.app`
3. Visit: `http://admin.globapp.app`

**Expected:** Apps should load (may show "Not Secure" - that's OK for now).

**If you see errors:**
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

### Step 16: Install SSL Certificates

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

**Get certificate for Rider:**
```bash
sudo certbot --nginx -d rider.globapp.app
```

**Follow prompts:**
1. Enter email → Press Enter
2. Agree to terms → Type `A` and press Enter
3. Share email (optional) → Type `Y` or `N` and press Enter
4. Redirect HTTP to HTTPS → Type `2` and press Enter (recommended)

**Get certificate for Driver:**
```bash
sudo certbot --nginx -d driver.globapp.app
```

**Get certificate for Admin:**
```bash
sudo certbot --nginx -d admin.globapp.app
```

**Verify certificates:**
```bash
sudo certbot certificates
```

**Expected:** Should show all three certificates.

---

### Step 17: Restart Backend (to apply CORS changes)

```bash
# Navigate to backend directory
cd ~/globapp-backend

# Pull latest code (to get CORS updates)
git pull origin main

# Restart backend service
sudo systemctl restart globapp-api
# or if using different service name:
# sudo systemctl restart your-backend-service-name

# Verify backend is running
sudo systemctl status globapp-api
```

**Expected:** Should show "active (running)" in green.

---

### Step 18: Test All Subdomains (HTTPS)

**Test Rider App:**
1. Visit: `https://rider.globapp.app`
2. Expected:
   - ✅ No errors
   - ✅ Rider booking interface loads
   - ✅ Green padlock in address bar
3. Check browser console (F12) - should see no CORS errors

**Test Driver App:**
1. Visit: `https://driver.globapp.app`
2. Expected:
   - ✅ No errors
   - ✅ Driver login page loads
   - ✅ Green padlock in address bar

**Test Admin App:**
1. Visit: `https://admin.globapp.app`
2. Expected:
   - ✅ No errors
   - ✅ Admin dashboard loads
   - ✅ Green padlock in address bar

---

## ✅ Final Checklist

- [ ] Backend CORS updated (includes subdomains)
- [ ] Code pulled from Git
- [ ] Node.js installed on Droplet
- [ ] Web directories created (`/var/www/globapp/{rider,driver,admin}`)
- [ ] Rider app built and deployed
- [ ] Driver app built and deployed
- [ ] Admin app built and deployed
- [ ] File permissions set correctly (`www-data:www-data`)
- [ ] Nginx installed
- [ ] Nginx configs created for all three apps
- [ ] Nginx sites enabled
- [ ] Nginx reloaded
- [ ] HTTP tested (apps load)
- [ ] SSL certificates installed
- [ ] Backend restarted (CORS applied)
- [ ] All subdomains tested (HTTPS working)

---

## 🎉 Success!

Once complete, you'll have:

✅ **Three working subdomains with HTTPS:**
- https://rider.globapp.app
- https://driver.globapp.app
- https://admin.globapp.app

✅ **All connecting to:** https://globapp.app/api/v1

✅ **SSL certificates:** Auto-renewing

✅ **Ready for production use!**

---

## 🔄 Updating Apps (Future Deployments)

When you make changes to the apps:

```bash
# SSH into Droplet
ssh root@YOUR_DROPLET_IP

# Pull latest code
cd ~/globapp-backend
git pull origin main

# Rebuild and redeploy each app
cd rider-app && npm install && npm run build && sudo cp -r dist/* /var/www/globapp/rider/ && cd ..
cd driver-app && npm install && npm run build && sudo cp -r dist/* /var/www/globapp/driver/ && cd ..
cd admin-app && npm install && npm run build && sudo cp -r dist/* /var/www/globapp/admin/ && cd ..

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp

# Reload Nginx (if config changed)
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Issue: 500 Internal Server Error

**Check Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 6-8
- Wrong permissions → Re-do Step 5
- Missing index.html → Re-do Steps 6-8

---

### Issue: Site Can't Be Reached

**Check DNS:**
```powershell
# On Windows PowerShell
Resolve-DnsName rider.globapp.app
```

**Expected:** Should show your Droplet IP

**If not:** Wait 15-30 minutes for DNS propagation

---

### Issue: SSL Certificate Error

**Check certificates:**
```bash
sudo certbot certificates
```

**If missing:** Re-do Step 16

---

### Issue: CORS Errors

**Check backend CORS:**
```bash
cd ~/globapp-backend
grep -A 15 "allow_origins" app.py
```

**Verify subdomains are listed:** Should see `rider.globapp.app`, `driver.globapp.app`, `admin.globapp.app`

**If missing:** 
1. Update `app.py` CORS configuration
2. Commit and push changes
3. Pull on Droplet
4. Restart backend (Step 17)

---

### Issue: Apps Not Loading

**Check file permissions:**
```bash
ls -la /var/www/globapp/
```

**Expected:** All directories should be owned by `www-data:www-data`

**Fix:**
```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

## 📚 Quick Reference

### File Locations (on Droplet):
- Rider: `/var/www/globapp/rider/`
- Driver: `/var/www/globapp/driver/`
- Admin: `/var/www/globapp/admin/`

### Nginx Configs:
- `/etc/nginx/sites-available/rider.globapp.app`
- `/etc/nginx/sites-available/driver.globapp.app`
- `/etc/nginx/sites-available/admin.globapp.app`

### Useful Commands:

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

## ⏱️ Estimated Time

- **Steps 1-3:** 5 minutes (CORS update, SSH, pull code)
- **Step 4:** 5 minutes (Node.js installation if needed)
- **Step 5:** 1 minute (create directories)
- **Steps 6-8:** 20 minutes (build and deploy apps)
- **Steps 9-14:** 15 minutes (Nginx setup)
- **Step 15:** 2 minutes (test HTTP)
- **Step 16:** 10 minutes (SSL certificates)
- **Step 17:** 2 minutes (restart backend)
- **Step 18:** 5 minutes (testing)

**Total:** ~65 minutes

---

**Follow these steps in order, and you'll have your subdomains working!** 🚀

