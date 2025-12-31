# Environment Variables Setup

## Overview
Each app has its own `.env` file for configuration. These files are already created with default values for local development.

## Files Created

### rider-app/.env
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000/api/v1)
- `VITE_PUBLIC_API_KEY` - Optional public API key

### driver-app/.env
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000/api/v1)
- No API key needed (uses driver authentication)

### admin-app/.env
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000/api/v1)
- `VITE_ADMIN_API_KEY` - Optional admin API key

## Usage

### Development (Current Setup)
The `.env` files are configured for local development:
- All apps point to `http://localhost:8000/api/v1`
- API keys are optional (can be entered in UI)

### Production
For production builds, update the `.env` files or use environment variables:

**Option 1: Update .env files**
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1
VITE_PUBLIC_API_KEY=your_public_key
VITE_ADMIN_API_KEY=your_admin_key
```

**Option 2: Use environment variables during build**
```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api/v1 npm run build
```

## Important Notes

1. **Vite Prefix**: All environment variables must start with `VITE_` to be accessible in the app
2. **Build Time**: These variables are embedded at build time, not runtime
3. **Security**: API keys in `.env` files will be included in the built app. For sensitive keys, consider:
   - Entering them in the UI instead
   - Using server-side environment variables
   - Using a secure key management system

## Updating Values

### For Local Development
Edit the `.env` file directly in each app directory.

### For Production
1. Update `.env` files, OR
2. Set environment variables before building:
   ```bash
   # Windows PowerShell
   $env:VITE_API_BASE_URL="https://your-backend.com/api/v1"
   npm run build
   
   # Linux/Mac
   VITE_API_BASE_URL="https://your-backend.com/api/v1" npm run build
   ```

## Testing

After updating `.env` files:
1. Restart the dev server (`npm run dev`)
2. Check browser console for API Base URL logs
3. Verify API calls are going to the correct endpoint

## Default Values

If `.env` files are missing or variables are not set, the apps will use:
- **API URL**: `http://localhost:8000/api/v1` (development) or `https://globapp.app/api/v1` (production fallback)
- **API Keys**: Empty (can be entered in UI)




