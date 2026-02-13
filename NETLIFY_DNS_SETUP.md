# Setting Up DNS Records in Netlify for globapp.org

## Step 1: Your DigitalOcean Droplet IP Address

**Your Droplet IP:** `157.245.231.224`

**Use this IP for all DNS records below.**

---

## Step 2: Access Netlify DNS Settings

1. Log in to https://app.netlify.com
2. Click on your site (or go to **Sites** if you have multiple)
3. Go to **Site configuration** → **Domain management** (or **Domains**)
4. Find `globapp.org` in your domain list
5. Click on **DNS** or **DNS settings** (may be under a settings/gear icon)

**Alternative path:**
- Go to **Team settings** → **Domains** → Click `globapp.org` → **DNS**

---

## Step 3: Add A Records

**For each subdomain, add an A record:**

### A Record 1: Main Domain (globapp.org)

1. Click **Add new record** or **Add DNS record**
2. Select record type: **A**
3. Fill in:
   - **Name/Host**: `@` or leave blank (for root domain)
   - **Value/IP**: `157.245.231.224`
   - **TTL**: `3600` (or leave default)
4. Click **Save** or **Add record**

### A Record 2: Rider Subdomain (rider.globapp.org)

1. Click **Add new record**
2. Select record type: **A**
3. Fill in:
   - **Name/Host**: `rider`
   - **Value/IP**: `157.245.231.224`
   - **TTL**: `3600`
4. Click **Save**

### A Record 3: Driver Subdomain (driver.globapp.org)

1. Click **Add new record**
2. Select record type: **A**
3. Fill in:
   - **Name/Host**: `driver`
   - **Value/IP**: `157.245.231.224`
   - **TTL**: `3600`
4. Click **Save**

### A Record 4: Admin Subdomain (admin.globapp.org)

1. Click **Add new record**
2. Select record type: **A**
3. Fill in:
   - **Name/Host**: `admin`
   - **Value/IP**: `157.245.231.224`
   - **TTL**: `3600`
4. Click **Save**

---

## Step 4: Verify DNS Records

**After adding all records, you should see:**

```
Type    Name      Value              TTL
A       @         157.245.231.224    3600
A       rider     157.245.231.224    3600
A       driver    157.245.231.224    3600
A       admin     157.245.231.224    3600
```

---

## Step 5: Wait for DNS Propagation

**DNS changes can take:**
- **Minimum**: 5-15 minutes
- **Usually**: 1-2 hours
- **Maximum**: 24-48 hours

**To check if DNS has propagated:**

```bash
# On Windows PowerShell:
nslookup globapp.org
nslookup rider.globapp.org
nslookup driver.globapp.org
nslookup admin.globapp.org

# Or use online tools:
# https://dnschecker.org
# Enter each domain and check if it resolves to your droplet IP
```

---

## Step 6: Important Notes

### If Netlify is Hosting Your Site:

**If Netlify is currently hosting your site**, you may need to:

1. **Disable Netlify hosting** for these domains (if you want DigitalOcean to serve them)
2. Or **keep Netlify DNS** but point A records to DigitalOcean
3. Netlify may have **CNAME records** - you can delete those and replace with A records

### Common Netlify DNS Issues:

- **CNAME conflicts**: If you see CNAME records for `@`, you may need to delete them first (A records and CNAME can't coexist for root domain)
- **Netlify subdomain**: If you see `netlify.app` subdomain, that's fine - keep it for Netlify hosting if needed
- **www subdomain**: You can add `www` as an A record too if needed: `www` → `157.245.231.224`

---

## Step 7: Test After Propagation

**Once DNS propagates, test:**

```bash
# Should return your droplet IP
nslookup globapp.org
nslookup rider.globapp.org

# Test HTTPS (after SSL setup)
curl -I https://globapp.org/api/v1/health
```

---

## Troubleshooting

**If DNS doesn't resolve:**
1. Double-check the IP address is correct
2. Verify records are saved in Netlify
3. Wait longer (up to 48 hours)
4. Check for typos in hostnames (`rider`, `driver`, `admin`)

**If you see wrong IP:**
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Try different DNS server (8.8.8.8)

