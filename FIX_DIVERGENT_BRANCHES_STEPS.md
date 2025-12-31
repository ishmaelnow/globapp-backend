# Step-by-Step Fix for Divergent Branches

## Problem
Git is asking you to specify how to reconcile divergent branches when pulling.

## Solution Steps

### Step 1: Check Current Status
```bash
git status
```

### Step 2: Handle Uncommitted Changes (if any)
If you have uncommitted changes, either:

**Option A: Stash them (temporary save)**
```bash
git stash push -m "Saving changes before pull"
```

**Option B: Commit them**
```bash
git add .
git commit -m "Your commit message"
```

### Step 3: Choose Pull Strategy

**Option 1: Merge Strategy (Recommended)**
This creates a merge commit combining both histories:
```bash
git config pull.rebase false
git pull origin main
```

**Option 2: Rebase Strategy**
This replays your local commits on top of remote commits:
```bash
git config pull.rebase true
git pull origin main
```

**Option 3: Fast-Forward Only**
This only works if you have no local commits:
```bash
git config pull.ff only
git pull origin main
```

### Step 4: Execute the Pull
After setting the strategy, run:
```bash
git pull origin main
```

### Step 5: Handle Conflicts (if any)
If conflicts occur:
1. Git will mark conflicted files
2. Edit the files to resolve conflicts
3. Stage resolved files: `git add <file>`
4. Complete the merge/rebase: `git commit` (for merge) or `git rebase --continue` (for rebase)

### Step 6: Restore Stashed Changes (if you stashed)
```bash
git stash pop
```

## Set Default Strategy Globally (Optional)
To avoid this prompt in the future, set a global default:

```bash
# For merge strategy (recommended)
git config --global pull.rebase false

# OR for rebase strategy
git config --global pull.rebase true

# OR for fast-forward only
git config --global pull.ff only
```

## Quick One-Line Fix
If you want to merge and pull in one command:
```bash
git pull origin main --no-rebase
```

Or for rebase:
```bash
git pull origin main --rebase
```

## What Each Strategy Does

- **Merge**: Creates a merge commit that combines both branch histories. Preserves all commit history.
- **Rebase**: Replays your local commits on top of the remote commits. Creates a linear history.
- **Fast-forward only**: Only pulls if it can fast-forward (no local commits). Fails if branches have diverged.



