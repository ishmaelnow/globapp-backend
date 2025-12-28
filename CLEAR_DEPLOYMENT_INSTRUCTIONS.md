# Clear Deployment Instructions

## Step-by-Step Guide

### Step 1: Connect to Your Droplet
Open your terminal/SSH client and connect to your Droplet:
```bash
ssh ishmael@your-droplet-ip
```
(Replace `your-droplet-ip` with your actual Droplet IP address)

---

### Step 2: Navigate to Project Directory
```bash
cd ~/globapp-backend
```

---

### Step 3: Pull Latest Code from GitHub
```bash
git pull origin frontend
```
This downloads the latest fixes from GitHub.

---

### Step 4: Go to Frontend Directory
```bash
cd frontend
```

---

### Step 5: Create Environment File with API Keys
```bash
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
```
This creates a file that embeds the API keys into the build.

---

### Step 6: Build the Frontend
```bash
npm run build
```
This compiles your React app. Wait for it to finish (should take 10-30 seconds).

**Expected output:** You should see "✓ built in X.XXs" at the end.

---

### Step 7: Copy Built Files to Web Directory
```bash
sudo cp -r dist/* /var/www/globapp/frontend/
```
This copies the built files to where Nginx serves them from.

**Note:** You'll be asked for your sudo password. Type it and press Enter.

---

### Step 8: Verify Deployment (Optional)
```bash
ls -la /var/www/globapp/frontend/ | head -10
```
This shows the deployed files. You should see `index.html` and an `assets` folder.

---

## Testing After Deployment

### Step 9: Hard Refresh Your Browser
1. Open your browser
2. Go to: `https://globapp.app/admin`
3. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - This clears the browser cache and loads the new version

### Step 10: Test Admin Dashboard - Driver Dropdown
1. You should be on the Admin Dashboard
2. Click the **"Rides"** tab at the top
3. Look at the **"Select Driver"** dropdown
4. **Expected result:** 
   - Dropdown label should show: "Select Driver (Debug: 5 total, 5 active)"
   - When you click the dropdown, you should see all 5 drivers listed
   - You should be able to select a driver

### Step 11: Test Driver Dashboard - GPS Location
1. Go to: `https://globapp.app/driver`
2. Login as a driver (use driver phone and PIN)
3. Click the **"Update Location"** tab
4. Click the **"Get My Location"** button
5. **Expected result:**
   - Browser will ask: "Allow globapp.app to access your location?" → Click **Allow**
   - Location fields should automatically fill with your GPS coordinates
   - Click **"Update Location to Server"** to save

---

## Troubleshooting

### If Driver Dropdown is Still Empty:
1. Open browser Developer Tools: Press `F12`
2. Go to **Console** tab
3. Look for any red error messages
4. Copy and share those errors

### If Build Fails:
- Check if you're in the `frontend` directory: `pwd` should show `/home/ishmael/globapp-backend/frontend`
- Check if `.env.production` exists: `cat .env.production`
- Check for error messages in the build output

### If GPS Doesn't Work:
- Make sure you clicked "Allow" when browser asked for location permission
- Make sure you're using HTTPS (not HTTP)
- Try a different browser

---

## Quick Copy-Paste Commands (All at Once)

If you want to run everything at once, copy and paste this entire block:

```bash
cd ~/globapp-backend && git pull origin frontend && cd frontend && echo "VITE_PUBLIC_API_KEY=yesican" > .env.production && echo "VITE_ADMIN_API_KEY=admincan" >> .env.production && npm run build && sudo cp -r dist/* /var/www/globapp/frontend/
```

**Note:** You'll be asked for your sudo password when it reaches the `sudo cp` command.

---

## Summary

1. ✅ Connect to Droplet
2. ✅ Pull latest code: `git pull origin frontend`
3. ✅ Create API keys file: `echo "VITE_PUBLIC_API_KEY=yesican" > .env.production` (and admin key)
4. ✅ Build: `npm run build`
5. ✅ Deploy: `sudo cp -r dist/* /var/www/globapp/frontend/`
6. ✅ Hard refresh browser: `Ctrl+Shift+R`
7. ✅ Test driver dropdown in Admin Dashboard
8. ✅ Test GPS location in Driver Dashboard

That's it! Let me know if you run into any issues.




