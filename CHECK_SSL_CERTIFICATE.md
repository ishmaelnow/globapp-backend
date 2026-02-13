# Check SSL Certificate Issues

## 🔴 Possible Certificate Problems

After DNS changes, SSL certificates might have issues:

1. **Certificate doesn't cover subdomains** (admin.globapp.org not in SAN)
2. **Certificate expired**
3. **Certificate path incorrect in Nginx**
4. **Certificate not renewed after domain change**

---

## ✅ Check Certificate on Droplet

### Step 1: SSH into Droplet

```bash
ssh ishmael@157.245.231.224
```

### Step 2: Check Certificate Status

```bash
# List all certificates
sudo certbot certificates

# Check certificate files exist
sudo ls -la /etc/letsencrypt/live/globapp.org/

# Check certificate details
sudo openssl x509 -in /etc/letsencrypt/live/globapp.org/cert.pem -text -noout | grep -A 2 "Subject Alternative Name"
```

**Expected output should include:**
- `admin.globapp.org`
- `rider.globapp.org`
- `driver.globapp.org`
- `globapp.org`

### Step 3: Check Certificate Expiry

```bash
# Check when certificate expires
sudo openssl x509 -in /etc/letsencrypt/live/globapp.org/cert.pem -noout -dates
```

**Should show:**
- `notBefore` = Certificate start date
- `notAfter` = Certificate expiry date (should be in the future)

### Step 4: Check Nginx SSL Configuration

```bash
# Check SSL certificate paths in Nginx config
sudo grep -A 10 "server_name admin.globapp.org" /etc/nginx/sites-enabled/default | grep ssl_certificate
```

**Should show:**
```nginx
ssl_certificate /etc/letsencrypt/live/globapp.org/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/globapp.org/privkey.pem;
```

### Step 5: Test SSL from Droplet

```bash
# Test SSL connection
openssl s_client -connect admin.globapp.org:443 -servername admin.globapp.org

# Or test with curl
curl -v https://admin.globapp.org/api/v1/health
```

**Look for:**
- Certificate chain verification
- Certificate subject/issuer
- Any SSL errors

---

## 🔧 Fix Certificate Issues

### Issue 1: Certificate Doesn't Include Subdomains

**If certificate doesn't include `admin.globapp.org`:**

```bash
# Renew certificate with all subdomains
sudo certbot certonly --standalone \
  -d globapp.org \
  -d www.globapp.org \
  -d admin.globapp.org \
  -d rider.globapp.org \
  -d driver.globapp.org

# Reload Nginx
sudo systemctl reload nginx
```

### Issue 2: Certificate Expired

**If certificate is expired:**

```bash
# Renew certificate
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

### Issue 3: Wrong Certificate Path in Nginx

**If Nginx points to wrong certificate:**

```bash
# Check current paths
sudo grep ssl_certificate /etc/nginx/sites-enabled/default

# Update if needed (should point to globapp.org)
sudo sed -i 's|/etc/letsencrypt/live/globapp\.app|/etc/letsencrypt/live/globapp.org|g' /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Issue 4: Certificate Not Found

**If certificate files don't exist:**

```bash
# Get new certificate
sudo certbot certonly --standalone \
  -d globapp.org \
  -d www.globapp.org \
  -d admin.globapp.org \
  -d rider.globapp.org \
  -d driver.globapp.org

# Verify files exist
sudo ls -la /etc/letsencrypt/live/globapp.org/

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🧪 Test Certificate from Local Machine

**Windows PowerShell:**

```powershell
# Test SSL connection (will show certificate errors if any)
try {
    $response = Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET
    Write-Host "✅ Certificate valid!"
} catch {
    if ($_.Exception.Message -like "*certificate*" -or $_.Exception.Message -like "*SSL*") {
        Write-Host "❌ Certificate error: $($_.Exception.Message)"
    } else {
        Write-Host "Different error: $($_.Exception.Message)"
    }
}

# Check certificate details
$cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$request = [System.Net.HttpWebRequest]::Create("https://admin.globapp.org")
try {
    $response = $request.GetResponse()
    $cert = $request.ServicePoint.Certificate
    Write-Host "Certificate Subject: $($cert.Subject)"
    Write-Host "Certificate Issuer: $($cert.Issuer)"
    Write-Host "Certificate Valid: $($cert.Verify())"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
```

---

## 🔍 Common Certificate Errors

### Error: "Certificate name mismatch"
**Cause:** Certificate doesn't include the subdomain  
**Fix:** Renew certificate with all subdomains

### Error: "Certificate expired"
**Cause:** Certificate past expiry date  
**Fix:** Renew certificate

### Error: "Certificate not trusted"
**Cause:** Certificate chain incomplete  
**Fix:** Check Nginx uses `fullchain.pem` (not `cert.pem`)

### Error: "SSL handshake failed"
**Cause:** Certificate path wrong or certificate doesn't exist  
**Fix:** Check Nginx config and certificate files

---

## ✅ Quick Certificate Check Script

**Run on droplet:**

```bash
#!/bin/bash
echo "=== SSL Certificate Check ==="
echo ""
echo "1. Certificate files:"
sudo ls -la /etc/letsencrypt/live/globapp.org/ 2>/dev/null || echo "Certificate directory not found!"
echo ""
echo "2. Certificate details:"
sudo certbot certificates 2>/dev/null | grep -A 10 globapp.org || echo "No certificates found"
echo ""
echo "3. Certificate SAN (Subject Alternative Names):"
sudo openssl x509 -in /etc/letsencrypt/live/globapp.org/cert.pem -text -noout 2>/dev/null | grep -A 2 "Subject Alternative Name" || echo "Cannot read certificate"
echo ""
echo "4. Nginx SSL config:"
sudo grep -A 2 "ssl_certificate" /etc/nginx/sites-enabled/default | grep admin.globapp.org -A 5
echo ""
echo "5. Test SSL:"
curl -v https://admin.globapp.org/api/v1/health 2>&1 | grep -i "certificate\|SSL\|TLS"
```

---

## 📝 Summary

**Certificate issues can cause network errors** even if DNS is correct.

**Check:**
1. Certificate includes all subdomains
2. Certificate not expired
3. Certificate path correct in Nginx
4. Certificate files exist

**Fix:**
- Renew certificate with all subdomains
- Update Nginx config if needed
- Reload Nginx after changes

---

**Run the checks above on your droplet to identify the certificate issue!** 🔍










