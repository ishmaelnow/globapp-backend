# Get Domain Up and Running - Simple Steps

## 🎯 Goal: Make `globapp.org` Work

**Forget everything else - just get the domain working!**

---

## Step 1: Check DNS Records in Netlify

**Go to:** https://app.netlify.com → Site → Domain management → DNS

**Required DNS Records:**

| Name | Type | Value | Status |
|------|------|-------|--------|
| `@` (or blank) | A | `157.245.231.224` | Must be Active |
| `admin` | A | `157.245.231.224` | Must be Active |
| `rider` | A | `157.245.231.224` | Must be Active |
| `driver` | A | `157.245.231.224` | Must be Active |

**Action:**
- ✅ Verify all 4 records exist
- ✅ Verify all point to `157.245.231.224`
- ✅ Verify all are "Active" or "Published"
- ❌ Delete any CNAME or NETLIFY records

---

## Step 2: Wait for DNS Propagation

**Time:** 5-15 minutes (sometimes up to 30 minutes)

**Test DNS:**
```powershell
Resolve-DnsName globapp.org
Resolve-DnsName admin.globapp.org
```

**Expected:** All should return `157.245.231.224`

---

## Step 3: Verify Server is Running

**SSH into server:**
```bash
ssh ishmael@157.245.231.224
```

**Check services:**
```bash
# Backend
sudo systemctl status globapp-api

# Nginx
sudo systemctl status nginx

# Both should be "active (running)"
```

**If not running:**
```bash
sudo systemctl start globapp-api
sudo systemctl start nginx
```

---

## Step 4: Test Domain

**From your computer:**
```powershell
# Test DNS
Resolve-DnsName globapp.org

# Test API
Invoke-WebRequest -Uri "https://globapp.org/api/v1/health"
```

**Expected:**
- DNS resolves to `157.245.231.224`
- API returns `{"ok":true}`

---

## Step 5: If DNS Not Resolving

**Check in Netlify:**
1. Are records still there?
2. Are they "Active"?
3. Any warnings or errors?

**If records exist but not working:**
- Delete and re-add them
- Or toggle them off/on
- Or save again to republish

---

## ✅ Success Criteria

**Domain is working when:**
- ✅ `Resolve-DnsName globapp.org` returns `157.245.231.224`
- ✅ `https://globapp.org/api/v1/health` returns `{"ok":true}`
- ✅ Web apps load (not Netlify 404)

---

**Focus: DNS records in Netlify → Point to `157.245.231.224` → Wait → Test!** 🎯










