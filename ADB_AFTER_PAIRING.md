# ADB Connection After Pairing

**Pairing successful, but connection still failing?**

---

## ✅ After Pairing, You Need to Connect

**The pairing code is just for authentication. You still need to connect:**

### Step 1: Check Port on Phone

**On your phone:**
1. Settings → Developer Options → Wireless Debugging
2. Look at **"IP address & port"** section
3. It might show: `192.168.1.158:XXXXX` (where XXXXX is a port number)

**Note:** The port might NOT be 5555! It could be something like `34567` or `41234`

### Step 2: Connect Using Correct Port

**On your computer:**
```powershell
# Use the EXACT port shown on your phone
adb connect 192.168.1.158:ACTUAL_PORT_SHOWN_ON_PHONE
```

**Example:**
```powershell
# If phone shows: 192.168.1.158:34567
adb connect 192.168.1.158:34567
```

### Step 3: Verify Connection

```powershell
adb devices
```

**Should show:**
```
List of devices attached
192.168.1.158:34567    device
```

### Step 4: Install APK

```powershell
adb install "C:\Users\koshi\cursor-apps\rider-mobile-pwa\android\app\build\outputs\apk\release\newrideapp-release.apk"
```

---

## 🔧 If Still Not Working

### Try These:

1. **Toggle Wireless Debugging:**
   - Turn OFF Wireless Debugging on phone
   - Turn it back ON
   - Check new IP/port
   - Try connecting again

2. **Check Both Devices on Same WiFi:**
   - Make sure phone and computer are on the same WiFi network
   - Try disconnecting/reconnecting WiFi on phone

3. **Try USB Instead:**
   - If USB works even briefly, use it:
   ```powershell
   adb devices  # Should show device
   adb install "path\to\newrideapp-release.apk"
   ```

4. **Check Firewall:**
   - Windows Firewall might be blocking ADB
   - Temporarily disable firewall to test

---

## 📋 Quick Checklist

- [ ] Paired successfully ✅
- [ ] Checked IP and port on phone
- [ ] Connected using correct port: `adb connect IP:PORT`
- [ ] Verified with `adb devices`
- [ ] Installed APK: `adb install path\to\apk`

---

**What IP and port does your phone show in Wireless Debugging settings?** 🔍








