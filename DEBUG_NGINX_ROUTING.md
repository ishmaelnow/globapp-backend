# Debug Nginx Routing - Find Which Server Block is Handling Requests

## 🔴 Problem
Backend is running, Nginx config has `/api/` blocks, but external requests get 404.

## ✅ Solution: Check Which Server Block is Matching

### Step 1: Test from Droplet Itself

**SSH into droplet and test:**
```bash
# Test HTTPS from droplet
curl -v https://admin.globapp.org/api/v1/health

# Check what Host header is being sent
curl -H "Host: admin.globapp.org" http://localhost/api/v1/health
```

### Step 2: Check for Default Server Block

**Check if there's a default server block catching requests:**
```bash
sudo grep -B 5 -A 20 "listen 443" /etc/nginx/sites-enabled/default | grep -A 20 "default_server"
```

**Or check all server blocks:**
```bash
sudo grep -n "server_name" /etc/nginx/sites-enabled/default
```

### Step 3: Check Nginx Error Logs in Real-Time

**On droplet, watch error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Then from your local machine, make a request:**
```powershell
Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET
```

**Watch the Nginx error log - it will show which server block handled the request.**

### Step 4: Check Access Logs

**Check access logs to see what's happening:**
```bash
sudo tail -f /var/log/nginx/access.log
```

Make a request and see what gets logged.

### Step 5: Verify Server Block Order

**Nginx processes server blocks in order. Check if there's a catch-all block first:**
```bash
sudo cat /etc/nginx/sites-enabled/default | grep -B 2 -A 30 "server_name"
```

**Look for:**
- `server_name _;` (catch-all)
- `server_name admin.globapp.org;` (specific)
- Multiple `server_name admin.globapp.org;` blocks (duplicate)

### Step 6: Test Specific Server Block

**Force Nginx to use the admin.globapp.org server block:**
```bash
# On droplet
curl -v -H "Host: admin.globapp.org" https://127.0.0.1/api/v1/health --insecure
```

### Step 7: Check SSL Certificate Issue

**Maybe SSL handshake is failing? Check:**
```bash
# Test SSL connection
openssl s_client -connect admin.globapp.org:443 -servername admin.globapp.org

# Check if certificate matches
echo | openssl s_client -connect admin.globapp.org:443 -servername admin.globapp.org 2>/dev/null | openssl x509 -noout -subject
```

## 🔍 Most Likely Issues

### Issue 1: Default Server Block Without /api/ Location

**If there's a default server block (catch-all) that doesn't have `/api/` location:**
```bash
# Find default server block
sudo grep -B 5 -A 30 "server_name _" /etc/nginx/sites-enabled/default
# or
sudo grep -B 5 -A 30 "listen 443.*default_server" /etc/nginx/sites-enabled/default
```

**Fix: Add `/api/` location to default server block, or remove default_server flag.**

### Issue 2: Multiple Server Blocks for Same Domain

**If there are multiple blocks for `admin.globapp.org`:**
```bash
sudo grep -n "server_name admin.globapp.org" /etc/nginx/sites-enabled/default
```

**Fix: Remove duplicates, keep only one.**

### Issue 3: Server Block Order

**Nginx uses the first matching server block. If a catch-all comes first:**
```bash
# Check order
sudo grep -n "server_name" /etc/nginx/sites-enabled/default
```

**Fix: Put specific server blocks before catch-all blocks.**

## ✅ Quick Diagnostic Script

**Run this on droplet:**
```bash
#!/bin/bash
echo "=== Checking Nginx Configuration ==="
echo ""
echo "1. Backend status:"
sudo systemctl status globapp-api --no-pager | head -3
echo ""
echo "2. Testing backend directly:"
curl -s http://localhost:8000/api/v1/health | head -1
echo ""
echo "3. Server blocks:"
sudo grep -n "server_name" /etc/nginx/sites-enabled/default
echo ""
echo "4. Testing through Nginx (from droplet):"
curl -s https://admin.globapp.org/api/v1/health | head -1
echo ""
echo "5. Nginx config test:"
sudo nginx -t
echo ""
echo "6. Recent Nginx errors:"
sudo tail -5 /var/log/nginx/error.log
```

## 📝 Next Steps

1. Run the diagnostic script above
2. Check which server block is matching
3. Verify `/api/` location exists in that block
4. Test from droplet vs from external
5. Check Nginx error logs for clues

---

**The backend is working - this is definitely an Nginx routing issue!**










