# Complete Build Commands - All Apps

## Overview
This guide provides step-by-step build commands for all apps in the GlobApp project.

**Apps to Build:**
1. ✅ **Admin App** (Web PWA) → `admin.globapp.org`
2. ✅ **Driver App** (Web PWA) → `driver.globapp.org`
3. ✅ **Rider App** (Web PWA) → `rider.globapp.org`
4. ✅ **Rider Mobile PWA** (Mobile APK) → EAS Build
5. ✅ **Passenger Mobile PWA** (Mobile APK) → EAS Build

---

## 🥇 APP 1: ADMIN APP (Web PWA)

### Step 1: Navigate to Admin App Directory
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\admin-app
```

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

### Step 3: Build for Production
```powershell
npm run build
```

**Expected Output:**
- Creates `dist/` folder with built files
- Should see: `dist/index.html`, `dist/assets/`, etc.

### Step 4: Verify Build
```powershell
# Check if dist folder exists and has files
dir dist
```

**Expected:** Should see `index.html` and `assets` folder.

### Step 5: Deploy to Droplet (SSH into Droplet)
```bash
# SSH into your DigitalOcean Droplet
ssh ishmael@YOUR_DROPLET_IP

# Navigate to project directory
cd ~/globapp-backend

# Pull latest code (if using Git)
git pull origin main

# Build admin app (if building on server)
cd admin-app
npm install
npm run build

# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/admin

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6: Test Admin App
Open browser: `https://admin.globapp.org`

**✅ Admin App Build Complete!**

---

## 🥈 APP 2: DRIVER APP (Web PWA)

### Step 1: Navigate to Driver App Directory
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\driver-app
```

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

### Step 3: Build for Production
```powershell
npm run build
```

**Expected Output:**
- Creates `dist/` folder with built files

### Step 4: Verify Build
```powershell
dir dist
```

### Step 5: Deploy to Droplet (SSH into Droplet)
```bash
# SSH into your DigitalOcean Droplet
ssh ishmael@YOUR_DROPLET_IP

# Navigate to project directory
cd ~/globapp-backend

# Pull latest code (if using Git)
git pull origin main

# Build driver app (if building on server)
cd driver-app
npm install
npm run build

# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6: Test Driver App
Open browser: `https://driver.globapp.org`

**✅ Driver App Build Complete!**

---

## 🥉 APP 3: RIDER APP (Web PWA)

### Step 1: Navigate to Rider App Directory
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\rider-app
```

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

### Step 3: Build for Production
```powershell
npm run build
```

**Expected Output:**
- Creates `dist/` folder with built files

### Step 4: Verify Build
```powershell
dir dist
```

### Step 5: Deploy to Droplet (SSH into Droplet)
```bash
# SSH into your DigitalOcean Droplet
ssh ishmael@YOUR_DROPLET_IP

# Navigate to project directory
cd ~/globapp-backend

# Pull latest code (if using Git)
git pull origin main

# Build rider app (if building on server)
cd rider-app
npm install
npm run build

# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6: Test Rider App
Open browser: `https://rider.globapp.org`

**✅ Rider App Build Complete!**

---

## 📱 APP 4: RIDER MOBILE PWA (Mobile APK)

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Logged into EAS: `eas login`
- EAS project configured in `app.json`

### Step 1: Navigate to Rider Mobile PWA Directory
```powershell
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
```

### Step 2: Verify Configuration
```powershell
# Check app.json has correct API URL
type app.json | findstr "globapp.org"
```

**Expected:** Should see `https://globapp.org/api/v1`

### Step 3: Build Release APK
```powershell
eas build --platform android --profile production
```

**What Happens:**
- Build starts on EAS servers
- You'll get a build ID
- Build takes 15-30 minutes
- Email notification when complete
- Download link provided

### Step 4: Check Build Status
```powershell
# List all builds
eas build:list

# View specific build (replace BUILD_ID)
eas build:view BUILD_ID
```

### Step 5: Download APK
- Check email for download link, OR
- Visit EAS dashboard: https://expo.dev
- Download APK file

### Step 6: Install and Test
- Transfer APK to Android device
- Install APK
- Test all features

**✅ Rider Mobile PWA Build Complete!**

---

## 📱 APP 5: PASSENGER MOBILE PWA (Mobile APK)

### Step 1: Navigate to Passenger Mobile PWA Directory
```powershell
cd C:\Users\koshi\cursor-apps\passenger-mobile-pwa
```

### Step 2: Verify Configuration
```powershell
# Check app.json has correct API URL
type app.json | findstr "globapp.org"
```

**Expected:** Should see `https://globapp.org/api/v1`

### Step 3: Build Release APK
```powershell
eas build --platform android --profile production
```

**What Happens:**
- Build starts on EAS servers
- You'll get a build ID
- Build takes 15-30 minutes
- Email notification when complete
- Download link provided

### Step 4: Check Build Status
```powershell
# List all builds
eas build:list

# View specific build (replace BUILD_ID)
eas build:view BUILD_ID
```

### Step 5: Download APK
- Check email for download link, OR
- Visit EAS dashboard: https://expo.dev
- Download APK file

### Step 6: Install and Test
- Transfer APK to Android device
- Install APK
- Test all features

**✅ Passenger Mobile PWA Build Complete!**

---

## 🚀 Quick Build Script (All Web Apps)

If you want to build all web apps at once, create a PowerShell script:

**Create `build-all-web-apps.ps1`:**
```powershell
# Build Admin App
Write-Host "Building Admin App..." -ForegroundColor Green
cd C:\Users\koshi\cursor-apps\flask-react-project\admin-app
npm install
npm run build
Write-Host "Admin App built successfully!" -ForegroundColor Green

# Build Driver App
Write-Host "Building Driver App..." -ForegroundColor Green
cd C:\Users\koshi\cursor-apps\flask-react-project\driver-app
npm install
npm run build
Write-Host "Driver App built successfully!" -ForegroundColor Green

# Build Rider App
Write-Host "Building Rider App..." -ForegroundColor Green
cd C:\Users\koshi\cursor-apps\flask-react-project\rider-app
npm install
npm run build
Write-Host "Rider App built successfully!" -ForegroundColor Green

Write-Host "All web apps built! Ready to deploy." -ForegroundColor Cyan
```

**Run the script:**
```powershell
.\build-all-web-apps.ps1
```

---

## 📋 Build Checklist

### Web Apps (Admin, Driver, Rider)
- [ ] Admin app built (`dist/` folder created)
- [ ] Driver app built (`dist/` folder created)
- [ ] Rider app built (`dist/` folder created)
- [ ] All apps deployed to `/var/www/globapp/`
- [ ] Permissions set correctly (`www-data:www-data`)
- [ ] Nginx reloaded
- [ ] All apps accessible via HTTPS

### Mobile Apps (Rider, Passenger)
- [ ] Rider mobile PWA built (APK downloaded)
- [ ] Passenger mobile PWA built (APK downloaded)
- [ ] Both APKs tested on Android devices
- [ ] API connectivity verified
- [ ] All features working correctly

---

## 🔧 Troubleshooting

### Web Apps Build Issues

**Error: `npm: command not found`**
- Install Node.js: https://nodejs.org
- Verify: `node --version` and `npm --version`

**Error: `Cannot find module`**
- Run: `npm install` in the app directory

**Build succeeds but app doesn't load**
- Check Nginx configuration
- Verify files copied to `/var/www/globapp/`
- Check permissions: `ls -la /var/www/globapp/`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Mobile Apps Build Issues

**Error: `eas: command not found`**
- Install: `npm install -g eas-cli`
- Verify: `eas --version`

**Error: `Not logged in`**
- Login: `eas login`

**Build fails on EAS**
- Check build logs in EAS dashboard
- Verify `app.json` has valid `projectId`
- Check all dependencies in `package.json`

---

## 📝 Notes

### Web Apps Deployment Options

**Option A: Build Locally, Deploy via SCP**
- Build on Windows machine
- Use SCP to copy `dist/` folders to droplet

**Option B: Build on Droplet**
- SSH into droplet
- Pull code from Git
- Build on server
- Copy to web directories

**Option C: Automated Deployment**
- Set up CI/CD pipeline
- Automatically build and deploy on Git push

### Mobile Apps
- Always build via EAS (cloud builds)
- Local builds possible but not recommended for release
- APKs are production-ready release builds

---

## Summary

**Build Order:**
1. ✅ Admin App (Web)
2. ✅ Driver App (Web)
3. ✅ Rider App (Web)
4. ✅ Rider Mobile PWA (Mobile)
5. ✅ Passenger Mobile PWA (Mobile)

**Total Build Time:**
- Web Apps: ~5-10 minutes each (local build)
- Mobile Apps: ~15-30 minutes each (EAS cloud build)

**Ready to build!** 🚀











