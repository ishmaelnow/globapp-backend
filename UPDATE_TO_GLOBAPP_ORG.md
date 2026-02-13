# Update Domain from globapp.app to globapp.org

## ✅ Files Updated Locally

### Backend:
- ✅ `app.py` - CORS origins updated

### Mobile Apps:
- ✅ `rider-mobile-pwa/src/config/api.js` - API URL updated
- ✅ `rider-mobile-pwa/app.json` - API URL updated
- ✅ `passenger-mobile-pwa/src/config/api.js` - API URL updated
- ✅ `passenger-mobile-pwa/app.json` - API URL updated

---

## 🔧 Server Updates Needed (On DigitalOcean Droplet)

### 1. Update DNS Records

**In your domain registrar (where you bought globapp.org):**

Point DNS to your DigitalOcean droplet:
- **A Record**: `globapp.org` → Your droplet IP
- **A Record**: `rider.globapp.org` → Your droplet IP
- **A Record**: `driver.globapp.org` → Your droplet IP
- **A Record**: `admin.globapp.org` → Your droplet IP

### 2. Update Nginx Configs

**SSH into your droplet and run:**

```bash
# Backup current config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d)

# Update all server_name entries from .app to .org
sudo sed -i 's/globapp\.app/globapp.org/g' /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Get New SSL Certificates

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get certificates for new domain
sudo certbot certonly --standalone -d globapp.org -d www.globapp.org -d rider.globapp.org -d driver.globapp.org -d admin.globapp.org

# Update nginx config to use new certificate paths
sudo sed -i 's/\/etc\/letsencrypt\/live\/globapp\.app/\/etc\/letsencrypt\/live\/globapp.org/g' /etc/nginx/sites-enabled/default

# Start nginx
sudo systemctl start nginx

# Test config
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Update Environment Variables (if any)

```bash
# Check for any .env files on server
sudo find /var/www -name ".env" -type f

# Update any globapp.app references
sudo sed -i 's/globapp\.app/globapp.org/g' /var/www/globapp/*/.env
```

### 5. Restart Backend Service

```bash
# Restart your FastAPI/backend service
sudo systemctl restart your-backend-service-name
# OR if using PM2/supervisor, restart that
```

---

## 📱 After Server Updates

1. **Test DNS resolution:**
   ```bash
   nslookup globapp.org
   nslookup rider.globapp.org
   ```

2. **Test HTTPS:**
   ```bash
   curl -I https://globapp.org/api/v1/health
   curl -I https://rider.globapp.org
   ```

3. **Rebuild mobile apps** (they'll use the new domain automatically)

---

## ⚠️ Important Notes

- DNS propagation can take 24-48 hours (usually faster)
- SSL certificates need to be renewed for the new domain
- All subdomains need DNS records pointing to your droplet
- Test each subdomain after DNS propagates











