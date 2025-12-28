# Final Deployment Steps

## On Your Droplet - Run These Commands:

```bash
# 1. Navigate to project directory
cd ~/globapp-backend

# 2. Pull latest frontend changes (includes ADMIN_API_KEY fix)
git pull origin frontend

# 3. Go to frontend directory
cd frontend

# 4. Create .env.production with API keys
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production

# 5. Rebuild frontend
npm run build

# 6. Deploy to web directory
sudo cp -r dist/* /var/www/globapp/frontend/

# 7. Verify deployment
ls -la /var/www/globapp/frontend/ | head -10
```

## After Deployment - Test:

### 1. Hard Refresh Browser
- Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- This clears browser cache

### 2. Test Admin Dashboard - Driver Dropdown
- Go to: `https://globapp.app/admin`
- Click "Rides" tab
- Check dropdown label - should show: "Select Driver (Debug: 5 total, 5 active)"
- Dropdown should show all 5 drivers

### 3. Test Driver Dashboard - GPS Location
- Go to: `https://globapp.app/driver`
- Login as a driver
- Click "Update Location" tab
- Click "Get My Location" button
- Browser will ask for location permission
- Location should auto-populate
- Click "Update Location to Server" to save

### 4. Check Browser Console (F12)
- Should see logs like:
  - "Rides tab - Loaded all drivers: [...]"
  - "Rides tab - Active drivers count: 5"
  - "DEBUG: Drivers state changed: {count: 5, ...}"

## If Something Doesn't Work:

1. **Driver dropdown still empty:**
   - Open browser console (F12)
   - Check for errors
   - Check Network tab → `/api/v1/drivers` request
   - Share console logs

2. **GPS not working:**
   - Make sure browser has location permission
   - Try different browser
   - Check if HTTPS is enabled (required for geolocation)

3. **Build fails:**
   - Check if `.env.production` exists
   - Verify API keys are set correctly
   - Check for any error messages




