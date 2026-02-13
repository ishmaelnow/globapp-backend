# Admin Mobile PWA - Testing Guide

## ✅ Build Complete!

**APK Location:** `C:\Users\koshi\cursor-apps\admin-mobile-pwa\android\app\build\outputs\apk\release\app-release.apk`  
**Size:** 66.07 MB  
**Build Date:** January 17, 2026

---

## 📱 Testing Options

### Option 1: Install on Physical Android Device (Recommended)

1. **Connect your Android device via USB:**
   ```powershell
   # Enable USB Debugging on your phone:
   # Settings > About Phone > Tap "Build Number" 7 times
   # Settings > Developer Options > Enable "USB Debugging"
   
   # Check if device is detected:
   adb devices
   ```

2. **Install the APK:**
   ```powershell
   adb install "C:\Users\koshi\cursor-apps\admin-mobile-pwa\android\app\build\outputs\apk\release\app-release.apk"
   ```

3. **Or manually transfer:**
   - Copy the APK file to your phone
   - Open it on your phone
   - Allow installation from unknown sources if prompted
   - Install and launch

### Option 2: Use Android Emulator

1. **Start an Android emulator** (if you have Android Studio installed)
2. **Install the APK:**
   ```powershell
   adb install "C:\Users\koshi\cursor-apps\admin-mobile-pwa\android\app\build\outputs\apk\release\app-release.apk"
   ```

---

## ✅ Testing Checklist

### 1. App Launch
- [ ] App opens without crashing
- [ ] Splash screen displays correctly
- [ ] App navigates to login/splash screen

### 2. API Connectivity
- [ ] App can connect to `https://globapp.org/api/v1`
- [ ] Login functionality works
- [ ] API calls return data (not network errors)
- [ ] Check browser DevTools/network logs if available

### 3. Core Admin Features
- [ ] **Dashboard** - Loads correctly
- [ ] **Ride Management** - View/manage rides
- [ ] **Driver Management** - View/manage drivers
- [ ] **Rider Management** - View/manage riders
- [ ] **Analytics** - View statistics/reports
- [ ] **Settings** - App settings accessible

### 4. Network & Performance
- [ ] No connection errors
- [ ] Data loads within reasonable time
- [ ] App doesn't freeze or crash
- [ ] Images/assets load correctly

### 5. Domain Verification
- [ ] All API calls go to `globapp.org` (not `globapp.app`)
- [ ] Check network requests in device logs or browser DevTools

---

## 🔍 How to Check API Endpoints

### On Android Device:
1. Enable USB Debugging
2. Connect device and run:
   ```powershell
   adb logcat | Select-String "globapp"
   ```
3. Look for API calls in the logs

### Manual Check:
- Open the app
- Try logging in or accessing features
- Check if network requests show `globapp.org` in the URL

---

## 🐛 Troubleshooting

### If app won't install:
- **"Unknown sources"**: Enable installation from unknown sources in Android settings
- **"App not installed"**: Uninstall any previous version first
- **"Package conflict"**: Another app with same package name exists

### If network errors occur:
- Check internet connection on device
- Verify `globapp.org` is accessible from device browser
- Check if API endpoint is correct: `https://globapp.org/api/v1`
- Verify backend server is running

### If app crashes:
- Check device logs: `adb logcat`
- Look for error messages
- Verify device meets minimum Android version requirements

---

## 📊 Expected Behavior

### Successful Test:
- ✅ App launches successfully
- ✅ Login screen appears
- ✅ Can authenticate with admin credentials
- ✅ Dashboard loads with data
- ✅ All API calls use `globapp.org` domain
- ✅ No network connection errors

### If Issues Found:
- Note the specific error messages
- Check which API endpoints are failing
- Verify backend is accessible from device
- Check device network settings

---

## 🚀 Quick Test Commands

```powershell
# Check connected devices
adb devices

# Install APK
adb install "C:\Users\koshi\cursor-apps\admin-mobile-pwa\android\app\build\outputs\apk\release\app-release.apk"

# View app logs
adb logcat | Select-String "admin\|globapp\|error"

# Uninstall if needed (to reinstall)
adb uninstall com.globapp.admin

# Check installed apps
adb shell pm list packages | Select-String "globapp"
```

---

## 📝 Test Results Template

After testing, note:

- **Device Model:** _______________
- **Android Version:** _______________
- **App Launch:** ✅ / ❌
- **API Connectivity:** ✅ / ❌
- **Login Functionality:** ✅ / ❌
- **Dashboard Loads:** ✅ / ❌
- **Issues Found:** _______________
- **API Endpoint Verified:** ✅ / ❌ (`globapp.org`)

---

**Ready to test!** 🎯










