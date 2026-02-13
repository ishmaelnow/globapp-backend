# Fix DNS and Nginx Configuration

## 🔴 Problem Found!

**DNS is pointing to Netlify instead of your droplet!**

The curl output shows:
- DNS resolves to: `13.52.188.95, 52.52.192.191` (Netlify IPs)
- Should resolve to: `157.245.231.224` (Your droplet)
- Response comes from: Netlify server

Also, Nginx config still has `globapp.app` references that need to be updated to `globapp.org`.

---

## ✅ Solution: Fix DNS First

### Step 1: Check Current DNS Records in Netlify

1. Go to Netlify Dashboard
2. Navigate to your domain settings
3. Check DNS records for `admin.globapp.org`

**You need to ensure:**
- **Type:** A
- **Name:** `admin`
- **Value:** `157.245.231.224`
- **TTL:** 3600

**Delete any:**
- CNAME records for `admin`
- NETLIFY records
- Any records pointing to Netlify IPs

### Step 2: Verify DNS Propagation

**On your droplet, check DNS:**
```bash
nslookup admin.globapp.org
```

**Expected output:**
```
Name:    admin.globapp.org
Address: 157.245.231.224
```

**If it still shows Netlify IPs, wait a few minutes for DNS propagation (can take up to 48 hours, but usually 15-60 minutes).**

### Step 3: Update Nginx Config (Remove globapp.app References)

**On your droplet:**
```bash
# Backup config first
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d)

# Update all globapp.app to globapp.org
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default

# Verify changes
sudo grep "globapp" /etc/nginx/sites-enabled/default | head -20

# Test config
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

### Step 4: Verify Nginx Config

**Check that admin.globapp.org block is correct:**
```bash
sudo grep -A 30 "server_name admin.globapp.org" /etc/nginx/sites-enabled/default
```

**Should show:**
```nginx
server_name admin.globapp.org;  # ✅ Not admin.globapp.app

root /var/www/globapp/admin;
index index.html;

ssl_certificate /etc/letsencrypt/live/globapp.org/fullchain.pem;  # ✅ globapp.org
ssl_certificate_key /etc/letsencrypt/live/globapp.org/privkey.pem;  # ✅ globapp.org

location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:8000;
    # ... rest of config
}
```

### Step 5: Test After DNS Propagates

**Wait for DNS to propagate (check with nslookup), then test:**
```bash
# On droplet
nslookup admin.globapp.org
# Should show: 157.245.231.224

# Test API
curl https://admin.globapp.org/api/v1/health
# Should return: {"ok":true,"version":"v1",...}
```

---

## 🔍 Quick DNS Check Commands

**On droplet:**
```bash
# Check DNS resolution
nslookup admin.globapp.org
dig admin.globapp.org +short
host admin.globapp.org
```

**All should return:** `157.245.231.224`

**If they return Netlify IPs, DNS hasn't propagated yet.**

---

## 📝 Complete Fix Checklist

- [ ] **DNS:** `admin.globapp.org` A record points to `157.245.231.224` in Netlify
- [ ] **DNS:** Deleted any CNAME/NETLIFY records for `admin`
- [ ] **DNS:** Verified with `nslookup admin.globapp.org` shows droplet IP
- [ ] **Nginx:** Updated all `globapp.app` → `globapp.org` in config
- [ ] **Nginx:** Verified `server_name admin.globapp.org;` exists
- [ ] **Nginx:** Verified `/api/` location block exists
- [ ] **Nginx:** Tested config: `sudo nginx -t`
- [ ] **Nginx:** Reloaded: `sudo systemctl reload nginx`
- [ ] **Test:** `curl https://admin.globapp.org/api/v1/health` works

---

## ⚠️ Important Notes

1. **DNS propagation can take time** - Usually 15-60 minutes, but can take up to 48 hours
2. **Check DNS from multiple locations** - Use https://dnschecker.org to see global DNS propagation
3. **Clear DNS cache** - On your local machine: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

---

## 🚀 After DNS Propagates

Once DNS points to your droplet (`157.245.231.224`), the mobile app should work!

**Test from your local machine:**
```powershell
Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET
```

**Should return:** `{"ok":true,"version":"v1","environment":"development"}`










