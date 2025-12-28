# Rebuild and Redeploy Frontend

## Why It Still Asks for API Key

The changes are in your **source code**, but the **deployed frontend** on the Droplet still has the old code. You need to rebuild and redeploy.

## Steps to Redeploy

### Step 1: Commit & Push (If Not Done Yet)

**On Cursor:**

```bash
git add frontend/src/config/api.js frontend/src/services/publicService.js frontend/src/services/rideService.js
git commit -m "Embed API key in frontend build"
git push origin main
```

### Step 2: Rebuild Frontend on Droplet

**SSH to your Droplet:**

```bash
ssh ishmael@YOUR_DROPLET_IP
```

**Then run:**

```bash
# Go to project
cd ~/globapp-backend

# Pull latest code
git pull origin main

# Go to frontend
cd frontend

# Create .env.production with API key
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production

# Install dependencies (if needed)
npm install

# Build frontend (this embeds the API key)
npm run build

# Deploy the NEW build
sudo cp -r dist/* /var/www/globapp/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp/frontend

# Optional: Clear browser cache or hard refresh (Ctrl+Shift+R)
```

### Step 3: Test

1. **Hard refresh** your browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Go to `https://globapp.app/rider`
3. Try booking without entering API key
4. Should work now!

---

## Quick One-Liner (On Droplet)

```bash
cd ~/globapp-backend && git pull origin main && cd frontend && echo "VITE_PUBLIC_API_KEY=yesican" > .env.production && npm run build && sudo cp -r dist/* /var/www/globapp/frontend/
```

---

## Verify Build Worked

After building, check if API key is embedded:

```bash
# On Droplet, check the built file
grep -r "yesican" /var/www/globapp/frontend/assets/*.js | head -1
```

If you see the API key in the built JS files, it's embedded correctly!

---

## Troubleshooting

**If it still asks for API key:**
- Make sure you did `npm run build` (not just `npm install`)
- Make sure you copied the NEW `dist/*` files
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors (F12)

**If build fails:**
- Make sure you're in `frontend` directory
- Run `npm install` first
- Check for errors in build output




