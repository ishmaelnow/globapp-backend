# Check Environment Files

## The Situation

Your systemd service loads from:
- `/etc/globapp-api.env` (what service uses)

Your API keys are in:
- `~/globapp-backend/.env` (your actual file)

## Check Both Files

**On your Droplet:**

```bash
# 1. Check what's in the systemd env file (what service uses)
sudo cat /etc/globapp-api.env

# 2. Check what's in your project .env file (where your keys are)
cat ~/globapp-backend/.env

# 3. Check if API key exists in systemd file
sudo grep GLOBAPP_PUBLIC_API_KEY /etc/globapp-api.env

# 4. Check if API key exists in project file
grep GLOBAPP_PUBLIC_API_KEY ~/globapp-backend/.env
```

## Solution: Copy Your .env to Systemd Location

```bash
# Copy your .env file to where systemd expects it
sudo cp ~/globapp-backend/.env /etc/globapp-api.env

# Verify it copied
sudo cat /etc/globapp-api.env | grep GLOBAPP_PUBLIC_API_KEY

# Restart service to load new variables
sudo systemctl restart globapp-api

# Verify it's loaded
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY
```

## Alternative: Change Service to Use Project .env

If you prefer to keep using `~/globapp-backend/.env`:

```bash
# Edit service file
sudo nano /etc/systemd/system/globapp-api.service

# Change this line:
EnvironmentFile=/etc/globapp-api.env

# To:
EnvironmentFile=/home/ishmael/globapp-backend/.env

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart globapp-api
```

## Recommended: Copy to /etc/globapp-api.env

This is cleaner because:
- Systemd env files are typically in `/etc/`
- Keeps service configuration separate from project files
- More secure (can set proper permissions)




