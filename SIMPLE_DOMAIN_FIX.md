# Simple Domain Fix - Get It Working NOW

## 🎯 ONE GOAL: Make `globapp.org` Work

---

## ✅ Step 1: Check DNS Records in Netlify

**Go to:** https://app.netlify.com → Site → Domain management → DNS

**You need these 4 A records:**

1. **Root domain:**
   - Name: `@` (or blank)
   - Type: `A`
   - Value: `157.245.231.224`
   - Status: Must be **Active**

2. **Admin subdomain:**
   - Name: `admin`
   - Type: `A`
   - Value: `157.245.231.224`
   - Status: Must be **Active**

3. **Rider subdomain:**
   - Name: `rider`
   - Type: `A`
   - Value: `157.245.231.224`
   - Status: Must be **Active**

4. **Driver subdomain:**
   - Name: `driver`
   - Type: `A`
   - Value: `157.245.231.224`
   - Status: Must be **Active**

**DELETE these if they exist:**
- ❌ Any CNAME records
- ❌ Any NETLIFY records
- ❌ Anything pointing to Netlify IPs

---

## ✅ Step 2: Wait 5-15 Minutes

DNS changes take time to propagate.

---

## ✅ Step 3: Test DNS

**Run this in PowerShell:**
```powershell
Resolve-DnsName globapp.org
```

**Expected:** Should show `157.245.231.224`

**If not:** Go back to Step 1, check records are Active

---

## ✅ Step 4: Test API

**Run this in PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://globapp.org/api/v1/health"
```

**Expected:** Should return `{"ok":true}`

**If not:** DNS might not be propagated yet, wait longer

---

## ✅ Step 5: Verify Server is Running

**SSH into server:**
```bash
ssh ishmael@157.245.231.224
```

**Check services:**
```bash
sudo systemctl status globapp-api
sudo systemctl status nginx
```

**Both should say:** `active (running)`

**If not:**
```bash
sudo systemctl start globapp-api
sudo systemctl start nginx
```

---

## 🎯 That's It!

**Domain works when:**
- ✅ DNS resolves to `157.245.231.224`
- ✅ API returns `{"ok":true}`
- ✅ Web apps load

**Focus:** DNS records in Netlify → Point to `157.245.231.224` → Wait → Test!










