# Debug Admin Dashboard API Key Issue

## What to Check

### Step 1: Check Browser Console

**Open F12 → Console and look for:**
- `Admin API Key configured: Yes` or `No`
- `Admin API Key value: admincan` or `(empty)`

**What does it show?**

### Step 2: Check Network Request

**Open F12 → Network tab:**
1. Try to load admin dashboard
2. Click on the failed GET request to `/api/v1/drivers`
3. Go to Headers tab
4. Check Request Headers
5. **Is `X-API-Key` header present?**
6. **What value does it have?**

### Step 3: Check Deployed Files

**On Droplet:**
```bash
# Check if admin API key is in deployed files
grep -r "admincan" /var/www/globapp/frontend/assets/*.js | head -1
```

**If this returns nothing**, the admin API key wasn't embedded in the build.

### Step 4: Check .env.production File

**On Droplet:**
```bash
cd ~/globapp-backend/frontend
cat .env.production
```

**Should show:**
```
VITE_PUBLIC_API_KEY=yesican
VITE_ADMIN_API_KEY=admincan
```

## Possible Issues

1. **Admin API key not in build** → Need to rebuild with both keys
2. **localStorage overriding** → Clear `admin_api_key` from localStorage
3. **Code not using embedded key** → Check if `getInitialApiKey()` is working

## Quick Fix

**On Droplet:**
```bash
cd ~/globapp-backend/frontend

# Make sure both keys are in .env.production
cat > .env.production << EOF
VITE_PUBLIC_API_KEY=yesican
VITE_ADMIN_API_KEY=admincan
EOF

# Rebuild
rm -rf dist
npm run build

# Verify both keys are in build
grep -r "yesican" dist/assets/*.js | head -1
grep -r "admincan" dist/assets/*.js | head -1

# Deploy
sudo cp -r dist/* /var/www/globapp/frontend/
```

**In Browser:**
1. Clear localStorage: `localStorage.removeItem('admin_api_key')`
2. Hard refresh: `Ctrl+Shift+R`
3. Test admin dashboard




