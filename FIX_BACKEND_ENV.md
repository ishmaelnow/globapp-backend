# Fix Backend Environment Variables

## Find Where Environment Variables Are Set

**On your Droplet:**

```bash
# Check backend service configuration
sudo systemctl cat globapp-api

# Check if environment variables are in systemd service file
sudo grep -E "GLOBAPP_PUBLIC_API_KEY|Environment" /etc/systemd/system/globapp-api.service

# Check if .env file exists elsewhere
find ~/globapp-backend -name ".env" -o -name "*.env" 2>/dev/null

# Check backend status
sudo systemctl status globapp-api
```

## Fix Backend Service

**The environment variables are likely in the systemd service file:**

```bash
# Edit the service file
sudo nano /etc/systemd/system/globapp-api.service
```

**Find the line with `GLOBAPP_PUBLIC_API_KEY=` and comment it out:**

```ini
# Change from:
Environment="GLOBAPP_PUBLIC_API_KEY=your-key-here"

# To:
# Environment="GLOBAPP_PUBLIC_API_KEY=your-key-here"
```

**Or remove the line entirely.**

**Then:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Restart backend
sudo systemctl restart globapp-api

# Check status
sudo systemctl status globapp-api
```

## Alternative: Check How Backend is Started

**If backend is started differently:**

```bash
# Check how backend is started
ps aux | grep uvicorn
ps aux | grep python | grep app

# Check if there's a startup script
ls -la ~/globapp-backend/*.sh
ls -la ~/globapp-backend/venv/bin/
```

## Quick Fix: Remove from Systemd Service

```bash
# Backup service file
sudo cp /etc/systemd/system/globapp-api.service /etc/systemd/system/globapp-api.service.backup

# Remove PUBLIC_API_KEY line
sudo sed -i '/GLOBAPP_PUBLIC_API_KEY=/d' /etc/systemd/system/globapp-api.service

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart globapp-api

# Check status
sudo systemctl status globapp-api
```



