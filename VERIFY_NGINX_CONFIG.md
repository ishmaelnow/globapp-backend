# Verify Nginx Config - Your Config Looks Correct!

## ✅ Your Nginx Config is Correct

**Your `/api/` location block:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**This configuration is correct!** ✅

**What it does:**
- Routes all `/api/` requests (including `/api/v1/health`) to backend
- Preserves headers correctly
- Should work for WebSocket upgrades

---

## 🔍 Why It Might Still Not Work

**Even though config looks correct, check these:**

### 1. Check Which Server Block Has This Config

**On server, check:**

```bash
# See all server blocks
sudo grep -n "server {" /etc/nginx/sites-enabled/default

# Check which server block contains /api/
sudo grep -B 20 "location /api/" /etc/nginx/sites-enabled/default | grep "server_name"
```

**Important:** The `/api/` block must be in the server block that handles your requests!

**If you have multiple server blocks:**
- Each subdomain (admin.globapp.org, rider.globapp.org, etc.) needs its own server block
- Each server block needs the `/api/` location block

---

### 2. Check for More Specific Location Blocks

**A more specific block might be catching `/api/v1/` first:**

```bash
# Check for /api/v1/ block
sudo grep -n -A 10 "location /api/v1" /etc/nginx/sites-enabled/default

# Check for any location blocks that might match
sudo grep -n "location.*api" /etc/nginx/sites-enabled/default
```

**Nginx uses most specific match:**
- `location /api/v1/` would match before `location /api/`
- If `/api/v1/` block exists and is wrong, it overrides `/api/`

---

### 3. Check Server Name Matching

**Verify the request is hitting the right server block:**

```bash
# See all server_name directives
sudo grep -n "server_name" /etc/nginx/sites-enabled/default

# Check default_server
sudo grep -B 5 -A 20 "default_server" /etc/nginx/sites-enabled/default
```

**If testing via IP (`157.245.231.224`):**
- Request might hit default_server block
- Default server might not have `/api/` block

**Solution:** Add `/api/` block to default_server, or test via domain name

---

### 4. Verify Nginx Has Reloaded

**Test config and reload:**

```bash
# Test config syntax
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Verify reload worked
sudo systemctl status nginx
```

**Check if Nginx actually reloaded:**

```bash
# Check Nginx process start time
ps aux | grep nginx

# Or check systemd
sudo systemctl status nginx | grep "Active"
```

---

### 5. Test with Exact Request

**Test from server:**

```bash
# Test /api/v1/health
curl -v http://localhost/api/v1/health

# Check what headers are sent
curl -v -H "Host: admin.globapp.org" http://localhost/api/v1/health
```

**Look for:**
- HTTP response code
- Headers returned
- Any redirects

---

## 🔧 Quick Fix Steps

**Run these commands on server:**

```bash
# 1. Backup config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# 2. Check for conflicting blocks
sudo grep -n "location.*api" /etc/nginx/sites-enabled/default

# 3. Verify /api/ block is in correct server block
sudo grep -B 20 "location /api/" /etc/nginx/sites-enabled/default | grep "server_name"

# 4. Test config
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx

# 6. Test
curl http://localhost/api/v1/health
```

---

## 🎯 Most Likely Issues

**1. Config in wrong server block**
- `/api/` block exists but not in the server block handling requests
- **Fix:** Add `/api/` block to all server blocks, or to default_server

**2. More specific location block**
- `location /api/v1/` exists and overrides `/api/`
- **Fix:** Remove `/api/v1/` block or fix it

**3. Nginx not reloaded**
- Config changed but Nginx not reloaded
- **Fix:** `sudo systemctl reload nginx`

**4. Testing via IP hits wrong server**
- IP request hits default_server which doesn't have `/api/`
- **Fix:** Test via domain name or add `/api/` to default_server

---

## ✅ Verification Checklist

- [ ] `/api/` location block exists ✅ (You have this!)
- [ ] `/api/` block is in the correct server block ❓ (Check this!)
- [ ] No conflicting `/api/v1/` block ❓ (Check this!)
- [ ] Nginx config test passes ❓ (Run `sudo nginx -t`)
- [ ] Nginx reloaded successfully ❓ (Run `sudo systemctl reload nginx`)
- [ ] Test works: `curl http://localhost/api/v1/health` ❓ (Test this!)

---

**Your config looks correct - now verify it's in the right place and reload Nginx!** 🎯










