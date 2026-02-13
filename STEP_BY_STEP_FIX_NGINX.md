# Step-by-Step: Fix Nginx Routing for /api/v1/health

## 🎯 Problem
- ✅ Backend works: `curl http://127.0.0.1:8000/api/v1/health` → Works
- ❌ Nginx fails: `curl http://157.245.231.224/api/v1/health` → 404
- ✅ But: `curl http://157.245.231.224/api/health` → Works

**Issue:** Nginx not routing `/api/v1/health` correctly

---

## 📋 Step-by-Step Fix

### Step 1: SSH into Server

```bash
ssh ishmael@157.245.231.224
```

**Expected:** You should be logged into the server

---

### Step 2: Check for Conflicting Location Blocks

**Check if there's a specific `/api/v1/` block that's interfering:**

```bash
sudo grep -n -A 10 "location /api/v1" /etc/nginx/sites-enabled/default
```

**Expected Results:**

**Option A: No output (good!)**
- Means no conflicting block exists
- Continue to Step 3

**Option B: Found a block (problem!)**
- There's a specific `/api/v1/` block
- Note the line numbers
- Continue to Step 4 to remove/fix it

---

### Step 3: Check All Location Blocks

**See all location blocks to understand the structure:**

```bash
sudo grep -n "location" /etc/nginx/sites-enabled/default
```

**Expected:** Should see multiple `location` blocks including `/api/`

**Check the `/api/` block specifically:**

```bash
sudo grep -n -A 15 "location /api/" /etc/nginx/sites-enabled/default
```

**Verify it looks like this:**
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

**If it looks correct:** Continue to Step 5

**If it's missing or wrong:** Continue to Step 6

---

### Step 4: Remove Conflicting /api/v1/ Block (If Found)

**If Step 2 found a `/api/v1/` block, remove it:**

```bash
# Backup the config first
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Edit the config
sudo nano /etc/nginx/sites-enabled/default
```

**In nano:**
1. Find the `location /api/v1/` block (use Ctrl+W to search)
2. Delete the entire block (lines with `location /api/v1/` through the closing `}`)
3. Save: Ctrl+O, Enter
4. Exit: Ctrl+X

**Or use sed to remove it automatically:**

```bash
# Find line numbers first
sudo grep -n "location /api/v1" /etc/nginx/sites-enabled/default
# Note the line number, then remove that block manually
```

**After removing:** Continue to Step 5

---

### Step 5: Check for Rewrite Rules

**Check if rewrite rules are interfering:**

```bash
sudo grep -n "rewrite" /etc/nginx/sites-enabled/default
```

**If found, check context:**

```bash
sudo grep -B 5 -A 5 "rewrite.*api" /etc/nginx/sites-enabled/default
```

**If rewrite rules exist and might interfere:**
- Comment them out or remove them
- Or ensure they don't affect `/api/v1/`

**Continue to Step 6**

---

### Step 6: Verify /api/ Location Block is Correct

**Check the exact `/api/` block:**

```bash
sudo grep -A 10 "location /api/" /etc/nginx/sites-enabled/default
```

**Must have:**
- `proxy_pass http://127.0.0.1:8000;` (with semicolon, NO trailing slash)
- Proper proxy headers

**If missing or wrong, fix it:**

```bash
sudo nano /etc/nginx/sites-enabled/default
```

**Find the server block for your domain (admin.globapp.org, rider.globapp.org, etc.)**

**Ensure it has:**

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

**Important:** `proxy_pass` should be `http://127.0.0.1:8000;` (no trailing slash)

**Save and exit nano**

---

### Step 7: Test Nginx Configuration

**Before reloading, test the config:**

```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If errors appear:**
- Fix the syntax errors
- Run `sudo nginx -t` again
- Repeat until test passes

**If test passes:** Continue to Step 8

---

### Step 8: Reload Nginx

**Reload Nginx to apply changes:**

```bash
sudo systemctl reload nginx
```

**Or restart if reload doesn't work:**

```bash
sudo systemctl restart nginx
```

**Check status:**

```bash
sudo systemctl status nginx
```

**Expected:** Should show `active (running)`

---

### Step 9: Test the Fix

**Test from server:**

```bash
# Test /api/v1/health
curl http://localhost/api/v1/health

# Test /api/health
curl http://localhost/api/health
```

**Expected:**
- Both should return JSON responses
- `/api/v1/health` should return `{"ok":true,"version":"v1","environment":"development"}`

**If both work:** ✅ Success! Continue to Step 10

**If still 404:** Check Step 10 (error logs)

---

### Step 10: Check Nginx Error Logs (If Still Failing)

**If Step 9 still shows 404, check error logs:**

```bash
sudo tail -n 50 /var/log/nginx/error.log
```

**Look for:**
- 404 errors
- Routing issues
- Proxy errors

**Common issues:**

**Issue 1: "No such file or directory"**
- Backend not running: `sudo systemctl start globapp-api`

**Issue 2: "Connection refused"**
- Backend not listening on 8000: Check backend status

**Issue 3: "upstream" errors**
- Backend connection issue: Verify backend is running

**Fix the issue found, then reload Nginx again**

---

### Step 11: Test from Your Computer

**Once it works on server, test from your computer:**

```powershell
# Test via IP
Invoke-WebRequest -Uri "http://157.245.231.224/api/v1/health" -UseBasicParsing

# Test via domain (once DNS works)
Invoke-WebRequest -Uri "https://globapp.org/api/v1/health" -UseBasicParsing
```

**Expected:** Should return `{"ok":true,"version":"v1","environment":"development"}`

---

## ✅ Success Checklist

- [ ] Step 1: SSH into server
- [ ] Step 2: Checked for conflicting blocks
- [ ] Step 3: Verified `/api/` location block exists
- [ ] Step 4: Removed conflicting blocks (if any)
- [ ] Step 5: Checked rewrite rules
- [ ] Step 6: Verified `/api/` block is correct
- [ ] Step 7: `sudo nginx -t` passes
- [ ] Step 8: Nginx reloaded successfully
- [ ] Step 9: `curl http://localhost/api/v1/health` works
- [ ] Step 10: Error logs checked (if needed)
- [ ] Step 11: Test from computer works

---

## 🔧 Quick Fix Summary

**If you want to try the quickest fix first:**

```bash
# 1. Backup
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# 2. Test config
sudo nginx -t

# 3. Reload
sudo systemctl reload nginx

# 4. Test
curl http://localhost/api/v1/health
```

**If that doesn't work, follow all steps above.**

---

**Follow these steps in order - you'll fix it!** 🎯










