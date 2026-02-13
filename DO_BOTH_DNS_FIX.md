# Do Both: Local Testing + Production DNS Fix

## 🎯 Plan: Fix Both

1. **Add `/etc/hosts` entries** → Immediate testing on server
2. **Fix DNS in Netlify** → Production access for everyone

---

## ✅ Step 1: Add /etc/hosts Entries (Local Testing)

**On your server, run:**

```bash
# Backup hosts file first
sudo cp /etc/hosts /etc/hosts.backup

# Edit hosts file
sudo nano /etc/hosts
```

**In nano, add these lines at the end:**

```
127.0.0.1 globapp.org
127.0.0.1 www.globapp.org
127.0.0.1 admin.globapp.org
127.0.0.1 rider.globapp.org
127.0.0.1 driver.globapp.org
```

**Save and exit:**
- Press `Ctrl+O` (save)
- Press `Enter` (confirm filename)
- Press `Ctrl+X` (exit)

**Test immediately:**

```bash
# Test root domain
curl https://globapp.org/api/v1/health

# Test admin subdomain
curl https://admin.globapp.org/api/v1/health

# Test rider subdomain
curl https://rider.globapp.org/api/v1/health

# Test driver subdomain
curl https://driver.globapp.org/api/v1/health
```

**Expected:** All should return `{"ok":true,"version":"v1","environment":"development"}`

**✅ Done!** You can now test locally on the server.

---

## ✅ Step 2: Fix DNS in Netlify (Production)

**This makes domains work for everyone (not just server).**

### 2.1: Go to Netlify DNS

1. **Open browser:** https://app.netlify.com
2. **Log in** to your Netlify account
3. **Navigate to:** Site → Domain management → DNS
   - Or direct link: https://app.netlify.com/teams/YOUR_TEAM/dns

### 2.2: Delete Conflicting Records

**Before adding new records, delete these if they exist:**

- ❌ Any CNAME records pointing to `globapp.netlify.app`
- ❌ Any NETLIFY records
- ❌ Any records pointing to Netlify IPs (like `13.52.188.95`, `52.52.192.191`)

**How to delete:**
- Find the record
- Click the "Delete" or trash icon
- Confirm deletion

### 2.3: Add A Records

**Add these 4 A records:**

| Name | Type | Value | TTL |
|------|------|-------|-----|
| `@` (or blank/root) | A | `157.245.231.224` | 3600 |
| `admin` | A | `157.245.231.224` | 3600 |
| `rider` | A | `157.245.231.224` | 3600 |
| `driver` | A | `157.245.231.224` | 3600 |

**How to add:**
1. Click "Add new record" or "+" button
2. Select "A" from Type dropdown
3. Enter Name (use `@` for root domain, or leave blank if option available)
4. Enter Value: `157.245.231.224`
5. Set TTL: `3600` (or leave default)
6. Click "Save" or "Add record"
7. Repeat for all 4 records

### 2.4: Verify Records Are Active

**After adding, verify:**
- ✅ All 4 records show as "Active" or "Published"
- ✅ All point to `157.245.231.224`
- ✅ No warnings or errors
- ✅ Status is green/active

### 2.5: Wait for DNS Propagation

**Time:** 5-15 minutes (sometimes up to 30 minutes)

**While waiting:** You can continue testing locally using `/etc/hosts` entries

### 2.6: Test DNS Propagation

**From your computer (PowerShell):**

```powershell
# Test root domain
Resolve-DnsName globapp.org

# Test admin subdomain
Resolve-DnsName admin.globapp.org

# Test rider subdomain
Resolve-DnsName rider.globapp.org

# Test driver subdomain
Resolve-DnsName driver.globapp.org
```

**Expected:** All should return `157.245.231.224`

**If not resolving yet:** Wait longer (up to 30 minutes)

### 2.7: Test API via Domain

**Once DNS resolves, test from your computer:**

```powershell
# Test root domain
Invoke-WebRequest -Uri "https://globapp.org/api/v1/health" -UseBasicParsing

# Test admin subdomain
Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -UseBasicParsing
```

**Expected:** Should return `{"ok":true,"version":"v1","environment":"development"}`

---

## ✅ Step 3: Remove /etc/hosts Entries (After DNS Works)

**Once DNS is working in Netlify, remove local entries:**

```bash
# Edit hosts file
sudo nano /etc/hosts

# Remove the lines you added:
# 127.0.0.1 globapp.org
# 127.0.0.1 www.globapp.org
# 127.0.0.1 admin.globapp.org
# 127.0.0.1 rider.globapp.org
# 127.0.0.1 driver.globapp.org

# Save and exit (Ctrl+O, Enter, Ctrl+X)
```

**Or restore from backup:**

```bash
sudo cp /etc/hosts.backup /etc/hosts
```

**Why remove?**
- Once DNS works, you want to use real DNS
- `/etc/hosts` entries override DNS, which can cause confusion
- Better to use production DNS for testing

---

## 📋 Complete Checklist

### Local Testing (Step 1)
- [ ] Backup `/etc/hosts`
- [ ] Add domain entries to `/etc/hosts`
- [ ] Test: `curl https://admin.globapp.org/api/v1/health`
- [ ] Verify it works locally

### Production DNS (Step 2)
- [ ] Log into Netlify
- [ ] Go to DNS settings
- [ ] Delete conflicting CNAME/NETLIFY records
- [ ] Add A record for `@` → `157.245.231.224`
- [ ] Add A record for `admin` → `157.245.231.224`
- [ ] Add A record for `rider` → `157.245.231.224`
- [ ] Add A record for `driver` → `157.245.231.224`
- [ ] Verify all records are Active
- [ ] Wait 5-15 minutes
- [ ] Test DNS: `Resolve-DnsName globapp.org`
- [ ] Test API: `Invoke-WebRequest -Uri "https://globapp.org/api/v1/health"`

### Cleanup (Step 3)
- [ ] Remove `/etc/hosts` entries (after DNS works)
- [ ] Verify using real DNS

---

## 🎯 Summary

**Do both:**
1. ✅ **`/etc/hosts`** → Immediate local testing (works now!)
2. ✅ **Netlify DNS** → Production access (works in 5-15 minutes)

**Result:**
- ✅ Can test immediately on server
- ✅ Everyone can access domains once DNS propagates
- ✅ Full production setup complete!

---

**Follow these steps - you'll have both working!** 🎯










