# Fix Environment File Path

## The Issue

Your systemd service is configured to load from:
```
EnvironmentFile=/etc/globapp-api.env
```

But your `.env` file is at:
```
~/globapp-backend/.env
```

## Solution Options

### Option 1: Copy Variables to `/etc/globapp-api.env` (Recommended)

**On your Droplet:**

```bash
# 1. Check what's in your .env file
cat ~/globapp-backend/.env

# 2. Copy variables to systemd env file
sudo cp ~/globapp-backend/.env /etc/globapp-api.env

# Or manually edit it
sudo nano /etc/globapp-api.env
```

**Make sure it has:**
```
GLOBAPP_PUBLIC_API_KEY=your-key-here
GLOBAPP_ADMIN_API_KEY=your-admin-key-here
DATABASE_URL=your-database-url
# ... other variables
```

**Then restart:**
```bash
sudo systemctl restart globapp-api
sudo systemctl status globapp-api
```

---

### Option 2: Change Service to Use Project .env File

**Edit service file:**
```bash
sudo nano /etc/systemd/system/globapp-api.service
```

**Change this line:**
```ini
EnvironmentFile=/etc/globapp-api.env
```

**To:**
```ini
EnvironmentFile=/home/ishmael/globapp-backend/.env
```

**Then reload:**
```bash
sudo systemctl daemon-reload
sudo systemctl restart globapp-api
```

---

### Option 3: Check What's Currently in `/etc/globapp-api.env`

```bash
# Check if file exists
sudo cat /etc/globapp-api.env

# Check if API key is there
sudo grep GLOBAPP_PUBLIC_API_KEY /etc/globapp-api.env
```

---

## Recommended: Option 1

Copy your `.env` file to `/etc/globapp-api.env` so the service can load it.

**Quick commands:**
```bash
# Copy .env to systemd location
sudo cp ~/globapp-backend/.env /etc/globapp-api.env

# Verify it copied
sudo cat /etc/globapp-api.env | grep GLOBAPP_PUBLIC_API_KEY

# Restart service
sudo systemctl restart globapp-api

# Verify it's loaded
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY
```

---

## Why This Matters

- Systemd service loads from `/etc/globapp-api.env`
- Your `.env` file is in project directory
- They're different files!
- Need to sync them or point service to the right file




