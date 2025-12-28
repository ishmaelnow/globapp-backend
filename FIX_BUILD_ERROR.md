# Fix Build Error - ADMIN_API_KEY Not Exported

## Problem
Build failed because `ADMIN_API_KEY` is not exported from `api.js` on the Droplet.

## Solution
The changes to `api.js` weren't committed. I've now committed and pushed them.

## Next Steps on Droplet

```bash
cd ~/globapp-backend
git pull origin frontend
cd frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
echo "VITE_ADMIN_API_KEY=admincan" >> .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

The `ADMIN_API_KEY` export is now in the GitHub repo, so after pulling it should build successfully.




