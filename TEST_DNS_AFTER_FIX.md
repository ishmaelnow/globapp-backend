# Test DNS After Fixing NETLIFY Records

## ✅ What You Did

1. ✅ Deleted all 5 NETLIFY records
2. ✅ Kept only A records (all pointing to `157.245.231.224`)

## ⏳ Wait for DNS Propagation

**Time:** 5-15 minutes (sometimes up to 1 hour)

DNS changes need time to propagate across the internet.

---

## 🧪 Test Commands (Run After 10-15 Minutes)

### Test 1: Check DNS Resolution

**Windows PowerShell:**
```powershell
# Clear DNS cache first
ipconfig /flushdns

# Check DNS resolution
nslookup globapp.org
nslookup admin.globapp.org
nslookup rider.globapp.org
```

**Expected output:** All should show `157.245.231.224`

### Test 2: Test API Endpoints

```powershell
# Test admin API
try {
    $response = Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET -UseBasicParsing
    Write-Host "✅ SUCCESS!"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Still propagating: $($_.Exception.Message)"
}
```

**Expected:** `{"ok":true,"version":"v1","environment":"development"}`

### Test 3: Test Web Apps

Open in browser:
- https://admin.globapp.org
- https://rider.globapp.org
- https://driver.globapp.org

**Expected:** All should load and API calls should work

---

## ✅ Success Criteria

After DNS propagates, you should see:

- [ ] `nslookup admin.globapp.org` shows `157.245.231.224`
- [ ] `curl https://admin.globapp.org/api/v1/health` returns JSON
- [ ] Web apps load and make API calls successfully
- [ ] Mobile app connects to API

---

## 🚀 After DNS Propagates

Once DNS is working:

1. **Test mobile app:**
   - Install/reinstall the APK
   - Launch the app
   - Verify it connects to API

2. **If mobile app still has issues:**
   - Rebuild APK to ensure latest config
   - Check mobile app logs for actual API URL being called

---

## 🔍 If DNS Still Not Working After 1 Hour

1. **Double-check Netlify DNS:**
   - Verify NETLIFY records are deleted
   - Verify A records exist and point to `157.245.231.224`

2. **Check DNS globally:**
   - Go to https://dnschecker.org
   - Enter: `admin.globapp.org`
   - Record type: `A`
   - Should show `157.245.231.224` globally

3. **Clear local DNS cache:**
   ```powershell
   ipconfig /flushdns
   ```

---

## 📝 Quick Test Script

**Run this in PowerShell after 10-15 minutes:**

```powershell
Write-Host "Testing DNS and API...`n"

# Test DNS
Write-Host "1. DNS Resolution:"
try {
    $dns = Resolve-DnsName admin.globapp.org -Type A
    foreach ($r in $dns) {
        if ($r.IPAddress -eq "157.245.231.224") {
            Write-Host "   ✅ Correct: $($r.IPAddress)"
        } else {
            Write-Host "   ❌ Wrong: $($r.IPAddress) (should be 157.245.231.224)"
        }
    }
} catch {
    Write-Host "   ⏳ Still propagating..."
}

# Test API
Write-Host "`n2. API Endpoint:"
try {
    $response = Invoke-WebRequest -Uri "https://admin.globapp.org/api/v1/health" -Method GET -UseBasicParsing
    Write-Host "   ✅ SUCCESS! Status: $($response.StatusCode)"
    Write-Host "   Response: $($response.Content)"
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)"
}
```

---

**Wait 10-15 minutes, then run the tests above!** 🎯










