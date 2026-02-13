# Fix ADB Connection Refused Error

**Error:** `cannot connect to 192.168.1.158:5555: No connection could be made because the target machine actively refused it. (10061)`

---

## 🔧 Fix 1: Use Pairing Code (Android 11+)

**Newer Android versions require pairing first:**

### On Your Phone:
1. Settings → Developer Options → Wireless Debugging
2. Tap **"Pair device with pairing code"**
3. Note the **pairing code** and **port number** (e.g., port `12345`)

### On Your Computer:
```powershell
# Pair first using the pairing code
adb pair 192.168.1.158:PAIRING_PORT

# Enter the pairing code when prompted
# Then connect normally
adb connect 192.168.1.158:5555
```

---

## 🔧 Fix 2: Check Wireless Debugging Settings

**On your phone:**
1. Settings → Developer Options → Wireless Debugging
2. Make sure it's **ON** and shows "Wireless debugging is active"
3. Check the IP address matches (`192.168.1.158`)
4. Make sure port is `5555` (or note the actual port shown)

---

## 🔧 Fix 3: Try USB Instead (If Available)

**If USB works even briefly:**

```powershell
# Connect phone via USB
adb devices

# If device shows up, install directly
adb install "C:\Users\koshi\cursor-apps\rider-mobile-pwa\android\app\build\outputs\apk\release\newrideapp-release.apk"
```

---

## 🔧 Fix 4: Use Telegram (Easiest Alternative!)

**Since ADB is having issues, use Telegram:**

1. **On computer:** Open Telegram → Send `newrideapp-release.apk` to "Saved Messages"
2. **On phone:** Open Telegram → Go to "Saved Messages" → Download APK
3. **Install:** Tap downloaded file → Install

**Telegram handles large files much better than Google Drive!**

---

## 🔧 Fix 5: Try Different Port

**Sometimes the port isn't 5555:**

```powershell
# Check what port Wireless Debugging shows on phone
# Try connecting with that specific port
adb connect 192.168.1.158:ACTUAL_PORT_SHOWN_ON_PHONE
```

---

## 🎯 Recommended: Use Telegram!

**Since ADB is having connection issues, Telegram is the fastest solution:**
- ✅ Supports large files (79 MB is fine)
- ✅ No connection setup needed
- ✅ Works reliably
- ✅ Easy to use

---

## 📋 Quick Checklist

**If you want to fix ADB:**
- [ ] Enable Wireless Debugging on phone
- [ ] Use pairing code method (Android 11+)
- [ ] Check IP address matches
- [ ] Check port number
- [ ] Make sure phone and computer on same WiFi

**Or use Telegram (easier!):**
- [ ] Send APK to yourself via Telegram
- [ ] Download on phone
- [ ] Install

---

**Try Telegram - it's the easiest solution right now!** 🚀








