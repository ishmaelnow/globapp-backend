# Fix CORS for New Apps

## 🚨 Issue

Your new React apps are getting CORS errors because the backend doesn't allow requests from:
- `http://localhost:3001` (rider-app)
- `http://localhost:3002` (driver-app)
- `http://localhost:3003` (admin-app)

## ✅ Solution

### Step 1: Update Local Backend (Already Done)

The `app.py` file has been updated to include ports 3001, 3002, and 3003.

### Step 2: Update Backend on DigitalOcean

You need to update the backend on your DigitalOcean droplet to allow these ports.

**Option A: SSH into Droplet and Update**

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP

# Navigate to backend directory
cd ~/globapp-backend
# or wherever your backend code is

# Edit app.py
nano app.py
# or
vi app.py
```

Find the CORS configuration (around line 29-43) and update it to:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",  # Rider app
        "http://localhost:3002",  # Driver app
        "http://localhost:3003",  # Admin app
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:5173",
        "https://globapp.app",
        "https://www.globapp.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

**Save and restart backend:**

```bash
# Restart backend service
sudo systemctl restart globapp-api
# or
sudo systemctl restart globapp-backend
# or whatever your service name is

# Check if it's running
sudo systemctl status globapp-api
```

**Option B: Push via Git (Recommended)**

```powershell
# On your local machine
git add app.py
git commit -m "backend: Add CORS support for new apps (ports 3001, 3002, 3003)"
git push origin main
# or git push origin backend (depending on your branch)

# Then on droplet, pull and restart
ssh root@YOUR_DROPLET_IP
cd ~/globapp-backend
git pull origin main
sudo systemctl restart globapp-api
```

## ✅ Verify Fix

After updating, test from your local apps:

1. **Rider App** (`http://localhost:3001`):
   - Try booking a ride
   - Check browser console - should see no CORS errors

2. **Driver App** (`http://localhost:3002`):
   - Try logging in
   - Should connect without CORS errors

3. **Admin App** (`http://localhost:3003`):
   - Should load dashboard without CORS errors

## 🔍 Check CORS is Working

Open browser console (F12) and look for:
- ✅ No CORS errors
- ✅ API requests succeed
- ✅ Network tab shows 200 OK responses

## 📝 Summary

**Problem:** Backend only allowed `localhost:3000`, but new apps use `3001`, `3002`, `3003`

**Solution:** Update backend CORS to include all three ports

**Status:** 
- ✅ Local `app.py` updated
- ⏳ Need to update backend on DigitalOcean droplet

---

## Quick Test After Fix

Once backend is updated, restart your apps:

```powershell
# Rider App
cd rider-app
npm run dev

# Driver App
cd driver-app
npm run dev

# Admin App
cd admin-app
npm run dev
```

All should now connect to `https://globapp.app/api/v1` without CORS errors!




