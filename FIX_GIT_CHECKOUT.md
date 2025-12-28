# Fix Git Checkout Issue

## Problem
Git sees both a `frontend` directory and `frontend` branch, so it doesn't know which one you want.

## Solution

Use one of these approaches:

### Option 1: Explicitly specify branch
```bash
cd ~/globapp-backend
git checkout -b frontend origin/frontend
git pull origin frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

### Option 2: Use -- to disambiguate
```bash
cd ~/globapp-backend
git checkout -- frontend
git pull origin frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

### Option 3: Check current branch first
```bash
cd ~/globapp-backend
git branch -a  # See all branches
git checkout frontend  # If already on frontend, this will work
git pull origin frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

## Recommended: Step by Step

```bash
# 1. Check what branch you're on
cd ~/globapp-backend
git branch

# 2. If not on frontend, switch to it explicitly
git checkout -b frontend origin/frontend

# 3. Pull latest
git pull origin frontend

# 4. Go to frontend directory
cd frontend

# 5. Set API keys
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production

# 6. Build
npm run build

# 7. Deploy
sudo cp -r dist/* /var/www/globapp/frontend/
```




