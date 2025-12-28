# How to Edit Nginx Config on Your Droplet

## Method 1: SSH + Nano (Easiest)

### Step 1: SSH to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# or
ssh ishmael@YOUR_DROPLET_IP
```

### Step 2: Backup First

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
```

### Step 3: Open the File in Nano

```bash
sudo nano /etc/nginx/sites-available/default
```

### Step 4: Replace Everything

**Option A: Delete and Paste**
1. Press `Ctrl + K` repeatedly to delete all lines (or `Ctrl + A` then `Ctrl + K`)
2. Or select all: `Ctrl + A`, then `Delete`
3. Copy the entire contents from `complete_nginx_config.conf` in Cursor
4. Right-click in the terminal (or `Shift + Insert`) to paste
5. Press `Ctrl + X` to exit
6. Press `Y` to save
7. Press `Enter` to confirm

**Option B: Clear and Type**
1. Press `Ctrl + A` to select all
2. Press `Delete` to clear
3. Paste the new config (right-click or `Shift + Insert`)

### Step 5: Test Configuration

```bash
sudo nginx -t
```

### Step 6: Reload (if test passes)

```bash
sudo systemctl reload nginx
```

---

## Method 2: Copy File via SCP (From Cursor)

### Step 1: Copy File to Droplet

**In PowerShell (on your Cursor machine):**

```powershell
# Navigate to project folder
cd C:\Users\koshi\cursor-apps\flask-react-project

# Copy file to Droplet
scp complete_nginx_config.conf root@YOUR_DROPLET_IP:/tmp/nginx_new.conf
```

Replace `YOUR_DROPLET_IP` with your actual Droplet IP address.

### Step 2: SSH to Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### Step 3: Backup and Replace

```bash
# Backup
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Replace
sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default

# Test
sudo nginx -t

# Reload (if test passes)
sudo systemctl reload nginx
```

---

## Method 3: Using Vim (If You Prefer)

```bash
sudo vim /etc/nginx/sites-available/default
```

**Vim commands:**
- Press `gg` to go to top
- Press `dG` to delete everything
- Press `i` to enter insert mode
- Paste your config (right-click or `Shift + Insert`)
- Press `Esc` to exit insert mode
- Type `:wq` and press `Enter` to save and quit

---

## Quick Copy-Paste Method (Recommended)

### On Your Droplet:

```bash
# 1. Backup
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 2. Open editor
sudo nano /etc/nginx/sites-available/default

# 3. In nano:
#    - Press Ctrl+K repeatedly to delete all lines
#    - OR: Press Ctrl+A then Delete
#    - Right-click to paste (or Shift+Insert)
#    - Press Ctrl+X, then Y, then Enter

# 4. Test
sudo nginx -t

# 5. Reload (if OK)
sudo systemctl reload nginx
```

---

## Nano Keyboard Shortcuts

- `Ctrl + K` = Delete current line
- `Ctrl + A` = Go to beginning of line
- `Ctrl + E` = Go to end of line
- `Ctrl + W` = Search
- `Ctrl + X` = Exit
- `Ctrl + O` = Save (then Enter)
- Right-click = Paste (in most terminals)

---

## What You're Replacing

**File:** `/etc/nginx/sites-available/default`

**With:** Contents from `complete_nginx_config.conf`

**Changes:**
- Frontend root: `/var/www/globapp/frontend`
- Frontend location block: Serves React app with `try_files`

Everything else stays the same!




