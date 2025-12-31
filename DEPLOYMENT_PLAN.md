# Deployment Plan - Subdomain Strategy

## 🎯 Goal
Deploy three separate React apps to subdomains:
- `rider.yourdomain.com` → Rider App
- `driver.yourdomain.com` → Driver App  
- `admin.yourdomain.com` → Admin App

All apps connect to the same backend API.

---

## ✅ What's Already Done

### Completed Setup
- ✅ **rider-app/** - Complete React app with Booking component
- ✅ **driver-app/** - Complete React app with DriverPortal component
- ✅ **admin-app/** - Complete React app with AdminDashboard component
- ✅ All dependencies installed (`npm install` completed)
- ✅ `.env` files configured with API keys:
  - `rider-app/.env` → Has `VITE_PUBLIC_API_KEY=yesican`
  - `admin-app/.env` → Has `VITE_ADMIN_API_KEY=admincan`
  - `driver-app/.env` → No API key needed (uses login)
- ✅ All apps configured to connect to backend API

### Current Status
**READY FOR TESTING AND DEPLOYMENT**

---

## 📋 Next Steps - Clear Action Plan

### Phase 1: Local Testing (Do This First)

#### Step 1: Test Backend Connection
```powershell
# Terminal 1 - Start Backend
cd C:\Users\koshi\cursor-apps\flask-react-project
python app.py
```
**Verify:** Backend runs on http://localhost:8000

#### Step 2: Test Rider App Locally
```powershell
# Terminal 2 - Start Rider App
cd C:\Users\koshi\cursor-apps\flask-react-project\rider-app
npm run dev
```
**Verify:** 
- Opens http://localhost:3001
- Can book a ride
- No API key prompt (already configured)

#### Step 3: Test Driver App Locally
```powershell
# Terminal 3 - Start Driver App
cd C:\Users\koshi\cursor-apps\flask-react-project\driver-app
npm run dev
```
**Verify:**
- Opens http://localhost:3002
- Can login as driver
- Tabs work correctly

#### Step 4: Test Admin App Locally
```powershell
# Terminal 4 - Start Admin App
cd C:\Users\koshi\cursor-apps\flask-react-project\admin-app
npm run dev
```
**Verify:**
- Opens http://localhost:3003
- Dashboard loads without API key prompt
- Can view/manage drivers

**✅ Checkpoint:** All apps work locally before deploying

---

### Phase 2: Prepare for Production Build

#### Step 5: Update .env Files for Production

**rider-app/.env** (Update for production):
```env
# Production Configuration
VITE_API_BASE_URL=https://globapp.app/api/v1
# OR if same domain: VITE_API_BASE_URL=/api/v1

VITE_PUBLIC_API_KEY=yesican
```

**driver-app/.env** (Update for production):
```env
# Production Configuration
VITE_API_BASE_URL=https://globapp.app/api/v1
# OR if same domain: VITE_API_BASE_URL=/api/v1
```

**admin-app/.env** (Update for production):
```env
# Production Configuration
VITE_API_BASE_URL=https://globapp.app/api/v1
# OR if same domain: VITE_API_BASE_URL=/api/v1

VITE_ADMIN_API_KEY=admincan
```

**Note:** Replace `globapp.app` with your actual backend domain.

---

### Phase 3: Build Production Versions

#### Step 6: Build Rider App
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\rider-app

# Update .env for production first (see Step 5)
npm run build
```
**Output:** `rider-app/dist/` folder with production files

#### Step 7: Build Driver App
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\driver-app

# Update .env for production first (see Step 5)
npm run build
```
**Output:** `driver-app/dist/` folder with production files

#### Step 8: Build Admin App
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\admin-app

# Update .env for production first (see Step 5)
npm run build
```
**Output:** `admin-app/dist/` folder with production files

**✅ Checkpoint:** All three `dist/` folders created

---

### Phase 4: Subdomain Deployment Setup

#### Step 9: Configure DNS (On Your Domain Provider)

Add three A records pointing to your server IP:

```
Type: A
Name: rider
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: driver
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: admin
Value: YOUR_SERVER_IP
TTL: 3600
```

**Result:**
- `rider.yourdomain.com` → Your server
- `driver.yourdomain.com` → Your server
- `admin.yourdomain.com` → Your server

---

#### Step 10: Configure Nginx (On Your Server)

**Create Nginx configuration file:** `/etc/nginx/sites-available/globapp-subdomains`

```nginx
# Rider App - rider.yourdomain.com
server {
    listen 80;
    server_name rider.yourdomain.com;
    
    root /var/www/globapp/rider-app;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optional: Add security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# Driver App - driver.yourdomain.com
server {
    listen 80;
    server_name driver.yourdomain.com;
    
    root /var/www/globapp/driver-app;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# Admin App - admin.yourdomain.com
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    root /var/www/globapp/admin-app;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# Backend API (if on same server)
server {
    listen 80;
    server_name api.yourdomain.com;  # or yourdomain.com
    
    location /api/v1 {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable the configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/globapp-subdomains /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

---

#### Step 11: Create Deployment Directories (On Your Server)

```bash
# Create directories for each app
sudo mkdir -p /var/www/globapp/rider-app
sudo mkdir -p /var/www/globapp/driver-app
sudo mkdir -p /var/www/globapp/admin-app

# Set permissions
sudo chown -R $USER:$USER /var/www/globapp
```

---

#### Step 12: Deploy Built Apps (On Your Server)

**Option A: Upload via SCP**
```bash
# From your local machine
scp -r rider-app/dist/* user@your-server:/var/www/globapp/rider-app/
scp -r driver-app/dist/* user@your-server:/var/www/globapp/driver-app/
scp -r admin-app/dist/* user@your-server:/var/www/globapp/admin-app/
```

**Option B: Git + Build on Server**
```bash
# On server - clone/build each app
cd /var/www/globapp
git clone your-repo-url rider-app-source
cd rider-app-source/rider-app
npm install
npm run build
cp -r dist/* /var/www/globapp/rider-app/

# Repeat for driver-app and admin-app
```

**Option C: rsync**
```bash
rsync -avz rider-app/dist/ user@your-server:/var/www/globapp/rider-app/
rsync -avz driver-app/dist/ user@your-server:/var/www/globapp/driver-app/
rsync -avz admin-app/dist/ user@your-server:/var/www/globapp/admin-app/
```

---

#### Step 13: Set Permissions (On Your Server)

```bash
sudo chown -R www-data:www-data /var/www/globapp
sudo chmod -R 755 /var/www/globapp
```

---

#### Step 14: Configure SSL/HTTPS (Recommended)

**Using Let's Encrypt/Certbot:**
```bash
sudo certbot --nginx -d rider.yourdomain.com
sudo certbot --nginx -d driver.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
```

This will automatically update your Nginx configs to use HTTPS.

---

### Phase 5: Verify Deployment

#### Step 15: Test Each Subdomain

1. **Test Rider App:**
   - Visit: `https://rider.yourdomain.com`
   - Verify: App loads, can book rides
   - Check: Browser console shows correct API URL

2. **Test Driver App:**
   - Visit: `https://driver.yourdomain.com`
   - Verify: Login screen appears
   - Check: Can login and access dashboard

3. **Test Admin App:**
   - Visit: `https://admin.yourdomain.com`
   - Verify: Dashboard loads without API key prompt
   - Check: Can manage drivers and dispatch rides

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All apps tested locally
- [ ] .env files updated for production
- [ ] Production builds created (`npm run build`)
- [ ] DNS records configured
- [ ] Server directories created

### Deployment
- [ ] Nginx configuration created
- [ ] Nginx configuration tested
- [ ] Built apps uploaded to server
- [ ] Permissions set correctly
- [ ] SSL certificates installed (if using HTTPS)

### Post-Deployment
- [ ] Rider app accessible on subdomain
- [ ] Driver app accessible on subdomain
- [ ] Admin app accessible on subdomain
- [ ] All apps can connect to backend API
- [ ] No console errors in browser

---

## 🔄 Future Updates/Deployments

### To Update an App:

1. **Make changes** to the app locally
2. **Update .env** if needed
3. **Build:** `npm run build`
4. **Deploy:** Upload `dist/` folder to server
5. **No restart needed** - Nginx serves static files

### Quick Deploy Script (Optional)

Create `deploy.sh`:
```bash
#!/bin/bash
# Build and deploy all apps

cd rider-app && npm run build && rsync -avz dist/ user@server:/var/www/globapp/rider-app/
cd ../driver-app && npm run build && rsync -avz dist/ user@server:/var/www/globapp/driver-app/
cd ../admin-app && npm run build && rsync -avz dist/ user@server:/var/www/globapp/admin-app/
```

---

## 🆘 Troubleshooting

### Issue: Subdomain not resolving
**Solution:** Check DNS propagation (can take up to 48 hours, usually faster)

### Issue: 502 Bad Gateway
**Solution:** Check Nginx config syntax: `sudo nginx -t`

### Issue: 404 on routes
**Solution:** Make sure `try_files $uri $uri/ /index.html;` is in Nginx config

### Issue: CORS errors
**Solution:** Ensure backend CORS allows all three subdomains

### Issue: API calls failing
**Solution:** Check `.env` files have correct `VITE_API_BASE_URL` for production

---

## 📊 Summary

**Current Status:** ✅ Ready for local testing

**Next Immediate Steps:**
1. Test all apps locally (Steps 1-4)
2. Update .env files for production (Step 5)
3. Build production versions (Steps 6-8)
4. Configure DNS and Nginx (Steps 9-11)
5. Deploy to server (Steps 12-14)
6. Verify everything works (Step 15)

**Timeline Estimate:**
- Local testing: 30 minutes
- Production build: 10 minutes
- DNS setup: 5 minutes (propagation may take longer)
- Nginx config: 15 minutes
- Deployment: 10 minutes
- **Total: ~1-2 hours** (plus DNS propagation time)

---

## 📞 Need Help?

If you get stuck:
1. Check browser console (F12) for errors
2. Check server logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS: `nslookup rider.yourdomain.com`
4. Test Nginx: `sudo nginx -t`




