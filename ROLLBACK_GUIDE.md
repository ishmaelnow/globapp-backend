# Rollback Guide - Restore to Stable Checkpoint

## Current Stable Version: v1.0-stable

**Date:** December 30, 2025  
**Status:** All 3 apps working, Stripe integration ready (not yet configured)

## What's Working

✅ **Rider App** (`rider.globapp.app`)
- Real distance/duration calculation
- $2.80 per mile pricing
- Payment selection (cash working, Stripe ready)
- Booking flow complete

✅ **Admin App** (`admin.globapp.app`)
- Dashboard functional
- Driver management
- Ride dispatch
- API key handling

✅ **Driver App** (`driver.globapp.app`)
- Login and authentication
- Assigned ride viewing
- Location updates
- Ride status updates

✅ **Backend**
- Real geocoding API integration
- Payment endpoints ready
- Stripe integration code added (needs keys)

## How to Rollback

### Option 1: Restore from Git Tag (Recommended)

```bash
# On your Droplet
cd ~/globapp-backend

# Checkout the stable tag
git fetch origin --tags
git checkout v1.0-stable

# Or create a new branch from the tag
git checkout -b restore-stable v1.0-stable

# Pull latest (if needed)
git pull origin v1.0-stable
```

### Option 2: Restore from Stable Branch

```bash
cd ~/globapp-backend
git fetch origin
git checkout stable-checkpoint
git pull origin stable-checkpoint
```

### Option 3: Reset Current Branch to Stable Commit

```bash
cd ~/globapp-backend
git log --oneline | grep "Stable checkpoint"  # Find commit hash
git reset --hard <commit-hash>
git push origin main --force  # ⚠️ Only if you're sure!
```

## After Rollback

### 1. Restart Backend
```bash
sudo systemctl restart globapp-api
sudo systemctl status globapp-api
```

### 2. Rebuild Frontend Apps

**Rider App:**
```bash
cd ~/globapp-backend/rider-app
npm install  # In case dependencies changed
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider
```

**Admin App:**
```bash
cd ~/globapp-backend/admin-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
sudo chown -R www-data:www-data /var/www/globapp/admin
sudo chmod -R 755 /var/www/globapp/admin
```

**Driver App:**
```bash
cd ~/globapp-backend/driver-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/driver/
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver
```

## Verify Rollback

1. **Test Rider App:** https://rider.globapp.app
   - Should show fare estimates
   - Should allow booking
   - Payment selection should work

2. **Test Admin App:** https://admin.globapp.app
   - Should load dashboard
   - Should show drivers/rides

3. **Test Driver App:** https://driver.globapp.app
   - Should show login
   - Should work after login

## Current Commit Hash

To find the exact commit:
```bash
git show v1.0-stable --no-patch --format="%H"
```

## Important Notes

- ⚠️ **Force push warning:** Only use `--force` if you're absolutely sure
- ✅ **Safe rollback:** Using tags/branches is safer than force push
- 📝 **Document changes:** Before making new changes, document what you're changing
- 🔄 **Test first:** Always test changes in a separate branch first

## Quick Rollback Command

```bash
# One-liner to restore stable version
cd ~/globapp-backend && git fetch origin --tags && git checkout v1.0-stable && sudo systemctl restart globapp-api
```



