# Fix Empty API Key Issue

## The Problem

Your `/etc/globapp-api.env` has:
```
GLOBAPP_PUBLIC_API_KEY=
```

This is set but empty. The backend code should handle this, but let's verify.

## The Code Logic

```python
def _get_env(name: str) -> str | None:
    v = os.getenv(name)
    if v is None:
        return None
    v = v.strip()
    return v if v else None  # Empty string becomes None

PUBLIC_KEY = _get_env("GLOBAPP_PUBLIC_API_KEY")

def require_public_key(x_api_key: str | None):
    if not PUBLIC_KEY:  # Should be None if empty
        return
    # ... otherwise requires match
```

**Expected:** Empty string should become `None`, making API key optional.

## Solution: Remove the Line Entirely

**On your Droplet:**

```bash
# Edit the env file
sudo nano /etc/globapp-api.env
```

**Remove or comment out this line:**
```
GLOBAPP_PUBLIC_API_KEY=
```

**Or comment it:**
```
# GLOBAPP_PUBLIC_API_KEY=
```

**Save:** Ctrl+X, Y, Enter

**Restart:**
```bash
sudo systemctl restart globapp-api
```

**Verify:**
```bash
# Should return nothing (not set)
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY

# Test backend
curl http://127.0.0.1:8000/api/v1/health
```

## Why This Works

- If the variable is **not in the file at all**, `os.getenv()` returns `None`
- `PUBLIC_KEY` becomes `None`
- `require_public_key()` returns early (doesn't require API key)
- Matches local behavior!

## Alternative: Set a Real Value

If you want API key protection:

```bash
sudo nano /etc/globapp-api.env
```

Change to:
```
GLOBAPP_PUBLIC_API_KEY=your-actual-api-key-value-here
```

Then enter that value in the frontend UI.

## Recommended: Remove It

Since it worked locally without an API key, remove the line to match that behavior.




