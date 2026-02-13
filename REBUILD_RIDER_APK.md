# Rebuild Rider Mobile PWA APK

**Current APK:** `rideapp-release.apk` (January 15, 2026)  
**Location:** `C:\Users\koshi\cursor-apps\rider-mobile-pwa\android\app\build\outputs\apk\release\`

---

## 🔨 Quick Rebuild Steps

### Step 1: Navigate to Project
```powershell
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
```

### Step 2: Install Dependencies (if needed)
```powershell
npm install
```

### Step 3: Generate Android Project (if needed)
```powershell
npx expo prebuild --platform android
```

### Step 4: Build Release APK
```powershell
cd android
.\gradlew assembleRelease
```

### Step 5: Find New APK
After build completes, new APK will be at:
```
C:\Users\koshi\cursor-apps\rider-mobile-pwa\android\app\build\outputs\apk\release\app-release.apk
```
(Note: May be named `app-release.apk` or `rideapp-release.apk` depending on build config)

---

## 📋 Full Rebuild Command (All in One)

```powershell
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
npm install
npx expo prebuild --platform android
cd android
.\gradlew clean
.\gradlew assembleRelease
```

---

## ✅ Verify New Build

After build completes:

```powershell
# Check APK file
Get-Item "C:\Users\koshi\cursor-apps\rider-mobile-pwa\android\app\build\outputs\apk\release\*.apk" | Select-Object Name, Length, LastWriteTime
```

**Expected:**
- New `LastWriteTime` (should be today's date/time)
- File size: ~66 MB
- File exists

---

## 🎯 What Gets Updated

Rebuilding will:
- ✅ Include all latest code changes
- ✅ Update to latest dependencies
- ✅ Apply any configuration changes
- ✅ Generate fresh APK with current date

---

## 🚨 Troubleshooting

### Build Fails
```powershell
# Clean and try again
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Missing Android Project
```powershell
# Generate Android project
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
npx expo prebuild --platform android
cd android
.\gradlew assembleRelease
```

### Gradle Issues
```powershell
# Update Gradle wrapper (if needed)
cd android
.\gradlew wrapper --gradle-version=8.0
```

---

## 📱 After Rebuild

1. **New APK created** with today's date
2. **Upload to Google Drive** (or email/share)
3. **Download on phone** and install
4. **Test the app**

---

**Ready to rebuild? Run the commands above!** 🚀








