# How to Create Subdomains - DNS Setup Guide

**Quick Guide:** Set up DNS records for three subdomains in DigitalOcean.

**Subdomains to create:**
- `rider.globapp.app`
- `driver.globapp.app`
- `admin.globapp.app`

---

## Step-by-Step Instructions

### Step 1: Log into DigitalOcean

1. Go to: https://cloud.digitalocean.com
2. Sign in with your account

### Step 2: Navigate to DNS Settings

1. Click **"Networking"** in the left sidebar
2. Click **"Domains"**
3. Find and click on **`globapp.app`** (your domain)

### Step 3: Add First Subdomain (Rider)

1. Click **"Create new record"** or **"Add record"** button
2. Fill in the form:
   - **Type:** Select `A` from dropdown
   - **Hostname:** Type `rider` (without quotes)
   - **Value:** Type your Droplet IP address (e.g., `123.456.789.012`)
   - **TTL:** Leave default (`3600`) or select `3600`
3. Click **"Create Record"**

**Result:** `rider.globapp.app` DNS record created

### Step 4: Add Second Subdomain (Driver)

1. Click **"Create new record"** again
2. Fill in the form:
   - **Type:** `A`
   - **Hostname:** `driver`
   - **Value:** Same Droplet IP address as above
   - **TTL:** `3600`
3. Click **"Create Record"**

**Result:** `driver.globapp.app` DNS record created

### Step 5: Add Third Subdomain (Admin)

1. Click **"Create new record"** again
2. Fill in the form:
   - **Type:** `A`
   - **Hostname:** `admin`
   - **Value:** Same Droplet IP address as above
   - **TTL:** `3600`
3. Click **"Create Record"**

**Result:** `admin.globapp.app` DNS record created

---

## Verify DNS Records

After creating all three records, your DNS table should show:

| Type | Hostname | Value | TTL |
|------|----------|-------|-----|
| A | `rider` | `YOUR_DROPLET_IP` | 3600 |
| A | `driver` | `YOUR_DROPLET_IP` | 3600 |
| A | `admin` | `YOUR_DROPLET_IP` | 3600 |

**Note:** Replace `YOUR_DROPLET_IP` with your actual Droplet IP address.

---

## Wait for DNS Propagation

**Time Required:** 5-15 minutes (sometimes up to 30 minutes)

DNS changes take time to propagate across the internet. Wait before testing.

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

### On Mac/Linux:

```bash
nslookup rider.globapp.app
nslookup driver.globapp.app
nslookup admin.globapp.app
```

**Expected Output:** Should show your Droplet IP address.

---

## Visual Guide

### DigitalOcean DNS Interface:

```
┌─────────────────────────────────────────┐
│  globapp.app                            │
├─────────────────────────────────────────┤
│  [Create new record]                    │
├─────────────────────────────────────────┤
│  Type │ Hostname │ Value      │ TTL    │
├─────────────────────────────────────────┤
│  A    │ rider    │ 123.45.67  │ 3600   │ ← You add this
│  A    │ driver   │ 123.45.67  │ 3600   │ ← You add this
│  A    │ admin    │ 123.45.67  │ 3600   │ ← You add this
│  ...  │ ...      │ ...        │ ...    │
└─────────────────────────────────────────┘
```

---

## Important Notes

### What is an A Record?

- **A Record** = Points a domain name to an IP address
- **Hostname** = The subdomain part (rider, driver, admin)
- **Value** = Your server's IP address (Droplet IP)

### Why All Three Point to Same IP?

All three subdomains point to the same Droplet because:
- Your Droplet runs Nginx (web server)
- Nginx routes traffic based on domain name
- Each subdomain serves different files/folders

### Finding Your Droplet IP

If you don't know your Droplet IP:
1. Go to DigitalOcean → **Droplets**
2. Click on your Droplet
3. Copy the **IPv4** address shown

---

## Troubleshooting

### DNS Not Resolving After 30 Minutes

**Check:**
1. Verify records are saved in DigitalOcean dashboard
2. Check hostname spelling (rider, driver, admin - lowercase)
3. Verify IP address is correct
4. Try clearing DNS cache:
   ```powershell
   # Windows PowerShell (as Administrator)
   ipconfig /flushdns
   ```

### Wrong IP Address

**Fix:**
1. Click on the DNS record in DigitalOcean
2. Click **"Edit"**
3. Update the **Value** field with correct IP
4. Save changes
5. Wait 5-15 minutes for propagation

### Can't See "Create new record" Button

**Solution:**
- Make sure you clicked on the domain name (`globapp.app`)
- Look for **"Add record"** or **"+"** button
- Check you're in the **"Records"** tab

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

**DigitalOcean DNS URL:**
```
https://cloud.digitalocean.com/networking/domains
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

---

## Checklist

- [ ] Logged into DigitalOcean
- [ ] Navigated to `globapp.app` domain settings
- [ ] Created A record for `rider` subdomain
- [ ] Created A record for `driver` subdomain
- [ ] Created A record for `admin` subdomain
- [ ] Verified all three records show correct IP
- [ ] Waited 5-15 minutes for DNS propagation
- [ ] Verified DNS with `Resolve-DnsName` command
- [ ] All three subdomains resolve to Droplet IP

---

## ✅ Success!

Once DNS verification works, your subdomains are ready for deployment!

**Next:** Follow `SUBDOMAIN_SETUP_GUIDE.md` Part 2 (Build Apps) and beyond.




