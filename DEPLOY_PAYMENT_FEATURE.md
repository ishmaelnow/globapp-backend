# Deploy Payment Feature to Droplet - Step by Step

## ⚠️ Important: Your Setup

- **Local Machine (Cursor)**: Where you edit code
- **Remote Droplet**: Where backend runs (`~/globapp-backend` on Ubuntu)
- **Files I Created**: Are on your LOCAL machine, need to be transferred to droplet

---

## Option 1: Use Git (Recommended - Best Practice)

### Step 1: Commit Changes Locally

On your **local machine** (Cursor):

```powershell
# Make sure you're in the project root
cd C:\Users\koshi\cursor-apps\flask-react-project

# Check what files were created/modified
git status

# Add all new files
git add .
git add requirements.txt pricing_engine.py distance_calculator.py payment_providers.py
git add migrations/
git add frontend/src/services/paymentService.js
git add frontend/src/components/PaymentSelection.jsx
git add app.py  # Updated file

# Commit
git commit -m "Add payment feature with Stripe and Cash support"

# Push to your repository
git push origin main  # or your branch name
```

### Step 2: Pull on Droplet

SSH into your droplet:

```bash
ssh ishmael@YOUR_DROPLET_IP
cd ~/globapp-backend
git pull origin main
```

### Step 3: Install Dependencies on Droplet

```bash
cd ~/globapp-backend
source .venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt
```

### Step 4: Run Database Migrations

```bash
cd ~/globapp-backend
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

### Step 5: Restart Backend Service

```bash
# If using systemd service
sudo systemctl restart globapp-backend

# Or if running manually
pkill -f uvicorn
cd ~/globapp-backend
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000 &
```

---

## Option 2: Manual File Transfer (Quick but Manual)

### Step 1: Transfer Files via SCP

From your **local machine** (Windows PowerShell):

```powershell
# Set your droplet IP (replace with actual IP)
$DROPLET_IP = "YOUR_DROPLET_IP"
$USER = "ishmael"

# Transfer backend Python files
scp requirements.txt ${USER}@${DROPLET_IP}:~/globapp-backend/
scp pricing_engine.py ${USER}@${DROPLET_IP}:~/globapp-backend/
scp distance_calculator.py ${USER}@${DROPLET_IP}:~/globapp-backend/
scp payment_providers.py ${USER}@${DROPLET_IP}:~/globapp-backend/
scp app.py ${USER}@${DROPLET_IP}:~/globapp-backend/

# Transfer migrations folder
scp -r migrations ${USER}@${DROPLET_IP}:~/globapp-backend/

# Transfer frontend files
scp frontend/src/services/paymentService.js ${USER}@${DROPLET_IP}:~/globapp-backend/frontend/src/services/
scp frontend/src/components/PaymentSelection.jsx ${USER}@${DROPLET_IP}:~/globapp-backend/frontend/src/components/
scp frontend/src/components/RideBooking.jsx ${USER}@${DROPLET_IP}:~/globapp-backend/frontend/src/components/
```

### Step 2: On Droplet - Install Dependencies

```bash
cd ~/globapp-backend
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 3: Run Migrations

```bash
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

### Step 4: Restart Backend

```bash
sudo systemctl restart globapp-backend
# or manually restart uvicorn
```

---

## Option 3: Create Files Directly on Droplet (If Git Not Available)

SSH into droplet and create files manually:

### Step 1: Create requirements.txt

```bash
ssh ishmael@YOUR_DROPLET_IP
cd ~/globapp-backend

cat > requirements.txt << 'EOF'
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
psycopg[binary]>=3.1.0
pydantic>=2.0.0
stripe>=7.0.0
EOF
```

### Step 2: Create Python Files

You'll need to copy the content of each file. I can provide a script to create them all at once if needed.

### Step 3: Install and Migrate

```bash
source .venv/bin/activate
pip install -r requirements.txt
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

---

## Complete Checklist

### Files That Need to Be on Droplet:

**Backend Files:**
- [ ] `requirements.txt` (NEW)
- [ ] `pricing_engine.py` (NEW)
- [ ] `distance_calculator.py` (NEW)
- [ ] `payment_providers.py` (NEW)
- [ ] `app.py` (UPDATED - has new endpoints)
- [ ] `migrations/001_add_fare_payment_tables.sql` (NEW)
- [ ] `migrations/002_add_ride_payment_fields.sql` (NEW)

**Frontend Files:**
- [ ] `frontend/src/services/paymentService.js` (NEW)
- [ ] `frontend/src/components/PaymentSelection.jsx` (NEW)
- [ ] `frontend/src/components/RideBooking.jsx` (UPDATED)

### Steps to Complete:

1. [ ] Transfer files to droplet (Git, SCP, or manual)
2. [ ] Install Python dependencies: `pip install -r requirements.txt`
3. [ ] Run database migrations
4. [ ] Restart backend service
5. [ ] Rebuild frontend: `cd frontend && npm run build`
6. [ ] Copy frontend build: `sudo cp -r frontend/dist/* /var/www/globapp/frontend/`
7. [ ] Reload nginx: `sudo systemctl reload nginx`

---

## Verification

After deployment, test:

```bash
# Check backend is running
curl http://localhost:8000/api/health

# Test fare estimate endpoint
curl -X POST http://localhost:8000/api/v1/fare/estimate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{"pickup": "123 Main St", "dropoff": "456 Oak Ave"}'

# Check database tables exist
psql $DATABASE_URL -c "\d fare_quotes"
psql $DATABASE_URL -c "\d payments"
```

---

## Which Option Should You Use?

**Use Git (Option 1)** if:
- ✅ You have git repository set up
- ✅ You want version control
- ✅ You want easiest workflow going forward

**Use SCP (Option 2)** if:
- ✅ You need quick deployment
- ✅ Git is not set up
- ✅ You want to test before committing

**Use Manual (Option 3)** if:
- ✅ You don't have SSH access from local machine
- ✅ You prefer to create files directly on server
- ✅ You're already SSH'd into droplet

---

## Going Forward: Clear Workflow

**When I create backend files:**
1. ✅ Files are created on your **LOCAL machine** (Cursor)
2. ⚠️ You need to **deploy them to droplet** (Git push + pull, or SCP)
3. ⚠️ Then **restart services** on droplet

**When I create frontend files:**
1. ✅ Files are created on your **LOCAL machine** (Cursor)
2. ⚠️ You need to **deploy them to droplet** (Git push + pull, or SCP)
3. ⚠️ Then **rebuild frontend** on droplet
4. ⚠️ Then **copy to nginx directory** and reload nginx

I'll make this clearer in future responses! 🎯


