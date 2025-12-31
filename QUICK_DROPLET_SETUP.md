# Quick Setup: Get Apps on Droplet

## Issue
The `rider-app`, `driver-app`, and `admin-app` directories don't exist on your Droplet yet.

## Solution: Pull Latest Code

**On your Droplet, run:**

```bash
# Make sure you're in the right directory
cd ~/globapp-backend

# Pull latest code from GitHub
git pull origin main

# Verify the apps now exist
ls -d rider-app driver-app admin-app
```

**Expected output:** Should see all three directories listed.

---

## If Apps Still Don't Exist

**Check what branch you're on:**
```bash
git branch
```

**Check remote branches:**
```bash
git branch -r
```

**If apps are on a different branch:**
```bash
# Check what branches have the apps
git fetch origin
git branch -r | grep -E "(frontend|main|master)"

# Switch to the branch with the apps (likely 'main' or 'frontend')
git checkout main
# or
git checkout frontend

# Pull again
git pull origin main
# or
git pull origin frontend
```

---

## Verify Apps Exist

```bash
# List all directories
ls -la

# Check specifically for the app directories
ls -d */ | grep -E "(rider|driver|admin)"
```

**Expected:** Should see `rider-app/`, `driver-app/`, `admin-app/`

---

## If Still Missing: Check GitHub

The apps might be in a different branch or repository. Check:
1. Go to https://github.com/ishmaelnow/globapp-backend
2. Check which branch has the `rider-app`, `driver-app`, `admin-app` folders
3. Pull from that branch

---

## Once Apps Are Present

Continue with the deployment guide:
- See `DEPLOY_SUBDOMAINS_COMPLETE_GUIDE.md` Step 4 onwards



