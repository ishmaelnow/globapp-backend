# Find All Duplicate Server Blocks

## Check All Config Files

**The duplicates might be in separate files. Check:**

```bash
# List all enabled config files
ls -la /etc/nginx/sites-enabled/

# Check each file for the subdomains
sudo grep -l "rider.globapp.app" /etc/nginx/sites-enabled/*
sudo grep -l "driver.globapp.app" /etc/nginx/sites-enabled/*
sudo grep -l "admin.globapp.app" /etc/nginx/sites-enabled/*

# Check if there are separate files for each subdomain
ls -la /etc/nginx/sites-enabled/ | grep -E "(rider|driver|admin)"
```

## Remove Separate Config Files

**If there are separate files (like rider.globapp.app, driver.globapp.app, admin.globapp.app), remove them:**

```bash
# Remove separate config files (they're duplicates)
sudo rm /etc/nginx/sites-enabled/rider.globapp.app 2>/dev/null
sudo rm /etc/nginx/sites-enabled/driver.globapp.app 2>/dev/null
sudo rm /etc/nginx/sites-enabled/admin.globapp.app 2>/dev/null

# Verify they're gone
ls -la /etc/nginx/sites-enabled/ | grep -E "(rider|driver|admin)"

# Test config (should have NO warnings now)
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## Complete Fix Command

**Run this to remove all duplicates:**

```bash
# List all enabled files
echo "=== All enabled config files ==="
ls -la /etc/nginx/sites-enabled/

# Remove separate subdomain files if they exist
echo "=== Removing duplicate files ==="
sudo rm -f /etc/nginx/sites-enabled/rider.globapp.app
sudo rm -f /etc/nginx/sites-enabled/driver.globapp.app
sudo rm -f /etc/nginx/sites-enabled/admin.globapp.app

# Verify only default remains (or check what's left)
echo "=== Remaining files ==="
ls -la /etc/nginx/sites-enabled/

# Test config
echo "=== Testing config ==="
sudo nginx -t

# If test passes with NO warnings, reload
if [ $? -eq 0 ]; then
    echo "=== Reloading Nginx ==="
    sudo systemctl reload nginx
    echo "Done! No duplicates."
else
    echo "Config test failed!"
fi
```



