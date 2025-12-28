# Fix GitHub Permission Denied Error

## The Problem
You're getting "Permission denied" when trying to push to GitHub. This means Git doesn't have your credentials.

## Solution Options

### Option 1: Use Personal Access Token (Easiest)

**Step 1: Create a Personal Access Token on GitHub**

1. Go to GitHub.com → Click your profile picture (top right)
2. Go to **Settings** → **Developer settings** (bottom left)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**
5. Give it a name: `globapp-push`
6. Select expiration: `90 days` or `No expiration`
7. Check these permissions:
   - ✅ `repo` (Full control of private repositories)
8. Click **Generate token**
9. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Step 2: Use Token When Pushing**

When you push, Git will ask for password. Use the token instead:

```powershell
git push origin master:main
# Username: ishmaelnow
# Password: [paste your token here]
```

**Step 3: Save Credentials (Optional)**

To avoid entering it every time:

```powershell
# Windows Credential Manager will save it
git config --global credential.helper wincred
```

Or use GitHub CLI (see Option 2)

---

### Option 2: Use GitHub CLI (Recommended)

**Step 1: Install GitHub CLI**

Download from: https://cli.github.com/
Or via winget:
```powershell
winget install GitHub.cli
```

**Step 2: Authenticate**

```powershell
gh auth login
```

Follow the prompts:
- Choose GitHub.com
- Choose HTTPS
- Authenticate via browser
- Choose your token permissions

**Step 3: Push**

```powershell
git push origin master:main
```

---

### Option 3: Switch to SSH (More Secure)

**Step 1: Generate SSH Key**

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter for default location
# Press Enter for no passphrase (or set one)
```

**Step 2: Add SSH Key to GitHub**

1. Copy your public key:
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   # Or on Windows:
   type $env:USERPROFILE\.ssh\id_ed25519.pub
   ```

2. Go to GitHub.com → Settings → SSH and GPG keys
3. Click **New SSH key**
4. Paste the key
5. Click **Add SSH key**

**Step 3: Change Remote URL to SSH**

```powershell
git remote set-url origin git@github.com:ishmaelnow/globapp-backend.git
```

**Step 4: Test Connection**

```powershell
ssh -T git@github.com
# Should say: "Hi ishmaelnow! You've successfully authenticated..."
```

**Step 5: Push**

```powershell
git push origin master:main
```

---

### Option 4: Use GitHub Desktop (Easiest GUI)

1. Download: https://desktop.github.com/
2. Sign in with your GitHub account
3. Add your repository
4. Push via the GUI

---

## Quick Fix (Try This First)

If you just want to push right now:

1. **Create a Personal Access Token** (see Option 1, Step 1)
2. **Change remote URL to include token** (temporary):

```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/ishmaelnow/globapp-backend.git
git push origin master:main
```

Then change it back:
```powershell
git remote set-url origin https://github.com/ishmaelnow/globapp-backend.git
```

---

## Verify Authentication

After setting up, test:

```powershell
git push origin master:main
```

Should work without errors!

---

## Which Option Should You Use?

- **Quick fix**: Option 1 (Personal Access Token)
- **Long-term**: Option 2 (GitHub CLI) or Option 3 (SSH)
- **GUI preference**: Option 4 (GitHub Desktop)




