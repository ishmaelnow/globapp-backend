# Separate React Apps for GlobApp

This project now contains three independent React applications:

1. **rider-app** - Booking interface for riders
2. **driver-app** - Driver portal for drivers
3. **admin-app** - Admin dashboard for administrators

## Structure

```
flask-react-project/
├── rider-app/          # Rider booking app (port 3001)
├── driver-app/         # Driver portal app (port 3002)
├── admin-app/          # Admin dashboard app (port 3003)
└── frontend/           # Original combined app (port 3000)
```

## Running the Apps

Each app can be run independently:

### Rider App
```bash
cd rider-app
npm install
npm run dev
```
Runs on http://localhost:3001

### Driver App
```bash
cd driver-app
npm install
npm run dev
```
Runs on http://localhost:3002

### Admin App
```bash
cd admin-app
npm install
npm run dev
```
Runs on http://localhost:3003

## Building for Production

Each app can be built independently:

```bash
cd rider-app
npm run build
# Output: rider-app/dist/

cd driver-app
npm run build
# Output: driver-app/dist/

cd admin-app
npm run build
# Output: admin-app/dist/
```

## Deployment

Each app can be deployed separately to different domains or subdomains:
- `rider.yourdomain.com` - Rider app
- `driver.yourdomain.com` - Driver app
- `admin.yourdomain.com` - Admin app

Or deploy all three to the same domain with different paths using a reverse proxy (nginx, etc.)

## Features

### Rider App
- Book Ride
- My Bookings
- Ride Details

### Driver App
- Driver Login
- Assigned Ride
- Update Location
- My Rides

### Admin App
- Drivers Management
- Available Drivers
- Driver Presence
- Rides Dispatch
- Active Rides

## Shared Dependencies

All apps share the same dependencies and can be updated independently. Each app has its own:
- `package.json`
- `vite.config.js`
- `index.html`
- Build output directory

## Notes

- Each app is completely independent
- They can be developed, built, and deployed separately
- Shared components/services are copied to each app (not symlinked)
- Each app has its own node_modules after `npm install`




