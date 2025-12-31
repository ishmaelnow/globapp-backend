# Troubleshooting: requirements.txt Not Found on Droplet

## The Problem

You're getting:
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

This means the file doesn't exist on your droplet yet.

---

## Why This Happened

The `requirements.txt` file was pushed to GitHub on the `frontend` branch, but your droplet hasn't pulled it yet.

---

## Solution: Pull the Latest Changes

### Step 1: Check Current Branch

```bash
cd ~/globapp-backend
git branch
```

**Expected output:**
- `* main` (if on main branch)
- `* frontend` (if on frontend branch)

### Step 2: Pull the Changes

**If you're on `main` branch:**
```bash
git pull origin frontend
# This pulls frontend branch into main
```

**OR switch to frontend branch:**
```bash
git checkout frontend
git pull origin frontend
```

**OR fetch and merge:**
```bash
git fetch origin
git merge origin/frontend
```

### Step 3: Verify Files Are There

```bash
# Check if requirements.txt exists
ls -la requirements.txt

# Check if other payment files exist
ls -la pricing_engine.py
ls -la payment_providers.py
ls -la distance_calculator.py
ls -la migrations/
```

**If files exist → Continue to Step 4**
**If files don't exist → See "Alternative Solutions" below**

### Step 4: Install Dependencies

```bash
cd ~/globapp-backend
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Alternative Solutions

### Option 1: Check What Branch Droplet Is On

```bash
cd ~/globapp-backend
git status
git branch -a
```

If droplet is on `main` and files are on `frontend`, you need to either:
- Switch to frontend: `git checkout frontend`
- Or merge frontend into main: `git merge origin/frontend`

### Option 2: Manually Create requirements.txt

If git pull isn't working, create the file manually:

```bash
cd ~/globapp-backend
cat > requirements.txt << 'EOF'
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
psycopg[binary]>=3.1.0
pydantic>=2.0.0
stripe>=7.0.0
EOF
```

Then install:
```bash
pip install -r requirements.txt
```

### Option 3: Check Git Remote

```bash
cd ~/globapp-backend
git remote -v
```

Should show:
```
origin  https://github.com/ishmaelnow/globapp-backend.git (fetch)
origin  https://github.com/ishmaelnow/globapp-backend.git (push)
```

If not, add it:
```bash
git remote add origin https://github.com/ishmaelnow/globapp-backend.git
```

---

## Complete Troubleshooting Steps

Run these commands on your droplet:

```bash
# 1. Go to project directory
cd ~/globapp-backend

# 2. Check current status
git status
git branch

# 3. Fetch latest from GitHub
git fetch origin

# 4. See what branches exist
git branch -a

# 5. Pull frontend branch
git pull origin frontend

# 6. If that doesn't work, try:
git checkout frontend
git pull origin frontend

# 7. Verify files exist
ls -la requirements.txt pricing_engine.py

# 8. If files exist, install
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Quick Fix (If Git Pull Fails)

If git pull isn't working, manually create the file:

```bash
cd ~/globapp-backend
cat > requirements.txt << 'EOF'
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
psycopg[binary]>=3.1.0
pydantic>=2.0.0
stripe>=7.0.0
EOF

source .venv/bin/activate
pip install -r requirements.txt
```

---

## Verify Everything Is Pulled

After pulling, check these files exist:

```bash
cd ~/globapp-backend
ls -la | grep -E "(requirements|pricing|payment|distance|migrations)"
```

Should see:
- `requirements.txt`
- `pricing_engine.py`
- `payment_providers.py`
- `distance_calculator.py`
- `migrations/` directory

---

## Next Steps After Fixing

Once `requirements.txt` exists:

1. ✅ Install dependencies: `pip install -r requirements.txt`
2. ✅ Run migrations: `psql $DATABASE_URL -f migrations/001_add_fare_payment_tables.sql`
3. ✅ Restart backend: `sudo systemctl restart globapp-api`







