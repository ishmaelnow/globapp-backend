# Complete .env Files Configuration

## Overview
Each app has its own `.env` file with the proper API keys configured. Here's what each file contains:

## ✅ rider-app/.env

```env
# Rider App Environment Variables
# Development Configuration

# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Public API Key
VITE_PUBLIC_API_KEY=yesican
```

**Purpose:** Used for ride booking and public API requests.

---

## ✅ driver-app/.env

```env
# Driver App Environment Variables
# Development Configuration

# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Note: Driver app uses driver authentication (login), not API keys
```

**Purpose:** No API key needed - drivers authenticate with phone/PIN login.

---

## ✅ admin-app/.env

```env
# Admin App Environment Variables
# Development Configuration

# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Admin API Key
VITE_ADMIN_API_KEY=admincan
```

**Purpose:** Required for admin dashboard operations (managing drivers, dispatching rides, etc.).

---

## API Keys Reference

| Key Type | Value | Used By |
|----------|-------|---------|
| Public API Key | `yesican` | rider-app |
| Admin API Key | `admincan` | admin-app |
| Driver Auth | N/A (uses login) | driver-app |

---

## Production Configuration

For production builds, update the `.env` files with production URLs:

### rider-app/.env (Production)
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
# or relative path if same domain:
# VITE_API_BASE_URL=/api/v1

VITE_PUBLIC_API_KEY=yesican
```

### driver-app/.env (Production)
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
# or relative path if same domain:
# VITE_API_BASE_URL=/api/v1
```

### admin-app/.env (Production)
```env
VITE_API_BASE_URL=https://globapp.app/api/v1
# or relative path if same domain:
# VITE_API_BASE_URL=/api/v1

VITE_ADMIN_API_KEY=admincan
```

---

## Important Notes

1. **Vite Prefix**: All variables must start with `VITE_` to be accessible in the app
2. **Build Time**: These values are embedded at build time (`npm run build`)
3. **Development**: Values are read when you run `npm run dev`
4. **Security**: API keys in `.env` files will be included in the built JavaScript files
   - For production, consider:
     - Using environment variables during build
     - Entering keys in the UI instead
     - Using a secure key management system

---

## Verifying Configuration

After setting up `.env` files:

1. **Restart dev server** if running:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Check browser console** - You should see:
   ```
   API Base URL: http://localhost:8000/api/v1
   Public API Key configured: Yes (for rider-app)
   Admin API Key configured: Yes (for admin-app)
   ```

3. **Test the apps**:
   - Rider app should work without entering API key
   - Admin app should work without entering API key
   - Driver app uses login, no API key needed

---

## Current Status

✅ All three `.env` files are created with proper values
✅ API keys are configured correctly
✅ Ready for development testing




