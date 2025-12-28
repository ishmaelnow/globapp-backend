# Running Backend + Frontend on DigitalOcean Droplet

## Current Setup

- ✅ **Droplet**: Ubuntu VM
- ✅ **Backend**: Running on Droplet (probably with uvicorn)
- ❓ **Frontend**: Need to add and serve

## How It Works

### Architecture:

```
Internet
    ↓
Droplet (Ubuntu VM)
    ├── Nginx (Web Server)
    │   ├── Serves Frontend (static files) → https://globapp.app/
    │   └── Proxies API requests → Backend → https://globapp.app/api/v1/
    │
    ├── Backend (FastAPI)
    │   └── Running on port 8000 (internal)
    │
    └── Frontend (React - Built)
        └── Static files in /var/www/globapp/frontend/dist
```

### Flow:

1. User visits `https://globapp.app/` → Nginx serves React frontend
2. Frontend makes API call to `/api/v1/...` → Nginx proxies to backend on port 8000
3. Backend responds → Nginx forwards to frontend
4. Everything on same domain = **No CORS issues!**

---

## Step-by-Step Setup

### Step 1: Build Frontend Locally

On your **Cursor machine**:

```powershell
cd frontend
npm install
npm run build
```

This creates a `dist` folder with all the static files.

### Step 2: Upload Frontend to Droplet

**Option A: Using SCP (from Cursor)**

```powershell
# From your project folder
scp -r frontend/dist/* root@YOUR_DROPLET_IP:/var/www/globapp/frontend/
```

**Option B: Using Git (Recommended)**

On Droplet:
```bash
cd ~/globapp-backend
git pull origin main
cd frontend
npm install
npm run build
# This builds frontend on the Droplet
```

### Step 3: Install Nginx on Droplet

SSH into your Droplet:

```bash
# Update system
sudo apt update

# Install Nginx
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/globapp
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend - Serve static files
    location / {
        root /var/www/globapp/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API - Proxy to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/globapp /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Set Up SSL (HTTPS)

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d globapp.app -d www.globapp.app

# Follow prompts (enter email, agree to terms)
# Certbot will automatically configure HTTPS
```

### Step 6: Update Frontend API URL

Since everything is on the same domain now, update frontend config:

**On Droplet, after building:**

```bash
cd ~/globapp-backend/frontend
# Edit src/config/api.js
nano src/config/api.js
```

Change to:
```javascript
const BASE_URL = '/api/v1';  // Relative URL - same domain!
```

Rebuild:
```bash
npm run build
```

### Step 7: Set Up Backend to Run Automatically

Create systemd service for backend:

```bash
sudo nano /etc/systemd/system/globapp-backend.service
```

Paste:

```ini
[Unit]
Description=GlobApp Backend API
After=network.target

[Service]
User=root
WorkingDirectory=/root/globapp-backend
Environment="PATH=/root/globapp-backend/venv/bin"
ExecStart=/root/globapp-backend/venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable globapp-backend
sudo systemctl start globapp-backend
sudo systemctl status globapp-backend
```

---

## Directory Structure on Droplet

```
/root/globapp-backend/          # Your Git repo
├── app.py                      # Backend code
├── frontend/                   # Frontend source
│   └── dist/                   # Built frontend (after npm run build)
│
/var/www/globapp/frontend/      # Nginx serves from here
└── dist/                        # Copy of frontend/dist
    ├── index.html
    ├── assets/
    └── ...
```

---

## Deployment Workflow

### When You Update Backend:

```bash
# On Droplet
cd ~/globapp-backend
git pull origin main  # or backend branch
# Restart backend
sudo systemctl restart globapp-backend
```

### When You Update Frontend:

**Option 1: Build on Droplet**
```bash
cd ~/globapp-backend/frontend
git pull origin main  # or frontend branch
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

**Option 2: Build Locally, Upload**
```powershell
# On Cursor
cd frontend
npm run build
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/globapp/frontend/
```

---

## Quick Setup Script

Create a setup script on Droplet:

```bash
nano ~/setup-globapp.sh
```

Paste:

```bash
#!/bin/bash

# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create directories
sudo mkdir -p /var/www/globapp/frontend
sudo chown -R $USER:$USER /var/www/globapp

# Build frontend
cd ~/globapp-backend/frontend
npm install
npm run build

# Copy frontend files
sudo cp -r dist/* /var/www/globapp/frontend/

# Configure Nginx (you'll need to create the config file first)
# Then:
sudo ln -s /etc/nginx/sites-available/globapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d globapp.app -d www.globapp.app

echo "Setup complete!"
```

Make executable:
```bash
chmod +x ~/setup-globapp.sh
```

---

## Update CORS (Since Same Domain)

Since everything is on `globapp.app`, you can simplify CORS:

```python
# In app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://globapp.app",
        "https://www.globapp.app",
        "http://localhost:3000",  # For local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Testing

### Test Backend:
```bash
curl https://globapp.app/api/v1/health
```

### Test Frontend:
Visit: https://globapp.app

### Test API from Frontend:
Frontend at `https://globapp.app` calls `/api/v1/...` → No CORS issues!

---

## Troubleshooting

### Nginx not serving frontend:
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify files exist
ls -la /var/www/globapp/frontend/
```

### Backend not responding:
```bash
# Check backend service
sudo systemctl status globapp-backend

# Check backend logs
sudo journalctl -u globapp-backend -f

# Test backend directly
curl http://127.0.0.1:8000/api/v1/health
```

### 502 Bad Gateway:
- Backend not running on port 8000
- Check: `sudo systemctl start globapp-backend`

---

## Summary

1. **Nginx** serves frontend static files
2. **Nginx** proxies `/api/` requests to backend
3. **Backend** runs on port 8000 (internal, not exposed)
4. **Everything** on same domain = No CORS!

This is a standard production setup! ✅




