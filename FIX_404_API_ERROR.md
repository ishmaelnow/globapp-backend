# Fix 404 API Error - Admin Mobile PWA

## 🔴 Problem

The admin mobile app is getting **404 errors** when trying to connect to:
```
https://globapp.org/api/v1/...
```

**Root Cause:** `globapp.org` is pointing to **Netlify** (showing Netlify 404 page), not the **DigitalOcean droplet** where the backend API is running.

---

## ✅ Solution Options

### Option 1: Use API Subdomain (Recommended)

Create a dedicated subdomain for the API: `api.globapp.org`

**Steps:**

1. **Add DNS A Record in Netlify:**
   - **Type:** A
   - **Name:** `api`
   - **Value:** `157.245.231.224`
   - **TTL:** 3600

2. **Update Nginx on Droplet:**
   ```bash
   ssh ishmael@157.245.231.224
   sudo nano /etc/nginx/sites-enabled/default
   ```

   Add this server block:
   ```nginx
   server {
       listen 80;
       server_name api.globapp.org;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name api.globapp.org;

       ssl_certificate /etc/letsencrypt/live/globapp.org/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/globapp.org/privkey.pem;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Get SSL Certificate:**
   ```bash
   sudo certbot certonly --standalone -d api.globapp.org
   ```

4. **Update Mobile App Config:**
   - Change API URL from `https://globapp.org/api/v1` to `https://api.globapp.org/api/v1`
   - Update `admin-mobile-pwa/src/config/api.js`
   - Update `admin-mobile-pwa/app.json`

---

### Option 2: Fix Root Domain DNS

Make `globapp.org` point to DigitalOcean droplet instead of Netlify.

**Steps:**

1. **Check Current DNS:**
   - Go to Netlify DNS settings
   - Check if `globapp.org` (@ record) has an A record pointing to `157.245.231.224`
   - If it has a CNAME or NETLIFY record, **delete it first**

2. **Add/Update A Record:**
   - **Type:** A
   - **Name:** `@` (or blank for root)
   - **Value:** `157.245.231.224`
   - **TTL:** 3600

3. **Wait for DNS Propagation:**
   ```powershell
   nslookup globapp.org
   # Should show: 157.245.231.224
   ```

4. **Verify Backend is Accessible:**
   ```powershell
   Invoke-WebRequest -Uri "https://globapp.org/api/v1/health" -Method GET
   # Should return: {"ok": true, "version": "v1", ...}
   ```

---

### Option 3: Use Direct IP (Temporary Testing)

For immediate testing, you can temporarily use the IP address:

**Update Mobile App:**
```javascript
// In admin-mobile-pwa/src/config/api.js
const DIGITALOCEAN_URL = 'http://157.245.231.224/api/v1';
```

**⚠️ Warning:** This is NOT secure (HTTP, not HTTPS) and should only be used for testing!

---

## 🔍 Diagnostic Commands

### Check DNS Resolution:
```powershell
nslookup globapp.org
nslookup api.globapp.org
nslookup rider.globapp.org
```

### Test API Endpoints:
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://globapp.org/api/v1/health" -Method GET

# Test with API subdomain (if created)
Invoke-WebRequest -Uri "https://api.globapp.org/api/v1/health" -Method GET

# Test direct IP (HTTP only, for testing)
Invoke-WebRequest -Uri "http://157.245.231.224/api/v1/health" -Method GET
```

### Check What's Actually Serving globapp.org:
```powershell
$response = Invoke-WebRequest -Uri "https://globapp.org" -Method GET
$response.Content
# If you see "Netlify" in the HTML, it's pointing to Netlify
# If you see your backend response, it's pointing to DigitalOcean
```

---

## 🎯 Recommended Approach

**Use Option 1 (API Subdomain)** because:
- ✅ Keeps web apps on Netlify (if desired)
- ✅ Separates API from web hosting
- ✅ More professional setup
- ✅ Easier to manage SSL certificates
- ✅ Better security isolation

---

## 📝 After Fixing

1. **Update Mobile App Config:**
   ```javascript
   // admin-mobile-pwa/src/config/api.js
   const DIGITALOCEAN_URL = 'https://api.globapp.org/api/v1'; // or keep globapp.org if Option 2
   ```

2. **Rebuild APK:**
   ```powershell
   cd C:\Users\koshi\cursor-apps\admin-mobile-pwa\android
   .\gradlew assembleRelease
   ```

3. **Test Again:**
   - Install new APK
   - Verify API calls work
   - Check network logs for correct endpoint

---

## 🚨 Current Status

- ❌ `https://globapp.org/api/v1` → Returns Netlify 404
- ❓ `https://api.globapp.org/api/v1` → Not configured yet
- ❓ `http://157.245.231.224/api/v1` → May work (HTTP only)

**Next Step:** Choose an option above and implement it!










