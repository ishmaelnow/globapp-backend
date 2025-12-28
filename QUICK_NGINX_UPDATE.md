# Quick Nginx Update - Just 2 Changes

## File to Edit

```bash
sudo nano /etc/nginx/sites-available/default
```

## Change 1: Update Root Directory

**Find this line** (in the HTTPS server block, around line 50):
```nginx
root /var/www/html;
```

**Change it to:**
```nginx
root /var/www/globapp/frontend;
```

## Change 2: Update Location / Block

**Find this block** (in the HTTPS server block, at the bottom):
```nginx
    # Static site
    location / {
        try_files $uri $uri/ =404;
    }
```

**Replace it with:**
```nginx
    # Frontend - Serve React app
    location / {
        root /var/www/globapp/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
```

## Save and Reload

```bash
# Save: Ctrl+X, Y, Enter

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

## Done! ✅

Visit https://globapp.app and your React app should load!




