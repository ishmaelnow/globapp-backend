# Multi-Machine Git Workflow

## What Happened

You have code in **two places**:
1. **Cursor (Windows)** - Has latest code (frontend + updated backend)
2. **DigitalOcean Droplet (Linux)** - Has older code (before frontend was added)

When you tried to push from the droplet, Git rejected it because:
- GitHub has newer commits (from Cursor)
- Droplet has older commits
- Git won't let you overwrite newer work

## Current Situation

```
GitHub (main):     [old] → [CORS fix] → [frontend] → [latest]
                                    ↑
Cursor:            [old] → [CORS fix] → [frontend] → [latest] ✅
                                    ↑
Droplet:           [old] → [CORS fix]                    ❌ (outdated)
```

## Solution: Sync Droplet with GitHub

### Step 1: Pull Latest Code on Droplet

On your DigitalOcean droplet, run:

```bash
cd ~/globapp-backend
git fetch origin
git pull origin main --rebase
```

This will:
- Download the latest code from GitHub
- Apply your local changes on top
- Resolve any conflicts if needed

### Step 2: If There Are Conflicts

If `git pull` shows conflicts:

1. **See what conflicted:**
   ```bash
   git status
   ```

2. **Resolve conflicts:**
   - Open conflicted files
   - Look for `<<<<<<<`, `=======`, `>>>>>>>` markers
   - Keep the version you want
   - Remove the markers

3. **Complete the merge:**
   ```bash
   git add .
   git rebase --continue
   ```

### Step 3: Verify Everything is Synced

```bash
git log --oneline -5
# Should show the same commits as GitHub
```

---

## Best Practices for Multi-Machine Development

### ✅ Your Rules Are Correct!

**Rule 1: Never push to main directly from multiple machines**
- ✅ Correct! This causes conflicts
- Use feature branches instead

**Rule 2: Create feature branches**
- ✅ Perfect approach
- Each machine works on its own branch

**Rule 3: Pull/rebase before every push**
- ✅ Excellent practice
- Keeps everything in sync

### Recommended Workflow

#### On Cursor (Your Development Machine):

```powershell
# 1. Always start by syncing
git checkout main
git pull origin main --rebase

# 2. Create feature branch
git checkout -b feature/add-new-feature

# 3. Make changes, commit
git add .
git commit -m "Add new feature"

# 4. Push feature branch
git push -u origin feature/add-new-feature

# 5. Create Pull Request on GitHub
# 6. Merge PR to main
# 7. Pull main again
git checkout main
git pull origin main --rebase
```

#### On Droplet (Production Server):

```bash
# 1. ALWAYS pull before making changes
git checkout main
git pull origin main --rebase

# 2. If you need to make changes, use feature branch
git checkout -b feature/server-fix

# 3. Make changes, commit
git add .
git commit -m "Server configuration fix"

# 4. Push feature branch
git push -u origin feature/server-fix

# 5. Create PR and merge (or merge locally if urgent)
git checkout main
git pull origin main --rebase
git merge feature/server-fix
git push origin main
```

---

## Quick Fix for Current Situation

### On Droplet (Right Now):

```bash
cd ~/globapp-backend

# Option 1: Pull and merge (safest)
git pull origin main --rebase

# Option 2: If you have local changes you want to keep
git stash                    # Save your changes
git pull origin main --rebase
git stash pop               # Reapply your changes
git add .
git commit -m "Merge latest from GitHub"
git push origin main

# Option 3: If droplet code is outdated and you want GitHub version
git fetch origin
git reset --hard origin/main  # ⚠️ WARNING: Discards local changes!
```

---

## Setting Up Proper Workflow

### 1. Make Droplet Read-Only for Main Branch

On GitHub:
- Go to repository → Settings → Branches
- Add branch protection rule for `main`
- Require pull request reviews
- Prevent direct pushes

### 2. Use Feature Branches Always

**Cursor:**
```powershell
git checkout -b feature/cursor-changes
# work, commit, push
git push -u origin feature/cursor-changes
```

**Droplet:**
```bash
git checkout -b feature/droplet-changes
# work, commit, push
git push -u origin feature/droplet-changes
```

### 3. Always Pull Before Push

Create an alias to make it easier:

```bash
# On droplet
git config --global alias.sync '!git pull origin main --rebase && git push origin main'

# Usage:
git sync
```

---

## Current Action Items

### Immediate (Fix the conflict):

1. **On Droplet:**
   ```bash
   cd ~/globapp-backend
   git pull origin main --rebase
   ```

2. **If conflicts:**
   - Resolve them
   - `git add .`
   - `git rebase --continue`

3. **Verify:**
   ```bash
   git log --oneline -5
   # Should match GitHub
   ```

### Long-term (Set up workflow):

1. ✅ Always use feature branches
2. ✅ Always pull before push
3. ✅ Use PRs to merge to main
4. ✅ Keep main as the source of truth

---

## Summary

**What happened:** Droplet has old code, GitHub has new code (from Cursor)

**Fix:** Pull latest code on droplet:
```bash
git pull origin main --rebase
```

**Going forward:** 
- Use feature branches
- Always pull before push
- Never push directly to main from multiple places




