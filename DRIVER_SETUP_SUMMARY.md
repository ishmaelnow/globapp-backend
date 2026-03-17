# Driver App – Setup Summary

## How drivers get access

1. **Admin creates the driver** (Admin app → Drivers → add driver with **phone** and **PIN**).
2. **Driver goes to** https://driver.globapp.org (or your driver URL).
3. **Driver logs in** with **phone** + **PIN** (no signup by driver; admin-only creation).
4. **Session** is stored in the browser (`localStorage`: `driver_auth` with `driver_id`, `access_token`, `refresh_token`). Logout clears it.

---

## Driver flow (after login)

| Tab | What it does |
|-----|----------------|
| **Assigned Ride** | Shows current assigned ride: rider name, **rider phone (masked)**, pickup, dropoff, status. Map, and buttons: Mark as En route / Arrived / In progress, Complete, Cancel. |
| **Location** | Get current location, Update Location, or **Start location tracking** (sends location to backend on an interval). |
| **My Rides** | List of this driver’s rides (history). |
| **Notifications** | In-app notifications (recipient_type = driver). |

---

## API & auth

- **Base URL:** Same as rider – production uses `/api/v1` (relative), dev uses `VITE_API_BASE_URL` or `https://globapp.org/api/v1`.
- **Public API key:** Sent as `X-API-Key` on all requests (from env or localStorage).
- **Driver auth:** After login, `Authorization: Bearer <access_token>` is added by the axios interceptor from `localStorage.driver_auth`.
- **Endpoints used:**  
  `POST /driver/login` (phone, pin, device_id)  
  `GET /driver/assigned-ride`  
  `PUT /driver/location`  
  `POST /driver/rides/:id/status`  
  `GET /driver/rides`  
  (+ notifications).

---

## Deploy (driver app)

**Local (repo root):** `C:\Users\koshi\cursor-apps\flask-react-project`  
**Driver app folder:** `driver-app`  
**On droplet:** `~/globapp-backend/driver-app`  
**Nginx serves from:** `/var/www/globapp/driver/` (e.g. https://driver.globapp.org)

### On droplet (after git pull)

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

---

## Rider phone for “driver calls rider”

Right now the **assigned-ride** API returns only **rider_phone_masked** (e.g. ***1234). So the driver sees a masked number and **cannot click-to-call** from the app.

To allow the driver to call the rider:

1. **Backend:** In the `GET /api/v1/driver/assigned-ride` response, include **rider_phone_e164** (full number) for the assigned ride only (driver is already authenticated).
2. **Frontend:** In DriverPortal, show a **“Call rider”** link: `<a href={`tel:${assignedRide.rider_phone_e164}`}>Call rider</a>` next to the masked display if you still want to show masked in logs.

---

## Checklist

- [ ] Admin has created at least one driver (phone + PIN).
- [ ] Driver can open https://driver.globapp.org and log in with that phone + PIN.
- [ ] After login, Assigned Ride / Location / My Rides / Notifications load without errors.
- [ ] If a ride is assigned to this driver, it appears under Assigned Ride with rider name, pickup, dropoff.
- [ ] (Optional) Add rider_phone_e164 + “Call rider” so the driver can call to confirm.
