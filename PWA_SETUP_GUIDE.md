# PWA Setup Guide

## ✅ What's Been Added

All three apps (Rider, Driver, Admin) now have PWA capabilities:

1. **Web App Manifest** (`public/manifest.json`) - Makes apps installable
2. **Service Worker** (`public/service-worker.js`) - Enables offline support
3. **PWA Meta Tags** - iOS and Windows support
4. **Service Worker Registration** - Automatic registration on load

## 📱 How to Generate App Icons

You need to create app icons for each app. Here's how:

### Option 1: Use Online Tool (Easiest)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG logo/image
3. Download the generated icon set
4. Extract to `rider-app/public/icons/`, `driver-app/public/icons/`, `admin-app/public/icons/`

### Option 2: Create Manually
Create these sizes for each app:
- 72x72.png
- 96x96.png
- 128x128.png
- 144x144.png
- 152x152.png
- 192x192.png (required)
- 384x384.png
- 512x512.png (required)

Place them in:
- `rider-app/public/icons/`
- `driver-app/public/icons/`
- `admin-app/public/icons/`

### Option 3: Use a Simple Icon Generator Script
```bash
# Install ImageMagick (if not installed)
# On Ubuntu/Debian: sudo apt-get install imagemagick
# On macOS: brew install imagemagick

# Create a simple script to generate icons
# Create a base 512x512 icon first, then run:
for size in 72 96 128 144 152 192 384 512; do
  convert base-icon.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

## 🚀 Testing PWA Locally

1. **Build the app:**
   ```bash
   cd rider-app  # or driver-app, admin-app
   npm run build
   ```

2. **Serve with HTTPS** (required for PWA):
   ```bash
   # Install serve with HTTPS support
   npm install -g serve
   
   # Serve with HTTPS (you'll need to accept self-signed certificate)
   serve -s dist --ssl-cert cert.pem --ssl-key key.pem
   ```

   Or use a simple HTTP server for testing (Chrome allows localhost):
   ```bash
   serve -s dist
   ```

3. **Test in Browser:**
   - Open Chrome DevTools (F12)
   - Go to Application tab
   - Check "Manifest" section
   - Check "Service Workers" section
   - Click "Add to Home Screen" button (if available)

## 📲 Installing on Mobile

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Select "Add to Home Screen" or "Install App"
4. Confirm installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Customize name and tap "Add"

## 🔧 Vite Configuration

Make sure `vite.config.js` copies public files correctly (should work by default):

```javascript
export default {
  build: {
    rollupOptions: {
      // Vite automatically copies public/ folder
    }
  }
}
```

## ✅ Checklist

- [x] Manifest files created for all apps
- [x] Service workers created for all apps
- [x] HTML files updated with PWA meta tags
- [x] Service worker registration added
- [ ] App icons generated and placed in `public/icons/`
- [ ] Tested on Android device
- [ ] Tested on iOS device
- [ ] Verified offline functionality

## 🎯 Next Steps

1. **Generate Icons** - Create app icons for each app
2. **Test Installation** - Test on mobile devices
3. **Deploy** - Deploy to production (HTTPS required)
4. **Monitor** - Check service worker registration in production

## 📝 Notes

- **HTTPS Required**: PWAs require HTTPS in production (you already have SSL!)
- **Service Worker Scope**: Service workers only work on their origin (rider.globapp.app, driver.globapp.app, admin.globapp.app)
- **Offline Support**: Basic offline support is enabled, but API calls still require internet
- **Push Notifications**: Service worker is ready for push notifications (needs backend setup)

## 🐛 Troubleshooting

**Service Worker not registering:**
- Check browser console for errors
- Ensure HTTPS is enabled (or localhost)
- Clear browser cache and reload

**Icons not showing:**
- Verify icons are in `public/icons/` folder
- Check manifest.json paths are correct (`/icons/icon-192x192.png`)
- Rebuild the app after adding icons

**Install prompt not showing:**
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Verify service worker is registered
- Some browsers require user interaction before showing install prompt

