# Step-by-Step Fix Guide - Complete Walkthrough

## 🎯 Goal
Fix DNS and Nginx so `admin.globapp.org/api/v1` works for the mobile app.

---

## Step 1: Fix DNS in Netlify

### 1.1: Access Netlify Dashboard
1. Go to https://app.netlify.com
2. Log in to your account
3. Click on your site (or go to Domain settings)

### 1.2: Navigate to DNS Settings
1. Click on **"Domain settings"** or **"DNS"** in the left sidebar
2. Find your domain: `globapp.org`
3. Look for DNS records section

### 1.3: Check Current DNS Records
Look for records related to `admin` subdomain:
- Look for: `admin` or `admin.globapp.org`
- Check the **Type** column:
  - If it says **A** → Check if value is `157.245.231.224`
  - If it says **CNAME** → This needs to be deleted/changed
  - If it says **NETLIFY** → This needs to be deleted

### 1.4: Add/Update A Record for admin.globapp.org
**If A record doesn't exist or points to wrong IP:**

1. Click **"Add new record"** or **"Edit"** existing `admin` record
2. Set:
   - **Type:** `A`
   - **Name:** `admin` (or `admin.globapp.org`)
   - **Value:** `157.245.231.224`
   - **TTL:** `3600` (or leave default)
3. Click **"Save"** or **"Add record"**

### 1.5: Delete Conflicting Records
**If there are CNAME or NETLIFY records for `admin`:**

1. Find any record with:
   - **Name:** `admin`
   - **Type:** `CNAME` or `NETLIFY`
2. Click **"Delete"** or **"Remove"** on each one
3. Confirm deletion

### 1.6: Verify DNS Records
**After making changes, you should see:**
- ✅ One **A** record: `admin` → `157.245.231.224`
- ❌ No CNAME records for `admin`
- ❌ No NETLIFY records for `admin`

**Screenshot or note what you see, then proceed to Step 2.**

---

## Step 2: Update Nginx Config on Droplet

### 2.1: SSH into Droplet
**On your local machine (PowerShell or Terminal):**
```powershell
ssh ishmael@157.245.231.224
```

**Enter your password when prompted.**

### 2.2: Backup Nginx Config
**Once connected to droplet:**
```bash
# Create backup with timestamp
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)

# Verify backup was created
ls -lh /etc/nginx/sites-enabled/default.backup*
```

### 2.3: Check Current Config (Before Change)
```bash
# See what needs to be changed
sudo grep "globapp.app" /etc/nginx/sites-enabled/default | head -10
```

**This shows lines that still have `globapp.app`**

### 2.4: Update globapp.app to globapp.org
```bash
# Replace all occurrences
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default

# Verify the change worked
sudo grep "globapp.org" /etc/nginx/sites-enabled/default | head -10
```

**You should see `globapp.org` instead of `globapp.app`**

### 2.5: Verify admin.globapp.org Server Block
```bash
# Check the admin server block
sudo grep -A 30 "server_name admin.globapp.org" /etc/nginx/sites-enabled/default
```

**Should show:**
- `server_name admin.globapp.org;` ✅
- `ssl_certificate .../globapp.org/...` ✅
- `location /api/ { ... }` ✅

### 2.6: Test Nginx Configuration
```bash
# Test syntax
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you see errors, share them and we'll fix them.**

### 2.7: Reload Nginx
```bash
# Reload Nginx to apply changes
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

**Should show: `active (running)`**

---

## Step 3: Verify DNS Propagation

### 3.1: Check DNS from Droplet
**Still on droplet, run:**
```bash
# Check DNS resolution
nslookup admin.globapp.org
```

**Expected output:**
```
Name:    admin.globapp.org
Address: 157.245.231.224
```

**If it still shows Netlify IPs (13.52.x.x or 52.52.x.x), DNS hasn't propagated yet.**

### 3.2: Check DNS from Multiple Locations
**On your local machine (Windows PowerShell):**
```powershell
# Check DNS
nslookup admin.globapp.org

# Or use dig (if available)
Resolve-DnsName admin.globapp.org
```

**Also check online:**
- Go to https://dnschecker.org
- Enter: `admin.globapp.org`
- Select record type: `A`
- Click "Search"
- Check if it shows `157.245.231.224` globally

**DNS propagation can take 15-60 minutes (sometimes up to 48 hours).**

### 3.3: Clear Local DNS Cache (Windows)
**On your local machine:**
```powershell
# Run as Administrator
ipconfig /flushdns

# Verify
nslookup admin.globapp.org
```

---

## Step 4: Test API Endpoint

### 4.1: Test from Droplet (Direct)
**On droplet:**
```bash
# Test backend directly (bypasses Nginx)
curl http://localhost:8000/api/v1/health

# Expected: {"ok":true,"version":"v1","environment":"development"}
```

### 4.2: Test Through Nginx (From Droplet)
**Wait for DNS to propagate, then on droplet:**
```bash
# Test through Nginx
curl https://admin.globapp.org/api/v1/health

# Expected: {"ok":true,"version":"v1","environment":"development"}
```

**If you get 404 or connection error, DNS might not have propagated yet.**

### 4.3: Test from Local Machine
**On your local machine (Windows PowerShell):**
```powershell
# Test API endpoint
try {
    $response = Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET -UseBasicParsing
    Write-Host "✅ SUCCESS!"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    }
}
```

**Expected output:**
```
✅ SUCCESS!
Status: 200
Response: {"ok":true,"version":"v1","environment":"development"}
```

### 4.4: Test Mobile App
**Once API works:**
1. Install the rebuilt APK on your Android device
2. Launch the admin mobile app
3. Check if it connects to the API
4. Look for any network errors in the app

---

## 🔍 Troubleshooting

### If DNS Still Points to Netlify After 1 Hour
1. Double-check Netlify DNS records
2. Verify you deleted CNAME/NETLIFY records
3. Try adding the A record again
4. Contact Netlify support if needed

### If Nginx Test Fails
```bash
# Check what the error is
sudo nginx -t

# Common fixes:
# - Check for syntax errors
# - Verify SSL certificate paths exist
# - Check file permissions
```

### If API Still Returns 404 After DNS Propagates
```bash
# Check Nginx error logs
sudo tail -20 /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -20 /var/log/nginx/access.log

# Verify backend is running
sudo systemctl status globapp-api
```

---

## ✅ Success Checklist

- [ ] DNS record `admin` → `157.245.231.224` added in Netlify
- [ ] CNAME/NETLIFY records for `admin` deleted
- [ ] Nginx config updated: `globapp.app` → `globapp.org`
- [ ] Nginx config tested: `sudo nginx -t` passes
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] DNS propagated: `nslookup admin.globapp.org` shows `157.245.231.224`
- [ ] API test passes: `curl https://admin.globapp.org/api/v1/health` returns JSON
- [ ] Mobile app connects successfully

---

## 📞 Need Help?

If you get stuck at any step:
1. Share the exact command/output you're seeing
2. Share any error messages
3. Let me know which step you're on

I'll help you troubleshoot!










