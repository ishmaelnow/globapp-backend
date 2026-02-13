# Fix Root Domain DNS - Delete and Recreate

## ✅ Status: Subdomains Working, Root Domain Not

**Working:**
- ✅ `admin.globapp.org` → Resolving correctly
- ✅ `driver.globapp.org` → Resolving correctly
- ✅ `rider.globapp.org` → Resolving correctly

**Not Working:**
- ❌ `globapp.org` → Not resolving

**Solution:** Delete and recreate the root domain record

---

## 🔧 Step-by-Step: Fix Root Domain

### Step 1: Delete the Existing Record

**In Netlify DNS interface:**

1. **Find the `globapp.org` record** (the one with Name: `globapp.org`)
2. **Click the dropdown/actions icon** (chevron on the right)
3. **Select "Delete"** or click the delete/trash icon
4. **Confirm deletion**

**Wait 1-2 minutes** after deletion before recreating.

---

### Step 2: Recreate the Record

**In Netlify DNS interface:**

1. **Click "Add new record"** button
2. **Select Type:** `A`
3. **Enter Name:** 
   - Use `@` if that option is available
   - OR leave blank if there's a "root domain" option
   - OR enter `globapp.org` if required
4. **Enter Value:** `157.245.231.224`
5. **Set TTL:** `3600` (or leave default)
6. **Click "Save" or "Add record"**

---

### Step 3: Verify the Record

**After recreating:**

- ✅ Record shows as "Active" or "Published"
- ✅ Points to `157.245.231.224`
- ✅ No warnings or errors
- ✅ Status is green/active

---

### Step 4: Wait and Test

**Wait 5-15 minutes** for DNS propagation.

**Test from your computer:**

```powershell
# Test DNS resolution
Resolve-DnsName globapp.org

# Test API
Invoke-WebRequest -Uri "https://globapp.org/api/v1/health" -UseBasicParsing
```

**Expected:**
- DNS resolves to `157.245.231.224`
- API returns `{"ok":true,"version":"v1","environment":"development"}`

---

## 🔍 Why This Works

**Sometimes DNS records can get "stuck":**
- Record exists but not propagating
- Cached incorrectly
- Not properly published

**Deleting and recreating:**
- Forces DNS refresh
- Clears any cached issues
- Ensures record is properly published

---

## ✅ Quick Checklist

- [ ] Delete existing `globapp.org` A record
- [ ] Wait 1-2 minutes
- [ ] Create new A record for root domain (`@` or blank)
- [ ] Set value to `157.245.231.224`
- [ ] Verify record is Active
- [ ] Wait 5-15 minutes
- [ ] Test: `Resolve-DnsName globapp.org`
- [ ] Test: `Invoke-WebRequest -Uri "https://globapp.org/api/v1/health"`

---

## 🎯 Summary

**Yes, delete and recreate the `globapp.org` record!**

**Since subdomains are working, the root domain should work too. Deleting and recreating will force a refresh and should fix it.**

**After recreating, wait 5-15 minutes and test again!** 🎯
