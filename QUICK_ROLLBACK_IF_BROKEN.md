# Quick Rollback If Rebuild Breaks Something

## If Payment Form Stops Working After Rebuild

### Option 1: Revert Frontend Only (Fastest)

```bash
# On Droplet
cd ~/globapp-backend/rider-app

# Restore previous build (if you have backup)
# OR rebuild with previous code
git log --oneline -5  # See recent commits
git checkout HEAD~1   # Go back one commit
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
```

### Option 2: Restore from Stable Tag

```bash
# On Droplet
cd ~/globapp-backend
git checkout v1.0-stable
cd rider-app
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo systemctl restart globapp-api
```

### Option 3: Just Revert the Last Commit

```bash
# On Droplet
cd ~/globapp-backend
git revert HEAD  # Undo last commit
git pull origin main
cd rider-app
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
```

## What We Changed

The only change in the last commit was:
- Added `fields.billingDetails.address.postalCode: 'always'` to Stripe options
- This just ensures ZIP code is always visible
- **Very unlikely to break anything**

## If It Works Now, It Will Work After Rebuild

Since payment is already working, the rebuild will just:
1. Include the ZIP code visibility fix
2. Sync your code
3. **Should work exactly the same**

## Test After Rebuild

1. Hard refresh browser: `Ctrl+Shift+R`
2. Book a ride
3. Select "Card" payment
4. Verify all fields show (card number, expiry, CVC, ZIP)
5. Test with: `4242 4242 4242 4242`

If anything breaks, use one of the rollback options above!



