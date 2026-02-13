# Mobile PWA Domain Migration Summary

## Overview
This document summarizes the domain migration from `globapp.app` to `globapp.org` for the mobile Progressive Web Apps (PWAs).

## Apps Updated
1. **rider-mobile-pwa** - Rider mobile app
2. **passenger-mobile-pwa** - Passenger mobile app

---

## Files Updated

### rider-mobile-pwa

#### Configuration Files
- ✅ `src/config/api.js` - Updated `DIGITALOCEAN_URL` to `https://globapp.org/api/v1`
- ✅ `app.json` - Updated `EXPO_PUBLIC_API_BASE_URL` in `extra` section to `https://globapp.org/api/v1`

#### Service Files
- ✅ `src/services/rideTrackingService.js` - Updated fallback API URL
- ✅ `src/services/rideService.js` - Updated fallback API URLs (2 locations)

#### Component Files
- ✅ `src/components/Receipt.jsx` - Updated support email from `support@globapp.app` to `support@globapp.org` (2 locations)

### passenger-mobile-pwa

#### Configuration Files
- ✅ `src/config/api.js` - Updated `DIGITALOCEAN_URL` to `https://globapp.org/api/v1`
- ✅ `src/src/config/api.js` - Updated `DIGITALOCEAN_URL` (duplicate structure)
- ✅ `app.json` - Updated `EXPO_PUBLIC_API_BASE_URL` in `extra` section to `https://globapp.org/api/v1`

#### Service Files
- ✅ `src/services/rideService.js` - Updated fallback API URLs (2 locations)
- ✅ `src/src/services/rideService.js` - Updated fallback API URLs (duplicate structure)

#### Component Files
- ✅ `src/components/Receipt.jsx` - Updated support email from `support@globapp.app` to `support@globapp.org` (2 locations)
- ✅ `src/src/components/Receipt.jsx` - Updated support email (duplicate structure)

---

## Verification

### Domain References Check
All references to `globapp.app` have been replaced with `globapp.org`:
- ✅ No remaining `globapp.app` references in `rider-mobile-pwa/src/`
- ✅ No remaining `globapp.app` references in `passenger-mobile-pwa/src/`

### Configuration Status
Both apps are configured with:
- ✅ Correct API base URL: `https://globapp.org/api/v1`
- ✅ EAS project IDs configured in `app.json`
- ✅ EAS build configuration ready (`eas.json`)

---

## Next Steps: Building Release APKs

### Prerequisites
1. Ensure you're logged into EAS:
   ```bash
   eas login
   ```

2. Verify EAS CLI is installed:
   ```bash
   npm install -g eas-cli
   ```

### Build Commands

#### For rider-mobile-pwa:
```bash
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
eas build --platform android --profile production
```

#### For passenger-mobile-pwa:
```bash
cd C:\Users\koshi\cursor-apps\passenger-mobile-pwa
eas build --platform android --profile production
```

### Build Profiles
Both apps use the `production` profile configured in `eas.json`:
- **Build Type**: APK (Android Package Kit)
- **Auto Increment**: Enabled (version numbers increment automatically)
- **Distribution**: Internal (for testing before Play Store submission)

### Expected Build Time
- EAS cloud builds typically take 15-30 minutes
- You'll receive an email notification when the build completes
- Download links will be provided in the EAS dashboard

---

## Testing Checklist

After building, test the following:

### API Connectivity
- [ ] App can connect to `https://globapp.org/api/v1`
- [ ] API calls return successful responses
- [ ] No CORS errors in logs

### Core Features
- [ ] User authentication/login
- [ ] Ride booking
- [ ] Ride tracking
- [ ] Payment processing
- [ ] Receipt generation (verify support email is `support@globapp.org`)
- [ ] Notifications

### Network Handling
- [ ] App handles network errors gracefully
- [ ] Offline mode works correctly
- [ ] Retry logic functions properly

---

## Troubleshooting

### If Build Fails
1. Check EAS build logs in the dashboard
2. Verify `app.json` has valid `projectId`
3. Ensure all dependencies are listed in `package.json`
4. Check for syntax errors in updated files

### If App Can't Connect to API
1. Verify DNS propagation: `nslookup globapp.org`
2. Check backend CORS settings include mobile app origins
3. Verify SSL certificate is valid: `curl -I https://globapp.org/api/v1`
4. Check app logs for specific error messages

### If Support Email Shows Old Domain
1. Clear app cache/data
2. Rebuild the app
3. Verify `Receipt.jsx` files have been updated

---

## Notes

### Duplicate Structure in passenger-mobile-pwa
The `passenger-mobile-pwa` app has a duplicate `src/src/` directory structure. Both locations were updated to ensure consistency, but you may want to clean this up in the future to avoid confusion.

### Environment Variables
Both apps support environment variables via:
- `.env` file (if using `dotenv`)
- `app.json` `extra` section (recommended for Expo)
- Hardcoded fallback in `api.js` (now updated to `globapp.org`)

The priority order is:
1. `process.env.EXPO_PUBLIC_API_BASE_URL`
2. `Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL`
3. Hardcoded `DIGITALOCEAN_URL` fallback

---

## Migration Complete ✅

All mobile PWA code has been updated to use `globapp.org`. The apps are ready for rebuild and testing.











