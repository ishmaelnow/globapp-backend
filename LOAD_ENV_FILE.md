# Load .env File on Droplet

## The Problem

Your `.env` file exists but the backend service (systemd) doesn't automatically load it. Systemd services need environment variables set explicitly.

## Solution: Load .env File in Systemd Service

### Option 1: Use EnvironmentFile in Systemd (Recommended)

**On your Droplet:**

```bash
# 1. Check your current service file
sudo cat /etc/systemd/system/globapp-api.service

# 2. Edit the service file
sudo nano /etc/systemd/system/globapp-api.service
```

**Add or update the `EnvironmentFile` line:**

```ini
[Unit]
Description=GlobApp FastAPI (Uvicorn)
After=network.target

[Service]
Type=simple
User=ishmael
WorkingDirectory=/home/ishmael/globapp-backend
EnvironmentFile=/home/ishmael/globapp-backend/.env
ExecStart=/home/ishmael/globapp-backend/.venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**Key line:** `EnvironmentFile=/home/ishmael/globapp-backend/.env`

**Then reload and restart:**
```bash
sudo systemctl daemon-reload
sudo systemctl restart globapp-api
sudo systemctl status globapp-api
```

---

### Option 2: Load .env in Python Code (Alternative)

**Update `app.py` to load .env file:**

Add at the top of `app.py`:

```python
from dotenv import load_dotenv
load_dotenv()  # Load .env file

from fastapi import FastAPI, Header, HTTPException, Depends
# ... rest of imports
```

**Install python-dotenv:**
```bash
cd ~/globapp-backend
source .venv/bin/activate
pip install python-dotenv
```

**Then restart:**
```bash
sudo systemctl restart globapp-api
```

---

### Option 3: Set Environment Variables Directly in Systemd

**Edit service file:**
```bash
sudo nano /etc/systemd/system/globapp-api.service
```

**Add Environment lines:**
```ini
[Service]
Environment="GLOBAPP_PUBLIC_API_KEY=your-actual-key-here"
Environment="GLOBAPP_ADMIN_API_KEY=your-admin-key-here"
Environment="DATABASE_URL=your-database-url"
# ... etc
```

---

## Check Current Setup

**On your Droplet, run:**

```bash
# 1. Check if .env file exists
ls -la ~/globapp-backend/.env

# 2. Check what's in .env
cat ~/globapp-backend/.env

# 3. Check current service configuration
sudo systemctl show globapp-api --property=EnvironmentFile
sudo systemctl show globapp-api --property=Environment

# 4. Check if API key is loaded
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY
```

---

## Recommended: Option 1 (EnvironmentFile)

This is the cleanest approach - systemd will automatically load all variables from your `.env` file.

**Steps:**
1. Make sure `.env` file exists: `~/globapp-backend/.env`
2. Add `EnvironmentFile=/home/ishmael/globapp-backend/.env` to service file
3. Reload and restart service

---

## Verify It Works

After making changes:

```bash
# Check service status
sudo systemctl status globapp-api

# Check if environment variables are loaded
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY

# Test API
curl http://127.0.0.1:8000/api/v1/health
```




