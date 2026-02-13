# Mobile PWA Build Testing Guide

## Build Type Confirmation ✅

**YES - These are RELEASE APKs**

Both apps are configured to build **release APKs** using the `production` profile:

```json
"production": {
  "autoIncrement": true,
  "android": {
    "buildType": "apk"  // ← This creates release APK files
  }
}
```

### What This Means:
- ✅ **Release builds** (not debug builds)
- ✅ **APK format** (Android Package Kit) - installable on Android devices
- ✅ **Auto-incrementing versions** - each build gets a new version number
- ✅ **Production-ready** - optimized and signed for distribution

---

## Recommended Testing Order

### 🥇 **Test rider-mobile-pwa FIRST**

**Reasoning:**
1. **Primary user-facing app** - Riders are typically the main users
2. **More features** - Likely has more functionality to test
3. **Validation** - If rider app works, passenger app should work too (similar codebase)
4. **Faster feedback** - Test one app thoroughly before building the second

### 🥈 **Then test passenger-mobile-pwa**

After confirming rider-mobile-pwa works correctly, build and test passenger-mobile-pwa.

---

## Build Commands

### Step 1: Build rider-mobile-pwa (Test First)

```bash
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
eas build --platform android --profile production
```

**Expected Output:**
- Build will start on EAS servers
- You'll get a build ID
- Build typically takes 15-30 minutes
- You'll receive email notification when complete
- Download link will be provided

### Step 2: After Testing rider-mobile-pwa, Build passenger-mobile-pwa

```bash
cd C:\Users\koshi\cursor-apps\passenger-mobile-pwa
eas build --platform android --profile production
```

---

## Testing Checklist for rider-mobile-pwa

After downloading the APK, test these critical features:

### ✅ Network & API Connectivity
- [ ] App launches without errors
- [ ] Can connect to `https://globapp.org/api/v1`
- [ ] No network timeout errors
- [ ] API calls return successful responses
- [ ] Check logs for any CORS errors

### ✅ Core Functionality
- [ ] User registration/login
- [ ] Address autocomplete/search
- [ ] Ride booking flow
- [ ] Ride tracking (real-time location)
- [ ] Payment processing
- [ ] Receipt generation
- [ ] Notifications

### ✅ Domain Migration Verification
- [ ] All API calls go to `globapp.org` (not `globapp.app`)
- [ ] Support email shows `support@globapp.org` in receipts
- [ ] No references to old domain in app

### ✅ User Experience
- [ ] App is responsive
- [ ] No crashes during normal use
- [ ] Offline handling works
- [ ] Error messages are clear

---

## Installation Instructions

### On Android Device:

1. **Download the APK** from EAS build dashboard
2. **Enable "Install from Unknown Sources"**:
   - Go to Settings → Security → Enable "Unknown Sources" or
   - Settings → Apps → Special Access → Install Unknown Apps
3. **Transfer APK to device** (via email, USB, or direct download)
4. **Tap the APK file** to install
5. **Follow installation prompts**

### Testing Tips:
- Install on a **real device** (not emulator) for best results
- Test on **different network conditions** (WiFi, mobile data)
- Test with **different Android versions** if possible
- Clear app data between tests if needed

---

## If Build Fails

### Common Issues:

1. **EAS Not Logged In**
   ```bash
   eas login
   ```

2. **Missing Dependencies**
   - Check `package.json` has all required packages
   - Run `npm install` before building

3. **Invalid Configuration**
   - Verify `app.json` has valid `projectId`
   - Check `eas.json` syntax is correct

4. **Build Timeout**
   - EAS builds can take time
   - Check build logs in dashboard for specific errors

---

## Build Status Tracking

### Check Build Status:
```bash
eas build:list
```

### View Build Logs:
```bash
eas build:view [BUILD_ID]
```

Or check the EAS dashboard: https://expo.dev/accounts/[your-account]/projects

---

## Next Steps After Testing

### If rider-mobile-pwa Works ✅:
1. Document any issues found
2. Build passenger-mobile-pwa
3. Test passenger-mobile-pwa with same checklist
4. Deploy both apps to users

### If Issues Found ❌:
1. Fix issues in code
2. Rebuild and retest
3. Verify fixes before building passenger app

---

## Summary

- ✅ **Build Type**: Release APKs (production-ready)
- 🥇 **Test First**: rider-mobile-pwa
- 🥈 **Test Second**: passenger-mobile-pwa
- ⏱️ **Build Time**: 15-30 minutes per app
- 📱 **Installation**: Direct APK install on Android devices

**Ready to start building!** 🚀











