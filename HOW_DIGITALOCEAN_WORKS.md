# How DigitalOcean App Platform Works

## Key Concepts

### ❌ You DON'T Copy Files Manually
- DigitalOcean **automatically pulls** code from your GitHub repository
- No manual file copying needed
- No SSH/terminal access required (unlike Droplets)

### ✅ DigitalOcean Connects to GitHub
- DigitalOcean reads your code directly from GitHub
- When you push code to GitHub, DigitalOcean automatically deploys
- It's like connecting a pipe: GitHub → DigitalOcean

### 🏗️ App Platform vs Droplets

**App Platform (What You're Using):**
- Managed service (like Heroku, Vercel)
- Automatically builds and deploys from GitHub
- No server management needed
- Multiple "components" in one app (backend + frontend)

**Droplets (VPS - Not What You're Using):**
- Virtual private server (like a remote computer)
- You manage everything yourself
- Need to SSH in and manually deploy
- More control, more work

## How It Works Step-by-Step

### Step 1: Push Code to GitHub
```bash
# In your local project folder
git add .
git commit -m "Add frontend deployment config"
git push origin main
```

### Step 2: DigitalOcean Reads from GitHub
- DigitalOcean is already connected to your GitHub repo
- It watches for changes on your `main` branch
- When you push, it automatically detects the changes

### Step 3: DigitalOcean Builds Your App
- Reads your `.do/app.yaml` file (or manual config)
- Runs build commands:
  - Backend: `pip install -r requirements.txt`
  - Frontend: `npm ci && npm run build`
- Creates deployment artifacts

### Step 4: DigitalOcean Deploys
- Deploys backend to handle `/api/*` routes
- Deploys frontend to handle `/` routes
- Both run in the **same app** (not separate droplets)

## Your Current Setup

Based on your backend being at `https://globapp.app`, you're using **DigitalOcean App Platform**.

### What You Have Now:
- ✅ Backend API component (handles `/api/*`)
- ❌ Frontend component (needs to be added)

### What You Need to Do:

#### Option A: Add Frontend to Existing App (Easiest)

1. **Push your code to GitHub** (if not already there):
   ```bash
   git add .
   git commit -m "Add frontend"
   git push
   ```

2. **Go to DigitalOcean Dashboard**:
   - Navigate to: https://cloud.digitalocean.com/apps
   - Click on your existing `globapp` app

3. **Add Frontend Component**:
   - Click "Settings" → "Components"
   - Click "Edit Components" or "Add Component"
   - Click "+" to add a new component
   - Select "Static Site"

4. **Configure Frontend**:
   - **Name**: `frontend`
   - **Source Directory**: `/frontend` (tells DO where your frontend code is)
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist` (where Vite puts built files)
   - **Routes**: `/` (serve frontend at root)

5. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add new variable:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://globapp.app/api/v1`
     - **Scope**: Build Time (important!)

6. **Save and Deploy**:
   - Click "Save Changes"
   - DigitalOcean will automatically:
     - Pull latest code from GitHub
     - Build the frontend
     - Deploy it

#### Option B: Use Configuration File

1. **Update `.do/app.yaml`**:
   - Change `your-username/your-repo-name` to your actual GitHub repo
   - Example: `koshi/globapp` or whatever your repo is

2. **Push to GitHub**:
   ```bash
   git add .do/app.yaml
   git commit -m "Add deployment config"
   git push
   ```

3. **In DigitalOcean**:
   - Go to your app → Settings → Components
   - Click "Edit Components"
   - Click "Use a configuration file"
   - Select `.do/app.yaml`
   - Save

## Visual Flow

```
Your Computer
    ↓ (git push)
GitHub Repository
    ↓ (automatic)
DigitalOcean App Platform
    ├── Backend Component (Python)
    │   └── Handles: /api/*
    └── Frontend Component (Static Site)
        └── Handles: /
```

## Important Points

1. **Same App, Different Components**:
   - Backend and frontend are **components** in the **same app**
   - Not separate droplets or servers
   - Both share the same domain: `https://globapp.app`

2. **Automatic Deployments**:
   - Every time you `git push`, DigitalOcean rebuilds and redeploys
   - No manual steps needed after initial setup

3. **Source Directory**:
   - `/frontend` tells DigitalOcean: "look in the frontend folder"
   - DigitalOcean clones your entire repo, then looks in that folder

4. **Build vs Runtime**:
   - **Build Time**: When building the app (npm install, npm run build)
   - **Runtime**: When the app is running
   - `VITE_API_BASE_URL` must be **Build Time** because Vite embeds it during build

## Checklist

- [ ] Code is pushed to GitHub
- [ ] DigitalOcean app is connected to your GitHub repo
- [ ] Frontend component is added to your app
- [ ] Environment variable `VITE_API_BASE_URL` is set (Build Time)
- [ ] Routes are configured (`/` for frontend, `/api/*` for backend)
- [ ] Save and deploy!

## Need Help?

If you're not sure:
1. Check if your code is on GitHub
2. Check if DigitalOcean is connected to that repo
3. Follow Option A above (easiest method)

