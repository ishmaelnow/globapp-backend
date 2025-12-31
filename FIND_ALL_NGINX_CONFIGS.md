# Find ALL Nginx Config Locations

## The Problem
Duplicates are coming from somewhere other than `/etc/nginx/sites-enabled/default`. Nginx loads configs from multiple locations.

## Check ALL Config Locations

**Run these commands to find ALL duplicates:**

```bash
# 1. Check main nginx.conf for includes
sudo grep -E "include|server_name.*globapp" /etc/nginx/nginx.conf

# 2. Check conf.d directory
ls -la /etc/nginx/conf.d/
sudo grep -r "server_name.*globapp" /etc/nginx/conf.d/ 2>/dev/null

# 3. Check ALL files in sites-enabled
ls -la /etc/nginx/sites-enabled/
sudo grep -r "server_name.*globapp" /etc/nginx/sites-enabled/

# 4. Check sites-available (even if not enabled, might be included)
sudo grep -r "server_name.*globapp" /etc/nginx/sites-available/ 2>/dev/null

# 5. Check if nginx.conf includes conf.d
sudo grep "include.*conf.d" /etc/nginx/nginx.conf

# 6. Get full Nginx config tree
sudo nginx -T 2>&1 | grep -A 5 "server_name.*globapp"
```

## Most Likely: conf.d Directory

**Certbot or other tools might have created configs in `/etc/nginx/conf.d/`:**

```bash
# Check conf.d
ls -la /etc/nginx/conf.d/
cat /etc/nginx/conf.d/*.conf 2>/dev/null | grep -A 10 "globapp"
```

## Fix: Remove from ALL Locations

```bash
# Remove from conf.d
sudo rm -f /etc/nginx/conf.d/*globapp*.conf
sudo rm -f /etc/nginx/conf.d/*rider*.conf
sudo rm -f /etc/nginx/conf.d/*driver*.conf
sudo rm -f /etc/nginx/conf.d/*admin*.conf

# Remove from sites-enabled (already done, but double-check)
sudo rm -f /etc/nginx/sites-enabled/*globapp*.app
sudo rm -f /etc/nginx/sites-enabled/*rider*
sudo rm -f /etc/nginx/sites-enabled/*driver*
sudo rm -f /etc/nginx/sites-enabled/*admin*

# Verify only default remains
ls -la /etc/nginx/sites-enabled/

# Test
sudo nginx -t
```



