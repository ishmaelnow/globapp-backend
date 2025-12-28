# Simplified Branch Model - Workflow

## Branch Structure

```
main (integration/release)
  ├── backend (source of truth = Cursor)
  └── frontend (source of truth = Cursor)
```

## Branches Created

✅ **`backend`** - Created from `main`
✅ **`frontend`** - Created from `main`  
✅ **`main`** - Integration/release branch

## Rules

### ✅ Cursor (Your Development Machine)
- **Backend changes** → Push to `backend` branch
- **Frontend changes** → Push to `frontend` branch
- **Never push directly to `main`**
- **To release**: Create PR merging `backend` + `frontend` → `main`

### ✅ Server (DigitalOcean Droplet)
- **Only pulls** from GitHub
- **Never pushes** to GitHub
- **Pulls from `main`** after merge (gets both backend + frontend)

## Workflow

### Making Backend Changes (Cursor)

```powershell
# 1. Switch to backend branch
git checkout backend

# 2. Pull latest (in case of any updates)
git pull origin backend --rebase

# 3. Make changes to app.py, etc.
# Edit app.py, add endpoints, etc.

# 4. Commit backend changes
git add app.py requirements.txt
git commit -m "backend: Add new endpoint"

# 5. Push to backend branch
git push origin backend
```

### Making Frontend Changes (Cursor)

```powershell
# 1. Switch to frontend branch
git checkout frontend

# 2. Pull latest
git pull origin frontend --rebase

# 3. Make changes to frontend/
cd frontend
# Edit React components, etc.

# 4. Commit frontend changes
git add frontend/
git commit -m "frontend: Add new component"

# 5. Push to frontend branch
git push origin frontend
```

### Releasing (Merging to Main)

When ready to release:

1. **On GitHub:**
   - Go to repository → Pull Requests → New Pull Request
   - Base: `main`
   - Compare: `backend` (or `frontend`, or both)
   - Create PR: "Release: Merge backend and frontend"
   - Merge when ready

2. **Or merge both branches:**
   - Create PR: `backend` → `main`
   - Create PR: `frontend` → `main`
   - Merge both

3. **After merge, sync locally:**
   ```powershell
   git checkout main
   git pull origin main --rebase
   ```

### Server Deployment (DigitalOcean Droplet)

```bash
# Server only pulls, never pushes
cd ~/globapp-backend
git checkout main
git pull origin main --rebase

# Server now has latest backend + frontend from main
```

## Current Status

✅ **Branches created:**
- `backend` - exists on GitHub
- `frontend` - exists on GitHub
- `main` - exists on GitHub

✅ **Next steps:**
1. Set up branch protection on `main` (require PR)
2. Start working on `backend` or `frontend` branches
3. Server pulls from `main` after releases

## Benefits

- ✅ **No collisions** - Only Cursor pushes
- ✅ **Clear separation** - Backend vs Frontend
- ✅ **Controlled releases** - Main only updated via PR
- ✅ **Server stays clean** - Only pulls, never pushes




