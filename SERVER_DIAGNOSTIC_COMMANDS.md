# Server Diagnostic Commands - Run One by One

## ✅ Backend Status: RUNNING

**Backend is active and running!** ✅

Now run these commands **ONE BY ONE** and share the output:

---

## Command 2: Check Nginx

```bash
sudo systemctl status nginx
```

**Expected:** Should show `active (running)`

**If not running:** Start it with `sudo systemctl start nginx`

---

## Command 3: Test DNS from Server

```bash
nslookup admin.globapp.org
```

**Expected:** Should show `157.245.231.224`

**If not:** DNS propagation issue or DNS server problem

---

## Command 4: Test Backend Directly

```bash
curl http://localhost:8000/api/v1/health
```

**Expected:** `{"ok":true,"version":"v1","environment":"development"}`

**If not:** Backend issue (but we know it's running, so should work)

---

## Command 5: Test Through Nginx

```bash
curl http://localhost/api/v1/health
```

**Expected:** `{"ok":true,"version":"v1","environment":"development"}`

**If not:** Nginx configuration issue

---

## Command 6: Check Firewall

```bash
sudo ufw status
```

**Expected:** Should show ports 80 and 443 are ALLOW

**If not:** Firewall blocking connections

---

## Quick All-in-One Test

**Or run this all at once:**

```bash
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "=== DNS Test ==="
nslookup admin.globapp.org | grep -A 1 "Name:"

echo ""
echo "=== Backend Direct ==="
curl -s http://localhost:8000/api/v1/health

echo ""
echo "=== Nginx Proxy ==="
curl -s http://localhost/api/v1/health

echo ""
echo "=== Firewall ==="
sudo ufw status | head -10
```

---

**Run these commands and share ALL the output!** 🔍










