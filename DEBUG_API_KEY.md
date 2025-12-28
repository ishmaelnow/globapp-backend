# Debug API Key Issue

## Check What's Happening

The 401 errors mean the API key isn't being sent. Let's debug:

### Step 1: Check Browser Console

Open browser console (F12) and look for:
- `API Base URL: ...`
- `Public API Key configured: Yes` or `No`
- `Public API Key value: ...` or `(empty)`

**If it says "No" or "(empty)"**, the API key wasn't embedded in the build.

### Step 2: Verify on Droplet

**On your Droplet:**

```bash
# Check if .env.production exists
cat ~/globapp-backend/frontend/.env.production

# Should show: VITE_PUBLIC_API_KEY=yesican

# Check if API key is in built files
grep -r "yesican" /var/www/globapp/frontend/assets/*.js | head -1
```

**If grep finds nothing**, the API key wasn't embedded.

### Step 3: Rebuild Properly

**On Droplet:**

```bash
cd ~/globapp-backend/frontend

# Make sure .env.production exists
cat .env.production
# Should show: VITE_PUBLIC_API_KEY=yesican

# If it doesn't exist or is wrong:
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production

# Clean build (important!)
rm -rf dist node_modules/.vite

# Rebuild
npm run build

# Verify API key is in build
grep -r "yesican" dist/assets/*.js | head -1

# Deploy
sudo cp -r dist/* /var/www/globapp/frontend/
```

### Step 4: Hard Refresh Browser

- `Ctrl+Shift+R` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

---

## Quick Diagnostic Commands

**On Droplet:**

```bash
# Check if env file exists
ls -la ~/globapp-backend/frontend/.env.production

# Check what's in it
cat ~/globapp-backend/frontend/.env.production

# Check if API key is in deployed files
grep -r "yesican" /var/www/globapp/frontend/assets/*.js 2>/dev/null | head -1
```

**If grep returns nothing**, rebuild with the commands above.

---

## Most Likely Issue

The frontend wasn't rebuilt with the new code yet. You need to:
1. Make sure code is committed/pushed
2. Pull on Droplet
3. Create `.env.production` file
4. Rebuild frontend
5. Deploy




