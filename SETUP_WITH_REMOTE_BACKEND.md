# Setup Guide - Connecting to Remote Backend

## 🎯 Your Current Setup

✅ **Backend:** Running on DigitalOcean Droplet at `https://globapp.app`  
✅ **Three React Apps:** Created locally (rider-app, driver-app, admin-app)  
✅ **Goal:** Connect local apps to remote backend for testing, then deploy to subdomains

---

## ✅ What's Already Configured

All three apps are now configured to connect to your **remote backend** on DigitalOcean:

- **rider-app/.env** → Points to `https://globapp.app/api/v1`
- **driver-app/.env** → Points to `https://globapp.app/api/v1`
- **admin-app/.env** → Points to `https://globapp.app/api/v1`

**You do NOT need to run the backend locally!**

---

## 🚀 Testing Your Apps (No Local Backend Needed)

### Step 1: Test Rider App

```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\rider-app
npm run dev
```

**What Happens:**
- Opens http://localhost:3001
- Connects to `https://globapp.app/api/v1` (your remote backend)
- Should work immediately - no local backend needed!

**Test:**
- Try booking a ride
- Check browser console (F12) - should show: `API Base URL: https://globapp.app/api/v1`

---

### Step 2: Test Driver App

```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\driver-app
npm run dev
```

**What Happens:**
- Opens http://localhost:3002
- Connects to `https://globapp.app/api/v1` (your remote backend)
- Login screen appears

**Test:**
- Login with driver credentials (phone + PIN)
- Should connect to remote backend for authentication

---

### Step 3: Test Admin App

```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\admin-app
npm run dev
```

**What Happens:**
- Opens http://localhost:3003
- Connects to `https://globapp.app/api/v1` (your remote backend)
- Admin dashboard loads (API key already configured)

**Test:**
- Dashboard should load without API key prompt
- Can view/manage drivers on remote backend

---

## 📋 Current Configuration

### Backend Location
- **URL:** `https://globapp.app`
- **API Endpoint:** `https://globapp.app/api/v1`
- **Status:** ✅ Running on DigitalOcean Droplet
- **Local:** ❌ Not needed - apps connect remotely

### App Configuration

**rider-app/.env:**
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
VITE_PUBLIC_API_KEY=yesican
```

**driver-app/.env:**
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
```

**admin-app/.env:**
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
VITE_ADMIN_API_KEY=admincan
```

---

## 🔍 Verifying Connection

### Check Browser Console (F12)

When you run any app, you should see in the console:
```
API Base URL: https://globapp.app/api/v1
Public API Key configured: Yes (for rider-app)
Admin API Key configured: Yes (for admin-app)
```

### Test API Connection

Open browser console and run:
```javascript
fetch('https://globapp.app/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{"status": "ok"}` or similar

---

## ⚠️ Important Notes

### CORS Configuration

Your backend on DigitalOcean needs to allow requests from:
- `http://localhost:3001` (rider-app)
- `http://localhost:3002` (driver-app)
- `http://localhost:3003` (admin-app)

**Check your backend CORS settings** - it should already allow these if you've tested before.

If you get CORS errors, you may need to update backend CORS to include:
```python
allow_origins=[
    "http://localhost:3001",
    "http://localhost:3002", 
    "http://localhost:3003",
    "https://globapp.app",
    # ... other origins
]
```

---

## 🎯 Next Steps After Testing

Once all apps work locally (connecting to remote backend):

1. **Build for Production:**
   ```powershell
   cd rider-app && npm run build
   cd ..\driver-app && npm run build
   cd ..\admin-app && npm run build
   ```

2. **Deploy to Subdomains:**
   - `rider.globapp.app` → rider-app/dist/
   - `driver.globapp.app` → driver-app/dist/
   - `admin.globapp.app` → admin-app/dist/

3. **Update .env for Production:**
   - For subdomains, you can use relative URLs: `/api/v1`
   - Or keep full URL: `https://globapp.app/api/v1`

---

## 📝 Summary

**What You Have:**
- ✅ Backend running on DigitalOcean (`globapp.app`)
- ✅ Three React apps configured to connect remotely
- ✅ No local backend needed

**What To Do:**
1. Test each app locally (they connect to remote backend)
2. Verify everything works
3. Build for production
4. Deploy to subdomains

**Key Point:** Your apps will work immediately because they're already configured to use your remote backend!

---

## 🆘 Troubleshooting

### Issue: CORS Errors
**Solution:** Update backend CORS to allow localhost:3001, 3002, 3003

### Issue: "Cannot connect to backend"
**Solution:** 
- Verify backend is running: Visit `https://globapp.app/api/v1/health`
- Check .env files have correct URL

### Issue: API key errors
**Solution:** 
- Check .env files have correct API keys
- Restart dev server after changing .env

---

## ✅ Quick Test Commands

```powershell
# Test Rider App
cd rider-app
npm run dev
# Opens http://localhost:3001 → Connects to https://globapp.app/api/v1

# Test Driver App  
cd driver-app
npm run dev
# Opens http://localhost:3002 → Connects to https://globapp.app/api/v1

# Test Admin App
cd admin-app
npm run dev
# Opens http://localhost:3003 → Connects to https://globapp.app/api/v1
```

**No local backend needed - all connect to your DigitalOcean droplet!**




