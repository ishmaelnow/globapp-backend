# Quick Fix: Make API Key Optional

## The Problem

Locally it worked because `GLOBAPP_PUBLIC_API_KEY` wasn't set, so the backend didn't require it.
On Droplet, if it's set (even empty), it might be causing issues.

## Quick Fix: Make It Optional

**On your Droplet:**

```bash
# Edit the systemd env file
sudo nano /etc/globapp-api.env
```

**Make sure `GLOBAPP_PUBLIC_API_KEY` is either:**
1. **Not in the file at all** (remove the line if it exists)
2. **Or set to empty**: `GLOBAPP_PUBLIC_API_KEY=`

**Then restart:**
```bash
sudo systemctl restart globapp-api
```

## Why This Works

The backend code checks:
```python
if not PUBLIC_KEY:  # If not set or empty, don't require it
    return
```

So if `GLOBAPP_PUBLIC_API_KEY` is not set or empty, the API key becomes optional (like locally).

## Verify

```bash
# Check it's not set
sudo systemctl show globapp-api --property=Environment | grep GLOBAPP_PUBLIC_API_KEY

# Should return nothing (or empty value)
```

Then test your frontend - it should work without requiring an API key!




