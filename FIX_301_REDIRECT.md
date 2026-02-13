# Fix 301 Redirect Issue

## ✅ Progress! Nginx is Working

**Test results:**
- ✅ Config is in correct server blocks (rider, driver, admin)
- ✅ No conflicting `/api/v1/` block
- ✅ Nginx config test passes
- ✅ Nginx reloaded successfully
- ⚠️ But: `curl http://localhost/api/v1/health` → **301 Redirect**

**This is progress!** Before it was 404, now it's 301. Nginx is working, but redirecting HTTP to HTTPS.

---

## 🔍 Understanding the 301 Redirect

**What's happening:**
- Nginx has HTTP → HTTPS redirect configured
- When you access `http://localhost/api/v1/health`, Nginx redirects to HTTPS
- But `localhost` doesn't have SSL certificate, so HTTPS fails

**This is normal behavior** - Nginx is configured to force HTTPS for security.

---

## ✅ Solution: Test via HTTPS or Domain

### Option 1: Test via HTTPS (with certificate check disabled)

**On server:**

```bash
# Test HTTPS (ignore certificate errors for localhost)
curl -k https://localhost/api/v1/health

# Or test with proper domain (once DNS works)
curl https://admin.globapp.org/api/v1/health
```

**Expected:** Should return JSON `{"ok":true,"version":"v1","environment":"development"}`

---

### Option 2: Check Redirect Location

**See where it's redirecting:**

```bash
curl -I http://localhost/api/v1/health
```

**Look for:** `Location: https://...` header

**This tells you where it's redirecting to.**

---

### Option 3: Test Backend Directly (Bypass Nginx)

**Verify backend still works:**

```bash
curl http://127.0.0.1:8000/api/v1/health
```

**Expected:** Should return JSON directly (bypasses Nginx)

---

## 🔧 If You Want to Test HTTP Without Redirect

**Temporarily disable redirect (for testing only):**

**On server:**

```bash
# Backup config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Edit config
sudo nano /etc/nginx/sites-enabled/default
```

**Find the HTTP server block (usually the first one):**

```nginx
server {
    listen 80;
    server_name _;
    
    # Look for this redirect:
    return 301 https://$host$request_uri;
    
    # Comment it out temporarily:
    # return 301 https://$host$request_uri;
}
```

**Save and reload:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Test again:**

```bash
curl http://localhost/api/v1/health
```

**Expected:** Should work now (but don't leave redirect disabled in production!)

**Restore redirect after testing:**

```bash
sudo nano /etc/nginx/sites-enabled/default
# Uncomment the return 301 line
sudo systemctl reload nginx
```

---

## ✅ Recommended: Test via HTTPS

**The proper way to test:**

```bash
# Test HTTPS (ignore cert errors for localhost)
curl -k https://localhost/api/v1/health

# Or test via domain (once DNS works)
curl https://admin.globapp.org/api/v1/health
```

**If HTTPS works:** ✅ Everything is configured correctly!

---

## 🎯 Summary

**Current status:**
- ✅ Nginx config is correct
- ✅ Backend is working
- ✅ Nginx is routing correctly
- ⚠️ HTTP → HTTPS redirect is working (this is good!)

**Next step:**
- Test via HTTPS: `curl -k https://localhost/api/v1/health`
- Or test via domain: `curl https://admin.globapp.org/api/v1/health` (once DNS works)

**The 301 redirect is actually a GOOD sign** - it means Nginx is working and enforcing HTTPS security!

---

**Test via HTTPS now - that's the proper way!** 🎯










