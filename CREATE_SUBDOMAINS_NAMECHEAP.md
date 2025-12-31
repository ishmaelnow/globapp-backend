# How to Create Subdomains - NameCheap DNS Setup Guide

**Quick Guide:** Set up DNS records for three subdomains in NameCheap.

**Subdomains to create:**
- `rider.globapp.app`
- `driver.globapp.app`
- `admin.globapp.app`

**Domain:** `globapp.app` (registered with NameCheap)

---

## Step-by-Step Instructions

### Step 1: Log into NameCheap

1. Go to: https://www.namecheap.com
2. Click **"Sign In"** (top right)
3. Enter your NameCheap account credentials

### Step 2: Access Domain List

1. After logging in, click **"Domain List"** in the left sidebar
   - Or go directly to: https://www.namecheap.com/myaccount/domainlist/
2. Find **`globapp.app`** in your domain list
3. Click **"Manage"** next to `globapp.app`

### Step 3: Navigate to Advanced DNS

1. In the domain management page, look for tabs/sections
2. Click on **"Advanced DNS"** tab
   - This is where you manage DNS records

### Step 4: Add First Subdomain (Rider)

1. Scroll down to the **"Host Records"** section
2. Click **"Add New Record"** button
3. Fill in the form:
   - **Type:** Select `A Record` from dropdown
   - **Host:** Type `rider` (without quotes, no dot at the end)
   - **Value:** Type your Droplet IP address (e.g., `123.456.789.012`)
   - **TTL:** Select `Automatic` or `30 min` (1800 seconds)
4. Click the **checkmark (✓)** or **"Save"** button to save

**Result:** `rider.globapp.app` DNS record created

### Step 5: Add Second Subdomain (Driver)

1. Click **"Add New Record"** again
2. Fill in the form:
   - **Type:** `A Record`
   - **Host:** `driver`
   - **Value:** Same Droplet IP address as above
   - **TTL:** `Automatic` or `30 min`
3. Click **"Save"**

**Result:** `driver.globapp.app` DNS record created

### Step 6: Add Third Subdomain (Admin)

1. Click **"Add New Record"** again
2. Fill in the form:
   - **Type:** `A Record`
   - **Host:** `admin`
   - **Value:** Same Droplet IP address as above
   - **TTL:** `Automatic` or `30 min`
3. Click **"Save"**

**Result:** `admin.globapp.app` DNS record created

---

## Verify DNS Records

After creating all three records, your Host Records table should show:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `rider` | `YOUR_DROPLET_IP` | Automatic |
| A Record | `driver` | `YOUR_DROPLET_IP` | Automatic |
| A Record | `admin` | `YOUR_DROPLET_IP` | Automatic |

**Note:** Replace `YOUR_DROPLET_IP` with your actual DigitalOcean Droplet IP address.

---

## Important: NameCheap DNS Settings

### Option A: Using NameCheap's DNS Servers (Recommended)

If your domain is using NameCheap's DNS servers (default), the records you just added will work immediately after propagation.

**Check your DNS servers:**
- In NameCheap domain management, look for **"Nameservers"**
- Should show: `dns1.registrar-servers.com` and `dns2.registrar-servers.com` (or similar NameCheap nameservers)

### Option B: Using Custom DNS Servers

If your domain is using custom DNS servers (like DigitalOcean's), you need to add the records in **both places**:

1. **NameCheap** (for domain registration)
2. **DigitalOcean DNS** (where your nameservers point)

**To check:** Look at your domain's nameservers in NameCheap. If they point to DigitalOcean, add records there instead (see `CREATE_SUBDOMAINS_DNS.md`).

---

## Wait for DNS Propagation

**Time Required:** 5-15 minutes (sometimes up to 30 minutes)

DNS changes take time to propagate across the internet. Wait before testing.

**Note:** NameCheap DNS propagation is usually faster (5-15 minutes) compared to other providers.

---

## Verify DNS is Working

### On Windows (PowerShell):

```powershell
# Check Rider subdomain
Resolve-DnsName rider.globapp.app

# Check Driver subdomain
Resolve-DnsName driver.globapp.app

# Check Admin subdomain
Resolve-DnsName admin.globapp.app
```

**Expected Output:** Should show your Droplet IP address in the results.

**Example Output:**
```
Name           : rider.globapp.app
Type           : A
TTL            : 1800
Section        : Answer
NameHost       : 123.456.789.012  ← Your Droplet IP
```

### On Mac/Linux:

```bash
nslookup rider.globapp.app
nslookup driver.globapp.app
nslookup admin.globapp.app
```

**Expected Output:** Should show your Droplet IP address.

### Online DNS Checker:

You can also use online tools:
- https://www.whatsmydns.net/#A/rider.globapp.app
- https://dnschecker.org/#A/rider.globapp.app

---

## Visual Guide - NameCheap Interface

### NameCheap Advanced DNS Page:

```
┌─────────────────────────────────────────────────┐
│  globapp.app - Advanced DNS                      │
├─────────────────────────────────────────────────┤
│  [Add New Record]                                │
├─────────────────────────────────────────────────┤
│  Type      │ Host │ Value         │ TTL         │
├─────────────────────────────────────────────────┤
│  A Record  │ @    │ 123.45.67.89  │ Automatic   │
│  A Record  │ www  │ 123.45.67.89  │ Automatic   │
│  A Record  │ rider│ 123.45.67.89 │ Automatic   │ ← You add this
│  A Record  │ driver│ 123.45.67.89│ Automatic   │ ← You add this
│  A Record  │ admin│ 123.45.67.89 │ Automatic   │ ← You add this
│  ...       │ ...  │ ...           │ ...         │
└─────────────────────────────────────────────────┘
```

---

## Finding Your Droplet IP Address

If you don't know your DigitalOcean Droplet IP:

1. **Log into DigitalOcean**
   - Go to: https://cloud.digitalocean.com
2. **Navigate to Droplets**
   - Click **"Droplets"** in the left sidebar
3. **Find Your Droplet**
   - Click on your Droplet name
4. **Copy IPv4 Address**
   - Look for **"IPv4"** section
   - Copy the IP address (e.g., `123.456.789.012`)

---

## Troubleshooting

### DNS Not Resolving After 30 Minutes

**Check:**
1. Verify records are saved in NameCheap Advanced DNS
2. Check hostname spelling (rider, driver, admin - lowercase, no trailing dot)
3. Verify IP address is correct
4. Check if domain is using NameCheap nameservers or custom ones
5. Try clearing DNS cache:
   ```powershell
   # Windows PowerShell (as Administrator)
   ipconfig /flushdns
   ```

### Wrong IP Address

**Fix:**
1. In NameCheap Advanced DNS, find the record
2. Click **"Edit"** (pencil icon) next to the record
3. Update the **Value** field with correct IP
4. Click **"Save"** (checkmark)
5. Wait 5-15 minutes for propagation

### Can't Find "Advanced DNS" Tab

**Solution:**
- Make sure you clicked **"Manage"** on the domain
- Look for tabs: **"Domain"**, **"Advanced DNS"**, **"WhoisGuard"**, etc.
- **Advanced DNS** might be under a different name like **"DNS"** or **"DNS Management"**

### Domain Using Custom Nameservers

**If your domain uses DigitalOcean nameservers:**

You need to add records in **DigitalOcean DNS**, not NameCheap:

1. Check nameservers in NameCheap:
   - Domain List → Manage → Nameservers
   - If it shows DigitalOcean nameservers (like `ns1.digitalocean.com`), use DigitalOcean DNS instead
2. Follow: `CREATE_SUBDOMAINS_DNS.md` (DigitalOcean DNS guide)

**To switch to NameCheap DNS:**
1. In NameCheap → Domain → Nameservers
2. Select **"Namecheap BasicDNS"** or **"Namecheap Web Hosting DNS"**
3. Save changes
4. Wait 24-48 hours for nameserver change to propagate
5. Then add DNS records in NameCheap

---

## Important Notes

### What is an A Record?

- **A Record** = Points a domain name to an IP address
- **Host** = The subdomain part (rider, driver, admin)
- **Value** = Your server's IP address (Droplet IP)
- **TTL** = Time To Live (how long DNS servers cache the record)

### Why All Three Point to Same IP?

All three subdomains point to the same Droplet because:
- Your Droplet runs Nginx (web server)
- Nginx routes traffic based on domain name
- Each subdomain serves different files/folders

### NameCheap vs DigitalOcean DNS

**If domain uses NameCheap DNS:**
- Add records in NameCheap (this guide)
- Records take 5-15 minutes to propagate

**If domain uses DigitalOcean DNS:**
- Add records in DigitalOcean
- See: `CREATE_SUBDOMAINS_DNS.md`

**How to check:** Look at your domain's nameservers in NameCheap.

---

## Next Steps After DNS Setup

Once DNS is working (verified with nslookup):

1. ✅ **DNS Records Created** ← You are here
2. ⏭️ **Build Apps** - Run `npm run build` in each app folder
3. ⏭️ **Deploy to Droplet** - Upload built files to server
4. ⏭️ **Configure Nginx** - Set up web server for each subdomain
5. ⏭️ **Set Up SSL** - Install HTTPS certificates
6. ⏭️ **Update Backend CORS** - Allow subdomains in backend config

**See:** `SUBDOMAIN_SETUP_GUIDE.md` for complete deployment instructions.

---

## Quick Reference

**NameCheap Login:**
```
https://www.namecheap.com
```

**Domain List:**
```
https://www.namecheap.com/myaccount/domainlist/
```

**Records to Create:**
- `rider` → A Record → Your Droplet IP
- `driver` → A Record → Your Droplet IP
- `admin` → A Record → Your Droplet IP

**Verification Command:**
```powershell
Resolve-DnsName rider.globapp.app
```

**Wait Time:** 5-15 minutes for DNS propagation

**Online DNS Checker:**
```
https://www.whatsmydns.net/#A/rider.globapp.app
```

---

## Checklist

- [ ] Logged into NameCheap
- [ ] Navigated to `globapp.app` domain management
- [ ] Opened **"Advanced DNS"** tab
- [ ] Created A record for `rider` subdomain
- [ ] Created A record for `driver` subdomain
- [ ] Created A record for `admin` subdomain
- [ ] Verified all three records show correct IP
- [ ] Confirmed domain is using NameCheap nameservers (or custom)
- [ ] Waited 5-15 minutes for DNS propagation
- [ ] Verified DNS with `Resolve-DnsName` command
- [ ] All three subdomains resolve to Droplet IP

---

## ✅ Success!

Once DNS verification works, your subdomains are ready for deployment!

**Next:** Follow `SUBDOMAIN_SETUP_GUIDE.md` Part 2 (Build Apps) and beyond.

---

## Need Help?

**NameCheap Support:**
- Live Chat: Available in NameCheap dashboard
- Knowledge Base: https://www.namecheap.com/support/knowledgebase/
- Support Email: support@namecheap.com

**Common Issues:**
- Can't find Advanced DNS → Look for "DNS" or "DNS Management" tab
- Records not saving → Make sure you click the checkmark/save button
- DNS not working → Check if domain uses NameCheap or custom nameservers




