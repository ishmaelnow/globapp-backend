# 📱 Making Your Apps App Store Ready

This guide will help you prepare all three mobile PWAs (Rider, Driver, Admin) for distribution on iOS App Store and Google Play Store.

## 🎯 Overview

You have three Expo apps that need to be configured for app store distribution:
1. **rider-mobile-pwa** - Rider app
2. **driver-mobile-pwa** - Driver app  
3. **admin-mobile-pwa** - Admin app

## ✅ Prerequisites

1. **Expo Account**: Sign up at https://expo.dev (free)
2. **Apple Developer Account**: $99/year (for iOS App Store)
3. **Google Play Developer Account**: $25 one-time (for Google Play)
4. **EAS CLI**: Install with `npm install -g eas-cli`

## 📋 Step-by-Step Checklist

### Phase 1: Setup & Configuration

#### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Login to Expo
```bash
eas login
```

#### 3. Initialize EAS for each app
```bash
# For each app (rider-mobile-pwa, driver-mobile-pwa, admin-mobile-pwa)
cd rider-mobile-pwa
eas build:configure
```

This creates an `eas.json` file with build configurations.

### Phase 2: Update app.json for Each App

Each app needs proper configuration. Here's what needs to be updated:

#### Required Fields:
- ✅ **name**: Display name (e.g., "GlobApp Rider")
- ✅ **slug**: URL-friendly name (already set)
- ✅ **version**: Version number (e.g., "1.0.0")
- ✅ **bundleIdentifier** (iOS): Unique identifier (e.g., "com.globapp.rider")
- ✅ **package** (Android): Unique package name (e.g., "com.globapp.rider")
- ✅ **icon**: App icon (1024x1024 PNG)
- ✅ **splash**: Splash screen
- ✅ **description**: App description
- ✅ **privacy**: Privacy policy URL

### Phase 3: Create App Icons & Assets

#### Required Icon Sizes:
- **iOS**: 1024x1024 PNG (no transparency)
- **Android**: 1024x1024 PNG (adaptive icon: 1024x1024 foreground + background)

#### Splash Screen:
- **iOS**: 1242x2436 PNG (or use Expo's default)
- **Android**: 1920x1920 PNG (or use Expo's default)

#### How to Generate Icons:
1. Create a 1024x1024 PNG logo
2. Use online tools:
   - https://www.appicon.co
   - https://www.makeappicon.com
   - https://www.iconkitchen.app
3. Or use Expo's icon generator:
   ```bash
   npx expo install @expo/image-utils
   ```

### Phase 4: Configure Build Settings

#### Create/Update `eas.json` for each app:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Phase 5: Build for App Stores

#### Build iOS App:
```bash
cd rider-mobile-pwa
eas build --platform ios --profile production
```

#### Build Android App:
```bash
eas build --platform android --profile production
```

#### Build Both:
```bash
eas build --platform all --profile production
```

**Note**: First build will take 15-30 minutes. Subsequent builds are faster.

### Phase 6: Submit to App Stores

#### Submit to Apple App Store:
```bash
eas submit --platform ios
```

#### Submit to Google Play:
```bash
eas submit --platform android
```

**Note**: You'll need:
- Apple: App Store Connect credentials
- Google: Google Play Console credentials

## 🔧 App-Specific Configurations

### Rider App (`rider-mobile-pwa`)

**app.json updates needed:**
```json
{
  "expo": {
    "name": "GlobApp Rider",
    "slug": "globapp-rider",
    "description": "Book rides easily with GlobApp",
    "ios": {
      "bundleIdentifier": "com.globapp.rider",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.globapp.rider",
      "versionCode": 1
    }
  }
}
```

### Driver App (`driver-mobile-pwa`)

**app.json updates needed:**
```json
{
  "expo": {
    "name": "GlobApp Driver",
    "slug": "globapp-driver",
    "description": "Driver app for GlobApp ride sharing",
    "ios": {
      "bundleIdentifier": "com.globapp.driver",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.globapp.driver",
      "versionCode": 1
    }
  }
}
```

### Admin App (`admin-mobile-pwa`)

**app.json updates needed:**
```json
{
  "expo": {
    "name": "GlobApp Admin",
    "slug": "globapp-admin",
    "description": "Admin dashboard for GlobApp",
    "ios": {
      "bundleIdentifier": "com.globapp.admin",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.globapp.admin",
      "versionCode": 1
    }
  }
}
```

## 📝 App Store Metadata Needed

### For Each App Store Listing:

#### iOS App Store:
- App Name (30 chars max)
- Subtitle (30 chars max)
- Description (4000 chars max)
- Keywords (100 chars max)
- Support URL
- Marketing URL (optional)
- Privacy Policy URL (required)
- Screenshots (various sizes)
- App Icon (1024x1024)
- App Preview Video (optional)

#### Google Play Store:
- App Name (50 chars max)
- Short Description (80 chars max)
- Full Description (4000 chars max)
- App Icon (512x512)
- Feature Graphic (1024x500)
- Screenshots (at least 2)
- Privacy Policy URL (required)

## 🚀 Quick Start Commands

### For Each App:

```bash
# 1. Navigate to app directory
cd rider-mobile-pwa  # or driver-mobile-pwa, admin-mobile-pwa

# 2. Install EAS CLI (if not already installed)
npm install -g eas-cli

# 3. Login to Expo
eas login

# 4. Configure EAS
eas build:configure

# 5. Update app.json with bundle identifiers

# 6. Build for production
eas build --platform all --profile production

# 7. Submit to stores (after review)
eas submit --platform ios
eas submit --platform android
```

## ⚠️ Important Notes

1. **Bundle Identifiers Must Be Unique**: 
   - iOS: `com.globapp.rider`, `com.globapp.driver`, `com.globapp.admin`
   - Android: Same as iOS

2. **Version Numbers**:
   - iOS: `buildNumber` (integer, increments)
   - Android: `versionCode` (integer, increments)
   - Both: `version` (semantic versioning like "1.0.0")

3. **Privacy Policy**: Required for both stores. Host at:
   - `https://globapp.app/privacy-policy`

4. **Testing**: Test builds before submitting:
   ```bash
   eas build --platform ios --profile preview
   ```

5. **Updates**: For app updates, increment version numbers and rebuild.

## 📚 Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

## ✅ Pre-Submission Checklist

For each app:
- [ ] App icon created (1024x1024)
- [ ] Splash screen configured
- [ ] Bundle identifier set (unique)
- [ ] Version numbers set
- [ ] App description written
- [ ] Privacy policy URL added
- [ ] Screenshots prepared
- [ ] EAS configured (`eas.json` exists)
- [ ] Production build successful
- [ ] Tested on real device
- [ ] App Store accounts ready
- [ ] Metadata prepared

## 🎉 Next Steps

1. **Start with one app** (recommend Rider app first)
2. **Create app icons** for that app
3. **Update app.json** with proper configuration
4. **Run EAS build** to test
5. **Submit to TestFlight** (iOS) or Internal Testing (Android)
6. **Gather feedback** and iterate
7. **Submit to production** when ready
8. **Repeat for other apps**

---

**Ready to start?** Let's begin by updating the `app.json` files with proper bundle identifiers and app names!




























