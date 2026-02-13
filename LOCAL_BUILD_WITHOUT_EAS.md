# Build Admin Mobile PWA Locally (Without EAS)

## ✅ Yes, You Can Build Without EAS!

There are two ways to build locally:

---

## Option 1: Expo Local Build (Recommended)

### Prerequisites:
- ✅ Android Studio installed
- ✅ Android SDK installed
- ✅ Java JDK installed
- ✅ Environment variables set (ANDROID_HOME, JAVA_HOME)

### Steps:

#### 1. Prebuild Native Android Project
```powershell
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa
npx expo prebuild --platform android
```

**What this does:**
- Generates `android/` folder with native Android project
- Creates Gradle build files
- Sets up Android project structure

#### 2. Build Release APK with Gradle
```powershell
cd android
.\gradlew assembleRelease
```

**APK Location:**
- `android/app/build/outputs/apk/release/app-release.apk`

#### 3. Install APK
- Transfer APK to Android device
- Install and test

---

## Option 2: Expo Run Android (Development Build)

### Steps:

```powershell
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa
npx expo run:android --variant release
```

**What this does:**
- Automatically prebuilds if needed
- Builds release APK
- Can install directly to connected device

---

## Prerequisites Check

### Check if Android Studio is installed:
```powershell
# Check Android SDK
$env:ANDROID_HOME
# Should show path like: C:\Users\YourName\AppData\Local\Android\Sdk

# Check Java
java -version
# Should show Java version
```

### If Android Studio Not Installed:

1. **Download Android Studio**: https://developer.android.com/studio
2. **Install Android Studio**:
   - During installation, make sure to install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (optional, for emulator)
3. **Set Environment Variables**:
   ```powershell
   # Set ANDROID_HOME (adjust path if different)
   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\koshi\AppData\Local\Android\Sdk', 'User')
   
   # Add to PATH
   $env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
   ```

---

## Quick Build Command (All-in-One)

```powershell
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa

# Prebuild Android project (if not already done)
npx expo prebuild --platform android

# Build release APK
cd android
.\gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Troubleshooting

### Error: "ANDROID_HOME not set"
- Install Android Studio
- Set ANDROID_HOME environment variable
- Restart terminal/PowerShell

### Error: "Java not found"
- Install Java JDK (version 11 or higher)
- Set JAVA_HOME environment variable

### Error: "Gradle build failed"
- Check Android SDK is installed
- Verify `android/` folder exists (run `npx expo prebuild` first)
- Check `android/build.gradle` for errors

### Error: "SDK location not found"
- Set ANDROID_HOME environment variable
- Or create `android/local.properties` file:
  ```
  sdk.dir=C:\\Users\\koshi\\AppData\\Local\\Android\\Sdk
  ```

---

## Build Output

### Release APK Location:
```
admin-mobile-pwa/android/app/build/outputs/apk/release/app-release.apk
```

### APK Details:
- **Type**: Release APK (signed)
- **Size**: ~20-50 MB (depending on dependencies)
- **Installation**: Direct install on Android devices

---

## Advantages of Local Builds

✅ **No EAS limits** - Build as many times as you want  
✅ **Faster** - No waiting for cloud builds  
✅ **Free** - No subscription needed  
✅ **Full control** - Customize build process  

## Disadvantages

⚠️ **Requires setup** - Android Studio, SDK, Java  
⚠️ **Larger downloads** - Android SDK is ~1GB  
⚠️ **Platform specific** - Windows setup different from Mac/Linux  

---

## Next Steps

1. **Check if Android Studio is installed**
2. **If not, install Android Studio**
3. **Run prebuild**: `npx expo prebuild --platform android`
4. **Build APK**: `cd android && .\gradlew assembleRelease`
5. **Install and test APK**

**Ready to build locally!** 🚀











