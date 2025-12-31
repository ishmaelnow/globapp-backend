# Build All Apps for Production

Quick guide to build all three React apps for subdomain deployment.

---

## Quick Build Script

### Windows PowerShell

Save this as `build-all.ps1` in your project root:

```powershell
# Build All Apps Script
Write-Host "Building Rider App..." -ForegroundColor Green
cd rider-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Rider app build failed!" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host "Building Driver App..." -ForegroundColor Green
cd driver-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Driver app build failed!" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host "Building Admin App..." -ForegroundColor Green
cd admin-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Admin app build failed!" -ForegroundColor Red
    exit 1
}
cd ..

Write-Host "All apps built successfully!" -ForegroundColor Green
Write-Host "Build outputs:" -ForegroundColor Cyan
Write-Host "  - rider-app/dist/" -ForegroundColor Cyan
Write-Host "  - driver-app/dist/" -ForegroundColor Cyan
Write-Host "  - admin-app/dist/" -ForegroundColor Cyan
```

**Run it:**
```powershell
.\build-all.ps1
```

---

## Manual Build Steps

### Step 1: Build Rider App

```powershell
cd rider-app
npm run build
cd ..
```

**Output:** `rider-app/dist/` folder

### Step 2: Build Driver App

```powershell
cd driver-app
npm run build
cd ..
```

**Output:** `driver-app/dist/` folder

### Step 3: Build Admin App

```powershell
cd admin-app
npm run build
cd ..
```

**Output:** `admin-app/dist/` folder

---

## Verify Builds

Check that each `dist` folder contains:
- `index.html`
- `assets/` folder with JS and CSS files
- No errors in terminal

---

## Production Environment Variables

Before building, ensure each app has the correct `.env.production` file:

### rider-app/.env.production
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
VITE_PUBLIC_API_KEY=yesican
```

### driver-app/.env.production
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
```

### admin-app/.env.production
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
VITE_ADMIN_API_KEY=admincan
```

**Note:** Vite uses `.env.production` automatically when you run `npm run build` (production mode).

---

## Upload to Droplet

After building, upload to your Droplet:

```powershell
# Upload Rider App
scp -r rider-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/rider/

# Upload Driver App
scp -r driver-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/driver/

# Upload Admin App
scp -r admin-app\dist\* root@YOUR_DROPLET_IP:/var/www/globapp/admin/
```

---

## Troubleshooting

### Build Fails
- Check for syntax errors in components
- Ensure all dependencies are installed: `npm install`
- Check `.env.production` files exist

### Build Succeeds but App Doesn't Work
- Verify environment variables are set correctly
- Check browser console for errors
- Ensure backend CORS includes subdomains




