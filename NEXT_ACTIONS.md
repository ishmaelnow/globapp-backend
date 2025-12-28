# Next Steps - What You Need to Do

## Step 1: Commit and Push Frontend Changes (On Cursor)

**In your Cursor terminal:**

```bash
# Check what changed
git status

# Add the changed files
git add frontend/src/config/api.js frontend/src/services/publicService.js frontend/src/services/rideService.js

# Commit
git commit -m "Embed API key in frontend build - users don't need to enter manually"

# Push to GitHub
git push origin main
```

---

## Step 2: Rebuild Frontend on Droplet

**SSH to your Droplet:**

```bash
ssh ishmael@YOUR_DROPLET_IP
```

**Then run:**

```bash
# Go to project folder
cd ~/globapp-backend

# Pull latest changes
git pull origin main

# Go to frontend folder
cd frontend

# Create .env.production with API key
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production

# Build frontend (API key will be embedded)
npm run build

# Deploy the built files
sudo cp -r dist/* /var/www/globapp/frontend/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/globapp/frontend
```

---

## Step 3: Test It

1. Open browser: `https://globapp.app/rider`
2. **Don't enter any API key** (leave it empty)
3. Fill in ride booking form
4. Click "Get Price Estimate" or "Book Now"
5. Should work without API key!

---

## Quick Commands Summary

**On Cursor:**
```bash
git add frontend/src/config/api.js frontend/src/services/publicService.js frontend/src/services/rideService.js
git commit -m "Embed API key in frontend build"
git push origin main
```

**On Droplet:**
```bash
cd ~/globapp-backend && git pull origin main
cd frontend && echo "VITE_PUBLIC_API_KEY=yesican" > .env.production && npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

---

## That's It!

After these steps, your ride-sharing app will work for users without them needing to enter an API key manually. Much better UX! 🎉




