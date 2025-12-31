# Troubleshooting Step 7: Driver App Deployment

## Common Issues and Solutions

### Issue 1: Command Not Found or Permission Denied

**If you get "command not found" or permission errors:**

```bash
# Make sure you're in the right directory
cd ~/globapp-backend/driver-app

# Check if directory exists
pwd
# Should show: /home/ishmael/globapp-backend/driver-app

# Check if npm is installed
npm --version
# If not installed, install Node.js first (see Step 4)
```

---

### Issue 2: npm install Fails

**If npm install fails:**

```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If still fails, check Node.js version
node --version
# Should be v18.x or higher
```

---

### Issue 3: Build Fails

**If `npm run build` fails:**

```bash
# Check for errors in the output
# Common issues:
# - Missing dependencies
# - Syntax errors in code
# - Environment variable issues

# Try cleaning and rebuilding
rm -rf node_modules dist
npm install
npm run build
```

---

### Issue 4: Copy Fails (Directory Doesn't Exist)

**If `/var/www/globapp/driver/` doesn't exist:**

```bash
# Create the directory first
sudo mkdir -p /var/www/globapp/driver

# Then copy files
sudo cp -r dist/* /var/www/globapp/driver/
```

---

### Issue 5: Permission Errors

**If you get permission denied errors:**

```bash
# Check current permissions
ls -la /var/www/globapp/

# Fix ownership
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver

# If still having issues, check if you're using sudo
sudo ls -la /var/www/globapp/driver/
```

---

## Step-by-Step Debugging

**Run these commands one by one and share the output:**

```bash
# 1. Check current directory
pwd

# 2. Verify driver-app exists
ls -la ~/globapp-backend/driver-app/

# 3. Check Node.js and npm
node --version
npm --version

# 4. Navigate to driver-app
cd ~/globapp-backend/driver-app

# 5. Check if package.json exists
ls -la package.json

# 6. Try installing dependencies
npm install

# 7. Check if dist directory exists after build
npm run build
ls -la dist/

# 8. Check if web directory exists
ls -la /var/www/globapp/driver/

# 9. Try copying files
sudo cp -r dist/* /var/www/globapp/driver/
```

---

## Quick Fix: Complete Step 7 Commands

**Copy and paste these commands one at a time:**

```bash
# Navigate to driver-app
cd ~/globapp-backend/driver-app

# Install dependencies
npm install

# Build for production
npm run build

# Verify build succeeded
ls -la dist/

# Create directory if it doesn't exist
sudo mkdir -p /var/www/globapp/driver

# Copy to web directory
sudo cp -r dist/* /var/www/globapp/driver/

# Set permissions
sudo chown -R www-data:www-data /var/www/globapp/driver
sudo chmod -R 755 /var/www/globapp/driver

# Verify files
ls -la /var/www/globapp/driver/
```

---

## What Error Are You Seeing?

Please share:
1. **The exact command you ran**
2. **The exact error message**
3. **The output of:** `pwd` and `ls -la ~/globapp-backend/driver-app/`

This will help me provide a specific solution!



