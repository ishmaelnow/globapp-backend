# Commands to Run on Droplet - Payment Feature Deployment

## Complete Command List

Copy and paste these commands one by one on your droplet:

---

## Step 1: SSH into Your Droplet

```bash
ssh ishmael@YOUR_DROPLET_IP
```

---

## Step 2: Navigate to Project Directory

```bash
cd ~/globapp-backend
```

---

## Step 3: Pull Latest Changes

**If your droplet uses `frontend` branch:**
```bash
git pull origin frontend
```

**OR if your droplet uses `main` branch:**
```bash
git checkout main
git pull origin frontend
# Or merge frontend into main:
git merge frontend
```

**OR to pull frontend branch directly:**
```bash
git fetch origin
git checkout frontend
git pull origin frontend
```

---

## Step 4: Activate Virtual Environment (if using one)

```bash
source .venv/bin/activate
# OR if venv is in different location:
# source venv/bin/activate
```

---

## Step 5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- fastapi
- uvicorn
- psycopg
- pydantic
- stripe

---

## Step 6: Run Database Migrations

**Migration 1: Create payment tables**
```bash
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
```

**Migration 2: Add payment fields to rides table**
```bash
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
```

**Verify migrations ran successfully:**
```bash
psql $DATABASE_URL -c "\d fare_quotes"
psql $DATABASE_URL -c "\d payments"
psql $DATABASE_URL -c "\d rides" | grep payment
```

---

## Step 7: Restart Backend Service

**If using systemd service:**
```bash
sudo systemctl restart globapp-backend
```

**OR if running manually:**
```bash
pkill -f uvicorn
cd ~/globapp-backend
source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8000 &
```

**Check if backend is running:**
```bash
sudo systemctl status globapp-backend
# OR
curl http://localhost:8000/api/health
```

---

## Step 8: (Optional) Rebuild Frontend

If you want to update the frontend on the droplet:

```bash
cd ~/globapp-backend/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
sudo systemctl reload nginx
```

---

## Complete One-Liner Script (Copy All at Once)

```bash
cd ~/globapp-backend && \
git pull origin frontend && \
source .venv/bin/activate && \
pip install -r requirements.txt && \
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql && \
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql && \
sudo systemctl restart globapp-backend && \
echo "✅ Payment feature deployed!"
```

---

## Verification Commands

After deployment, verify everything works:

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

## Troubleshooting

### If git pull fails:
```bash
# Check current branch
git branch

# Switch to frontend branch
git checkout frontend

# Pull again
git pull origin frontend
```

### If migrations fail:
```bash
# Check if tables already exist
psql $DATABASE_URL -c "\d fare_quotes"

# If they exist, migrations already ran - skip them
```

### If backend won't start:
```bash
# Check logs
sudo journalctl -u globapp-backend -n 50

# Or if running manually, check for errors:
cd ~/globapp-backend
source .venv/bin/activate
python -c "import pricing_engine; print('OK')"
```

---

## Quick Reference

**Essential commands (minimum needed):**
```bash
cd ~/globapp-backend
git pull origin frontend
source .venv/bin/activate
pip install -r requirements.txt
psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql
psql $DATABASE_URL -f migrations/002_add_ride_payment_fields.sql
sudo systemctl restart globapp-backend
```

---

**That's it! Your payment feature should now be live on the droplet.** 🎉

