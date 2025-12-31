# Remove Duplicate Nginx Server Blocks

## Issue
Conflicting server names mean there are duplicate server blocks. Nginx uses the first ones it finds, which might be the old ones without `/api/` location blocks.

## Find All Duplicates

**On your Droplet:**

```bash
# Find all occurrences of each subdomain
sudo grep -n "server_name rider.globapp.app" /etc/nginx/sites-enabled/default
sudo grep -n "server_name driver.globapp.app" /etc/nginx/sites-enabled/default
sudo grep -n "server_name admin.globapp.app" /etc/nginx/sites-enabled/default

# View the full config to see duplicates
sudo cat /etc/nginx/sites-enabled/default | grep -A 20 "server_name rider.globapp.app"
```

## Solution: Remove Old Blocks

**The old blocks (created by Certbot) are probably still in the config. Remove them:**

```bash
# Edit the config
sudo nano /etc/nginx/sites-enabled/default
```

**Find and DELETE these old sections:**
- Look for `# 6) rider.globapp.app` section - DELETE both HTTP and HTTPS blocks
- Look for any `# driver.globapp.app` section - DELETE both HTTP and HTTPS blocks  
- Look for any `# admin.globapp.app` section - DELETE both HTTP and HTTPS blocks

**Keep only the new blocks we just added (they should be at the top).**

## Or: Use sed to Remove Old Blocks

**If you prefer command line:**

```bash
# Backup
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup2

# Remove old rider blocks (the ones with comments like "# 6) rider.globapp.app")
sudo sed -i '/# 6) rider.globapp.app/,/^# ============================================================/d' /etc/nginx/sites-enabled/default

# Remove old driver blocks if they exist
sudo sed -i '/#.*driver.globapp.app/,/^# ============================================================/d' /etc/nginx/sites-enabled/default

# Remove old admin blocks if they exist  
sudo sed -i '/#.*admin.globapp.app/,/^# ============================================================/d' /etc/nginx/sites-enabled/default

# Test
sudo nginx -t
```

## Better Solution: Clean Slate

**Start fresh with only the new config:**

```bash
# Backup
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.full

# Check what other server blocks exist (like api.globapp.app, globapp.app)
sudo grep -E "^server|^#.*===" /etc/nginx/sites-enabled/default.backup.full | head -40

# Create clean config with only the three subdomains + any other blocks you need
sudo nano /etc/nginx/sites-enabled/default
# Delete all old rider/driver/admin blocks
# Keep only the new ones we added
# Add back any other server blocks you need (api.globapp.app, etc.)
```

## Quick Fix: View and Edit

**The easiest way:**

```bash
# View the config to see what's duplicated
sudo cat /etc/nginx/sites-enabled/default | less

# Search for duplicates (press / and type "rider.globapp.app")
# You'll see multiple matches - delete the old ones

# Or edit directly
sudo nano /etc/nginx/sites-enabled/default
```

**Look for patterns like:**
- `# 6) rider.globapp.app` - OLD, DELETE
- `# Rider App - HTTPS` - NEW, KEEP
- Similar for driver and admin

## After Removing Duplicates

```bash
# Test (should have no warnings)
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Verify no conflicts
sudo nginx -t
```



