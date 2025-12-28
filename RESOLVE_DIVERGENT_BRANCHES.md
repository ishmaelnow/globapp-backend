# Resolve Divergent Branches

## Problem
Your local `frontend` branch and remote `frontend` branch have diverged (different histories).

## Solution

### Option 1: Force update local to match remote (Recommended)
This will make your local frontend branch match the remote exactly:

```bash
cd ~/globapp-backend
git checkout -b frontend origin/frontend  # Create/switch to frontend branch
git fetch origin frontend
git reset --hard origin/frontend  # Force local to match remote
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

### Option 2: Rebase (if you want to keep local changes)
```bash
cd ~/globapp-backend
git checkout -b frontend origin/frontend
git pull --rebase origin frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

### Option 3: Merge (if you want to combine changes)
```bash
cd ~/globapp-backend
git checkout -b frontend origin/frontend
git pull --no-rebase origin frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

## Recommended: Use Option 1 (Force Update)
Since you want the latest code from GitHub, force update is safest:

```bash
cd ~/globapp-backend
git checkout -b frontend origin/frontend
git reset --hard origin/frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```




