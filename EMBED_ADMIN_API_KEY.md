# Embed Admin API Key

## What Changed

1. **config/api.js**: Added `ADMIN_API_KEY` export from `VITE_ADMIN_API_KEY` env var
2. **services/adminService.js**: Updated to use embedded `ADMIN_API_KEY` with fallback
3. **components/AdminDashboard.jsx**: Uses embedded key by default

## Rebuild with Both API Keys

**On Droplet:**

```bash
cd ~/globapp-backend/frontend

# Create .env.production with BOTH API keys
cat > .env.production << EOF
VITE_PUBLIC_API_KEY=yesican
VITE_ADMIN_API_KEY=admincan
EOF

# Verify
cat .env.production

# Clean and rebuild
rm -rf dist
npm run build

# Verify both keys are in build
grep -r "yesican" dist/assets/*.js | head -1
grep -r "admincan" dist/assets/*.js | head -1

# Deploy
sudo cp -r dist/* /var/www/globapp/frontend/
```

## After Rebuild

1. **Clear browser localStorage** (F12 → Application → Clear both `public_api_key` and `admin_api_key`)
2. **Hard refresh**: `Ctrl+Shift+R`
3. **Test both**:
   - Ride booking (should work without API key)
   - Admin dashboard (should work without API key)

Both should work automatically now!




