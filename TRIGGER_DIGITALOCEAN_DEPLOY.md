# Trigger DigitalOcean Redeploy

## What We Just Did

1. ✅ Verified CORS fix is in backend branch
2. ✅ Merged backend → main
3. ✅ Pushed to GitHub

## DigitalOcean Should Auto-Deploy

If your DigitalOcean app is connected to GitHub `main` branch with auto-deploy:
- It should automatically detect the push
- Start building and deploying
- Usually takes 5-10 minutes

## Check Deployment Status

1. Go to: https://cloud.digitalocean.com/apps
2. Click on your `globapp` app
3. Go to "Activity" or "Deployments" tab
4. You should see a new deployment starting

## Manual Trigger (If Needed)

If auto-deploy doesn't trigger:

### Option 1: Via DigitalOcean Dashboard
1. Go to your app
2. Click "Settings" → "App-Level Settings"
3. Look for "Deploy" or "Redeploy" button
4. Click it to trigger manual deploy

### Option 2: Via GitHub Webhook
- Sometimes you can trigger by making a small commit
- Or push an empty commit: `git commit --allow-empty -m "Trigger deploy" && git push`

### Option 3: Check App Spec
- Go to Settings → App Spec
- Make sure it's pointing to `main` branch
- Verify source directory and build commands

## Verify CORS is Fixed

After deployment completes (5-10 min), test:

```powershell
# Test CORS headers
curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -X OPTIONS https://globapp.app/api/v1/health -v
```

Should see: `Access-Control-Allow-Origin: http://localhost:3000`

## Then Test Frontend

```powershell
cd frontend
npm run dev
```

Visit: http://localhost:3000

Should work now! ✅




