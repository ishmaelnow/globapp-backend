# How to Find and Access Your Existing Nginx Config

## Step 1: SSH into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

---

## Step 2: List All Nginx Config Files

```bash
# See all available configs
ls -la /etc/nginx/sites-available/
```

**Common names you might see:**
- `default` (default Nginx config)
- `globapp` (your app config)
- `globapp-backend` (if you named it that)
- Or something similar

---

## Step 3: See Which Config is Currently Enabled

```bash
# See which configs are active/enabled
ls -la /etc/nginx/sites-enabled/
```

The files in `sites-enabled/` are symlinks to files in `sites-available/`.

---

## Step 4: Check What Domain Your Config Uses

```bash
# Search for your domain in config files
grep -r "globapp.app" /etc/nginx/sites-available/
```

This will show you which file contains your domain.

---

## Step 5: View Your Current Config

Once you find the file name, view it:

```bash
# Replace 'globapp' with your actual filename
cat /etc/nginx/sites-available/globapp

# Or if it's named 'default':
cat /etc/nginx/sites-available/default
```

---

## Step 6: Edit Your Config

```bash
# Edit with nano (easiest)
sudo nano /etc/nginx/sites-available/globapp

# Or edit with vi/vim
sudo vi /etc/nginx/sites-available/globapp

# Or edit with vim
sudo vim /etc/nginx/sites-available/globapp
```

---

## Quick Commands to Find It

### Option 1: List and Check
```bash
# List all configs
ls /etc/nginx/sites-available/

# Check each one for your domain
grep "globapp.app" /etc/nginx/sites-available/*
```

### Option 2: Check Enabled Configs
```bash
# See what's actually enabled
ls -la /etc/nginx/sites-enabled/

# View the enabled config (it's a symlink, but you can read it)
cat /etc/nginx/sites-enabled/globapp
# (or whatever filename shows up)
```

### Option 3: Check Nginx Main Config
```bash
# Sometimes configs are included in main config
cat /etc/nginx/nginx.conf | grep include
```

---

## Most Likely Scenarios

### Scenario A: You Have a Custom Config
```bash
# Your config is probably named:
/etc/nginx/sites-available/globapp

# To edit:
sudo nano /etc/nginx/sites-available/globapp
```

### Scenario B: You're Using Default Config
```bash
# Your config might be:
/etc/nginx/sites-available/default

# To edit:
sudo nano /etc/nginx/sites-available/default
```

### Scenario C: Config is in Main File
```bash
# Check main config
sudo nano /etc/nginx/nginx.conf
```

---

## How to Identify Your Config

Run these commands to find it:

```bash
# 1. List all configs
echo "=== Available configs ==="
ls /etc/nginx/sites-available/

# 2. List enabled configs
echo "=== Enabled configs ==="
ls /etc/nginx/sites-enabled/

# 3. Search for your domain
echo "=== Configs with your domain ==="
grep -l "globapp.app" /etc/nginx/sites-available/* 2>/dev/null

# 4. Check what's actually serving your site
echo "=== Active server blocks ==="
sudo nginx -T 2>/dev/null | grep -A 10 "server_name globapp.app"
```

---

## Once You Find It

### View the File:
```bash
sudo cat /etc/nginx/sites-available/YOUR_FILENAME
```

### Edit the File:
```bash
sudo nano /etc/nginx/sites-available/YOUR_FILENAME
```

### After Editing:
```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

---

## If You Can't Find It

### Check All Nginx Files:
```bash
# Search entire nginx directory
find /etc/nginx -name "*.conf" -o -name "*globapp*"

# Or search for your backend proxy_pass
grep -r "proxy_pass.*8000" /etc/nginx/
```

---

## Quick One-Liner to Find It

```bash
# This will show you which file has your backend config
grep -r "proxy_pass.*127.0.0.1:8000" /etc/nginx/sites-available/ /etc/nginx/conf.d/ 2>/dev/null
```

This searches for your backend proxy configuration and shows you the file!

---

## Common Locations

Nginx configs are usually in:
- `/etc/nginx/sites-available/` - Available configs
- `/etc/nginx/sites-enabled/` - Enabled configs (symlinks)
- `/etc/nginx/conf.d/` - Alternative location
- `/etc/nginx/nginx.conf` - Main config file

---

## After You Find It

1. **View it:**
   ```bash
   sudo cat /etc/nginx/sites-available/YOUR_FILE
   ```

2. **Edit it:**
   ```bash
   sudo nano /etc/nginx/sites-available/YOUR_FILE
   ```

3. **Add frontend location block** (see NGINX_CONFIG_EXPLANATION.md)

4. **Test and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Need Help?

Run this command and share the output:

```bash
echo "=== Available ===" && ls /etc/nginx/sites-available/ && echo -e "\n=== Enabled ===" && ls /etc/nginx/sites-enabled/ && echo -e "\n=== Searching for globapp ===" && grep -r "globapp" /etc/nginx/sites-available/ 2>/dev/null
```

This will show you exactly what config files exist and which one has your domain!




