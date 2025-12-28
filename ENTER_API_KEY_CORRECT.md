# Enter API Key - Correct Value

## Correct API Key

**Public API Key:** `yesican`

---

## Steps to Enter API Key

### Step 1: Go to Ride Booking Page
- Open: `https://globapp.app/rider`

### Step 2: Click "API Key" Button
- Look at **top right** of the form
- Click the **"API Key"** button

### Step 3: Enter the API Key
- Text field appears: **"Public API Key (Optional)"**
- Enter: `yesican`
- (It shows as dots because it's a password field)

### Step 4: Save It
- Click **"Save"** button OR click outside the field
- You'll see: **"API key saved"**

### Step 5: Test
- Fill in the ride booking form
- Click **"Get Price Estimate"** or **"Book Now"**
- Should work now!

---

## Quick Summary

1. Go to `https://globapp.app/rider`
2. Click **"API Key"** (top right)
3. Enter: `yesican`
4. Click **"Save"**
5. Try booking a ride!

---

## Also Update Backend (If Needed)

Make sure your `/etc/globapp-api.env` on the Droplet has:

```
GLOBAPP_PUBLIC_API_KEY=yesican
GLOBAPP_ADMIN_API_KEY=admincan
DATABASE_URL=postgresql://globapp_user:2024@localhost:5432/globapp_db
GLOBAPP_JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
GLOBAPP_ACCESS_TOKEN_MINUTES=15
GLOBAPP_REFRESH_TOKEN_DAYS=30
```

Then restart:
```bash
sudo systemctl restart globapp-api
```




