# Check Domain Registrar - Not a Netlify Issue

## ✅ What We Know

- ✅ DNS records are correct in Netlify
- ✅ Nameservers point to Netlify
- ❌ Domain not resolving

**If it's NOT a Netlify issue, check the domain registrar.**

---

## 🔍 Check Domain Registrar

### Step 1: Find Where Domain is Registered

**Where did you buy `globapp.org`?**

**Common registrars:**
- NameCheap
- GoDaddy
- Google Domains
- DigitalOcean
- Netlify (if bought through them)
- Other

**Check whois:**
- Go to: https://whois.net
- Enter: `globapp.org`
- Look for "Registrar"

### Step 2: Check Domain Status at Registrar

**Login to domain registrar and check:**

1. **Domain Status:**
   - Is domain **Active**?
   - Is domain **Expired**?
   - Is domain **Suspended**?
   - Is domain **Locked**?

2. **Domain Expiration:**
   - When does domain expire?
   - Is it expired or expiring soon?

3. **Domain Locks:**
   - Is domain locked?
   - Any registrar holds?
   - Transfer lock?

### Step 3: Check Registrar DNS Settings

**In registrar dashboard:**

1. **Nameservers:**
   - Do they match Netlify nameservers?
   - Are they saved correctly?

2. **DNS Settings:**
   - Any DNS forwarding?
   - Any DNS blocking?
   - Any custom DNS settings?

3. **Domain Management:**
   - Is domain properly managed?
   - Any pending actions?

---

## 🧪 Diagnostic Commands

### Check Domain Status

**Windows PowerShell:**
```powershell
# Check if domain exists
Resolve-DnsName globapp.org -Type SOA

# Check nameservers
Resolve-DnsName globapp.org -Type NS

# Check DNS globally
# Go to: https://dnschecker.org
# Enter: admin.globapp.org
# Record type: A
```

### Check Domain Registration

**Online:**
- https://whois.net
- Enter: `globapp.org`
- Check:
  - Registrar
  - Expiration date
  - Status
  - Nameservers

---

## 🔴 Common Registrar Issues

### Issue 1: Domain Expired
**Symptom:** Domain doesn't resolve
**Fix:** Renew domain at registrar

### Issue 2: Domain Locked
**Symptom:** DNS changes don't work
**Fix:** Unlock domain at registrar

### Issue 3: Nameservers Not Updated
**Symptom:** DNS records exist but don't resolve
**Fix:** Update nameservers at registrar to point to Netlify

### Issue 4: Registrar DNS Override
**Symptom:** Registrar has its own DNS settings overriding Netlify
**Fix:** Clear registrar DNS settings, use Netlify nameservers only

### Issue 5: Domain Suspended
**Symptom:** Domain doesn't work at all
**Fix:** Contact registrar to unsuspend

---

## 📝 Checklist

- [ ] Found domain registrar
- [ ] Checked domain status (active/expired/suspended)
- [ ] Checked domain expiration date
- [ ] Checked for domain locks
- [ ] Verified nameservers at registrar match Netlify
- [ ] Checked registrar DNS settings
- [ ] Checked DNS propagation globally (dnschecker.org)

---

## 🚀 Next Steps

1. **Identify registrar** - Where is globapp.org registered?
2. **Check domain status** - Is it active and not expired?
3. **Verify nameservers** - Do they match Netlify?
4. **Check for locks** - Is domain locked or suspended?
5. **Contact registrar** - If domain status is wrong

---

**Tell me: Where is globapp.org registered? We'll check the registrar settings!** 🔍










