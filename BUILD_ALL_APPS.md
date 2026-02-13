# Build All Apps - Quick Guide

All three apps are now ready to build! Here's how to build them:

## Prerequisites ✅
- ✅ EAS CLI installed
- ✅ Logged into Expo (koach2025)
- ✅ Git repos initialized for all apps
- ✅ eas.json configured for all apps

## Build Commands

Run these commands in order. Each build will take 15-30 minutes.

### 1. Admin App
```bash
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa
eas build:configure
# When prompted: Choose option 2 (remote version source)
eas build --platform all --profile production
```

### 2. Driver App
```bash
cd C:\Users\koshi\cursor-apps\driver-mobile-pwa
eas build:configure
# When prompted: Choose option 2 (remote version source)
eas build --platform all --profile production
```

### 3. Rider App
```bash
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
eas build:configure
# When prompted: Choose option 2 (remote version source)
eas build --platform all --profile production
```

## What to Expect

1. **First time setup**: `eas build:configure` will ask:
   - "Would you like to automatically create an EAS project?" → Type `y`
   - "App version source?" → Choose `2` (remote)

2. **Build process**: `eas build` will:
   - Ask about iOS credentials (you can skip for now if you don't have Apple Developer account)
   - Ask about Android credentials (you can use default)
   - Start the build in the cloud
   - Give you a link to monitor progress

3. **Build time**: 15-30 minutes per app (first build)

4. **Download**: When complete, you'll get download links for:
   - iOS: `.ipa` file (or TestFlight link)
   - Android: `.apk` or `.aab` file

## Testing After Build

After builds complete:
1. **Android**: Download `.apk` and install on Android device
2. **iOS**: Install via TestFlight or download `.ipa` and install via Xcode

## Tips

- You can build one platform at a time: `--platform ios` or `--platform android`
- Use `--profile preview` for faster test builds
- Monitor builds at: https://expo.dev/accounts/koach2025/projects
