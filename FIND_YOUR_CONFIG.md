# Find Your Actual Nginx Config

## The Config File Location

Your config is likely:
```
/etc/nginx/sites-available/default
```

(No `.conf` extension - that's why `find` didn't show it)

## Verify It Exists

```bash
# Check if it exists
ls -la /etc/nginx/sites-available/default

# View it
cat /etc/nginx/sites-available/default

# Or see what's enabled
ls -la /etc/nginx/sites-enabled/
```

## Find All Nginx Config Files (Including Non-.conf)

```bash
# Find all config files (not just .conf)
find /etc/nginx -type f -name "default" -o -name "*globapp*"

# Or list sites-available directory
ls -la /etc/nginx/sites-available/

# Or list sites-enabled directory  
ls -la /etc/nginx/sites-enabled/
```

## Your Config File

Based on what you showed me earlier, your config is:
```
/etc/nginx/sites-available/default
```

This is the standard location for Nginx site configs.

## Edit It

```bash
sudo nano /etc/nginx/sites-available/default
```

Then make the 2 changes:
1. Change `root /var/www/html;` → `root /var/www/globapp/frontend;`
2. Update the `location /` block

## Quick Check

```bash
# See what's actually enabled
ls -la /etc/nginx/sites-enabled/

# This will show you which config is active
# It's probably a symlink to /etc/nginx/sites-available/default
```




