# Fix Nginx Error: Missing globapp Config

## The Problem

Nginx is looking for `/etc/nginx/sites-enabled/globapp` but it doesn't exist.

## Solution: Check and Fix

### Step 1: See What's in sites-enabled

```bash
ls -la /etc/nginx/sites-enabled/
```

### Step 2: Remove the Broken Symlink (if it exists)

```bash
sudo rm /etc/nginx/sites-enabled/globapp
```

### Step 3: Make Sure default is Enabled

```bash
# Check if default is enabled
ls -la /etc/nginx/sites-enabled/default

# If it doesn't exist, enable it
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
```

### Step 4: Test Again

```bash
sudo nginx -t
```

---

## Quick Fix (All Commands)

```bash
# Remove broken globapp symlink
sudo rm /etc/nginx/sites-enabled/globapp

# Ensure default is enabled
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Test
sudo nginx -t
```

---

## What Happened

You probably had a symlink to `/etc/nginx/sites-available/globapp` that got deleted or never existed. Nginx tries to load everything in `sites-enabled/`, so it fails when it can't find the file.

The fix is to remove the broken symlink and make sure `default` is enabled.




