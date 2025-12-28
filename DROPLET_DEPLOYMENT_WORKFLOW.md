# Droplet Deployment Workflow

## Understanding Your Setup

You have:
- **Droplet**: Ubuntu VM on DigitalOcean
- **Backend**: FastAPI running on port 8000
- **Frontend**: React app (needs to be built and served)

## How It Works Together

```
User visits: https://globapp.app/
    ↓
Nginx (Web Server)
    ├── Serves React frontend (static HTML/JS files)
    └── Proxies /api/* requests → Backend (port 8000)
```

**Key Point**: Everything runs on the **same domain** (`globapp.app`), so:
- ✅ No CORS issues
- ✅ Frontend calls `/api/v1/...` (relative URL)
- ✅ Nginx handles routing

---

## Complete Setup Steps

### Step 1: SSH into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

### Step 2: Pull Latest Code

```bash
cd ~/globapp-backend
git pull origin main
```

### Step 3: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 4: Build Frontend

```bash
cd ~/globapp-backend/frontend
npm install
npm run build
```

This creates `dist/` folder with static files.

### Step 5: Set Up Frontend Files

```bash
# Create directory for Nginx to serve
sudo mkdir -p /var/www/globapp/frontend

# Copy built frontend
sudo cp -r ~/globapp-backend/frontend/dist/* /var/www/globapp/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp
```

### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/globapp
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
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
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/globapp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Step 7: Set Up SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d globapp.app -d www.globapp.app
```

Follow prompts (enter email, agree to terms).

### Step 8: Update Frontend API Config

Since everything is on the same domain, use relative URLs:

```bash
cd ~/globapp-backend/frontend/src/config
nano api.js
```

The config should use `/api/v1` (relative) when in production.

Actually, I already updated it! The code now uses:
- Relative URL (`/api/v1`) in production
- Full URL in development

Just rebuild:
```bash
cd ~/globapp-backend/frontend
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

### Step 9: Make Sure Backend is Running

```bash
# Check if backend is running
ps aux | grep uvicorn

# If not running, start it
cd ~/globapp-backend
source venv/bin/activate  # If using venv
uvicorn app:app --host 127.0.0.1 --port 8000 &

# Or set up as a service (see DROPLET_SETUP_BACKEND_FRONTEND.md)
```

---

## Testing

### Test Backend API:
```bash
curl https://globapp.app/api/v1/health
```

### Test Frontend:
Visit: **https://globapp.app**

Should see your React app!

### Test from Browser:
1. Open https://globapp.app
2. Open browser console (F12)
3. Try booking a ride
4. Should work without CORS errors!

---

## Updating Code (Deployment Workflow)

### Update Backend:

```bash
# On Droplet
cd ~/globapp-backend
git pull origin main  # or backend branch
# Restart backend
sudo systemctl restart globapp-backend
# Or if running manually:
pkill -f uvicorn
uvicorn app:app --host 127.0.0.1 --port 8000 &
```

### Update Frontend:

```bash
# On Droplet
cd ~/globapp-backend/frontend
git pull origin main  # or frontend branch
npm install  # If dependencies changed
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

---

## Your Workflow Going Forward

### On Cursor (Development):

```powershell
# Backend changes
git checkout backend
# make changes
git push origin backend

# Frontend changes  
git checkout frontend
# make changes
git push origin frontend
```

### On Droplet (Deployment):

```bash
# Pull and deploy backend
cd ~/globapp-backend
git pull origin main  # After merging backend → main
sudo systemctl restart globapp-backend

# Pull and deploy frontend
cd ~/globapp-backend/frontend
git pull origin main  # After merging frontend → main
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

---

## Summary

✅ **Nginx** serves frontend at `https://globapp.app/`
✅ **Nginx** proxies API calls to backend on port 8000
✅ **Backend** runs internally (not exposed directly)
✅ **Same domain** = No CORS issues!
✅ **Everything** works together seamlessly

See `DROPLET_SETUP_BACKEND_FRONTEND.md` for detailed instructions!




