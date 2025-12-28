# Edit Your Default Nginx Config - Step by Step

## Your Config File

**File:** `/etc/nginx/sites-available/default`

This is your existing config file. We'll add the frontend location block to it.

---

## Step 1: View Your Current Config

```bash
sudo cat /etc/nginx/sites-available/default
```

This shows you what you currently have.

---

## Step 2: Edit the Config

```bash
sudo nano /etc/nginx/sites-available/default
```

---

## Step 3: Add Frontend Location Block

Your current config probably looks something like:

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        ...
    }

    location /api/v1/health {
        proxy_pass http://127.0.0.1:8000/api/v1/health;
        ...
    }
}
```

**Add this location block BEFORE your `/api/` blocks:**

```nginx
    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
```

**Your complete config should look like:**

```nginx
server {
    listen 80;
    server_name globapp.app www.globapp.app;

    # Frontend - Serve React app (ADD THIS)
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API (YOU ALREADY HAVE THIS)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check (YOU ALREADY HAVE THIS)
    location /api/v1/health {
        proxy_pass http://127.0.0.1:8000/api/v1/health;
        ...
    }
}
```

---

## Step 4: Save and Exit Nano

1. Press `Ctrl + X` to exit
2. Press `Y` to confirm save
3. Press `Enter` to save

---

## Step 5: Test Configuration

```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If you see errors, go back and check your config.

---

## Step 6: Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## Step 7: Verify It Works

```bash
# Test backend
curl https://globapp.app/api/v1/health

# Test frontend (should serve index.html)
curl https://globapp.app/
```

---

## Important: Location Block Order

Make sure the `/` location block comes **BEFORE** the `/api/` blocks, or Nginx might match `/api/` first.

**Correct order:**
1. `location /` (frontend) - matches everything
2. `location /api/` (backend) - more specific, matches first
3. `location /api/v1/health` (health) - most specific

Nginx will match the most specific location, so `/api/` will still work correctly even if `/` comes first.

---

## If You Have SSL (HTTPS)

If your config has SSL blocks (listen 443), add the frontend location to **both** HTTP and HTTPS server blocks:

```nginx
# HTTP redirect block (usually at top)
server {
    listen 80;
    server_name globapp.app www.globapp.app;
    return 301 https://$server_name$request_uri;
}

# HTTPS block (add frontend here)
server {
    listen 443 ssl http2;
    server_name globapp.app www.globapp.app;

    ssl_certificate ...;
    ssl_certificate_key ...;

    # Frontend - Serve React app (ADD THIS)
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Your existing /api/ blocks...
}
```

---

## Quick Copy-Paste Commands

```bash
# 1. Edit config
sudo nano /etc/nginx/sites-available/default

# 2. Add the frontend location block (see above)

# 3. Test
sudo nginx -t

# 4. Reload
sudo systemctl reload nginx

# 5. Test
curl https://globapp.app/
```

---

## Troubleshooting

### If nginx -t fails:
- Check for typos in the config
- Make sure all braces `{}` are closed
- Check for missing semicolons `;`

### If frontend doesn't load:
- Verify files exist: `ls -la /var/www/globapp/frontend/`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify permissions: `sudo chown -R www-data:www-data /var/www/globapp`

---

## You're Ready!

Just edit `/etc/nginx/sites-available/default` and add the frontend location block!




