# Fix Rider App: Automatic API Key & Relative URLs

## Issues Found

1. **AddressAutocomplete uses absolute URL** instead of relative `/api/v1`
2. **API key requires manual input** instead of being automatic
3. **Missing backend endpoint** `/api/v1/address/autocomplete` (causing 404 errors)

## Solution

### Step 1: Fix AddressAutocomplete Component ✅

**Already fixed:** The component now:
- Uses `BASE_URL` from config (relative `/api/v1` in production)
- Automatically uses `PUBLIC_API_KEY` from config (no user input needed)

### Step 2: Rebuild Rider App with Production Mode

**On your Droplet:**

```bash
cd ~/globapp-backend/rider-app

# Rebuild with production mode (ensures relative URLs are used)
npm run build

# Verify build uses relative URLs
grep -r "api/v1" dist/assets/*.js | head -5

# Copy to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider
```

### Step 3: Option A - Make Backend Not Require API Key (Recommended)

**If you want public endpoints to work without API key:**

The backend already allows this! The `require_public_key` function says:
```python
# If PUBLIC_KEY is not set, do not block (keeps backward compatibility)
if not PUBLIC_KEY:
    return
```

**So if `GLOBAPP_PUBLIC_API_KEY` is not set on the backend, public endpoints work without API key!**

**Check backend environment:**
```bash
# On Droplet, check if PUBLIC_KEY is set
cd ~/globapp-backend
grep GLOBAPP_PUBLIC_API_KEY .env || echo "Not set - public endpoints work without key"
```

**If it's set and you want to remove the requirement:**
- Don't set `GLOBAPP_PUBLIC_API_KEY` environment variable
- Or set it to empty string

### Step 3: Option B - Embed API Key in Build

**If backend requires API key, embed it in the build:**

```bash
cd ~/globapp-backend/rider-app

# Create .env.production file with API key
echo "VITE_PUBLIC_API_KEY=your-actual-api-key-here" > .env.production

# Rebuild
npm run build

# Deploy
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

**⚠️ Security Note:** API keys in frontend builds are visible to users. Only use this for public API keys that are meant to be public.

### Step 4: Fix Missing Backend Endpoint

**The `/api/v1/address/autocomplete` endpoint doesn't exist!**

**Option A: Create the endpoint in backend** (if you have a geocoding service)

**Option B: Use a different geocoding service** (like Google Maps, Mapbox, etc.)

**Option C: Remove autocomplete temporarily** and use plain text input

**Quick fix - Disable autocomplete temporarily:**

Edit `rider-app/src/components/AddressAutocomplete.jsx` to return empty suggestions:

```javascript
const fetchSuggestions = async (searchQuery) => {
  // Temporarily disabled - endpoint doesn't exist
  setSuggestions([]);
  setShowSuggestions(false);
  return;
};
```

## Quick Fix Commands (All-in-One)

**On your Droplet:**

```bash
# 1. Rebuild rider app
cd ~/globapp-backend/rider-app
npm run build

# 2. Deploy
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider

# 3. Check backend API key requirement
cd ~/globapp-backend
grep GLOBAPP_PUBLIC_API_KEY .env || echo "Public API key not required - endpoints work without key"

# 4. Restart backend (if needed)
sudo systemctl restart globapp-api
```

## Verify Fix

**After rebuilding:**

1. **Visit:** `https://rider.globapp.app`
2. **Open browser console (F12)**
3. **Check:**
   - API Base URL should show `/api/v1` (relative, not absolute)
   - Public API Key should show configured (if backend requires it)
   - No 404 errors for `/api/v1/address/autocomplete` (if endpoint exists)

## Next Steps

1. **Commit the AddressAutocomplete fix:**
   ```bash
   git add rider-app/src/components/AddressAutocomplete.jsx
   git commit -m "Fix AddressAutocomplete to use relative URLs and automatic API key"
   git push origin main
   ```

2. **Pull on Droplet and rebuild:**
   ```bash
   cd ~/globapp-backend
   git pull origin main
   cd rider-app
   npm run build
   sudo cp -r dist/* /var/www/globapp/rider/
   ```

3. **Create backend endpoint** for address autocomplete (if needed)

---

**The main fix is done - AddressAutocomplete now uses relative URLs and automatic API key!**



