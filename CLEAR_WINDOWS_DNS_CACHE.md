# How to Clear Windows DNS Cache

## 🎯 Quick Method: PowerShell (Recommended)

### Step 1: Open PowerShell as Administrator

**Option A: From Start Menu**
1. Click **Start** button (Windows icon)
2. Type `PowerShell`
3. **Right-click** on "Windows PowerShell"
4. Select **"Run as administrator"**
5. Click **"Yes"** when prompted

**Option B: From Start Button**
1. **Right-click** the **Start** button (Windows icon)
2. Select **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
3. Click **"Yes"** when prompted

### Step 2: Clear DNS Cache

**In the PowerShell window, type:**

```powershell
ipconfig /flushdns
```

**Press Enter**

### Step 3: Verify Success

**You should see:**

```
Windows IP Configuration

Successfully flushed the DNS Resolver Cache.
```

**✅ Done!** DNS cache is cleared.

---

## 🔧 Alternative Method: Command Prompt

### Step 1: Open Command Prompt as Administrator

**Option A: From Start Menu**
1. Click **Start** button
2. Type `cmd` or `command prompt`
3. **Right-click** on "Command Prompt"
4. Select **"Run as administrator"**
5. Click **"Yes"** when prompted

**Option B: From Start Button**
1. **Right-click** the **Start** button
2. Select **"Command Prompt (Admin)"** or **"Terminal (Admin)"**
3. Click **"Yes"** when prompted

### Step 2: Clear DNS Cache

**In the Command Prompt window, type:**

```cmd
ipconfig /flushdns
```

**Press Enter**

### Step 3: Verify Success

**You should see:**

```
Windows IP Configuration

Successfully flushed the DNS Resolver Cache.
```

**✅ Done!** DNS cache is cleared.

---

## ✅ After Clearing Cache

### Test DNS Resolution

**In PowerShell or Command Prompt:**

```powershell
# Test DNS resolution
Resolve-DnsName globapp.org
Resolve-DnsName admin.globapp.org
```

**Expected:** Should return `157.245.231.224`

**If still not resolving:**
- Wait a few more minutes (DNS propagation)
- Clear browser cache (see below)
- Try different DNS servers

---

## 🌐 Also Clear Browser Cache

**After clearing Windows DNS cache, also clear browser cache:**

### Microsoft Edge:
1. Press `Ctrl + Shift + Delete`
2. Select **"Cached images and files"**
3. Click **"Clear now"**
4. Close all Edge windows

### Google Chrome:
1. Press `Ctrl + Shift + Delete`
2. Select **"Cached images and files"**
3. Click **"Clear data"**
4. Close all Chrome windows

**Or use Chrome's DNS cache flush:**
1. Go to: `chrome://net-internals/#dns`
2. Click **"Clear host cache"**
3. Click **"Flush sockets"**

---

## 🔍 Troubleshooting

### If "ipconfig /flushdns" doesn't work:

**Check if you're running as Administrator:**
- The window title should say "Administrator" or "Admin"
- If not, close and reopen as Administrator

**Try alternative command:**

```powershell
# PowerShell alternative
Clear-DnsClientCache
```

**Or restart DNS service:**

```powershell
# Stop DNS service
net stop dnscache

# Start DNS service
net start dnscache
```

**Note:** Requires Administrator privileges

---

## 📋 Complete Checklist

- [ ] Open PowerShell/Command Prompt as Administrator
- [ ] Run `ipconfig /flushdns`
- [ ] Verify "Successfully flushed" message
- [ ] Test DNS: `Resolve-DnsName globapp.org`
- [ ] Clear Edge cache: `Ctrl+Shift+Delete`
- [ ] Clear Chrome cache: `Ctrl+Shift+Delete`
- [ ] Close all browser windows
- [ ] Open browser fresh and test: `https://globapp.org`

---

## 🎯 Summary

**To clear Windows DNS cache:**

1. **Open PowerShell as Administrator**
2. **Run:** `ipconfig /flushdns`
3. **Verify:** "Successfully flushed" message
4. **Test:** `Resolve-DnsName globapp.org`
5. **Clear browser cache** (Edge/Chrome)
6. **Test in browser:** `https://globapp.org`

**That's it!** After clearing cache, DNS should resolve correctly in all browsers! ✅










