# Exact Commands to Run

## Step 1: Copy File to Droplet (Run in PowerShell on Cursor)

```powershell
scp complete_nginx_config.conf root@YOUR_DROPLET_IP:/tmp/nginx_new.conf
```

**Replace `YOUR_DROPLET_IP` with your actual Droplet IP address.**

**Example:**
```powershell
scp complete_nginx_config.conf root@123.45.67.89:/tmp/nginx_new.conf
```

---

## Step 2: SSH to Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

**Or if you use a different user:**
```bash
ssh ishmael@YOUR_DROPLET_IP
```

---

## Step 3: Run These Commands on Droplet (Copy-Paste Each One)

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
```

```bash
sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default
```

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

---

## All Commands Together (One Block)

**On Droplet, run all of these:**

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## What Each Command Does

1. `sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup`
   - Creates a backup of your current config

2. `sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default`
   - Replaces the config with the new one

3. `sudo nginx -t`
   - Tests if the config is valid

4. `sudo systemctl reload nginx`
   - Applies the new config (only run if test passed!)

---

## Expected Output

**After `sudo nginx -t`:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you see errors, DON'T run the reload command!**




