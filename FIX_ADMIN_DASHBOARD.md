# Fix Admin Dashboard - Step by Step

## Diagnostic Steps

### Step 1: Check Browser Console

**Open F12 → Console and look for:**
- `Admin API Key configured: Yes` or `No`
- `Admin API Key value: admincan` or `(empty)`

**If you don't see these logs**, the new code isn't deployed yet.

### Step 2: Check if Admin Key is in Deployed Files

**On Droplet:**
```bash
grep -r "admincan" /var/www/globapp/frontend/assets/*.js | head -1
```

**If this returns nothing**, the admin API key wasn't embedded.

### Step 3: Check .env.production File

**On Droplet:**
```bash
cd ~/globapp-backend/frontend
cat .env.production
```

**Should show BOTH:**
```
VITE_PUBLIC_API_KEY=yesican
VITE_ADMIN_API_KEY=admincan
```

## Fix: Rebuild with Both Keys

**On Droplet:**

```bash
cd ~/globapp-backend/frontend

# Create .env.production with BOTH keys
cat > .env.production << 'EOF'
VITE_PUBLIC_API_KEY=yesican
VITE_ADMIN_API_KEY=admincan
EOF

# Verify it was created correctly
cat .env.production

# Clean old build
rm -rf dist

# Rebuild
npm run build

# Verify BOTH keys are in build
echo "Checking public key:"
grep -r "yesican" dist/assets/*.js | head -1
echo "Checking admin key:"
grep -r "admincan" dist/assets/*.js | head -1

# Deploy
sudo cp -r dist/* /var/www/globapp/frontend/
```

## After Rebuild

1. **Clear browser localStorage:**
   - F12 → Console → Run: `localStorage.removeItem('admin_api_key')`
   - Or F12 → Application → Local Storage → Delete `admin_api_key`

2. **Hard refresh:** `Ctrl+Shift+R`

3. **Check console:** Should now show:
   - `Admin API Key configured: Yes`
   - `Admin API Key value: admincan`

4. **Test admin dashboard:** Should work without entering API key

## If Still Not Working

Check Network tab (F12 → Network):
- Click on failed request
- Check Request Headers
- Is `X-API-Key` header present?
- What value does it have?

If header is missing or wrong, the code logic might need adjustment.




