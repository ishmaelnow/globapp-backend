# Fix Conflicting Nginx Config

## Find Duplicate Configs

**On your Droplet:**

```bash
# Find all configs that mention rider.globapp.app
sudo grep -r "rider.globapp.app" /etc/nginx/sites-enabled/
sudo grep -r "rider.globapp.app" /etc/nginx/sites-available/

# Check what's in sites-enabled
ls -la /etc/nginx/sites-enabled/

# Check default config (Certbot might have added it there)
sudo grep -A 30 "rider.globapp.app" /etc/nginx/sites-enabled/default
```

## Most Likely: Certbot Added to Default Config

**Certbot often modifies the default config. Check:**

```bash
sudo cat /etc/nginx/sites-enabled/default | grep -A 30 "rider.globapp.app"
```

## Fix: Remove Duplicate or Consolidate

**Option 1: Remove from default config (if Certbot added it there)**

```bash
# Backup default
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup

# Edit default to remove rider.globapp.app blocks
sudo nano /etc/nginx/sites-enabled/default
# Remove any server blocks for rider.globapp.app
```

**Option 2: Use only the new config (recommended)**

```bash
# Disable default if it has rider config
sudo mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.disabled

# Or edit default to remove rider blocks
sudo nano /etc/nginx/sites-enabled/default
```

**Then test:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```



