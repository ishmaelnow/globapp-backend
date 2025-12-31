# Complete Next Steps - Copy-Paste Commands

## Step 1: Remove Broken Symlinks

```bash
sudo rm /etc/nginx/sites-enabled/driver.globapp.app
sudo rm /etc/nginx/sites-enabled/admin.globapp.app
```

---

## Step 2: Create Driver App Nginx Config

```bash
sudo tee /etc/nginx/sites-available/driver.globapp.app > /dev/null << 'EOF'
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
EOF
```

---

## Step 3: Create Admin App Nginx Config

```bash
sudo tee /etc/nginx/sites-available/admin.globapp.app > /dev/null << 'EOF'
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
EOF
```

---

## Step 4: Verify Config Files Were Created

```bash
ls -la /etc/nginx/sites-available/ | grep -E "(driver|admin)"
```

**Expected:** Should show both files with file sizes (not 0 bytes)

---

## Step 5: Enable Sites (Create Symlinks)

```bash
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/
```

---

## Step 6: Verify Symlinks Were Created

```bash
ls -la /etc/nginx/sites-enabled/ | grep -E "(driver|admin)"
```

**Expected:** Should show symlinks pointing to the config files

---

## Step 7: Test Nginx Configuration

```bash
sudo nginx -t
```

**Expected:** Should show `nginx: configuration file /etc/nginx/nginx.conf test is successful`

**If test fails:** Check the error message and fix any issues

---

## Step 8: Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## Step 9: Check Nginx Status

```bash
sudo systemctl status nginx
```

**Expected:** Should show "active (running)" in green

---

## Step 10: Test HTTP Access (From Droplet)

```bash
curl -I http://localhost -H "Host: driver.globapp.app"
curl -I http://localhost -H "Host: admin.globapp.app"
```

**Expected:** Should return `200 OK` or `301 Moved Permanently`

---

## Step 11: Install Certbot (If Not Installed)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 12: Get SSL Certificate for Driver App

```bash
sudo certbot --nginx -d driver.globapp.app --non-interactive --agree-tos --redirect
```

**Note:** Replace `--non-interactive` with interactive mode if you want to enter email:
```bash
sudo certbot --nginx -d driver.globapp.app
```

**Follow prompts:**
1. Enter email address → Press Enter
2. Agree to terms → Type `A` and press Enter
3. Share email (optional) → Type `Y` or `N` and press Enter
4. Redirect HTTP to HTTPS → Type `2` and press Enter (recommended)

---

## Step 13: Get SSL Certificate for Admin App

```bash
sudo certbot --nginx -d admin.globapp.app --non-interactive --agree-tos --redirect
```

**Or interactive mode:**
```bash
sudo certbot --nginx -d admin.globapp.app
```

**Follow prompts:** Same as Step 12

---

## Step 14: Verify SSL Certificates

```bash
sudo certbot certificates
```

**Expected:** Should show certificates for both `driver.globapp.app` and `admin.globapp.app`

---

## Step 15: Restart Backend (Apply CORS Changes)

```bash
# Check backend status
sudo systemctl status globapp-api

# Restart backend
sudo systemctl restart globapp-api

# Verify backend is running
sudo systemctl status globapp-api
```

**Note:** Replace `globapp-api` with your actual backend service name if different

---

## Step 16: Test HTTPS Access (From Browser)

**Open in your browser:**
- `https://driver.globapp.app`
- `https://admin.globapp.app`
- `https://rider.globapp.app` (if not already working)

**Expected:**
- Apps should load
- Green padlock 🔒 in address bar
- No errors in browser console (F12)

---

## All-in-One Script (Copy All at Once)

**Run this entire block to complete Steps 1-9:**

```bash
# Step 1: Remove broken symlinks
sudo rm -f /etc/nginx/sites-enabled/driver.globapp.app
sudo rm -f /etc/nginx/sites-enabled/admin.globapp.app

# Step 2: Create Driver App Nginx Config
sudo tee /etc/nginx/sites-available/driver.globapp.app > /dev/null << 'EOF'
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
EOF

# Step 3: Create Admin App Nginx Config
sudo tee /etc/nginx/sites-available/admin.globapp.app > /dev/null << 'EOF'
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
EOF

# Step 4: Verify config files
ls -la /etc/nginx/sites-available/ | grep -E "(driver|admin)"

# Step 5: Enable sites
sudo ln -s /etc/nginx/sites-available/driver.globapp.app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.globapp.app /etc/nginx/sites-enabled/

# Step 6: Verify symlinks
ls -la /etc/nginx/sites-enabled/ | grep -E "(driver|admin)"

# Step 7: Test Nginx configuration
sudo nginx -t

# Step 8: Reload Nginx
sudo systemctl reload nginx

# Step 9: Check status
sudo systemctl status nginx
```

---

## Quick SSL Installation (After Nginx Works)

```bash
# Install Certbot
sudo apt update && sudo apt install certbot python3-certbot-nginx -y

# Get certificates (interactive - will prompt for email)
sudo certbot --nginx -d driver.globapp.app
sudo certbot --nginx -d admin.globapp.app

# Verify
sudo certbot certificates
```

---

## Troubleshooting Commands

**If Nginx test fails:**
```bash
sudo nginx -t
sudo tail -20 /var/log/nginx/error.log
```

**If sites don't load:**
```bash
sudo systemctl status nginx
sudo tail -20 /var/log/nginx/error.log
curl -I http://localhost -H "Host: driver.globapp.app"
```

**If SSL fails:**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## Verification Checklist

After running all commands, verify:

- [ ] Nginx config test passes (`sudo nginx -t`)
- [ ] Nginx is running (`sudo systemctl status nginx`)
- [ ] HTTP works: `http://driver.globapp.app` and `http://admin.globapp.app`
- [ ] SSL certificates installed (`sudo certbot certificates`)
- [ ] HTTPS works: `https://driver.globapp.app` and `https://admin.globapp.app`
- [ ] Backend restarted (`sudo systemctl status globapp-api`)
- [ ] No errors in browser console (F12)

---

**Copy and paste these commands in order on your Droplet!** 🚀



