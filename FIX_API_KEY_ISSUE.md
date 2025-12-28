# Fix API Key Issue

## The Problem

The backend is rejecting requests with "Invalid API key" (401 Unauthorized) because:
- Backend has `GLOBAPP_PUBLIC_API_KEY` environment variable set
- Frontend is not sending the API key (or it's empty)
- Backend requires the API key to match

## Solution Options

### Option 1: Get API Key from Backend and Enter in Frontend (Recommended)

**On your Droplet:**

```bash
# Check what the API key is set to
echo $GLOBAPP_PUBLIC_API_KEY

# Or check environment file
cat ~/globapp-backend/.env | grep GLOBAPP_PUBLIC_API_KEY
```

**Then in the frontend:**
1. Go to the ride booking page
2. Click "API Key" button
3. Enter the API key value
4. It will be saved in localStorage

---

### Option 2: Make API Key Optional (If Not Needed)

**On your Droplet:**

```bash
# Edit your backend service or environment file
# Remove or comment out GLOBAPP_PUBLIC_API_KEY

# Then restart backend
sudo systemctl restart globapp-api
```

**Or set it to empty:**
```bash
export GLOBAPP_PUBLIC_API_KEY=""
```

---

### Option 3: Set API Key in Frontend Build (For Production)

**On your Droplet, before building frontend:**

```bash
cd ~/globapp-backend/frontend

# Create .env.production file
echo "VITE_PUBLIC_API_KEY=your-api-key-here" > .env.production

# Rebuild
npm run build

# Redeploy
sudo cp -r dist/* /var/www/globapp/frontend/
```

Then update frontend to use this environment variable.

---

## Quick Fix: Check Backend Environment

**On Droplet:**

```bash
# Check if API key is set
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY

# Or check the service file
sudo cat /etc/systemd/system/globapp-api.service | grep GLOBAPP_PUBLIC_API_KEY
```

---

## Current Behavior

- **Backend**: Requires API key if `GLOBAPP_PUBLIC_API_KEY` is set
- **Frontend**: Sends API key from localStorage (empty by default)
- **Result**: 401 Unauthorized

---

## Recommended Solution

1. **Get the API key** from your Droplet environment
2. **Enter it in the frontend** using the "API Key" button on the ride booking page
3. **It will be saved** in browser localStorage

This way users can enter their own API key if needed, or you can pre-configure it.




