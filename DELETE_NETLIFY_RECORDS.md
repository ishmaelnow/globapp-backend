# Delete NETLIFY Records - Fix DNS Conflict

## 🔴 Problem Found!

You have **BOTH** A records and NETLIFY records for the same domains. The NETLIFY records are conflicting and causing DNS to resolve to Netlify instead of your droplet.

## ✅ Solution: Delete All NETLIFY Records

### Records to DELETE:

1. **NETLIFY** record for `globapp.org` → `globapp.netlify.app`
2. **NETLIFY** record for `admin.globapp.org` → `globapp.netlify.app`
3. **NETLIFY** record for `driver.globapp.org` → `globapp.netlify.app`
4. **NETLIFY** record for `rider.globapp.org` → `globapp.netlify.app`
5. **NETLIFY** record for `www.globapp.org` → `globapp.netlify.app`

### Records to KEEP:

✅ **A** record for `globapp.org` → `157.245.231.224`
✅ **A** record for `admin.globapp.org` → `157.245.231.224`
✅ **A** record for `driver.globapp.org` → `157.245.231.224`
✅ **A** record for `rider.globapp.org` → `157.245.231.224`

---

## Step-by-Step: Delete NETLIFY Records

1. **Go to Netlify DNS settings** for `globapp.org`

2. **For each NETLIFY record:**
   - Find the NETLIFY record (Type: NETLIFY)
   - Click the **delete/trash icon** or **three dots menu** → Delete
   - Confirm deletion

3. **Delete these 5 NETLIFY records:**
   - `globapp.org` → NETLIFY → `globapp.netlify.app`
   - `admin.globapp.org` → NETLIFY → `globapp.netlify.app`
   - `driver.globapp.org` → NETLIFY → `globapp.netlify.app`
   - `rider.globapp.org` → NETLIFY → `globapp.netlify.app`
   - `www.globapp.org` → NETLIFY → `globapp.netlify.app`

4. **After deleting, verify you only have A records:**
   - Should see only 4 A records (globapp.org, admin, driver, rider)
   - All pointing to `157.245.231.224`
   - No NETLIFY records remaining

---

## Why This Happened

**NETLIFY records are created automatically** when you connect a domain to a Netlify site. They take precedence over A records in some DNS configurations, which is why DNS was resolving to Netlify IPs.

**By deleting NETLIFY records and keeping only A records**, DNS will resolve to your droplet (`157.245.231.224`).

---

## After Deleting NETLIFY Records

1. **Wait 5-15 minutes** for DNS propagation

2. **Verify DNS resolution:**
   ```powershell
   nslookup globapp.org
   nslookup admin.globapp.org
   nslookup rider.globapp.org
   ```
   
   **All should show:** `157.245.231.224`

3. **Test API endpoint:**
   ```powershell
   Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET
   ```
   
   **Should return:** `{"ok":true,"version":"v1",...}`

4. **Mobile app should work!**

---

## ⚠️ Important

**Do NOT delete the A records!** Only delete the NETLIFY records.

After deleting NETLIFY records, your DNS should have:
- ✅ 4 A records (globapp.org, admin, driver, rider) → `157.245.231.224`
- ❌ 0 NETLIFY records










