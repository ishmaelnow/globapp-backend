# Commands to Run on Your Droplet

## Step 1: Copy Config File from Cursor to Droplet

**On your Cursor machine (PowerShell):**

```powershell
# Make sure you're in the project folder
cd C:\Users\koshi\cursor-apps\flask-react-project

# Copy file to Droplet (replace YOUR_DROPLET_IP)
scp complete_nginx_config.conf root@YOUR_DROPLET_IP:/tmp/nginx_new.conf
```

**Or if you use a different user:**
```powershell
scp complete_nginx_config.conf ishmael@YOUR_DROPLET_IP:/tmp/nginx_new.conf
```

---

## Step 2: SSH to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

---

## Step 3: Run These Commands on Droplet

**Copy and paste these commands one by one:**

```bash
# 1. Backup current config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 2. Replace with new config
sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default

# 3. Test configuration
sudo nginx -t

# 4. Reload nginx (only if test passed!)
sudo systemctl reload nginx
```

---

## All Commands Together (Copy-Paste)

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup && \
sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default && \
sudo nginx -t && \
sudo systemctl reload nginx
```

---

## What Each Command Does

1. **Backup**: Creates a backup of your current config (safety net)
2. **Replace**: Copies the new config file to replace the old one
3. **Test**: Checks if the config syntax is correct (won't break anything)
4. **Reload**: Applies the new config (only runs if test passes)

---

## If Something Goes Wrong

**Restore from backup:**
```bash
sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Verify It Worked

```bash
# Test backend
curl https://globapp.app/api/v1/health

# Test frontend
curl https://globapp.app/
```

---

## Quick Reference

**File locations:**
- New config: `/tmp/nginx_new.conf` (after SCP)
- Current config: `/etc/nginx/sites-available/default`
- Backup: `/etc/nginx/sites-available/default.backup`

**Commands:**
- Backup: `sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup`
- Replace: `sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default`
- Test: `sudo nginx -t`
- Reload: `sudo systemctl reload nginx`




