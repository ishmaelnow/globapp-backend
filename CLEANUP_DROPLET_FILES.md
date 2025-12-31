# Safe Cleanup Guide for Droplet Files

This guide helps you clean up irrelevant files on the Droplet WITHOUT affecting:
- ✅ The original `frontend` folder (combined React app with all 3 portals - LIVE and functional)
- ✅ The 3 separate React apps: `rider-app`, `driver-app`, `admin-app` (also LIVE and functional)
- ✅ Any deployed/working code

**Important**: You have TWO setups:
1. **`frontend/`** - Original combined app (rider + driver + admin in one app)
2. **`rider-app/`, `driver-app/`, `admin-app/`** - Separate apps for separation of concerns

**BOTH are functional and should be preserved!**

## Files to Clean Up (Safe to Remove)

Based on `git status` output, these files are untracked and can be safely removed:

### 1. `.env.example` (root)
- **Status**: Untracked
- **Safe to remove**: ✅ YES
- **Reason**: Example files aren't needed in production

### 2. `frontend/.env.production`
- **Status**: Untracked
- **Safe to remove**: ✅ YES (but keep the `frontend/` folder itself!)
- **Reason**: The `frontend` app uses hardcoded URLs as fallbacks. The `.env.production` file is not tracked in git and not needed since URLs are hardcoded
- **Note**: This only removes the `.env.production` file, NOT the `frontend/` folder

### 3. `rider-app/.env.production`
- **Status**: Untracked
- **Safe to remove**: ✅ YES
- **Reason**: `rider-app` uses hardcoded URLs and is deployed via build artifacts, not env files

### 4. `rider-app/package-lock.json` (modified)
- **Status**: Modified (not untracked)
- **Safe to reset**: ✅ YES
- **Reason**: Auto-generated file, can be regenerated with `npm install`

## Safe Cleanup Commands

**SSH into your Droplet:**
```bash
ssh ishmael@157.245.231.224
cd ~/globapp-backend
```

### Step 1: Check what's actually deployed
```bash
# Check if frontend is deployed on Droplet (it shouldn't be)
ls -la /var/www/globapp/

# Should show: admin, driver, rider (NOT frontend)
```

### Step 2: Safe cleanup (preserves ALL apps - frontend AND separate apps)
```bash
# Remove root .env.example (safe - example file)
rm -f .env.example

# Remove rider-app .env.production (safe - uses hardcoded URLs)
rm -f rider-app/.env.production

# Remove frontend/.env.production (safe - frontend uses hardcoded URLs)
# NOTE: This only removes the .env.production FILE, NOT the frontend folder!
rm -f frontend/.env.production

# Reset package-lock.json changes (will regenerate on next npm install)
cd rider-app
git checkout -- package-lock.json
cd ..
```

### Step 3: Verify frontend folder is untouched
```bash
# Verify frontend folder still exists and has all files
ls -la frontend/
ls -la frontend/src/
ls -la frontend/src/components/

# Should show all the components and files
```

### Step 4: Check git status (should be clean)
```bash
git status

# Should only show:
# - Modified: rider-app/package-lock.json (if you didn't reset it)
# OR
# - Clean working directory (if you reset package-lock.json)
```

## What NOT to Remove

❌ **DO NOT REMOVE:**
- `frontend/` folder (entire folder - this is your original combined app!)
- `frontend/src/` (any source files)
- `frontend/package.json`
- `frontend/node_modules/` (if exists)
- `frontend/index.html`
- `rider-app/`, `driver-app/`, `admin-app/` folders (your separate apps!)
- Any tracked source files
- Any files in `.gitignore` that are tracked

**Remember**: You have TWO setups:
- `frontend/` = Original combined app (KEEP IT!)
- `rider-app/`, `driver-app/`, `admin-app/` = Separate apps (KEEP THEM!)

## Verification After Cleanup

```bash
# 1. Frontend folder should still exist (original combined app)
test -d frontend && echo "✅ Frontend folder exists" || echo "❌ Frontend folder missing!"
test -d frontend/src && echo "✅ Frontend src exists" || echo "❌ Frontend src missing!"
test -f frontend/package.json && echo "✅ Frontend package.json exists" || echo "❌ Missing!"

# 2. Separate apps should still exist
test -d rider-app && echo "✅ Rider-app exists" || echo "❌ Rider-app missing!"
test -d driver-app && echo "✅ Driver-app exists" || echo "❌ Driver-app missing!"
test -d admin-app && echo "✅ Admin-app exists" || echo "❌ Admin-app missing!"

# 3. Check git status (should be clean or only show package-lock.json)
git status

# 4. Verify separate apps still work (test URLs)
curl -I https://rider.globapp.app
curl -I https://driver.globapp.app
curl -I https://admin.globapp.app

# 5. Verify frontend app still works (if deployed separately)
# Check your frontend deployment URL
```

## Quick One-Liner (Safe Cleanup)

```bash
# This removes ONLY untracked .env files, preserves ALL apps
cd ~/globapp-backend && \
rm -f .env.example frontend/.env.production rider-app/.env.production && \
cd rider-app && git checkout -- package-lock.json && cd .. && \
echo "✅ Cleanup complete! Verifying apps..." && \
test -d frontend && echo "✅ Frontend app preserved" && \
test -d rider-app && echo "✅ Rider-app preserved" && \
test -d driver-app && echo "✅ Driver-app preserved" && \
test -d admin-app && echo "✅ Admin-app preserved" && \
git status
```

**This cleanup:**
- ✅ Removes untracked `.env` files (not needed - apps use hardcoded URLs)
- ✅ Resets `package-lock.json` (will regenerate on next `npm install`)
- ✅ Preserves `frontend/` folder (your original combined app)
- ✅ Preserves `rider-app/`, `driver-app/`, `admin-app/` (your separate apps)

## After Cleanup

Once cleanup is done, you can proceed with testing payment records:
```bash
# Run the test script from your local machine
.\test_payment_records.ps1

# Then check database on Droplet
psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -f check_payment_records.sql
```

