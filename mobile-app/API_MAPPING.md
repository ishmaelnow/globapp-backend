# GlobApp Mobile App - API Mapping Documentation

This document maps the React Native mobile app to the GlobApp backend API endpoints.

## Base Configuration

- **Backend URL**: `https://globapp.app/api/v1`
- **Environment Variable**: `EXPO_PUBLIC_API_BASE_URL` (optional, defaults to above)
- **API Version**: v1

## Authentication

### Public Endpoints
- Some endpoints require `X-API-Key` header (optional if `GLOBAPP_PUBLIC_API_KEY` is not set)
- Public API key can be set via `EXPO_PUBLIC_API_KEY` environment variable

### Driver Endpoints
- Require `Authorization: Bearer <access_token>` header
- Access tokens obtained via `/driver/login` endpoint
- Tokens expire after 15 minutes (configurable)
- Refresh tokens available via `/driver/refresh`

### Admin Endpoints
- Require `X-API-Key` header with admin key
- Admin API key can be set via `EXPO_PUBLIC_ADMIN_API_KEY` environment variable

## API Endpoints Mapping

### Health & Info

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `publicService.getHealth()` | `/api/v1/health` | GET | None | Health check |
| - | `/api/v1/info` | GET | None | API info |
| - | `/api/v1/time` | GET | None | Server time |

### Rides (Public)

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `rideService.getRideQuote()` | `/api/v1/rides/quote` | POST | Public Key* | Get ride quote |
| `paymentService.estimateFare()` | `/api/v1/fare/estimate` | POST | Public Key* | Estimate fare (alias for quote) |
| `rideService.createRide()` | `/api/v1/rides` | POST | Public Key* | Create new ride |
| `rideService.getMyRides()` | `/api/v1/rides/my-rides` | GET | Public Key* | Get rider's ride history |
| `rideService.getRideDetails()` | `/api/v1/rides/{ride_id}` | GET | Public Key* | Get ride details |
| `rideTrackingService.getRideDriverLocation()` | `/api/v1/rides/{ride_id}/driver-location` | GET | Public Key* | Get driver location for ride |

### Payments

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `paymentService.getPaymentOptions()` | `/api/v1/payment/options` | GET | Public Key* | Get available payment methods |
| `paymentService.createPaymentIntent()` | `/api/v1/payment/create-intent` | POST | Public Key* | Create payment intent |
| `paymentService.confirmPayment()` | `/api/v1/payment/confirm` | POST | Public Key* | Confirm payment |

**Note**: `/fare/accept` endpoint does not exist. The flow is:
1. Estimate fare (`/fare/estimate` or `/rides/quote`)
2. Create ride (`/rides`)
3. Create payment intent (`/payment/create-intent`)
4. Confirm payment (`/payment/confirm`)

### Driver Authentication

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `driverService.driverLogin()` | `/api/v1/driver/login` | POST | None | Login with phone & PIN |
| `driverService.driverRefresh()` | `/api/v1/driver/refresh` | POST | None | Refresh access token |

### Driver Operations (Requires Bearer Token)

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `driverService.updateDriverLocation()` | `/api/v1/driver/location` | PUT | Bearer | Update driver location |
| `driverService.getAssignedRide()` | `/api/v1/driver/assigned-ride` | GET | Bearer | Get assigned ride |
| `driverService.updateRideStatus()` | `/api/v1/driver/rides/{ride_id}/status` | POST | Bearer | Update ride status |
| `driverService.getDriverRides()` | `/api/v1/driver/rides` | GET | Bearer | Get driver's ride history |

### Admin Operations (Requires Admin API Key)

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `adminService.listDrivers()` | `/api/v1/drivers` | GET | Admin Key | List all drivers |
| `adminService.createDriver()` | `/api/v1/drivers` | POST | Admin Key | Create driver |
| `adminService.getDriverLocation()` | `/api/v1/drivers/{driver_id}/location` | GET | Admin Key | Get driver location |
| `adminService.getAvailableDrivers()` | `/api/v1/dispatch/available-drivers` | GET | Admin Key | Get available drivers |
| `adminService.getDriverPresence()` | `/api/v1/dispatch/driver-presence` | GET | Admin Key | Get driver presence status |
| `adminService.listDispatchRides()` | `/api/v1/dispatch/rides` | GET | Admin Key | List dispatch rides |
| `adminService.assignRide()` | `/api/v1/dispatch/rides/{ride_id}/assign` | POST | Admin Key | Assign ride to driver |
| `adminService.autoAssignRide()` | `/api/v1/dispatch/rides/{ride_id}/auto-assign` | POST | Admin Key | Auto-assign ride |
| `adminService.getActiveRides()` | `/api/v1/dispatch/active-rides` | GET | Admin Key | Get active rides |
| `adminService.getPaymentReports()` | `/api/v1/admin/payments/reports` | GET | Admin Key | Get payment reports |
| `adminService.getDriverMetrics()` | `/api/v1/admin/drivers/metrics` | GET | Admin Key | Get driver metrics |
| `adminService.getRidesHistory()` | `/api/v1/admin/rides/history` | GET | Admin Key | Get ride history |
| `adminService.getAutoAssignmentSetting()` | `/api/v1/admin/settings/auto-assignment` | GET | Admin Key | Get auto-assignment setting |
| `adminService.updateAutoAssignmentSetting()` | `/api/v1/admin/settings/auto-assignment` | PUT | Admin Key | Update auto-assignment setting |

### Notifications

| Mobile App | Backend Endpoint | Method | Auth | Description |
|------------|-----------------|--------|------|-------------|
| `notificationService.getRiderNotifications()` | `/api/v1/notifications` | GET | Public Key* | Get notifications for rider |
| `notificationService.getRideNotifications()` | `/api/v1/notifications` | GET | Public Key* | Get notifications for ride |
| `notificationService.getAllNotifications()` | `/api/v1/notifications` | GET | Public Key* | Get all notifications |
| `notificationService.markNotificationRead()` | `/api/v1/notifications/{notification_id}/read` | POST | Public Key* | Mark notification as read |

## Service Files

### `src/config/api.ts`
- Base API configuration
- Axios instance setup
- API key interceptors

### `src/services/publicService.ts`
- Public endpoints (health, quotes, rides)

### `src/services/rideService.ts`
- Ride management (create, get, history)

### `src/services/paymentService.ts`
- Payment operations (estimate, create intent, confirm)

### `src/services/driverService.ts`
- Driver authentication and operations

### `src/services/adminService.ts`
- Admin operations (drivers, dispatch, reports)

### `src/services/rideTrackingService.ts`
- Ride tracking and location services

### `src/services/notificationService.ts`
- Notification management

## Request/Response Examples

### Create Ride
```typescript
// Request
POST /api/v1/rides
Headers: { "Content-Type": "application/json", "X-API-Key": "optional" }
Body: {
  "rider_name": "John Doe",
  "rider_phone": "1234567890",
  "pickup": "123 Main St",
  "dropoff": "456 Oak Ave",
  "service_type": "economy"
}

// Response
{
  "ride_id": "uuid",
  "rider_name": "John Doe",
  "status": "requested",
  "estimated_price_usd": 12.50,
  ...
}
```

### Driver Login
```typescript
// Request
POST /api/v1/driver/login
Body: {
  "phone": "1234567890",
  "pin": "1234",
  "device_id": "optional"
}

// Response
{
  "driver_id": "uuid",
  "access_token": "jwt_token",
  "access_token_expires_minutes": 15,
  "refresh_token": "token",
  "refresh_token_expires_days": 30
}
```

### Update Driver Location
```typescript
// Request
PUT /api/v1/driver/location
Headers: { "Authorization": "Bearer <access_token>" }
Body: {
  "lat": 40.7128,
  "lng": -74.0060,
  "heading_deg": 90,
  "speed_mph": 25,
  "accuracy_m": 10
}

// Response
{
  "ok": true,
  "driver_id": "uuid",
  "updated_at_utc": "2024-01-01T00:00:00Z"
}
```

## Error Handling

All endpoints may return standard HTTP error codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "detail": "Error message description"
}
```

## CORS Configuration

The backend CORS is configured to allow:
- Local development servers (localhost:3000, 3001, 3002, 3003, 5173, 8081, 19000, 19001, 19002)
- Production domains (globapp.app, rider.globapp.app, driver.globapp.app, admin.globapp.app)
- Mobile app development (Expo dev server)

## Environment Variables

### Mobile App (.env or app.json)
- `EXPO_PUBLIC_API_BASE_URL` - Backend API base URL (default: `https://globapp.app/api/v1`)
- `EXPO_PUBLIC_API_KEY` - Public API key (optional)
- `EXPO_PUBLIC_ADMIN_API_KEY` - Admin API key (optional, for admin features)
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key (for address autocomplete)

## Notes

1. **Public API Key**: If `GLOBAPP_PUBLIC_API_KEY` is not set on the backend, public endpoints work without authentication.

2. **Bearer Tokens**: Driver endpoints require JWT Bearer tokens obtained via login. Tokens expire after 15 minutes and should be refreshed.

3. **Phone Number Format**: Backend expects phone numbers in E.164 format (digits only). The app normalizes phone numbers automatically.

4. **Payment Flow**: 
   - Estimate fare → Create ride → Create payment intent → Confirm payment
   - Cash payments don't require Stripe integration
   - Stripe payments require `STRIPE_SECRET_KEY` to be configured on backend

5. **Location Updates**: Driver location should be updated frequently (every few seconds) when driver is active.

6. **Ride Status Values**: 
   - `requested` - Ride created, waiting for assignment
   - `assigned` - Driver assigned
   - `en_route` - Driver heading to pickup
   - `arrived` - Driver arrived at pickup
   - `in_progress` - Ride in progress
   - `completed` - Ride completed
   - `cancelled` - Ride cancelled




























