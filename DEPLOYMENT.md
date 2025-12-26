# DigitalOcean Deployment Guide

This guide explains how to deploy both the backend API and frontend to DigitalOcean App Platform.

## Prerequisites

- DigitalOcean account
- GitHub repository with your code
- Backend already deployed at `https://globapp.app`

## Option 1: Add Frontend to Existing App (Recommended)

If your backend is already deployed, you can add the frontend as a static site component to the same app.

### Steps:

1. **Go to DigitalOcean App Platform Dashboard**
   - Navigate to your existing `globapp` app
   - Click "Settings" → "Components"

2. **Add Static Site Component**
   - Click "Edit Components" or "Add Component"
   - Select "Static Site"
   - Configure:
     - **Name**: `frontend`
     - **Source Directory**: `/frontend`
     - **Build Command**: `npm ci && npm run build`
     - **Output Directory**: `dist`
     - **HTTP Port**: `8080` (or leave default)

3. **Set Environment Variables**
   - Add build-time environment variable:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://globapp.app/api/v1`
     - **Scope**: Build Time

4. **Configure Routes**
   - Set the frontend route to `/` (root)
   - Ensure API routes are `/api/*` (handled by backend)

5. **Deploy**
   - Save changes
   - DigitalOcean will automatically build and deploy

## Option 2: Deploy Frontend as Separate App

If you prefer separate apps, use the `.do/app.yaml` in the `frontend` directory.

### Steps:

1. **Create New App**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub repository

2. **Use Configuration File**
   - Select "Use a configuration file"
   - Point to `frontend/.do/app.yaml`
   - Or manually configure using the settings below

3. **Manual Configuration** (if not using config file):
   - **Type**: Static Site
   - **Source Directory**: `/frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**:
     - `VITE_API_BASE_URL` = `https://globapp.app/api/v1` (Build Time)

4. **Deploy**
   - Save and deploy

## Option 3: Deploy Both Together (New Setup)

If setting up from scratch, use the root `.do/app.yaml` file.

### Steps:

1. **Create New App**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub repository

2. **Use Configuration File**
   - Select "Use a configuration file"
   - Point to `.do/app.yaml` in the root directory

3. **Update Configuration**
   - Edit `.do/app.yaml`:
     - Update `github.repo` with your actual repository
     - Update environment variables as needed

4. **Deploy**
   - Save and deploy

## Post-Deployment

### Update CORS (if needed)

After deploying the frontend, update `app.py` CORS configuration to include your frontend URL:

```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://globapp.app",  # Your frontend URL
    "https://www.globapp.app",
],
```

### Verify Deployment

1. **Check Frontend**: Visit `https://globapp.app` (or your frontend URL)
2. **Check API**: Visit `https://globapp.app/api/v1/health`
3. **Test Connection**: Try booking a ride from the frontend

## Troubleshooting

### Build Fails

- Check that `package.json` has all dependencies
- Verify Node.js version (DigitalOcean uses Node 18+ by default)
- Check build logs in DigitalOcean dashboard

### CORS Errors

- Ensure backend CORS includes your frontend URL
- Redeploy backend after CORS changes
- Check browser console for specific error messages

### Routes Not Working

- Verify route configuration in DigitalOcean
- Frontend should be at `/`
- API should be at `/api/*`
- Check `vite.config.js` base path

### Environment Variables

- `VITE_API_BASE_URL` must be set at **BUILD TIME** (not runtime)
- Changes require a rebuild
- Use `https://` not `http://` for production

## Cost Estimate

- Static Site: ~$5/month (basic-xxs)
- API Service: ~$5/month (basic-xxs)
- Total: ~$10/month for both

## Next Steps

1. Set up custom domain (if desired)
2. Configure SSL certificates (automatic with DigitalOcean)
3. Set up CI/CD for automatic deployments
4. Monitor logs and performance

