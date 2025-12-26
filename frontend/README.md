# GlobApp Frontend

React frontend for the GlobApp ride-sharing platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
   - Copy `.env.example` to `.env.local`
   - Update `VITE_API_BASE_URL` with your DigitalOcean backend URL
   - Example: `VITE_API_BASE_URL=https://your-app.ondigitalocean.app/api/v1`

3. Start development server:
```bash
npm run dev
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8000/api/v1)

## Features

- **Landing Page**: Beautiful landing page with navigation to all sections
- **Rider Portal**: Book rides and view booking history
- **Driver Portal**: Login, update location, manage assigned rides
- **Admin Dashboard**: Manage drivers, dispatch rides, monitor presence

## API Configuration

The app supports:
- Public API key (optional, for ride booking)
- Admin API key (required for admin dashboard)
- Driver authentication (JWT tokens)

API keys can be configured in the respective sections of the app.
