# Correct Deployment Commands

## Issue
You pulled from `main` branch, but the changes are on `frontend` branch!

## Correct Commands

```bash
# 1. Navigate to project
cd ~/globapp-backend

# 2. Switch to frontend branch (where the changes are)
git checkout frontend

# 3. Pull latest frontend changes
git pull origin frontend

# 4. Go to frontend directory
cd frontend

# 5. Ensure .env.production exists with API keys
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production

# 6. Rebuild frontend
npm run build

# 7. Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/frontend/

# 8. Verify deployment
ls -la /var/www/globapp/frontend/ | head -20
```

## One-Liner (if you prefer)

```bash
cd ~/globapp-backend && git checkout frontend && git pull origin frontend && cd frontend && echo "VITE_PUBLIC_API_KEY=yesican" > .env.production && echo "VITE_ADMIN_API_KEY=admincan" >> .env.production && npm run build && sudo cp -r dist/* /var/www/globapp/frontend/
```

## After Deployment

1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Go to Admin Dashboard → Rides tab
3. Check dropdown label - should show "Select Driver (Debug: 5 total, 5 active)"
4. Open browser console (F12) and check for logs




