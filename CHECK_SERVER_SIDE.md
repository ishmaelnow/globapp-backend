# Check Server-Side Configuration

## ✅ What We Know

- ✅ Domain registered with Netlify
- ✅ DNS records correct in Netlify
- ✅ Nameservers correct
- ❌ Domain not resolving from client

**If Netlify is NOT the issue, check the SERVER side.**

---

## 🔍 Check Server Configuration

### Step 1: SSH into Droplet

```bash
ssh ishmael@157.245.231.224
```

### Step 2: Check Backend Service

```bash
# Check if backend is running
sudo systemctl status globapp-api

# Should show: active (running)
# If not running, start it:
sudo systemctl start globapp-api
```

### Step 3: Check Nginx Service

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Should show: active (running)
# If not running, start it:
sudo systemctl start nginx
```

### Step 4: Test DNS from Server

```bash
# Can server resolve its own domain?
nslookup admin.globapp.org

# Should show: 157.245.231.224
# If not, DNS propagation issue
```

### Step 5: Test Backend Directly

```bash
# Test backend API directly (bypasses Nginx)
curl http://localhost:8000/api/v1/health

# Should return: {"ok":true,"version":"v1",...}
# If not, backend issue
```

### Step 6: Test Through Nginx

```bash
# Test API through Nginx (localhost)
curl http://localhost/api/v1/health

# Should return: {"ok":true,"version":"v1",...}
# If not, Nginx configuration issue
```

### Step 7: Check Nginx Configuration

```bash
# Test Nginx config
sudo nginx -t

# Should show: syntax is ok, test is successful
# If errors, fix them
```

### Step 8: Check Firewall

```bash
# Check if ports are open
sudo ufw status

# Should show: 80/tcp and 443/tcp ALLOW
# If not, open them:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Step 9: Check Nginx Server Blocks

```bash
# Verify admin.globapp.org server block exists
sudo grep -A 20 "server_name admin.globapp.org" /etc/nginx/sites-enabled/default

# Should show server block with:
# - server_name admin.globapp.org;
# - ssl_certificate /etc/letsencrypt/live/globapp.org/...
# - location /api/ { proxy_pass http://localhost:8000; }
```

---

## 🔴 Common Server-Side Issues

### Issue 1: Backend Not Running
**Symptom:** API calls fail
**Fix:** Start backend service
```bash
sudo systemctl start globapp-api
sudo systemctl enable globapp-api
```

### Issue 2: Nginx Not Running
**Symptom:** Nothing responds
**Fix:** Start Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Issue 3: Nginx Config Error
**Symptom:** Nginx won't start
**Fix:** Fix config errors
```bash
sudo nginx -t  # Shows errors
sudo nano /etc/nginx/sites-enabled/default  # Fix errors
sudo systemctl reload nginx
```

### Issue 4: Firewall Blocking
**Symptom:** Can't connect from outside
**Fix:** Open ports
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Issue 5: Wrong Nginx Server Block
**Symptom:** Wrong domain or missing config
**Fix:** Check and fix server blocks
```bash
sudo grep "server_name" /etc/nginx/sites-enabled/default
```

---

## 🧪 Quick Diagnostic Script

**Run on droplet:**

```bash
#!/bin/bash
echo "=== Server Diagnostic ==="
echo ""
echo "1. Backend status:"
sudo systemctl status globapp-api --no-pager | head -3
echo ""
echo "2. Nginx status:"
sudo systemctl status nginx --no-pager | head -3
echo ""
echo "3. DNS resolution from server:"
nslookup admin.globapp.org | grep -A 1 "Name:"
echo ""
echo "4. Backend direct test:"
curl -s http://localhost:8000/api/v1/health | head -1
echo ""
echo "5. Nginx test:"
curl -s http://localhost/api/v1/health | head -1
echo ""
echo "6. Nginx config test:"
sudo nginx -t
echo ""
echo "7. Firewall status:"
sudo ufw status | head -5
```

---

## 📝 Checklist

- [ ] Backend service running
- [ ] Nginx service running
- [ ] DNS resolves from server
- [ ] Backend responds directly
- [ ] Nginx proxies correctly
- [ ] Nginx config valid
- [ ] Firewall allows ports 80/443
- [ ] Server blocks configured correctly

---

## 🚀 Next Steps

1. **SSH into droplet**
2. **Run diagnostic script above**
3. **Fix any issues found**
4. **Test from server**
5. **Then test from client**

---

**Run the checks on your droplet and tell me what you find!** 🔍










