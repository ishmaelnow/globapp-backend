# Fix: Automatic API Key (No User Input)

## Changes Made

1. ✅ **Axios interceptor** - Automatically adds API key to ALL requests
2. ✅ **Removed API key UI** - No more input field or "API Key" button
3. ✅ **Automatic handling** - API key is embedded at build time

## Solution: Embed API Key at Build Time

**The API key needs to be set when building the app. Two options:**

### Option 1: Set API Key at Build Time (Recommended)

**On your Droplet, when building the rider app:**

```bash
cd ~/globapp-backend/rider-app

# Get your public API key from backend environment
# Check what it is:
grep GLOBAPP_PUBLIC_API_KEY ~/globapp-backend/.env

# Build with API key embedded
VITE_PUBLIC_API_KEY="your-actual-api-key-here" npm run build

# Or create .env.production file:
echo "VITE_PUBLIC_API_KEY=your-actual-api-key-here" > .env.production
npm run build

# Deploy
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

### Option 2: Make Backend Not Require API Key

**If you want public endpoints to work without API key:**

**On your Droplet:**

```bash
# Check if PUBLIC_KEY is set
grep GLOBAPP_PUBLIC_API_KEY ~/globapp-backend/.env

# If it's set and you want to remove the requirement:
# Edit .env file and remove or comment out GLOBAPP_PUBLIC_API_KEY
nano ~/globapp-backend/.env
# Remove or comment: GLOBAPP_PUBLIC_API_KEY=...

# Restart backend
sudo systemctl restart globapp-api
```

**The backend code already allows this:**
```python
def require_public_key(x_api_key: str | None):
    # If PUBLIC_KEY is not set, do not block (keeps backward compatibility)
    if not PUBLIC_KEY:
        return  # ← Allows requests without API key!
```

## Quick Fix Commands

**Option 1: Embed API Key (if backend requires it):**

```bash
cd ~/globapp-backend/rider-app

# Get API key from backend
API_KEY=$(grep GLOBAPP_PUBLIC_API_KEY ~/globapp-backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# Build with API key
VITE_PUBLIC_API_KEY="$API_KEY" npm run build

# Deploy
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

**Option 2: Remove API Key Requirement (if you want public access):**

```bash
# Comment out API key in backend .env
sed -i 's/^GLOBAPP_PUBLIC_API_KEY=/#GLOBAPP_PUBLIC_API_KEY=/' ~/globapp-backend/.env

# Restart backend
sudo systemctl restart globapp-api
```

## After Fix

**Rebuild and redeploy:**

```bash
cd ~/globapp-backend
git pull origin main

cd rider-app
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
```

**Test in browser:**
- No API key input should appear
- Booking should work automatically
- No 401 errors



