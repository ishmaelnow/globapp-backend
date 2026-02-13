# Complete Domain Migration Guide: globapp.app → globapp.org

## 📚 Table of Contents
1. [Overview](#overview)
2. [Understanding the Problem](#understanding-the-problem)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Commands Reference](#commands-reference)
5. [Troubleshooting](#troubleshooting)

---

## Overview

**What we did:** Migrated all services from `globapp.app` to `globapp.org`

**Why:** The old domain (`globapp.app`) account was cancelled, causing DNS failures

**What was updated:**
- DNS records (Netlify)
- Backend server (FastAPI)
- Nginx web server configuration
- SSL certificates
- All frontend apps (rider, driver, admin)
- All mobile apps (rider-mobile-pwa, passenger-mobile-pwa)

---

## Understanding the Problem

### What is DNS?
**DNS (Domain Name System)** is like a phone book for the internet. When you type `globapp.org`, DNS tells your computer which server (IP address) to connect to.

**Example:**
- You type: `globapp.org`
- DNS looks up: `157.245.231.224`
- Your browser connects to that IP address

### What Happened?
1. **Old domain cancelled** → DNS stopped working
2. **Apps couldn't connect** → Network errors
3. **Solution:** Buy new domain (`globapp.org`) and point everything to it

### Architecture Overview

```
User's Browser/App
    ↓
DNS Lookup (globapp.org → 157.245.231.224)
    ↓
Nginx (Web Server) - Routes requests
    ↓
    ├─→ Frontend Apps (rider.globapp.org, driver.globapp.org, admin.globapp.org)
    └─→ Backend API (globapp.org/api/v1) → FastAPI (app.py)
```

---

## Step-by-Step Migration Process

### Phase 1: DNS Configuration (Netlify)

**What:** Point domain names to your server IP address

**Why:** Without DNS, nobody can find your server

**How:**

#### Step 1.1: Get Your Server IP Address
```bash
# On DigitalOcean dashboard:
# Go to Droplets → Click your droplet → Copy IPv4 address
# Your IP: 157.245.231.224
```

#### Step 1.2: Add DNS Records in Netlify

**What is an A Record?**
- **A Record** = Maps a domain name to an IP address
- Example: `globapp.org` → `157.245.231.224`

**Commands/Steps:**

1. **Log into Netlify:** https://app.netlify.com
2. **Go to:** Site → Domain management → DNS
3. **Delete old records** (if any pointing to Netlify)
4. **Add new A records:**

| Name | Type | Value | TTL |
|------|------|-------|-----|
| `@` (or blank) | A | `157.245.231.224` | 3600 |
| `rider` | A | `157.245.231.224` | 3600 |
| `driver` | A | `157.245.231.224` | 3600 |
| `admin` | A | `157.245.231.224` | 3600 |

**What each record does:**
- `@` = Root domain (`globapp.org`)
- `rider` = Subdomain (`rider.globapp.org`)
- `driver` = Subdomain (`driver.globapp.org`)
- `admin` = Subdomain (`admin.globapp.org`)

**Why same IP for all?**
- All subdomains point to the same server
- Nginx (web server) routes them to different apps based on domain name

#### Step 1.3: Wait for DNS Propagation

**What is DNS Propagation?**
- Time it takes for DNS changes to spread across the internet
- Usually 15 minutes to 2 hours

**How to check:**
```bash
# On your local machine (Windows PowerShell):
nslookup globapp.org
nslookup rider.globapp.org

# Expected output:
# Name:    globapp.org
# Address: 157.245.231.224
```

**If DNS not ready:**
- Wait longer (can take up to 48 hours, but usually faster)
- Check different DNS servers: https://dnschecker.org

---

### Phase 2: Backend Server Updates

**What:** Update FastAPI backend to accept requests from new domain

**Why:** Backend has CORS (Cross-Origin Resource Sharing) settings that whitelist allowed domains

**File:** `app.py`

#### Step 2.1: Update CORS Origins

**What is CORS?**
- Security feature that controls which websites can access your API
- Prevents unauthorized sites from making requests

**Before:**
```python
allow_origins=[
    "https://globapp.app",
    "https://rider.globapp.app",
    # ... etc
]
```

**After:**
```python
allow_origins=[
    "https://globapp.org",
    "https://rider.globapp.org",
    "https://driver.globapp.org",
    "https://admin.globapp.org",
]
```

**Command used:**
```bash
# We used search/replace in code editor, but you can also use sed:
# (This is just for reference - we did it manually in the file)
sed -i 's/globapp\.app/globapp.org/g' app.py
```

**What this does:**
- `sed` = Stream editor (text replacement tool)
- `-i` = Edit file in place
- `'s/globapp\.app/globapp.org/g'` = Replace all occurrences
  - `s/` = Substitute
  - `globapp\.app` = What to find (`.` escaped as `\.` for literal dot)
  - `globapp.org` = What to replace with
  - `g` = Global (all occurrences)
- `app.py` = File to edit

**Verification:**
```bash
# Check if changes were made:
grep "globapp.org" app.py
# Should show the new domains
```

---

### Phase 3: Nginx Configuration Updates

**What:** Update web server configuration to serve new domains

**Why:** Nginx needs to know which domains to accept and where to route them

**File:** `/etc/nginx/sites-enabled/default`

#### Step 3.1: Update Domain Names in Nginx Config

**What is Nginx?**
- Web server software that:
  - Listens for incoming requests
  - Routes them to correct apps
  - Handles SSL/HTTPS
  - Serves static files

**Before:**
```nginx
server_name rider.globapp.app;
ssl_certificate /etc/letsencrypt/live/globapp.app/fullchain.pem;
```

**After:**
```nginx
server_name rider.globapp.org;
ssl_certificate /etc/letsencrypt/live/globapp.org/fullchain.pem;
```

**Command used:**
```bash
# SSH into your server first:
ssh ishmael@157.245.231.224

# Update all occurrences:
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default
```

**Breaking down the command:**
- `sudo` = Run as administrator (needed for system files)
- `sed -i` = Edit file in place
- `'s/globapp\.app/globapp.org/g'` = Replace pattern
- `/etc/nginx/sites-enabled/default` = Nginx config file

**Why sudo?**
- System configuration files require administrator privileges
- `/etc/` directory is protected

#### Step 3.2: Test Nginx Configuration

**Before reloading, always test:**

```bash
# Test syntax (doesn't require DNS):
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**What this does:**
- Checks if config file syntax is correct
- Doesn't actually start nginx
- Safe to run anytime

**If test fails:**
- Fix syntax errors first
- Don't reload nginx until test passes

#### Step 3.3: Reload Nginx

```bash
# Reload configuration (doesn't restart, just applies changes):
sudo systemctl reload nginx

# Or restart completely:
sudo systemctl restart nginx
```

**Difference:**
- `reload` = Graceful (finishes current requests, then applies changes)
- `restart` = Immediate (stops and starts, may interrupt requests)

**Prefer `reload`** unless nginx isn't running.

---

### Phase 4: SSL Certificate Setup

**What:** Get HTTPS certificates for new domain

**Why:** HTTPS encrypts traffic and browsers require it

**What is SSL/TLS?**
- Encryption protocol for secure connections
- Certificates prove domain ownership
- Let's Encrypt provides free certificates

#### Step 4.1: Check Existing Certificates

```bash
# See what certificates exist:
sudo ls -la /etc/letsencrypt/live/

# Expected output:
# globapp.app/  (old domain)
# globapp.org/  (new domain, after we create it)
```

**What is `/etc/letsencrypt/live/`?**
- Directory where Let's Encrypt stores certificates
- Symlinks to actual certificate files in `archive/`

#### Step 4.2: Get New Certificates

**Important:** DNS must be propagated first!

**Check DNS first:**
```bash
nslookup globapp.org
# Should show: 157.245.231.224
```

**Get certificates:**
```bash
# Stop nginx (certbot needs port 80/443):
sudo systemctl stop nginx

# Get certificates for all domains:
sudo certbot certonly --standalone \
  -d globapp.org \
  -d www.globapp.org \
  -d rider.globapp.org \
  -d driver.globapp.org \
  -d admin.globapp.org

# Start nginx:
sudo systemctl start nginx
```

**Breaking down certbot command:**
- `certbot` = Let's Encrypt client tool
- `certonly` = Only get certificate, don't modify nginx config
- `--standalone` = Use standalone mode (certbot runs its own web server)
- `-d` = Domain name (repeat for each domain)

**Why stop nginx?**
- Certbot needs to use port 80/443 to verify domain ownership
- Nginx is using those ports, so we stop it temporarily

**What certbot does:**
1. Verifies you own the domain (checks DNS)
2. Creates certificate files
3. Stores them in `/etc/letsencrypt/live/globapp.org/`

**If certbot fails:**
- Check DNS propagation (must be working)
- Check firewall (ports 80/443 must be open)
- Check domain spelling

#### Step 4.3: Update Nginx to Use New Certificates

**If nginx config already points to new domain:**
- Certificates should work automatically
- Just reload nginx: `sudo systemctl reload nginx`

**If nginx still points to old certificates:**
```bash
# Update certificate paths:
sudo sed -i 's/\/etc\/letsencrypt\/live\/globapp\.app/\/etc\/letsencrypt\/live\/globapp.org/g' /etc/nginx/sites-enabled/default

# Test and reload:
sudo nginx -t
sudo systemctl reload nginx
```

---

### Phase 5: Frontend Apps Updates

**What:** Update API URLs in all frontend apps

**Why:** Apps need to know where to send API requests

**Apps to update:**
1. `rider-app/`
2. `driver-app/`
3. `admin-app/`

#### Step 5.1: Update API Configuration Files

**File pattern:** `*/src/config/api.js`

**Before:**
```javascript
const DIGITALOCEAN_URL = 'https://globapp.app/api/v1';
```

**After:**
```javascript
const DIGITALOCEAN_URL = 'https://globapp.org/api/v1';
```

**Command used (for each app):**
```bash
# Rider app:
cd rider-app
sed -i 's/globapp\.app/globapp.org/g' src/config/api.js

# Driver app:
cd driver-app
sed -i 's/globapp\.app/globapp.org/g' src/config/api.js

# Admin app:
cd admin-app
sed -i 's/globapp\.app/globapp.org/g' src/config/api.js
```

**Other files that might need updating:**
```bash
# Check for any remaining references:
grep -r "globapp.app" rider-app/src/
grep -r "globapp.app" driver-app/src/
grep -r "globapp.app" admin-app/src/

# Update any found:
find rider-app/src -type f -exec sed -i 's/globapp\.app/globapp.org/g' {} \;
```

#### Step 5.2: Rebuild Frontend Apps

**Why rebuild?**
- Build process embeds API URLs into the code
- Old builds still have old URLs

**Commands:**
```bash
# Rider app:
cd rider-app
npm run build
# Output: rider-app/dist/

# Driver app:
cd driver-app
npm run build
# Output: driver-app/dist/

# Admin app:
cd admin-app
npm run build
# Output: admin-app/dist/
```

**What `npm run build` does:**
1. Compiles React code
2. Bundles JavaScript/CSS
3. Optimizes for production
4. Outputs to `dist/` folder

#### Step 5.3: Deploy to Server

**Copy built files to server:**

```bash
# From your local machine, copy to server:
scp -r rider-app/dist/* ishmael@157.245.231.224:/var/www/globapp/rider/
scp -r driver-app/dist/* ishmael@157.245.231.224:/var/www/globapp/driver/
scp -r admin-app/dist/* ishmael@157.245.231.224:/var/www/globapp/admin/
```

**Or SSH and copy:**
```bash
# SSH into server:
ssh ishmael@157.245.231.224

# Copy files (if you uploaded them):
sudo cp -r /path/to/rider-app/dist/* /var/www/globapp/rider/
sudo cp -r /path/to/driver-app/dist/* /var/www/globapp/driver/
sudo cp -r /path/to/admin-app/dist/* /var/www/globapp/admin/

# Set correct permissions:
sudo chown -R www-data:www-data /var/www/globapp/
```

---

### Phase 6: Mobile Apps Updates

**What:** Update API URLs in React Native/Expo apps

**Apps:**
1. `rider-mobile-pwa/`
2. `passenger-mobile-pwa/`

#### Step 6.1: Update API Configuration

**File:** `*/src/config/api.js`

**Before:**
```javascript
const DIGITALOCEAN_URL = 'https://globapp.app/api/v1';
```

**After:**
```javascript
const DIGITALOCEAN_URL = 'https://globapp.org/api/v1';
```

**Also update `app.json`:**
```json
{
  "extra": {
    "EXPO_PUBLIC_API_BASE_URL": "https://globapp.org/api/v1"
  }
}
```

#### Step 6.2: Rebuild Mobile Apps

**For React Native/Expo apps:**
```bash
# Rider mobile app:
cd rider-mobile-pwa
npm install  # Ensure dependencies are up to date
# Then build APK/IPA when ready

# Passenger mobile app:
cd passenger-mobile-pwa
npm install
# Then build APK/IPA when ready
```

**Note:** Mobile apps don't need immediate rebuild - they'll use new domain when rebuilt.

---

## Commands Reference

### DNS Commands

```bash
# Check DNS resolution:
nslookup globapp.org
nslookup rider.globapp.org

# Check from server:
dig globapp.org
host globapp.org
```

### Nginx Commands

```bash
# Test configuration:
sudo nginx -t

# Reload configuration:
sudo systemctl reload nginx

# Restart nginx:
sudo systemctl restart nginx

# Check nginx status:
sudo systemctl status nginx

# View nginx config:
sudo cat /etc/nginx/sites-enabled/default

# Search config:
sudo grep -n "globapp.org" /etc/nginx/sites-enabled/default
```

### SSL Certificate Commands

```bash
# List certificates:
sudo ls -la /etc/letsencrypt/live/

# Get new certificate:
sudo certbot certonly --standalone -d globapp.org -d rider.globapp.org

# Renew certificate:
sudo certbot renew

# Check certificate expiry:
sudo certbot certificates
```

### File Search/Replace Commands

```bash
# Search for old domain:
grep -r "globapp.app" /path/to/directory

# Replace in single file:
sed -i 's/globapp\.app/globapp.org/g' filename.js

# Replace in all files recursively:
find . -type f -name "*.js" -exec sed -i 's/globapp\.app/globapp.org/g' {} \;

# Replace with backup:
sed -i.bak 's/globapp\.app/globapp.org/g' filename.js
```

### Testing Commands

```bash
# Test HTTPS endpoint:
curl -I https://globapp.org/api/v1/health

# Test with verbose output:
curl -v https://globapp.org/api/v1/health

# Test specific subdomain:
curl -I https://rider.globapp.org

# Check SSL certificate:
openssl s_client -connect globapp.org:443 -servername globapp.org
```

---

## Troubleshooting

### Problem: DNS not resolving

**Symptoms:**
```
nslookup globapp.org
# Returns: Non-existent domain
```

**Solutions:**
1. Wait longer (DNS propagation takes time)
2. Check DNS records in Netlify (verify they're correct)
3. Check different DNS servers: https://dnschecker.org
4. Clear DNS cache: `ipconfig /flushdns` (Windows)

### Problem: Nginx won't start

**Symptoms:**
```
sudo systemctl start nginx
# Error: Job failed
```

**Solutions:**
1. Test config: `sudo nginx -t`
2. Check error logs: `sudo tail -f /var/log/nginx/error.log`
3. Common issues:
   - SSL certificate path wrong
   - Port already in use
   - Syntax error in config

### Problem: SSL certificate not found

**Symptoms:**
```
nginx: cannot load certificate "/etc/letsencrypt/live/globapp.org/fullchain.pem"
```

**Solutions:**
1. Check if certificate exists: `sudo ls -la /etc/letsencrypt/live/globapp.org/`
2. If missing, get certificate: `sudo certbot certonly --standalone -d globapp.org`
3. If exists but nginx can't read: `sudo chmod 755 /etc/letsencrypt/live/globapp.org/`

### Problem: CORS errors in browser

**Symptoms:**
```
Access to fetch at 'https://globapp.org/api/v1/...' from origin 'https://rider.globapp.org' 
has been blocked by CORS policy
```

**Solutions:**
1. Check backend CORS settings in `app.py`
2. Verify domain is in `allow_origins` list
3. Restart backend: `sudo systemctl restart your-backend-service`

### Problem: Apps still using old domain

**Symptoms:**
- Network errors
- Can't connect to API

**Solutions:**
1. Check API config files: `grep -r "globapp.app" src/`
2. Rebuild apps: `npm run build`
3. Clear browser cache
4. Check environment variables

---

## Key Concepts Explained

### What is a Domain Name?
- Human-readable address (e.g., `globapp.org`)
- Maps to IP address (e.g., `157.245.231.224`)
- Managed by DNS system

### What is DNS?
- **Domain Name System**
- Converts domain names to IP addresses
- Distributed database across internet

### What is an A Record?
- **Address Record**
- Maps domain name to IPv4 address
- Example: `globapp.org` → `157.245.231.224`

### What is a Subdomain?
- Part of main domain
- Example: `rider.globapp.org`
- `rider` = subdomain
- `globapp.org` = main domain

### What is Nginx?
- **Web server software**
- Handles HTTP/HTTPS requests
- Routes traffic to correct apps
- Serves static files

### What is SSL/TLS?
- **Secure Sockets Layer / Transport Layer Security**
- Encrypts data between browser and server
- HTTPS uses SSL/TLS

### What is Let's Encrypt?
- Free SSL certificate authority
- Provides certificates for HTTPS
- Certbot = tool to get certificates

### What is CORS?
- **Cross-Origin Resource Sharing**
- Security feature in browsers
- Controls which domains can access your API
- Backend must allow frontend domains

### What is a Build?
- Process of compiling source code
- Converts development code to production code
- Optimizes and bundles files
- Outputs deployable files

---

## Summary Checklist

**DNS Setup:**
- [ ] Added A records in Netlify
- [ ] Verified DNS propagation
- [ ] Tested with `nslookup`

**Backend Updates:**
- [ ] Updated CORS origins in `app.py`
- [ ] Restarted backend service

**Nginx Updates:**
- [ ] Updated domain names in config
- [ ] Updated SSL certificate paths
- [ ] Tested config (`nginx -t`)
- [ ] Reloaded nginx

**SSL Certificates:**
- [ ] Got new certificates with certbot
- [ ] Verified certificates exist
- [ ] Nginx using correct certificates

**Frontend Apps:**
- [ ] Updated API URLs in config files
- [ ] Rebuilt apps (`npm run build`)
- [ ] Deployed to server
- [ ] Tested in browser

**Mobile Apps:**
- [ ] Updated API URLs in config files
- [ ] Updated `app.json`
- [ ] Ready to rebuild when needed

**Testing:**
- [ ] All subdomains accessible via HTTPS
- [ ] API endpoints working
- [ ] No CORS errors
- [ ] Apps loading correctly

---

## Quick Reference: All Commands in Order

```bash
# 1. DNS (in Netlify dashboard - manual)
# Add A records pointing to 157.245.231.224

# 2. Check DNS propagation:
nslookup globapp.org

# 3. SSH into server:
ssh ishmael@157.245.231.224

# 4. Update backend CORS (local machine):
# Edit app.py - change globapp.app to globapp.org

# 5. Update nginx config (on server):
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 6. Get SSL certificates (on server):
sudo systemctl stop nginx
sudo certbot certonly --standalone -d globapp.org -d rider.globapp.org -d driver.globapp.org -d admin.globapp.org
sudo systemctl start nginx

# 7. Update frontend apps (local machine):
cd rider-app && sed -i 's/globapp\.app/globapp.org/g' src/config/api.js
cd driver-app && sed -i 's/globapp\.app/globapp.org/g' src/config/api.js
cd admin-app && sed -i 's/globapp\.app/globapp.org/g' src/config/api.js

# 8. Rebuild apps (local machine):
cd rider-app && npm run build
cd driver-app && npm run build
cd admin-app && npm run build

# 9. Deploy to server:
scp -r rider-app/dist/* ishmael@157.245.231.224:/var/www/globapp/rider/
scp -r driver-app/dist/* ishmael@157.245.231.224:/var/www/globapp/driver/
scp -r admin-app/dist/* ishmael@157.245.231.224:/var/www/globapp/admin/

# 10. Test:
curl -I https://globapp.org/api/v1/health
curl -I https://rider.globapp.org
```

---

## Learning Resources

**DNS:**
- https://www.cloudflare.com/learning/dns/what-is-dns/

**Nginx:**
- https://nginx.org/en/docs/
- https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04

**SSL/TLS:**
- https://www.cloudflare.com/learning/ssl/what-is-ssl/
- https://letsencrypt.org/how-it-works/

**CORS:**
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

**Linux Commands:**
- `sed`: https://www.gnu.org/software/sed/manual/sed.html
- `grep`: https://www.gnu.org/software/grep/manual/
- `systemctl`: https://www.freedesktop.org/software/systemd/man/systemctl.html

---

**Document Version:** 1.0  
**Last Updated:** January 16, 2026  
**Migration Date:** globapp.app → globapp.org











