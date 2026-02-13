# Admin Mobile PWA Build Guide

## ✅ Domain Migration Complete

All domain references have been updated from `globapp.app` to `globapp.org`:
- ✅ `app.json` - Updated `EXPO_PUBLIC_API_BASE_URL`
- ✅ `src/config/api.js` - Updated `DIGITALOCEAN_URL` and fallback URL
- ✅ `eas.json` - Added Android APK build configuration

---

## 📱 Build Commands for Admin Mobile PWA

### Step 1: Navigate to Admin Mobile PWA Directory
```powershell
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa
```

### Step 2: Verify Configuration
```powershell
# Check app.json has correct API URL
type app.json | findstr "globapp.org"
```

**Expected:** Should see `https://globapp.org/api/v1`

### Step 3: Verify EAS Login
```powershell
# Check if logged into EAS
eas whoami
```

**If not logged in:**
```powershell
eas login
```

### Step 4: Build Release APK
```powershell
eas build --platform android --profile production
```

**What Happens:**
- ✅ Build starts on EAS servers
- ✅ You'll get a build ID
- ✅ Build takes 15-30 minutes
- ✅ Email notification when complete
- ✅ Download link provided

### Step 5: Check Build Status
```powershell
# List all builds
eas build:list

# View specific build (replace BUILD_ID)
eas build:view BUILD_ID
```

### Step 6: Download APK
- Check email for download link, OR
- Visit EAS dashboard: https://expo.dev
- Download APK file

### Step 7: Install and Test
- Transfer APK to Android device
- Install APK
- Test all admin features

---

## 🔍 Configuration Details

### App Configuration (`app.json`)
- **Name**: GlobApp Admin
- **Package**: `com.globapp.admin`
- **API URL**: `https://globapp.org/api/v1`
- **EAS Project ID**: `af1dc900-6378-4b09-b9e8-71ddbb1c5032`

### Build Configuration (`eas.json`)
- **Profile**: `production`
- **Build Type**: `apk` (Android Package Kit)
- **Auto Increment**: Enabled
- **Distribution**: Internal (for testing)

---

## ✅ Build Checklist

Before building:
- [x] Domain updated to `globapp.org`
- [x] EAS project configured
- [x] Android APK build type set
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Logged into EAS (`eas login`)
- [ ] Dependencies installed (`npm install`)

After building:
- [ ] APK downloaded
- [ ] APK installed on Android device
- [ ] App launches successfully
- [ ] API connectivity verified
- [ ] Admin features tested

---

## 🚀 Quick Build Command

**One-liner:**
```powershell
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa && eas build --platform android --profile production
```

---

## 📝 Notes

- **Build Type**: Release APK (production-ready)
- **Build Time**: 15-30 minutes
- **Platform**: Android only (iOS requires Apple Developer account)
- **Distribution**: Internal (for testing before Play Store)

**Ready to build!** 🚀











