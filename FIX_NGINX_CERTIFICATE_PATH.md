# Fix Nginx Certificate Path

## ✅ Certificate Status

**Good news:** Your certificate is correct!
- ✅ `globapp.org` certificate exists
- ✅ Includes `admin.globapp.org`
- ✅ Valid for 88 days

## 🔴 Problem

**Nginx might be using the wrong certificate path!**

You have TWO certificates:
1. `globapp.app` → `/etc/letsencrypt/live/globapp.app/`
2. `globapp.org` → `/etc/letsencrypt/live/globapp.org/` ✅ (This is the one you need)

**Nginx might still be pointing to `globapp.app` certificate instead of `globapp.org`.**

---

## ✅ Solution: Check and Fix Nginx Config

### Step 1: Check Current Nginx SSL Config

**On droplet:**

```bash
# Check what certificate Nginx is using for admin.globapp.org
sudo grep -A 15 "server_name admin.globapp.org" /etc/nginx/sites-enabled/default | grep ssl_certificate
```

**Should show:**
```nginx
ssl_certificate /etc/letsencrypt/live/globapp.org/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/globapp.org/privkey.pem;
```

**If it shows `globapp.app` instead, that's the problem!**

### Step 2: Check All Server Blocks

```bash
# Check all SSL certificate paths
sudo grep "ssl_certificate" /etc/nginx/sites-enabled/default
```

**Look for any references to `globapp.app` - they should all be `globapp.org`.**

### Step 3: Fix Certificate Paths

**If Nginx is using `globapp.app` certificate:**

```bash
# Backup config first
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d)

# Replace all globapp.app certificate paths with globapp.org
sudo sed -i 's|/etc/letsencrypt/live/globapp\.app|/etc/letsencrypt/live/globapp.org|g' /etc/nginx/sites-enabled/default

# Verify changes
sudo grep "ssl_certificate" /etc/nginx/sites-enabled/default
```

**All should now show `globapp.org`.**

### Step 4: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### Step 5: Test SSL Connection

```bash
# Test SSL from droplet
curl -v https://admin.globapp.org/api/v1/health

# Check certificate details
openssl s_client -connect admin.globapp.org:443 -servername admin.globapp.org | grep -A 5 "subject\|issuer"
```

**Should show certificate for `globapp.org`.**

---

## 🔍 Verify Certificate Match

**After fixing, verify:**

1. **Certificate domain matches:**
   ```bash
   openssl s_client -connect admin.globapp.org:443 -servername admin.globapp.org 2>/dev/null | openssl x509 -noout -text | grep -A 2 "Subject Alternative Name"
   ```
   
   **Should include:** `admin.globapp.org`

2. **Nginx config matches:**
   ```bash
   sudo grep "ssl_certificate.*globapp.org" /etc/nginx/sites-enabled/default
   ```
   
   **Should show:** `globapp.org` (not `globapp.app`)

---

## 📝 Complete Fix Checklist

- [ ] Checked Nginx SSL config for `admin.globapp.org`
- [ ] Verified certificate path points to `globapp.org` (not `globapp.app`)
- [ ] Updated all certificate paths if needed
- [ ] Tested Nginx config: `sudo nginx -t`
- [ ] Reloaded Nginx: `sudo systemctl reload nginx`
- [ ] Tested SSL connection: `curl https://admin.globapp.org/api/v1/health`
- [ ] Verified certificate matches domain

---

## ⚠️ Important Notes

**You have TWO certificates:**
- `globapp.app` → Old domain (don't use)
- `globapp.org` → New domain ✅ (use this one)

**Make sure Nginx uses the `globapp.org` certificate for all `*.globapp.org` subdomains.**

---

## 🚀 After Fixing

Once Nginx uses the correct certificate:

1. **SSL errors should stop**
2. **API endpoints should work**
3. **Web app should connect**
4. **Mobile app should work**

---

**Run the check command above to see which certificate Nginx is using!** 🔍










