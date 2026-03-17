# Rider App – Deploy Quick Reference

## Local (Windows)

**Repo root:** `C:\Users\koshi\cursor-apps\flask-react-project`  
**Rider app folder:** `C:\Users\koshi\cursor-apps\flask-react-project\rider-app`

### Push changes

```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project
git add .
git status
git commit -m "Your message"
git push origin main
```

---

## Droplet (SSH)

**Repo on server:** `~/globapp-backend` (= `/home/ishmael/globapp-backend`)  
**Rider app on server:** `~/globapp-backend/rider-app`  
**Nginx serves from:** `/var/www/globapp/rider/` (e.g. https://rider.globapp.org)

### 1. SSH in

```bash
ssh ishmael@YOUR_DROPLET_IP
```

### 2. Pull, build, deploy rider app

```bash
cd ~/globapp-backend
git pull origin main

cd rider-app
npm install
npm run build

sudo cp -r dist/* /var/www/globapp/rider/
sudo chown -R www-data:www-data /var/www/globapp/rider
sudo chmod -R 755 /var/www/globapp/rider
```

### 3. (Optional) Reload nginx

```bash
sudo systemctl reload nginx
```

---

## One-liner (after SSH, from home dir)

```bash
cd ~/globapp-backend && git pull origin main && cd rider-app && npm install && npm run build && sudo cp -r dist/* /var/www/globapp/rider/ && sudo chown -R www-data:www-data /var/www/globapp/rider && sudo chmod -R 755 /var/www/globapp/rider
```

---

## Driver app (double-check setup)

**URL:** https://driver.globapp.org (or your driver subdomain)  
**Path on droplet:** `~/globapp-backend/driver-app`  
**Nginx root:** `/var/www/globapp/driver/`

### Deploy driver app (on droplet)

```bash
cd ~/globapp-backend
git pull origin main

cd driver-app
npm install
npm run build

sudo cp -r dist/* /var/www/globapp/driver/
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver
```

**Driver access:** No self-signup. Admin creates drivers (phone + PIN) in Admin app; drivers log in at driver.globapp.org with that phone + PIN. See **DRIVER_SETUP_SUMMARY.md** for full flow.

---

## Driver / Admin (same idea)

| App    | On droplet              | Copy to                    |
|--------|-------------------------|----------------------------|
| Rider  | `~/globapp-backend/rider-app`  | `/var/www/globapp/rider/`  |
| Driver | `~/globapp-backend/driver-app` | `/var/www/globapp/driver/` |
| Admin  | `~/globapp-backend/admin-app` | `/var/www/globapp/admin/`  |

**Driver one-liner:**  
`cd ~/globapp-backend/driver-app && npm run build && sudo cp -r dist/* /var/www/globapp/driver/ && sudo chown -R www-data:www-data /var/www/globapp/driver`

**Admin:**  
`cd ~/globapp-backend/admin-app && npm run build && sudo cp -r dist/* /var/www/globapp/admin/ && sudo chown -R www-data:www-data /var/www/globapp/admin`

---

## If changes don’t show after deploy

1. **On droplet – confirm you have latest code**
   ```bash
   cd ~/globapp-backend
   git fetch origin
   git log -1 --oneline
   ```
   You should see `8a846c4 Added map background` (or a newer commit). If not:
   ```bash
   git pull origin main
   ```

2. **On droplet – clean build and redeploy**
   ```bash
   cd ~/globapp-backend/rider-app
   rm -rf dist node_modules/.vite
   npm run build
   sudo cp -r dist/* /var/www/globapp/rider/
   sudo chown -R www-data:www-data /var/www/globapp/rider
   sudo chmod -R 755 /var/www/globapp/rider
   ```

3. **In the browser**
   - Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac).
   - Or open the site in a private/incognito window to avoid cache.
