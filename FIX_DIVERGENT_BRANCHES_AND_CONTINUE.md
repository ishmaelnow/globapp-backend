# Fix Divergent Branches and Continue Deployment

**Current Issue:** Git pull failed with "divergent branches" error on your Droplet.

**Status:** You're on your Droplet (`~/globapp-backend`) and need to resolve this before continuing.

---

## Step 1: Fix Divergent Branches

**You have two options. Choose ONE:**

### Option A: Merge (Recommended - Safest)

**This keeps both local and remote changes:**

```bash
git config pull.rebase false
git pull origin main
```

**When to use:** If you want to keep any local changes on the Droplet and merge them with remote changes.

---

### Option B: Force Pull (Use Remote Version)

**This discards local changes and uses only remote code:**

```bash
git fetch origin
git reset --hard origin/main
```

**⚠️ WARNING:** This will **DELETE** any local changes on the Droplet. Only use if you're sure you don't need local changes.

**When to use:** If you're certain all important code is on GitHub and you want the Droplet to match GitHub exactly.

---

## Step 2: Verify Apps Are Present

**After fixing the Git issue, verify the apps exist:**

```bash
ls -d rider-app driver-app admin-app
```

**Expected output:**
```
rider-app  driver-app  admin-app
```

**If apps don't exist:** You need to commit and push them from your local machine first.

---

## Step 3: Build and Deploy Rider App

```bash
cd ~/globapp-backend/rider-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/rider/

# Verify files were copied
ls -la /var/www/globapp/rider/
```

**Expected:** Should see `index.html` and `assets/` folder (no longer empty!).

---

## Step 4: Build and Deploy Driver App

```bash
cd ~/globapp-backend/driver-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Verify files were copied
ls -la /var/www/globapp/driver/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 5: Build and Deploy Admin App

```bash
cd ~/globapp-backend/admin-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected:** Should see `index.html` and `assets/` folder.

```bash
# Copy built files to web directory
sudo cp -r dist/* /var/www/globapp/admin/

# Verify files were copied
ls -la /var/www/globapp/admin/
```

**Expected:** Should see `index.html` and `assets/` folder.

---

## Step 6: Fix File Permissions

**Files need correct ownership for Nginx to serve them:**

```bash
# Fix ownership for all three apps
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chown -R www-data:www-data /var/www/globapp/admin

# Set correct permissions
sudo chmod -R 755 /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/admin
```

**Verify permissions:**

```bash
ls -la /var/www/globapp/
```

**Expected:** All directories should be owned by `www-data:www-data`

---

## Step 7: Configure Nginx (If Not Already Done)

**Check if Nginx configs exist:**

```bash
ls -la /etc/nginx/sites-available/ | grep globapp
```

**If configs don't exist, create them:**

### Create Rider Config

```bash
sudo nano /etc/nginx/sites-available/rider.globapp.app
```

**Paste:**

```nginx
server {
    listen 80;
    server_name rider.globapp.app;

    root /var/www/globapp/rider;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Create Driver Config

```bash
sudo nano /etc/nginx/sites-available/driver.globapp.app
```

**Paste:**

```nginx
server {
    listen 80;
    server_name driver.globapp.app;

    root /var/www/globapp/driver;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Create Admin Config

```bash
sudo nano /etc/nginx/sites-available/admin.globapp.app
```

**Paste:**

```nginx
server {
    listen 80;
    server_name admin.globapp.app;

    root /var/www/globapp/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

### Enable Sites

```bash
sudo ln -s /etc/nginx/sites-available/rider.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t
```

**Expected:** `nginx: configuration file /etc/nginx/nginx.conf test is successful`

```bash
# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 8: Test HTTP (Before SSL)

**Open browser and test:**

1. Visit: `http://rider.globapp.app`
2. Visit: `http://driver.globapp.app`
3. Visit: `http://admin.globapp.app`

**Expected:** Apps should load (may show "Not Secure" - that's OK for now).

**If you see 500 error:** Check logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Step 9: Install SSL Certificates

```bash
# Install Certbot if not installed
sudo apt install certbot python3-certbot-nginx -y

# Get certificates for each subdomain
sudo certbot --nginx -d rider.globapp.app
sudo certbot --nginx -d driver.globapp.app
sudo certbot --nginx -d admin.globapp.app
```

**For each certificate:**
1. Enter email → Press Enter
2. Agree to terms → Type `A` and press Enter
3. Share email (optional) → Type `Y` or `N` and press Enter
4. Redirect HTTP to HTTPS → Type `2` and press Enter

**Verify certificates:**

```bash
sudo certbot certificates
```

---

## Step 10: Update Backend CORS

```bash
cd ~/globapp-backend
nano app.py
```

**Find CORS section and add subdomains:**

```python
allow_origins=[
    "https://globapp.app",
    "https://rider.globapp.app",      # ← ADD THIS
    "https://driver.globapp.app",     # ← ADD THIS
    "https://admin.globapp.app",      # ← ADD THIS
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    # ... other origins
],
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Restart backend:**

```bash
sudo systemctl restart globapp-api
# or however you restart your backend
```

---

## Step 11: Test HTTPS

**Open browser and test:**

1. Visit: `https://rider.globapp.app`
2. Visit: `https://driver.globapp.app`
3. Visit: `https://admin.globapp.app`

**Expected:**
- ✅ Apps load correctly
- ✅ Green padlock in address bar
- ✅ No CORS errors in browser console (F12)

---

## ✅ Quick Checklist

- [ ] **Step 1:** Fixed divergent branches (chose Option A or B)
- [ ] **Step 2:** Verified apps exist (`rider-app`, `driver-app`, `admin-app`)
- [ ] **Step 3:** Built and deployed Rider app
- [ ] **Step 4:** Built and deployed Driver app
- [ ] **Step 5:** Built and deployed Admin app
- [ ] **Step 6:** Fixed file permissions
- [ ] **Step 7:** Configured Nginx
- [ ] **Step 8:** Tested HTTP (apps load)
- [ ] **Step 9:** Installed SSL certificates
- [ ] **Step 10:** Updated backend CORS
- [ ] **Step 11:** Tested HTTPS (all working)

---

## 🎯 What to Do Right Now

**You're currently on your Droplet at `~/globapp-backend`.**

**Run this command to fix the divergent branches:**

```bash
git config pull.rebase false
git pull origin main
```

**Then continue with Step 2 above.**

---

## Troubleshooting

### If Git Pull Still Fails

**Try force pull (discards local changes):**

```bash
git fetch origin
git reset --hard origin/main
```

### If Apps Don't Exist After Pull

**You need to commit and push from your local machine:**

```bash
# On your local machine (Windows)
cd C:\Users\koshi\cursor-apps\flask-react-project
git add rider-app driver-app admin-app
git commit -m "Add separate apps for deployment"
git push origin main
```

**Then go back to Droplet and pull again.**

### If Build Fails

**Check Node.js:**

```bash
node --version
npm --version
```

**If not installed:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### If 500 Error

**Check Nginx logs:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Common fixes:**
- Files not deployed → Re-do Steps 3-5
- Wrong permissions → Re-do Step 6
- Missing index.html → Re-do Steps 3-5

---

**Follow these steps in order starting from Step 1!**




