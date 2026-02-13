# Build Driver and Rider Mobile PWAs

## 🎯 Goal: Build Release APKs

**Apps to build:**
1. `driver-mobile-pwa`
2. `rider-mobile-pwa`

**API endpoint:** `https://globapp.org/api/v1` (same as admin-mobile-pwa that's working)

---

## ✅ Step 1: Verify API Configuration

**Before building, verify API endpoints are correct:**

### Check driver-mobile-pwa

**File:** `C:\Users\koshi\cursor-apps\driver-mobile-pwa\src\config\api.js`

**Should have:**
```javascript
const DIGITALOCEAN_URL = 'https://globapp.org/api/v1';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 
                 DIGITALOCEAN_URL || 
                 'https://globapp.org/api/v1';
```

**File:** `C:\Users\koshi\cursor-apps\driver-mobile-pwa\app.json`

**Should have:**
```json
"extra": {
  "EXPO_PUBLIC_API_BASE_URL": "https://globapp.org/api/v1"
}
```

### Check rider-mobile-pwa

**File:** `C:\Users\koshi\cursor-apps\rider-mobile-pwa\src\config\api.js`

**Should have:**
```javascript
const DIGITALOCEAN_URL = 'https://globapp.org/api/v1';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 
                 DIGITALOCEAN_URL || 
                 'https://globapp.org/api/v1';
```

**File:** `C:\Users\koshi\cursor-apps\rider-mobile-pwa\app.json`

**Should have:**
```json
"extra": {
  "EXPO_PUBLIC_API_BASE_URL": "https://globapp.org/api/v1"
}
```

---

## 🔧 Step 2: Build Driver Mobile PWA

**Navigate to driver-mobile-pwa:**

```powershell
cd C:\Users\koshi\cursor-apps\driver-mobile-pwa
```

**Pre-build steps:**

```powershell
# Install dependencies (if needed)
npm install

# Generate Android project (if needed)
npx expo prebuild --platform android
```

**Build release APK:**

```powershell
# Navigate to Android directory
cd android

# Build release APK
.\gradlew assembleRelease
```

**Expected output:**
- APK file: `android/app/build/outputs/apk/release/app-release.apk`
- File size: ~50-70 MB

---

## 🔧 Step 3: Build Rider Mobile PWA

**Navigate to rider-mobile-pwa:**

```powershell
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
```

**Pre-build steps:**

```powershell
# Install dependencies (if needed)
npm install

# Generate Android project (if needed)
npx expo prebuild --platform android
```

**Build release APK:**

```powershell
# Navigate to Android directory
cd android

# Build release APK
.\gradlew assembleRelease
```

**Expected output:**
- APK file: `android/app/build/outputs/apk/release/app-release.apk`
- File size: ~50-70 MB

---

## ✅ Step 4: Verify Builds

**After each build completes:**

```powershell
# Check if APK exists
Test-Path "android/app/build/outputs/apk/release/app-release.apk"

# Get file size
(Get-Item "android/app/build/outputs/apk/release/app-release.apk").Length / 1MB
```

**Expected:**
- File exists: `True`
- File size: ~50-70 MB

---

## 📱 Step 5: Install and Test

**Transfer APKs to phone and install:**

1. **Copy APK to phone:**
   - Use USB cable
   - Or upload to cloud storage
   - Or email to yourself

2. **Install APK:**
   - Enable "Install from unknown sources" on Android
   - Open APK file
   - Install

3. **Test app:**
   - Open app
   - Verify it connects to API
   - Test main functionality

---

## 🔍 Troubleshooting

### Build Fails

**If build fails:**

```powershell
# Clean build
cd android
.\gradlew clean

# Try again
.\gradlew assembleRelease
```

### API Endpoint Wrong

**If API endpoint is wrong, update:**

**For driver-mobile-pwa:**
```powershell
cd C:\Users\koshi\cursor-apps\driver-mobile-pwa
# Edit src/config/api.js and app.json
# Change to: https://globapp.org/api/v1
```

**For rider-mobile-pwa:**
```powershell
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
# Edit src/config/api.js and app.json
# Change to: https://globapp.org/api/v1
```

**Then rebuild.**

### Missing Android Project

**If Android project doesn't exist:**

```powershell
# Generate Android project
npx expo prebuild --platform android

# Then build
cd android
.\gradlew assembleRelease
```

---

## 📋 Build Checklist

**Before building:**
- [ ] Verify API endpoint is `https://globapp.org/api/v1`
- [ ] Check `src/config/api.js` has correct URL
- [ ] Check `app.json` has correct `EXPO_PUBLIC_API_BASE_URL`
- [ ] Dependencies installed (`npm install`)

**Driver Mobile PWA:**
- [ ] Navigate to `driver-mobile-pwa` directory
- [ ] Run `.\gradlew assembleRelease` in `android` folder
- [ ] Verify APK created successfully
- [ ] Check APK file size (~50-70 MB)

**Rider Mobile PWA:**
- [ ] Navigate to `rider-mobile-pwa` directory
- [ ] Run `.\gradlew assembleRelease` in `android` folder
- [ ] Verify APK created successfully
- [ ] Check APK file size (~50-70 MB)

**After building:**
- [ ] Install APKs on phone
- [ ] Test API connectivity
- [ ] Test main functionality

---

## 🎯 Quick Build Commands

**Driver Mobile PWA:**
```powershell
cd C:\Users\koshi\cursor-apps\driver-mobile-pwa\android
.\gradlew assembleRelease
```

**Rider Mobile PWA:**
```powershell
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa\android
.\gradlew assembleRelease
```

---

**Build both apps and test them!** 🎯










