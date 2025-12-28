# Complete Nginx Config Replacement - Step by Step

## What Changed

✅ **HTTPS server block:**
- Changed `root /var/www/html;` → `root /var/www/globapp/frontend;`
- Changed `location /` to serve React frontend

✅ **HTTP default server block:**
- Added frontend `location /` block (for IP access)

✅ **Everything else unchanged:**
- All `/api/` blocks preserved
- Rate limiting preserved
- SSL configuration preserved
- All proxy settings preserved

---

## Step 1: Backup Your Current Config

```bash
# Create backup
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Verify backup
ls -la /etc/nginx/sites-available/default.backup
```

---

## Step 2: Copy Complete Config to Droplet

**Option A: Copy from file I created**

On your **Cursor machine**, the complete config is in `complete_nginx_config.conf`.

You can:
1. Copy the contents
2. SSH to Droplet
3. Paste into the file

**Option B: Direct replacement on Droplet**

On your **Droplet**:

```bash
# Edit the file
sudo nano /etc/nginx/sites-available/default
```

**Delete everything** (Ctrl+K to delete lines, or select all and delete)

**Paste the complete config** from `complete_nginx_config.conf`

---

## Step 3: Save and Exit

1. Press `Ctrl + X`
2. Press `Y` to confirm
3. Press `Enter` to save

---

## Step 4: Test Configuration

```bash
# Test syntax
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If errors:**
- Restore backup: `sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default`
- Check the error message and fix

---

## Step 5: Reload Nginx

```bash
# Only if test passed!
sudo systemctl reload nginx
```

---

## Step 6: Verify

```bash
# Test backend
curl https://globapp.app/api/v1/health

# Test frontend
curl https://globapp.app/
```

---

## Complete Config File

The complete file is saved as `complete_nginx_config.conf` in your project.

**Key changes:**
- Line ~50: `root /var/www/globapp/frontend;` (was `/var/www/html`)
- Last location block: Updated to serve React with `try_files $uri $uri/ /index.html;`

**Everything else is identical to your original config!**

---

## Safety

✅ Backup created - can restore anytime
✅ Test before reload - won't break if syntax is wrong
✅ All your settings preserved - only frontend added

You're safe to replace! 🎯




