# Subdomain Setup Guide - NameCheap Domain

**Your Domain:** `globapp.app` (registered with NameCheap)

**Goal:** Create three subdomains:
- `rider.globapp.app`
- `driver.globapp.app`
- `admin.globapp.app`

---

## ⚠️ Important: Where to Add DNS Records

**It depends on where your DNS nameservers point:**

- **If using NameCheap DNS** → Add records in **NameCheap** ✅
- **If using DigitalOcean DNS** → Add records in **DigitalOcean** ✅

**You only need to add records in ONE place** (wherever your nameservers point).

---

## Step 1: Check Where Your DNS is Managed (2 minutes)

### Option A: Check in NameCheap

1. **Log into NameCheap**
   - Go to: https://www.namecheap.com
   - Sign in

2. **Go to Domain List**
   - Click **"Domain List"** in left sidebar
   - Or: https://www.namecheap.com/myaccount/domainlist/

3. **Open Domain Management**
   - Find **`globapp.app`**
   - Click **"Manage"**

4. **Check Nameservers**
   - Look for **"Nameservers"** section
   - You'll see one of two options:

   **Scenario 1: NameCheap DNS**
   ```
   Nameservers:
   - dns1.registrar-servers.com
   - dns2.registrar-servers.com
   ```
   → **Use NameCheap DNS** (follow Part 2 below)

   **Scenario 2: DigitalOcean DNS**
   ```
   Nameservers:
   - ns1.digitalocean.com
   - ns2.digitalocean.com
   - ns3.digitalocean.com
   ```
   → **Use DigitalOcean DNS** (follow Part 3 below)

---

## Part 2: If Using NameCheap DNS

**Use this section if your nameservers point to NameCheap.**

### Step 2.1: Access NameCheap Advanced DNS

1. In NameCheap domain management, click **"Advanced DNS"** tab
2. Scroll to **"Host Records"** section

### Step 2.2: Add Rider Subdomain

1. Click **"Add New Record"**
2. Fill in:
   - **Type:** `A Record`
   - **Host:** `rider` (no dot, lowercase)
   - **Value:** Your DigitalOcean Droplet IP (e.g., `123.456.789.012`)
   - **TTL:** `Automatic` or `30 min`
3. Click **checkmark (✓)** to save

### Step 2.3: Add Driver Subdomain

1. Click **"Add New Record"**
2. Fill in:
   - **Type:** `A Record`
   - **Host:** `driver`
   - **Value:** Same Droplet IP
   - **TTL:** `Automatic`
3. Click **checkmark (✓)** to save

### Step 2.4: Add Admin Subdomain

1. Click **"Add New Record"**
2. Fill in:
   - **Type:** `A Record`
   - **Host:** `admin`
   - **Value:** Same Droplet IP
   - **TTL:** `Automatic`
3. Click **checkmark (✓)** to save

### Step 2.5: Verify Records

Your Host Records should show:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `rider` | `YOUR_DROPLET_IP` | Automatic |
| A Record | `driver` | `YOUR_DROPLET_IP` | Automatic |
| A Record | `admin` | `YOUR_DROPLET_IP` | Automatic |

**✅ Done!** Skip to **Step 4: Wait and Verify** below.

---

## Part 3: If Using DigitalOcean DNS

**Use this section if your nameservers point to DigitalOcean.**

### Step 3.1: Access DigitalOcean DNS

1. **Log into DigitalOcean**
   - Go to: https://cloud.digitalocean.com
   - Sign in

2. **Navigate to DNS**
   - Click **"Networking"** in left sidebar
   - Click **"Domains"**
   - Click on **`globapp.app`**

### Step 3.2: Add Rider Subdomain

1. Click **"Create new record"** or **"Add record"**
2. Fill in:
   - **Type:** `A`
   - **Hostname:** `rider`
   - **Value:** Your Droplet IP address
   - **TTL:** `3600`
3. Click **"Create Record"**

### Step 3.3: Add Driver Subdomain

1. Click **"Create new record"**
2. Fill in:
   - **Type:** `A`
   - **Hostname:** `driver`
   - **Value:** Same Droplet IP
   - **TTL:** `3600`
3. Click **"Create Record"**

### Step 3.4: Add Admin Subdomain

1. Click **"Create new record"**
2. Fill in:
   - **Type:** `A`
   - **Hostname:** `admin`
   - **Value:** Same Droplet IP
   - **TTL:** `3600`
3. Click **"Create Record"**

### Step 3.5: Verify Records

Your DNS table should show:

| Type | Hostname | Value | TTL |
|------|----------|-------|-----|
| A | `rider` | `YOUR_DROPLET_IP` | 3600 |
| A | `driver` | `YOUR_DROPLET_IP` | 3600 |
| A | `admin` | `YOUR_DROPLET_IP` | 3600 |

**✅ Done!** Continue to **Step 4** below.

---

## Step 4: Wait for DNS Propagation

**Time Required:** 5-15 minutes (sometimes up to 30 minutes)

DNS changes take time to propagate. Wait before testing.

---

## Step 5: Verify DNS is Working

### On Windows (PowerShell):

```powershell
# Check Rider subdomain
Resolve-DnsName rider.globapp.app

# Check Driver subdomain
Resolve-DnsName driver.globapp.app

# Check Admin subdomain
Resolve-DnsName admin.globapp.app
```

**Expected Output:** Should show your Droplet IP address.

**Example:**
```
Name           : rider.globapp.app
Type           : A
TTL            : 1800
Section        : Answer
NameHost       : 123.456.789.012  ← Your Droplet IP
```

### Online DNS Checker:

Visit these URLs to check globally:
- https://www.whatsmydns.net/#A/rider.globapp.app
- https://dnschecker.org/#A/rider.globapp.app

**Expected:** Should show your Droplet IP in most locations.

---

## Finding Your Droplet IP

If you don't know your DigitalOcean Droplet IP:

1. **Log into DigitalOcean**
   - Go to: https://cloud.digitalocean.com
2. **Go to Droplets**
   - Click **"Droplets"** in left sidebar
3. **Find Your Droplet**
   - Click on your Droplet name
4. **Copy IPv4 Address**
   - Look for **"IPv4"** section
   - Copy the IP address (e.g., `123.456.789.012`)

---

## Common Questions

### Q: Do I need to add records in both NameCheap AND DigitalOcean?

**A: No!** Only add records where your nameservers point:
- If nameservers = NameCheap → Add in NameCheap only
- If nameservers = DigitalOcean → Add in DigitalOcean only

### Q: How do I know which one to use?

**A:** Check your nameservers in NameCheap:
- NameCheap nameservers → Use NameCheap DNS
- DigitalOcean nameservers → Use DigitalOcean DNS

### Q: Can I switch from NameCheap DNS to DigitalOcean DNS?

**A: Yes**, but it takes 24-48 hours:

1. In NameCheap → Domain → Nameservers
2. Change to DigitalOcean nameservers:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
3. Wait 24-48 hours for propagation
4. Then add DNS records in DigitalOcean

**Note:** Only switch if you want to manage DNS in DigitalOcean. If NameCheap DNS works, keep using it!

### Q: Why do all three subdomains point to the same IP?

**A:** Because:
- Your Droplet runs Nginx (web server)
- Nginx routes traffic based on domain name
- Each subdomain serves different files/folders
- All hosted on the same server (Droplet)

---

## Troubleshooting

### DNS Not Resolving

**Check:**
1. Verify records are saved (check the DNS interface)
2. Check hostname spelling (rider, driver, admin - lowercase)
3. Verify IP address is correct
4. Wait longer (up to 30 minutes)
5. Clear DNS cache:
   ```powershell
   # Windows PowerShell (as Administrator)
   ipconfig /flushdns
   ```

### Wrong IP Address

**Fix:**
1. Find the DNS record in NameCheap or DigitalOcean
2. Click **"Edit"** (pencil icon)
3. Update the **Value** field with correct IP
4. Save changes
5. Wait 5-15 minutes

### Can't Find Where to Add Records

**NameCheap:**
- Look for **"Advanced DNS"** tab
- Scroll to **"Host Records"** section

**DigitalOcean:**
- Go to **Networking** → **Domains** → Click domain name
- Look for **"Create new record"** button

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

### Check Nameservers:
**NameCheap:** Domain List → Manage → Nameservers section

### Add Records:
**NameCheap:** Advanced DNS → Host Records → Add New Record
**DigitalOcean:** Networking → Domains → globapp.app → Create new record

### Records to Create:
- `rider` → A Record → Your Droplet IP
- `driver` → A Record → Your Droplet IP
- `admin` → A Record → Your Droplet IP

### Verify DNS:
```powershell
Resolve-DnsName rider.globapp.app
```

### Wait Time:
5-15 minutes for DNS propagation

---

## Checklist

- [ ] Checked nameservers in NameCheap
- [ ] Determined if using NameCheap DNS or DigitalOcean DNS
- [ ] Added A record for `rider` subdomain (in correct location)
- [ ] Added A record for `driver` subdomain (in correct location)
- [ ] Added A record for `admin` subdomain (in correct location)
- [ ] Verified all three records show correct Droplet IP
- [ ] Waited 5-15 minutes for DNS propagation
- [ ] Verified DNS with `Resolve-DnsName` command
- [ ] All three subdomains resolve to Droplet IP

---

## ✅ Success!

Once DNS verification works, your subdomains are ready for deployment!

**Next:** Follow `SUBDOMAIN_SETUP_GUIDE.md` Part 2 (Build Apps) and beyond.

---

## Summary

**Key Point:** Your domain is registered with NameCheap, but DNS management depends on where your nameservers point:

- **NameCheap nameservers** → Add DNS records in NameCheap
- **DigitalOcean nameservers** → Add DNS records in DigitalOcean

**You only need to add records in ONE place** - wherever your nameservers are pointing!




