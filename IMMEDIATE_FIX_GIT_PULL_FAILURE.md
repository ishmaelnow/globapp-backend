# Immediate Fix - Git Pull Failure

**YOU ARE HERE:** On your Droplet at `~/globapp-backend` with a git pull failure.

**DO THIS RIGHT NOW:**

---

## Step 1: Fix the Git Error (Copy and Paste These Commands)

**Run these commands one at a time:**

```bash
git config pull.rebase false
```

**Press Enter**

```bash
git pull origin main
```

**Press Enter**

**Expected:** Should pull successfully now.

---

## Step 2: Verify Apps Exist

```bash
ls -d rider-app driver-app admin-app
```

**Expected output:**
```
rider-app  driver-app  admin-app
```

**If you see "No such file or directory":** The apps aren't in Git yet. Skip to "If Apps Don't Exist" section below.

---

## Step 3: Build Rider App

```bash
cd ~/globapp-backend/rider-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/rider/
```

---

## Step 4: Build Driver App

```bash
cd ~/globapp-backend/driver-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/driver/
```

---

## Step 5: Build Admin App

```bash
cd ~/globapp-backend/admin-app
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/admin/
```

---

## Step 6: Fix Permissions

```bash
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chown -R www-data:www-data /var/www/globapp/admin
```

---

## Step 7: Test HTTP

**Open browser and visit:**
- `http://rider.globapp.app`
- `http://driver.globapp.app`
- `http://admin.globapp.app`

**If they load:** Continue to Step 8.

**If 500 error:** Check logs:
```bash
sudo tail -20 /var/log/nginx/error.log
```

---

## Step 8: Install SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d rider.globapp.app
sudo certbot --nginx -d driver.globapp.app
sudo certbot --nginx -d admin.globapp.app
```

**For each certbot command:**
- Enter email → Enter
- Type `A` → Enter (agree)
- Type `Y` or `N` → Enter (share email)
- Type `2` → Enter (redirect HTTP to HTTPS)

---

## Step 9: Update Backend CORS

```bash
cd ~/globapp-backend
nano app.py
```

**Find this section:**
```python
allow_origins=[
```

**Add these lines inside the brackets:**
```python
    "https://rider.globapp.app",
    "https://driver.globapp.app",
    "https://admin.globapp.app",
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Restart backend:**
```bash
sudo systemctl restart globapp-api
```

---

## Step 10: Test HTTPS

**Open browser and visit:**
- `https://rider.globapp.app`
- `https://driver.globapp.app`
- `https://admin.globapp.app`

**Done!**

---

## ⚠️ IF APPS DON'T EXIST (Step 2 Failed)

**You need to push apps from your local machine first.**

### On Your Windows Machine (Local):

**Open PowerShell or CMD and run:**

```bash
cd C:\Users\koshi\cursor-apps\flask-react-project
git add rider-app driver-app admin-app
git commit -m "Add separate apps"
git push origin main
```

**Wait for push to complete.**

### Then Back on Droplet:

```bash
cd ~/globapp-backend
git pull origin main
ls -d rider-app driver-app admin-app
```

**Now continue from Step 3 above.**

---

## 🆘 TROUBLESHOOTING

### If `npm install` fails:

```bash
node --version
```

**If Node.js not installed:**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### If build fails:

**Check for errors in the output. Common issues:**
- Missing dependencies → Run `npm install` again
- Syntax errors → Fix in local code, commit, push, pull again

### If 500 error:

```bash
sudo tail -50 /var/log/nginx/error.log
```

**Common fixes:**
- Files not copied → Re-do Steps 3-5
- Wrong permissions → Re-do Step 6
- Missing Nginx config → Check if configs exist:
  ```bash
  ls -la /etc/nginx/sites-available/ | grep globapp
  ```

### If CORS errors:

**Make sure Step 9 was done correctly. Check:**

```bash
cd ~/globapp-backend
grep -A 5 "allow_origins" app.py
```

**Should see your subdomains listed.**

---

## ✅ QUICK CHECKLIST

- [ ] Fixed git pull (Step 1)
- [ ] Verified apps exist (Step 2)
- [ ] Built and deployed Rider (Step 3)
- [ ] Built and deployed Driver (Step 4)
- [ ] Built and deployed Admin (Step 5)
- [ ] Fixed permissions (Step 6)
- [ ] Tested HTTP (Step 7)
- [ ] Installed SSL (Step 8)
- [ ] Updated CORS (Step 9)
- [ ] Tested HTTPS (Step 10)

---

**START WITH STEP 1 RIGHT NOW!**




