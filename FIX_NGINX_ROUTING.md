# Fix Nginx Routing - Backend Works, Nginx Doesn't

## ✅ Backend Confirmed Working

**Direct backend test:**
- ✅ `curl http://127.0.0.1:8000/api/v1/health` → Works!
- ✅ `curl http://127.0.0.1:8000/api/health` → Works!

**But through Nginx:**
- ❌ `curl http://157.245.231.224/api/v1/health` → 404
- ✅ `curl http://157.245.231.224/api/health` → Works

**Conclusion:** Backend is fine, Nginx routing is broken!

---

## 🔍 Check Nginx Configuration

**On server, check for conflicting location blocks:**

```bash
# Check all location blocks
sudo grep -n "location" /etc/nginx/sites-enabled/default

# Check if there's a more specific /api/v1/ block
sudo grep -A 5 "location /api/v1" /etc/nginx/sites-enabled/default

# Check for rewrite rules
sudo grep -n "rewrite" /etc/nginx/sites-enabled/default
```

**Possible issues:**
1. More specific `location /api/v1/` block overriding `/api/`
2. Rewrite rule interfering
3. Default server block catching it first

---

## 🔧 Fix Option 1: Check for Specific /api/v1/ Block

**If there's a `location /api/v1/` block:**
- It might be proxying incorrectly
- Or returning 404 directly

**Fix:** Remove or fix the specific block, let `/api/` handle it

---

## 🔧 Fix Option 2: Check Default Server Block

**Check which server block is catching the request:**

```bash
# See all server_name directives
sudo grep -n "server_name" /etc/nginx/sites-enabled/default

# Check default_server
sudo grep -B 5 -A 20 "default_server" /etc/nginx/sites-enabled/default
```

**If default server doesn't have `/api/` location:**
- Add it or fix routing

---

## 🔧 Fix Option 3: Reload Nginx

**Sometimes Nginx needs reload:**

```bash
# Test config
sudo nginx -t

# Reload if test passes
sudo systemctl reload nginx

# Or restart
sudo systemctl restart nginx
```

---

## 🔧 Fix Option 4: Check Nginx Error Logs

**See what Nginx is doing:**

```bash
# Watch error log in real-time
sudo tail -f /var/log/nginx/error.log

# In another terminal, test:
curl http://157.245.231.224/api/v1/health

# See what error appears
```

**Look for:**
- 404 errors
- Routing issues
- Proxy errors

---

## 🎯 Most Likely Fix

**Since `/api/health` works but `/api/v1/health` doesn't:**

1. **Check if there's a `location /api/v1/` block:**
   ```bash
   sudo grep -A 10 "location /api/v1" /etc/nginx/sites-enabled/default
   ```

2. **If it exists and is wrong, remove it** (let `/api/` handle it)

3. **If it doesn't exist, check for rewrite rules:**
   ```bash
   sudo grep -B 5 -A 5 "rewrite.*api" /etc/nginx/sites-enabled/default
   ```

4. **Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

**Backend works - now fix Nginx routing!** 🎯










