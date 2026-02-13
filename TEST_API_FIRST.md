# Test API First - Direct IP Testing

## 🎯 Goal: Verify API is Working (Bypass DNS)

**Test the API directly using IP address to verify server is working.**

---

## ✅ Test 1: HTTP API (Direct IP)

**Command:**
```powershell
Invoke-WebRequest -Uri "http://157.245.231.224/api/v1/health"
```

**Expected:**
- Status: `200 OK`
- Response: `{"ok":true,"version":"v1","environment":"development"}`

**If this works:** ✅ Server is running, API is working!

---

## ✅ Test 2: HTTPS API (Direct IP)

**Command:**
```powershell
Invoke-WebRequest -Uri "https://157.245.231.224/api/v1/health" -SkipCertificateCheck
```

**Note:** `-SkipCertificateCheck` bypasses SSL certificate validation (certificate expects domain name, not IP)

**Expected:**
- Status: `200 OK`
- Response: `{"ok":true}`

**If this works:** ✅ HTTPS is working!

---

## ✅ Test 3: API with Host Header

**Command:**
```powershell
$headers = @{ "Host" = "globapp.org" }
Invoke-WebRequest -Uri "http://157.245.231.224/api/v1/health" -Headers $headers
```

**This simulates accessing via domain name.**

**Expected:**
- Status: `200 OK`
- Response: `{"ok":true}`

**If this works:** ✅ Nginx routing is working!

---

## 🔍 What Each Test Tells Us

**Test 1 (HTTP Direct IP):**
- ✅ Works = Server is running, backend is working
- ❌ Fails = Server is down or backend not running

**Test 2 (HTTPS Direct IP):**
- ✅ Works = SSL is configured
- ❌ Fails = SSL issue (but HTTP might still work)

**Test 3 (Host Header):**
- ✅ Works = Nginx routing is correct
- ❌ Fails = Nginx configuration issue

---

## ✅ If All Tests Pass

**API is working!** The issue is DNS only.

**Next step:** Fix DNS records in Netlify to point to `157.245.231.224`

---

## ❌ If Tests Fail

**Check server:**

**SSH into server:**
```bash
ssh ishmael@157.245.231.224
```

**Check services:**
```bash
# Backend
sudo systemctl status globapp-api

# Nginx
sudo systemctl status nginx
```

**Start if needed:**
```bash
sudo systemctl start globapp-api
sudo systemctl start nginx
```

---

**Test API first → Then fix DNS!** 🎯










