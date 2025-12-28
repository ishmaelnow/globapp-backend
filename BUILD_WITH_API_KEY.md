# Build Frontend with Embedded API Key

## The Solution

The API key is now automatically embedded in the frontend build, so users don't need to enter it manually!

## How It Works

1. **Build-time**: API key is embedded via environment variable `VITE_PUBLIC_API_KEY`
2. **Runtime**: Frontend automatically uses the embedded key
3. **Fallback**: If user enters a key manually, that takes priority (for flexibility)

## Build Frontend on Droplet

**On your Droplet:**

```bash
cd ~/globapp-backend/frontend

# Create .env.production file with API key
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production

# Build frontend (API key will be embedded)
npm run build

# Deploy the built files
sudo cp -r dist/* /var/www/globapp/frontend/

# Reload nginx (if needed)
sudo systemctl reload nginx
```

## Verify It Works

1. Visit `https://globapp.app/rider`
2. Try booking a ride **without** entering any API key
3. It should work automatically!

## Priority Order

The frontend uses API key in this order:
1. **User-entered** (localStorage) - if user manually enters one
2. **Build-time** (`VITE_PUBLIC_API_KEY`) - embedded during build
3. **Empty** - API key optional

## For Future Builds

Every time you rebuild the frontend, include the API key:

```bash
cd ~/globapp-backend/frontend
export VITE_PUBLIC_API_KEY=yesican
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

Or create `.env.production` file permanently:

```bash
cd ~/globapp-backend/frontend
echo "VITE_PUBLIC_API_KEY=yesican" > .env.production
npm run build
sudo cp -r dist/* /var/www/globapp/frontend/
```

## Security Note

⚠️ **Important**: The API key will be visible in the built JavaScript files. This is fine for a **public** API key that's meant to be used by the frontend. For sensitive keys, use proper authentication (JWT tokens, etc.).

Since `GLOBAPP_PUBLIC_API_KEY` is meant for public use, embedding it is acceptable.




