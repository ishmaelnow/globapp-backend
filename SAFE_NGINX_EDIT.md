# Safe Way to Edit Your Nginx Config - No Corruption!

## Step 1: Backup First (IMPORTANT!)

```bash
# Create a backup of your current config
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Verify backup was created
ls -la /etc/nginx/sites-available/default*
```

**Now you have a backup!** If anything goes wrong, you can restore it.

---

## Step 2: View Your Current Config

```bash
# See the entire file
cat /etc/nginx/sites-available/default

# Or view in pages
less /etc/nginx/sites-available/default
# (Press 'q' to exit)
```

---

## Step 3: Edit Safely

```bash
sudo nano /etc/nginx/sites-available/default
```

---

## Step 4: Make ONLY These 2 Changes

### Change 1: Find and Update Root Directory

**Look for this line** (in the HTTPS server block, around line 50):
```nginx
    root /var/www/html;
```

**Change ONLY this line to:**
```nginx
    root /var/www/globapp/frontend;
```

**DON'T change anything else on that line or around it!**

---

### Change 2: Update the Location / Block

**Find this exact block** (at the bottom of the HTTPS server block, before the closing `}`):
```nginx
    # Static site
    location / {
        try_files $uri $uri/ =404;
    }
```

**Replace ONLY this block with:**
```nginx
    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
```

**DON'T touch:**
- ❌ Any `/api/` blocks
- ❌ Any SSL configuration
- ❌ Any rate limiting
- ❌ Any proxy settings
- ❌ Any other location blocks

---

## Step 5: Save Carefully

1. Press `Ctrl + X` to exit
2. Press `Y` to confirm save
3. Press `Enter` to save

---

## Step 6: Test Before Applying

```bash
# Test the configuration syntax
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you see errors:**
- ❌ DON'T reload Nginx!
- ✅ Restore from backup: `sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default`
- ✅ Try editing again

---

## Step 7: Only Reload If Test Passes

```bash
# Only do this if nginx -t passed!
sudo systemctl reload nginx
```

---

## Step 8: Verify It Works

```bash
# Test backend (should still work)
curl https://globapp.app/api/v1/health

# Test frontend (should now work)
curl https://globapp.app/
```

---

## If Something Goes Wrong

### Restore from Backup:

```bash
# Restore the backup
sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Exact Changes Summary

**Only change these 2 things:**

1. **Line ~50** (in HTTPS server block):
   ```nginx
   root /var/www/html;  →  root /var/www/globapp/frontend;
   ```

2. **Last location block** (in HTTPS server block):
   ```nginx
   location / {
       try_files $uri $uri/ =404;
   }
   ```
   → Replace with:
   ```nginx
   location / {
       root /var/www/globapp/frontend;
       try_files $uri $uri/ /index.html;
       index index.html;
   }
   ```

**Everything else stays exactly the same!**

---

## Visual Guide: What to Change

```
Your Config File:
├── HTTP default server block
│   └── (Don't change - optional)
├── HTTPS server block ← EDIT THIS BLOCK ONLY
│   ├── SSL config (Don't change)
│   ├── root /var/www/html; ← CHANGE THIS LINE
│   ├── location /api/ (Don't change)
│   ├── location /api/v1/health (Don't change)
│   └── location / { ← CHANGE THIS BLOCK
│       try_files $uri $uri/ =404;
│   }
└── HTTP redirect block (Don't change)
```

---

## Safety Checklist

Before editing:
- [ ] Created backup: `sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup`
- [ ] Viewed current config: `cat /etc/nginx/sites-available/default`

While editing:
- [ ] Only changing `root` line
- [ ] Only changing `location /` block
- [ ] Not touching `/api/` blocks
- [ ] Not touching SSL config
- [ ] Not touching rate limiting

After editing:
- [ ] Tested: `sudo nginx -t` ✅
- [ ] Reloaded: `sudo systemctl reload nginx`
- [ ] Verified backend still works
- [ ] Verified frontend loads

---

## You're Safe!

With a backup, you can always restore. Just make those 2 small changes and test before reloading!




