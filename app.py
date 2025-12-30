from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4, UUID
from datetime import datetime, timezone, timedelta
import os
import json
import base64
import hmac
import hashlib
import secrets

import psycopg
from psycopg.errors import UniqueViolation
import requests
from math import radians, sin, cos, sqrt, atan2

# Stripe integration (optional)
try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    stripe = None

# Stripe integration (optional)
try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    stripe = None


app = FastAPI(title="GlobApp API", version="1.0.0")

# CORS configuration
# Note: When allow_credentials=True, cannot use allow_origins=["*"]
# Specify allowed origins explicitly or set allow_credentials=False
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3001",  # Rider app dev
        "http://localhost:3002",  # Driver app dev
        "http://localhost:3003",  # Admin app dev
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://globapp.app",
        "https://www.globapp.app",
        "https://rider.globapp.app",   # Rider subdomain
        "https://driver.globapp.app",  # Driver subdomain
        "https://admin.globapp.app",   # Admin subdomain
    ],  # Add your frontend URLs here
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# -----------------------------
# Config helpers
# -----------------------------
def _get_env(name: str) -> str | None:
    v = os.getenv(name)
    if v is None:
        return None
    v = v.strip()
    return v if v else None


PUBLIC_KEY = _get_env("GLOBAPP_PUBLIC_API_KEY")
ADMIN_KEY = _get_env("GLOBAPP_ADMIN_API_KEY")
DB_URL = _get_env("DATABASE_URL")

JWT_SECRET = _get_env("GLOBAPP_JWT_SECRET") or ""
ACCESS_TOKEN_MINUTES = int(_get_env("GLOBAPP_ACCESS_TOKEN_MINUTES") or "15")
REFRESH_TOKEN_DAYS = int(_get_env("GLOBAPP_REFRESH_TOKEN_DAYS") or "30")

# Presence thresholds (seconds). Used by /dispatch/driver-presence and helper presence_status().
PRESENCE_ONLINE_SECONDS = int(_get_env("GLOBAPP_PRESENCE_ONLINE_SECONDS") or "60")   # <= 60s => online
PRESENCE_STALE_SECONDS = int(_get_env("GLOBAPP_PRESENCE_STALE_SECONDS") or "600")   # <= 10m => stale


def require_public_key(x_api_key: str | None):
    # If PUBLIC_KEY is not set, do not block (keeps backward compatibility)
    if not PUBLIC_KEY:
        return
    if (x_api_key or "").strip() != PUBLIC_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def require_admin_key(x_api_key: str | None):
    if not ADMIN_KEY:
        raise HTTPException(status_code=500, detail="ADMIN API key is not configured")
    if (x_api_key or "").strip() != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def db_conn():
    if not DB_URL:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not configured")
    return psycopg.connect(DB_URL)


# -----------------------------
# Phone normalization (minimal best practice)
# -----------------------------
def normalize_phone(raw: str, default_country_code: str = "1") -> str:
    """
    Normalize phone into E.164-like format for US-only MVP.

    Output: +1XXXXXXXXXX
    Accepts:
      - 10 digits => assumed US
      - 11 digits starting with 1 => US
    """
    if not raw or not raw.strip():
        raise HTTPException(status_code=400, detail="phone is required")

    digits = "".join(ch for ch in raw if ch.isdigit())

    if len(digits) == 10:
        digits = default_country_code + digits
    elif len(digits) == 11 and digits.startswith(default_country_code):
        pass
    else:
        raise HTTPException(
            status_code=400,
            detail="phone must be 10 digits (US) or 11 digits starting with country code 1",
        )

    return f"+{digits}"


def mask_phone(phone: str) -> str:
    if not phone:
        return phone
    digits = "".join([c for c in phone if c.isdigit()])
    if len(digits) < 4:
        return "***"
    return f"***{digits[-4:]}"


def calculate_distance_duration(pickup: str, dropoff: str) -> tuple[float, float]:
    """
    Calculate real distance (miles) and duration (minutes) between two addresses.
    Uses Nominatim (OpenStreetMap) for geocoding.
    Falls back to Haversine formula if APIs fail.
    
    Returns: (distance_miles, duration_minutes)
    """
    try:
        # Geocode addresses using Nominatim (free, no API key required)
        nominatim_url = "https://nominatim.openstreetmap.org/search"
        headers = {
            "User-Agent": "GlobApp/1.0"  # Required by Nominatim
        }
        
        # Geocode pickup
        pickup_params = {
            "q": pickup,
            "format": "json",
            "limit": 1,
            "countrycodes": "us"
        }
        pickup_response = requests.get(nominatim_url, params=pickup_params, headers=headers, timeout=10)
        
        # Geocode dropoff
        dropoff_params = {
            "q": dropoff,
            "format": "json",
            "limit": 1,
            "countrycodes": "us"
        }
        dropoff_response = requests.get(nominatim_url, params=dropoff_params, headers=headers, timeout=10)
        
        if pickup_response.status_code == 200 and dropoff_response.status_code == 200:
            pickup_data = pickup_response.json()
            dropoff_data = dropoff_response.json()
            
            if pickup_data and dropoff_data and len(pickup_data) > 0 and len(dropoff_data) > 0:
                pickup_lat = float(pickup_data[0]["lat"])
                pickup_lon = float(pickup_data[0]["lon"])
                dropoff_lat = float(dropoff_data[0]["lat"])
                dropoff_lon = float(dropoff_data[0]["lon"])
                
                # Calculate distance using Haversine formula
                R = 3959  # Earth radius in miles
                lat1, lon1 = radians(pickup_lat), radians(pickup_lon)
                lat2, lon2 = radians(dropoff_lat), radians(dropoff_lon)
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * atan2(sqrt(a), sqrt(1-a))
                distance_miles = R * c
                
                # Estimate duration: assume average speed of 25 mph in city traffic
                # Add 2 minutes base time for pickup/dropoff
                duration_minutes = (distance_miles / 25) * 60 + 2
                
                # Return valid distance (should be > 0 if geocoding succeeded)
                if distance_miles > 0:
                    return (round(distance_miles, 2), round(duration_minutes, 1))
                else:
                    print(f"Warning: Geocoding returned 0 distance. Pickup: {pickup_lat},{pickup_lon}, Dropoff: {dropoff_lat},{dropoff_lon}")
            else:
                print(f"Warning: Geocoding returned empty results. Pickup: {pickup}, Dropoff: {dropoff}")
        else:
            print(f"Warning: Geocoding API returned non-200 status. Pickup: {pickup_response.status_code}, Dropoff: {dropoff_response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Geocoding network error: {e}")
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    # Fallback: Try to extract approximate coordinates from address strings
    # For Dallas area addresses, use approximate coordinates
    try:
        # Try to parse addresses and use approximate coordinates
        # Dallas downtown: 32.7767, -96.7970
        # Lewisville: 33.0462, -96.9942
        # If addresses contain "lewisville" or "75067", use Lewisville coordinates
        pickup_lower = pickup.lower()
        dropoff_lower = dropoff.lower()
        
        # Default to Dallas coordinates
        pickup_lat, pickup_lon = 32.7767, -96.7970
        dropoff_lat, dropoff_lon = 32.7767, -96.7970
        
        # Check for Lewisville (common destination)
        if "lewisville" in dropoff_lower or "75067" in dropoff_lower:
            dropoff_lat, dropoff_lon = 33.0462, -96.9942
        
        if "lewisville" in pickup_lower or "75067" in pickup_lower:
            pickup_lat, pickup_lon = 33.0462, -96.9942
        
        # Calculate distance using Haversine formula
        R = 3959  # Earth radius in miles
        lat1, lon1 = radians(pickup_lat), radians(pickup_lon)
        lat2, lon2 = radians(dropoff_lat), radians(dropoff_lon)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance_miles = R * c
        
        # Estimate duration: assume average speed of 25 mph
        duration_minutes = (distance_miles / 25) * 60 + 2
        
        # Ensure minimum distance (at least 0.1 miles)
        if distance_miles < 0.1:
            distance_miles = 2.6  # Default minimum
            duration_minutes = 8.0
        
        return (round(distance_miles, 2), round(duration_minutes, 1))
    except Exception as e:
        print(f"Fallback calculation error: {e}")
        # Ultimate fallback
        return (2.6, 8.0)


def presence_status(age_seconds: float | None) -> str:
    if age_seconds is None:
        return "offline"
    if age_seconds <= PRESENCE_ONLINE_SECONDS:
        return "online"
    if age_seconds <= PRESENCE_STALE_SECONDS:
        return "stale"
    return "offline"


# -----------------------------
# PIN hashing (no external deps)
# -----------------------------
def _hash_pin(pin: str, salt: str) -> str:
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        pin.encode("utf-8"),
        salt.encode("utf-8"),
        200_000,
        dklen=32,
    )
    return base64.urlsafe_b64encode(dk).decode("utf-8").rstrip("=")


def set_driver_pin(pin: str) -> tuple[str, str]:
    salt = secrets.token_urlsafe(16)
    pin_hash = _hash_pin(pin, salt)
    return salt, pin_hash


def verify_driver_pin(pin: str, salt: str, pin_hash: str) -> bool:
    check = _hash_pin(pin, salt)
    return hmac.compare_digest(check, pin_hash)


# -----------------------------
# Minimal JWT (HS256) implementation
# -----------------------------
def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + pad).encode("utf-8"))


def jwt_encode(payload: dict, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    msg = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"{header_b64}.{payload_b64}.{sig_b64}"


def jwt_decode(token: str, secret: str) -> dict:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    msg = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).digest()
    actual_sig = _b64url_decode(sig_b64)

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))

    exp = payload.get("exp")
    if exp is not None:
        now_ts = int(datetime.now(timezone.utc).timestamp())
        if now_ts > int(exp):
            raise HTTPException(status_code=401, detail="Token expired")

    return payload


def require_jwt_secret():
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT secret is not configured (GLOBAPP_JWT_SECRET)")


def make_access_token(driver_id: UUID) -> str:
    require_jwt_secret()
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    payload = {
        "sub": str(driver_id),
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "typ": "access",
    }
    return jwt_encode(payload, JWT_SECRET)


def hash_refresh_token(raw_token: str) -> str:
    h = hashlib.sha256(raw_token.encode("utf-8")).digest()
    return _b64url_encode(h)


def make_refresh_token() -> str:
    return secrets.token_urlsafe(48)


# -----------------------------
# Bearer token parsing (robust)
# -----------------------------
def get_bearer_token(authorization: str | None = Header(default=None, alias="Authorization")) -> str:
    if authorization is None:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    auth = authorization.strip()
    if not auth:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    parts = auth.split()
    if len(parts) < 2:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    if parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = parts[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    return token


def require_driver_access_token(token: str = Depends(get_bearer_token)) -> UUID:
    require_jwt_secret()
    payload = jwt_decode(token, JWT_SECRET)
    if payload.get("typ") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Missing subject")
    try:
        return UUID(sub)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid subject")


# -----------------------------
# Models
# -----------------------------
class RideQuoteIn(BaseModel):
    pickup: str
    dropoff: str
    service_type: str = "economy"


class RideCreateIn(BaseModel):
    rider_name: str
    rider_phone: str
    pickup: str
    dropoff: str
    service_type: str = "economy"


class DriverCreateIn(BaseModel):
    name: str
    phone: str
    vehicle: Optional[str] = None
    is_active: bool = True
    pin: Optional[str] = None


class DriverLoginIn(BaseModel):
    phone: str
    pin: str
    device_id: Optional[str] = None


class DriverRefreshIn(BaseModel):
    refresh_token: str
    device_id: Optional[str] = None


class DriverLocationUpsert(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    heading_deg: float | None = Field(default=None, ge=0, le=360)
    speed_mph: float | None = Field(default=None, ge=0)
    accuracy_m: float | None = Field(default=None, ge=0)


class RideAssignIn(BaseModel):
    driver_id: UUID


class RideStatusUpdateIn(BaseModel):
    status: str


# -----------------------------
# Existing (keep)
# -----------------------------
@app.get("/api/")
def api_root():
    return {"status": "ok", "service": "globapp", "message": "Real backend is live."}


@app.get("/api/health")
def health():
    return {"ok": True}


# -----------------------------
# v1
# -----------------------------
@app.get("/api/v1/health")
def v1_health():
    return {"ok": True, "version": "v1", "environment": os.getenv("APP_ENV", "unknown")}


@app.get("/api/v1/info")
def v1_info():
    return {
        "service": "globapp",
        "api_version": "v1",
        "app_version": app.version,
        "environment": os.getenv("APP_ENV", "unknown"),
    }


@app.get("/api/v1/time")
def v1_time():
    return {"utc": datetime.now(timezone.utc).isoformat()}


# -----------------------------
# Rides (PUBLIC key)
# -----------------------------
@app.post("/api/v1/rides/quote")
def rides_quote(payload: RideQuoteIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_public_key(x_api_key)

    # Calculate real distance and duration
    estimated_distance_miles, estimated_duration_min = calculate_distance_duration(
        payload.pickup, 
        payload.dropoff
    )
    
    base = 4.00
    per_mile = 2.80
    distance_fare = per_mile * estimated_distance_miles
    price = round(base + distance_fare, 2)

    return {
        "service_type": payload.service_type,
        "estimated_distance_miles": estimated_distance_miles,
        "estimated_duration_min": estimated_duration_min,
        "estimated_price_usd": price,
        "total_estimated_usd": price,
        "breakdown": {
            "base_fare": base,
            "distance_fare": round(distance_fare, 2),
            "time_fare": 0,
            "booking_fee": 0,
            "total_estimated": price,
        },
    }


@app.post("/api/v1/fare/estimate")
def fare_estimate(payload: RideQuoteIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    """Alias for /api/v1/rides/quote - returns fare estimate with breakdown"""
    require_public_key(x_api_key)

    # Calculate real distance and duration
    estimated_distance_miles, estimated_duration_min = calculate_distance_duration(
        payload.pickup, 
        payload.dropoff
    )
    
    base = 4.00
    per_mile = 2.80
    distance_fare = per_mile * estimated_distance_miles
    price = round(base + distance_fare, 2)

    return {
        "service_type": payload.service_type,
        "estimated_distance_miles": estimated_distance_miles,
        "estimated_duration_min": estimated_duration_min,
        "estimated_price_usd": price,
        "total_estimated_usd": price,
        "breakdown": {
            "base_fare": base,
            "distance_fare": round(distance_fare, 2),
            "time_fare": 0,
            "booking_fee": 0,
            "total_estimated": price,
        },
    }


@app.post("/api/v1/rides")
def create_ride(payload: RideCreateIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_public_key(x_api_key)

    # Calculate real distance and duration
    estimated_distance_miles, estimated_duration_min = calculate_distance_duration(
        payload.pickup, 
        payload.dropoff
    )
    
    base = 4.00
    per_mile = 2.80
    estimated_price_usd = round(base + per_mile * estimated_distance_miles, 2)

    ride_id = uuid4()
    created_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    rider_phone_raw = payload.rider_phone
    rider_phone_e164 = normalize_phone(payload.rider_phone)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO rides (
                        id,
                        rider_name,
                        rider_phone_raw,
                        rider_phone_e164,
                        pickup,
                        dropoff,
                        service_type,
                        estimated_distance_miles,
                        estimated_duration_min,
                        estimated_price_usd,
                        status,
                        created_at_utc
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        str(ride_id),
                        payload.rider_name,
                        rider_phone_raw,
                        rider_phone_e164,
                        payload.pickup,
                        payload.dropoff,
                        payload.service_type,
                        float(estimated_distance_miles),
                        float(estimated_duration_min),
                        float(estimated_price_usd),
                        "requested",
                        created_at_utc,
                    ),
                )
                conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")

    return {
        "ride_id": str(ride_id),
        "status": "requested",
        "created_at_utc": created_at_utc.isoformat(),
        "rider_phone_masked": mask_phone(rider_phone_e164),
        "estimated_price_usd": estimated_price_usd,
        "estimated_distance_miles": estimated_distance_miles,
        "estimated_duration_min": estimated_duration_min,
        "service_type": payload.service_type,
    }


# -----------------------------
# Payment (PUBLIC key)
# -----------------------------
class PaymentIntentCreateIn(BaseModel):
    ride_id: UUID
    quote_id: Optional[UUID] = None
    provider: str = Field(..., description="Payment provider: 'cash' or 'stripe'")


class PaymentConfirmIn(BaseModel):
    payment_id: UUID
    provider_payload: Optional[dict] = None


@app.get("/api/v1/payment/options")
def payment_options(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_public_key(x_api_key)
    
    # Return available payment options
    # Cash is always enabled, Stripe is enabled if configured
    options = [
        {
            "provider": "cash",
            "name": "Cash",
            "enabled": True,
            "description": "Pay directly to the driver"
        }
    ]
    
    # Check if Stripe is configured (optional)
    stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
    if stripe_secret_key:
        options.append({
            "provider": "stripe",
            "name": "Card",
            "enabled": True,
            "description": "Pay with credit or debit card"
        })
    
    return {"options": options}


@app.post("/api/v1/payment/create-intent")
def create_payment_intent(
    payload: PaymentIntentCreateIn,
    x_api_key: str | None = Header(default=None, alias="X-API-Key")
):
    require_public_key(x_api_key)
    
    if payload.provider not in ["cash", "stripe"]:
        raise HTTPException(status_code=400, detail="Invalid provider. Must be 'cash' or 'stripe'")
    
    # Verify ride exists
    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, estimated_price_usd FROM rides WHERE id = %s",
                    (str(payload.ride_id),)
                )
                ride_row = cur.fetchone()
                if not ride_row:
                    raise HTTPException(status_code=404, detail="Ride not found")
                
                estimated_price = float(ride_row[1]) if ride_row[1] else 0.0
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    
    payment_id = uuid4()
    created_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Handle Stripe payment
    if payload.provider == "stripe":
        stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_secret_key:
            raise HTTPException(status_code=500, detail="Stripe is not configured")
        
        if not STRIPE_AVAILABLE:
            raise HTTPException(status_code=500, detail="Stripe SDK not installed. Install with: pip install stripe")
        
        # Initialize Stripe
        stripe.api_key = stripe_secret_key
        
        # Convert dollars to cents for Stripe
        amount_cents = int(round(estimated_price * 100))
        
        try:
            # Create Stripe PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="usd",
                metadata={
                    "ride_id": str(payload.ride_id),
                    "payment_id": str(payment_id),
                },
                automatic_payment_methods={
                    "enabled": True,
                },
            )
            
            # Store payment record in database (graceful fallback if table doesn't exist)
            try:
                with db_conn() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            INSERT INTO payments (
                                id, ride_id, provider, status, amount_usd,
                                stripe_payment_intent_id, stripe_client_secret,
                                created_at_utc
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                str(payment_id),
                                str(payload.ride_id),
                                "stripe",
                                "requires_payment_method",
                                float(estimated_price),
                                intent.id,
                                intent.client_secret,
                                created_at_utc,
                            ),
                        )
                        conn.commit()
            except psycopg.errors.UndefinedTable:
                # Table doesn't exist yet - that's OK, payment still works
                print("Info: payments table not found. Run migration 004_add_payments_table.sql to enable payment records.")
            except Exception as db_error:
                # Log error but don't fail the request (payment intent already created)
                print(f"Warning: Failed to store payment record: {db_error}")
            
            return {
                "payment_id": str(payment_id),
                "ride_id": str(payload.ride_id),
                "provider": "stripe",
                "status": "requires_payment_method",
                "amount_usd": estimated_price,
                "client_secret": intent.client_secret,
                "stripe_payment_intent_id": intent.id,
                "created_at_utc": created_at_utc.isoformat(),
            }
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
    
    # Handle cash payment
    payment_status = "pending_cash"
    
    # Store cash payment record in database (graceful fallback if table doesn't exist)
    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO payments (
                        id, ride_id, provider, status, amount_usd, created_at_utc
                    )
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        str(payment_id),
                        str(payload.ride_id),
                        "cash",
                        payment_status,
                        float(estimated_price),
                        created_at_utc,
                    ),
                )
                conn.commit()
    except psycopg.errors.UndefinedTable:
        # Table doesn't exist yet - that's OK, payment still works
        print("Info: payments table not found. Run migration 004_add_payments_table.sql to enable payment records.")
    except Exception as db_error:
        # Log error but don't fail the request (cash payment can proceed)
        print(f"Warning: Failed to store payment record: {db_error}")
    
    return {
        "payment_id": str(payment_id),
        "ride_id": str(payload.ride_id),
        "provider": "cash",
        "status": payment_status,
        "amount_usd": estimated_price,
        "client_secret": None,
        "created_at_utc": created_at_utc.isoformat(),
    }


@app.post("/api/v1/payment/confirm")
def confirm_payment(
    payload: PaymentConfirmIn,
    x_api_key: str | None = Header(default=None, alias="X-API-Key")
):
    require_public_key(x_api_key)
    
    # Handle Stripe payment confirmation
    if payload.provider_payload and payload.provider_payload.get("payment_intent_id"):
        stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        if not stripe_secret_key:
            raise HTTPException(status_code=500, detail="Stripe is not configured")
        
        if not STRIPE_AVAILABLE:
            raise HTTPException(status_code=500, detail="Stripe SDK not installed")
        
        stripe.api_key = stripe_secret_key
        
        payment_intent_id = payload.provider_payload.get("payment_intent_id")
        
        try:
            # Retrieve PaymentIntent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == "succeeded":
                # Update payment record in database (graceful fallback if table doesn't exist)
                confirmed_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)
                try:
                    with db_conn() as conn:
                        with conn.cursor() as cur:
                            cur.execute(
                                """
                                UPDATE payments
                                SET status = 'confirmed',
                                    confirmed_at_utc = %s
                                WHERE id = %s
                                """,
                                (confirmed_at_utc, str(payload.payment_id)),
                            )
                            conn.commit()
                except psycopg.errors.UndefinedTable:
                    # Table doesn't exist yet - that's OK, payment still works
                    print("Info: payments table not found. Run migration 004_add_payments_table.sql to enable payment records.")
                except Exception as db_error:
                    # Log error but don't fail the request (payment already succeeded)
                    print(f"Warning: Failed to update payment record: {db_error}")
                
                return {
                    "payment_id": str(payload.payment_id),
                    "status": "confirmed",
                    "provider": "stripe",
                    "stripe_payment_intent_id": payment_intent_id,
                    "amount_usd": intent.amount / 100.0,
                    "confirmed_at_utc": confirmed_at_utc.isoformat(),
                }
            elif intent.status == "requires_payment_method":
                raise HTTPException(status_code=400, detail="Payment method required")
            elif intent.status == "requires_confirmation":
                raise HTTPException(status_code=400, detail="Payment requires confirmation")
            else:
                raise HTTPException(status_code=400, detail=f"Payment status: {intent.status}")
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")
    
    # Handle cash payment (no verification needed)
    return {
        "payment_id": str(payload.payment_id),
        "status": "confirmed",
        "provider": "cash",
        "confirmed_at_utc": datetime.now(timezone.utc).isoformat(),
    }


# -----------------------------
# Drivers (ADMIN key)
# -----------------------------
@app.get("/api/v1/drivers")
def list_drivers(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_admin_key(x_api_key)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, name, phone, vehicle, is_active, created_at_utc
                    FROM drivers
                    ORDER BY created_at_utc DESC
                    LIMIT 200
                    """
                )
                rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    return [
        {
            "id": str(r[0]),
            "name": r[1],
            "phone": r[2],
            "masked_phone": mask_phone(r[2]),
            "vehicle": r[3],
            "is_active": bool(r[4]),
            "created_at_utc": r[5].isoformat() if r[5] else None,
        }
        for r in rows
    ]


@app.post("/api/v1/drivers")
def create_driver(payload: DriverCreateIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_admin_key(x_api_key)

    driver_id = uuid4()
    created_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    phone_norm = normalize_phone(payload.phone)

    pin_salt = None
    pin_hash = None
    if payload.pin:
        pin_salt, pin_hash = set_driver_pin(payload.pin)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO drivers (id, name, phone, vehicle, is_active, created_at_utc, pin_salt, pin_hash)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        str(driver_id),
                        payload.name,
                        phone_norm,
                        payload.vehicle,
                        payload.is_active,
                        created_at_utc,
                        pin_salt,
                        pin_hash,
                    ),
                )
                conn.commit()
    except UniqueViolation:
        raise HTTPException(status_code=409, detail="Driver with this phone already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")

    return {
        "id": str(driver_id),
        "status": "created",
        "created_at_utc": created_at_utc.isoformat(),
        "masked_phone": mask_phone(phone_norm),
        "pin_set": True if payload.pin else False,
    }


# -----------------------------
# Driver auth
# -----------------------------
@app.post("/api/v1/driver/login")
def driver_login(payload: DriverLoginIn):
    phone_norm = normalize_phone(payload.phone)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, pin_salt, pin_hash, is_active
                    FROM drivers
                    WHERE phone = %s
                    LIMIT 1
                    """,
                    (phone_norm,),
                )
                row = cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    driver_id = UUID(str(row[0]))
    pin_salt = row[1]
    pin_hash = row[2]
    is_active = bool(row[3])

    if not is_active:
        raise HTTPException(status_code=403, detail="Driver is inactive")

    if not pin_salt or not pin_hash:
        raise HTTPException(status_code=403, detail="Driver PIN is not set")

    if not verify_driver_pin(payload.pin, pin_salt, pin_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = make_access_token(driver_id)

    refresh_token = make_refresh_token()
    refresh_hash = hash_refresh_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)
    expires_at_utc = expires_at.replace(tzinfo=None)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO driver_refresh_tokens (id, driver_id, token_hash, device_id, expires_at_utc)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (str(uuid4()), str(driver_id), refresh_hash, payload.device_id, expires_at_utc),
                )
                conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")

    return {
        "driver_id": str(driver_id),
        "access_token": access_token,
        "access_token_expires_minutes": ACCESS_TOKEN_MINUTES,
        "refresh_token": refresh_token,
        "refresh_token_expires_days": REFRESH_TOKEN_DAYS,
    }


@app.post("/api/v1/driver/refresh")
def driver_refresh(payload: DriverRefreshIn):
    refresh_hash = hash_refresh_token(payload.refresh_token)
    now_utc = datetime.now(timezone.utc)
    now_naive = now_utc.replace(tzinfo=None)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, driver_id, expires_at_utc, revoked_at_utc
                    FROM driver_refresh_tokens
                    WHERE token_hash = %s
                    LIMIT 1
                    """,
                    (refresh_hash,),
                )
                row = cur.fetchone()

                if not row:
                    raise HTTPException(status_code=401, detail="Invalid refresh token")

                token_row_id = row[0]
                driver_id = UUID(str(row[1]))
                expires_at_utc = row[2]
                revoked_at_utc = row[3]

                if revoked_at_utc is not None:
                    raise HTTPException(status_code=401, detail="Refresh token revoked")

                if expires_at_utc and expires_at_utc < now_naive:
                    raise HTTPException(status_code=401, detail="Refresh token expired")

                # revoke old
                cur.execute(
                    """
                    UPDATE driver_refresh_tokens
                    SET revoked_at_utc = %s
                    WHERE id = %s
                    """,
                    (now_naive, token_row_id),
                )

                # issue new refresh
                new_refresh = make_refresh_token()
                new_hash = hash_refresh_token(new_refresh)
                new_expires_at = (now_utc + timedelta(days=REFRESH_TOKEN_DAYS)).replace(tzinfo=None)

                cur.execute(
                    """
                    INSERT INTO driver_refresh_tokens (id, driver_id, token_hash, device_id, expires_at_utc)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (str(uuid4()), str(driver_id), new_hash, payload.device_id, new_expires_at),
                )

                conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB operation failed: {e}")

    access_token = make_access_token(driver_id)

    return {
        "driver_id": str(driver_id),
        "access_token": access_token,
        "access_token_expires_minutes": ACCESS_TOKEN_MINUTES,
        "refresh_token": new_refresh,
        "refresh_token_expires_days": REFRESH_TOKEN_DAYS,
    }


# =========================================================
# Phase 2 — Step 1: Driver location
# =========================================================
@app.put("/api/v1/driver/location")
def upsert_my_location(payload: DriverLocationUpsert, driver_id: UUID = Depends(require_driver_access_token)):
    updated_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO driver_locations (driver_id, lat, lng, heading_deg, speed_mph, accuracy_m, updated_at_utc)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (driver_id) DO UPDATE SET
                      lat = EXCLUDED.lat,
                      lng = EXCLUDED.lng,
                      heading_deg = EXCLUDED.heading_deg,
                      speed_mph = EXCLUDED.speed_mph,
                      accuracy_m = EXCLUDED.accuracy_m,
                      updated_at_utc = EXCLUDED.updated_at_utc
                    """,
                    (
                        str(driver_id),
                        payload.lat,
                        payload.lng,
                        payload.heading_deg,
                        payload.speed_mph,
                        payload.accuracy_m,
                        updated_at_utc,
                    ),
                )
                conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB upsert failed: {e}")

    return {"ok": True, "driver_id": str(driver_id), "updated_at_utc": updated_at_utc.isoformat()}


@app.get("/api/v1/drivers/{driver_id}/location")
def get_driver_location(driver_id: UUID, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_admin_key(x_api_key)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT driver_id, lat, lng, heading_deg, speed_mph, accuracy_m, updated_at_utc
                    FROM driver_locations
                    WHERE driver_id = %s
                    """,
                    (str(driver_id),),
                )
                row = cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    if not row:
        return None

    return {
        "driver_id": str(row[0]),
        "lat": row[1],
        "lng": row[2],
        "heading_deg": row[3],
        "speed_mph": row[4],
        "accuracy_m": row[5],
        "updated_at_utc": row[6].isoformat() if row[6] else None,
    }


@app.get("/api/v1/dispatch/available-drivers")
def list_available_drivers(
    minutes_recent: int = 5,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
):
    require_admin_key(x_api_key)

    if minutes_recent < 1:
        raise HTTPException(status_code=400, detail="minutes_recent must be >= 1")

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT d.id, d.name, d.phone, d.vehicle, d.is_active,
                           dl.lat, dl.lng, dl.updated_at_utc
                    FROM drivers d
                    JOIN driver_locations dl ON dl.driver_id = d.id
                    WHERE d.is_active = true
                      AND dl.updated_at_utc >= (now() - (%s || ' minutes')::interval)
                    ORDER BY dl.updated_at_utc DESC
                    """,
                    (minutes_recent,),
                )
                rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB query failed: {e}")

    return [
        {
            "driver_id": str(r[0]),
            "name": r[1],
            "phone": r[2],
            "masked_phone": mask_phone(r[2]),
            "vehicle": r[3],
            "lat": r[5],
            "lng": r[6],
            "last_seen_utc": r[7].isoformat() if r[7] else None,
        }
        for r in rows
    ]


# -----------------------------
# Dispatch: presence
# -----------------------------
@app.get("/api/v1/dispatch/driver-presence")
def driver_presence(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_admin_key(x_api_key)
    now = datetime.now(timezone.utc)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        d.id, d.name, d.phone, d.vehicle, d.is_active,
                        dl.lat, dl.lng, dl.updated_at_utc
                    FROM drivers d
                    LEFT JOIN driver_locations dl ON dl.driver_id = d.id
                    ORDER BY d.created_at_utc DESC
                    LIMIT 500
                    """
                )
                rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB query failed: {e}")

    out = []
    for r in rows:
        last_seen = r[7]  # naive UTC in DB
        age_seconds = None
        if last_seen is not None:
            last_seen_utc = last_seen.replace(tzinfo=timezone.utc)
            age_seconds = (now - last_seen_utc).total_seconds()

        out.append(
            {
                "driver_id": str(r[0]),
                "name": r[1],
                "phone": r[2],
                "vehicle": r[3],
                "is_active": bool(r[4]),
                "status": presence_status(age_seconds),
                "lat": r[5],
                "lng": r[6],
                "last_seen_utc": last_seen.isoformat() if last_seen else None,
                "age_seconds": age_seconds,
            }
        )

    return out


# =========================================================
# Phase 2 — Step 2: Dispatch assign + driver fetch assignment
# =========================================================
@app.get("/api/v1/dispatch/rides")
def dispatch_list_rides(
    status: str = "requested",
    limit: int = 50,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
):
    require_admin_key(x_api_key)

    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 200")

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        id, rider_name, rider_phone_raw, rider_phone_e164, pickup, dropoff, service_type,
                        status, created_at_utc,
                        assigned_driver_id, assigned_at_utc
                    FROM rides
                    WHERE status = %s
                    ORDER BY created_at_utc DESC
                    LIMIT %s
                    """,
                    (status, limit),
                )
                rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    return [
        {
            "ride_id": str(r[0]),
            "rider_name": r[1],
            "rider_phone_raw": r[2],
            "rider_phone_e164": r[3],
            "pickup": r[4],
            "dropoff": r[5],
            "service_type": r[6],
            "status": r[7],
            "created_at_utc": r[8].isoformat() if r[8] else None,
            "assigned_driver_id": str(r[9]) if r[9] else None,
            "assigned_at_utc": r[10].isoformat() if r[10] else None,
        }
        for r in rows
    ]


@app.post("/api/v1/dispatch/rides/{ride_id}/assign")
def dispatch_assign_ride(
    ride_id: UUID,
    payload: RideAssignIn,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
):
    require_admin_key(x_api_key)

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                # ride exists + assignable
                cur.execute("SELECT status FROM rides WHERE id = %s", (str(ride_id),))
                ride = cur.fetchone()
                if not ride:
                    raise HTTPException(status_code=404, detail="Ride not found")

                status = ride[0]
                if status not in ("requested", "assigned"):
                    raise HTTPException(status_code=400, detail=f"Ride is not assignable (status={status})")

                # driver exists + active
                cur.execute("SELECT is_active FROM drivers WHERE id = %s", (str(payload.driver_id),))
                drow = cur.fetchone()
                if not drow:
                    raise HTTPException(status_code=404, detail="Driver not found")
                if not bool(drow[0]):
                    raise HTTPException(status_code=403, detail="Driver is inactive")

                # assign
                cur.execute(
                    """
                    UPDATE rides
                    SET assigned_driver_id = %s,
                        assigned_at_utc = %s,
                        status = 'assigned'
                    WHERE id = %s
                    """,
                    (str(payload.driver_id), now_utc, str(ride_id)),
                )
                conn.commit()

    except UniqueViolation:
        raise HTTPException(status_code=409, detail="Driver already has an active ride")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB operation failed: {e}")

    return {
        "ok": True,
        "ride_id": str(ride_id),
        "assigned_driver_id": str(payload.driver_id),
        "assigned_at_utc": now_utc.isoformat(),
        "status": "assigned",
    }


@app.get("/api/v1/driver/assigned-ride")
def driver_assigned_ride(driver_id: UUID = Depends(require_driver_access_token)):
    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        id, rider_name, rider_phone_e164, pickup, dropoff, service_type,
                        status, created_at_utc, assigned_at_utc
                    FROM rides
                    WHERE assigned_driver_id = %s
                      AND status IN ('assigned','enroute','arrived','in_progress')
                    ORDER BY assigned_at_utc DESC NULLS LAST
                    LIMIT 1
                    """,
                    (str(driver_id),),
                )
                row = cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    if not row:
        return None

    return {
        "ride_id": str(row[0]),
        "rider_name": row[1],
        "rider_phone_masked": mask_phone(row[2]),
        "pickup": row[3],
        "dropoff": row[4],
        "service_type": row[5],
        "status": row[6],
        "created_at_utc": row[7].isoformat() if row[7] else None,
        "assigned_at_utc": row[8].isoformat() if row[8] else None,
    }


# =========================================================
# Phase 2 — Step 3: Driver updates ride status
# =========================================================
_ALLOWED_STATUSES = {"assigned", "enroute", "arrived", "in_progress", "completed", "cancelled"}
_STATUS_ORDER = {
    "assigned": 1,
    "enroute": 2,
    "arrived": 3,
    "in_progress": 4,
    "completed": 5,
    "cancelled": 99,
}

# =========================================================
# Phase 2 — Step 4: status timestamps + operational lists
# =========================================================

# ---- REPLACED (exactly as requested): driver_update_ride_status() ----
@app.post("/api/v1/driver/rides/{ride_id}/status")
def driver_update_ride_status(
    ride_id: UUID,
    payload: RideStatusUpdateIn,
    driver_id: UUID = Depends(require_driver_access_token),
):
    new_status = (payload.status or "").strip().lower()
    if new_status not in _ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {sorted(_ALLOWED_STATUSES)}")

    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    # Map status -> timestamp column
    ts_col_by_status = {
        "enroute": "enroute_at_utc",
        "arrived": "arrived_at_utc",
        "in_progress": "in_progress_at_utc",
        "completed": "completed_at_utc",
        "cancelled": "cancelled_at_utc",
    }

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                # Fetch current ride assignment + status
                cur.execute(
                    """
                    SELECT assigned_driver_id, status
                    FROM rides
                    WHERE id = %s
                    """,
                    (str(ride_id),),
                )
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Ride not found")

                assigned_driver_id = row[0]
                current_status = row[1] or "requested"
                current_status_norm = str(current_status).strip().lower()

                if not assigned_driver_id:
                    raise HTTPException(status_code=400, detail="Ride is not assigned to any driver")

                if str(assigned_driver_id) != str(driver_id):
                    raise HTTPException(status_code=403, detail="Ride is not assigned to this driver")

                if current_status_norm in ("completed", "cancelled"):
                    raise HTTPException(status_code=400, detail=f"Ride is already terminal (status={current_status_norm})")

                # Enforce progression (cancel anytime once assigned)
                if new_status != "cancelled":
                    if current_status_norm not in _STATUS_ORDER:
                        raise HTTPException(status_code=400, detail=f"Cannot transition from status={current_status_norm}")
                    if _STATUS_ORDER[new_status] < _STATUS_ORDER[current_status_norm]:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Invalid status regression: {current_status_norm} -> {new_status}",
                        )

                # Build UPDATE that also sets the matching timestamp once
                ts_col = ts_col_by_status.get(new_status)

                if ts_col:
                    # Set timestamp only if it is currently NULL (do not overwrite)
                    cur.execute(
                        f"""
                        UPDATE rides
                        SET status = %s,
                            {ts_col} = COALESCE({ts_col}, %s)
                        WHERE id = %s
                        """,
                        (new_status, now_utc, str(ride_id)),
                    )
                else:
                    cur.execute(
                        """
                        UPDATE rides
                        SET status = %s
                        WHERE id = %s
                        """,
                        (new_status, str(ride_id)),
                    )

                conn.commit()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB operation failed: {e}")

    return {"ok": True, "ride_id": str(ride_id), "driver_id": str(driver_id), "status": new_status}


# -----------------------------
# Phase 2 — Step 4A: Dispatch "active rides" (ADMIN)
# -----------------------------
@app.get("/api/v1/dispatch/active-rides")
def dispatch_active_rides(
    limit: int = 50,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
):
    require_admin_key(x_api_key)

    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 200")

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                        r.id,
                        r.rider_name,
                        r.rider_phone_e164,
                        r.pickup,
                        r.dropoff,
                        r.service_type,
                        r.status,
                        r.created_at_utc,
                        r.assigned_at_utc,
                        r.enroute_at_utc,
                        r.arrived_at_utc,
                        r.in_progress_at_utc,
                        r.assigned_driver_id,
                        d.name,
                        d.vehicle
                    FROM rides r
                    LEFT JOIN drivers d ON d.id = r.assigned_driver_id
                    WHERE r.status IN ('assigned','enroute','arrived','in_progress')
                    ORDER BY r.created_at_utc DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    return [
        {
            "ride_id": str(r[0]),
            "rider_name": r[1],
            "rider_phone_masked": mask_phone(r[2]),
            "pickup": r[3],
            "dropoff": r[4],
            "service_type": r[5],
            "status": r[6],
            "created_at_utc": r[7].isoformat() if r[7] else None,
            "assigned_at_utc": r[8].isoformat() if r[8] else None,
            "enroute_at_utc": r[9].isoformat() if r[9] else None,
            "arrived_at_utc": r[10].isoformat() if r[10] else None,
            "in_progress_at_utc": r[11].isoformat() if r[11] else None,
            "assigned_driver_id": str(r[12]) if r[12] else None,
            "driver_name": r[13],
            "vehicle": r[14],
        }
        for r in rows
    ]


# -----------------------------
# Phase 2 — Step 4B: Driver "my rides" list/history (Driver token)
# -----------------------------
@app.get("/api/v1/driver/rides")
def driver_list_my_rides(
    status: Optional[str] = None,
    limit: int = 20,
    driver_id: UUID = Depends(require_driver_access_token),
):
    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 200")

    where_status = ""
    params = [str(driver_id)]

    if status:
        s = status.strip().lower()
        if s not in _ALLOWED_STATUSES and s != "requested":
            raise HTTPException(status_code=400, detail="Invalid status filter")
        where_status = "AND r.status = %s"
        params.append(s)

    params.append(limit)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT
                        r.id,
                        r.rider_name,
                        r.rider_phone_e164,
                        r.pickup,
                        r.dropoff,
                        r.service_type,
                        r.status,
                        r.created_at_utc,
                        r.assigned_at_utc,
                        r.enroute_at_utc,
                        r.arrived_at_utc,
                        r.in_progress_at_utc,
                        r.completed_at_utc,
                        r.cancelled_at_utc
                    FROM rides r
                    WHERE r.assigned_driver_id = %s
                    {where_status}
                    ORDER BY r.created_at_utc DESC
                    LIMIT %s
                    """,
                    tuple(params),
                )
                rows = cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    return [
        {
            "ride_id": str(r[0]),
            "rider_name": r[1],
            "rider_phone_masked": mask_phone(r[2]),
            "pickup": r[3],
            "dropoff": r[4],
            "service_type": r[5],
            "status": r[6],
            "created_at_utc": r[7].isoformat() if r[7] else None,
            "assigned_at_utc": r[8].isoformat() if r[8] else None,
            "enroute_at_utc": r[9].isoformat() if r[9] else None,
            "arrived_at_utc": r[10].isoformat() if r[10] else None,
            "in_progress_at_utc": r[11].isoformat() if r[11] else None,
            "completed_at_utc": r[12].isoformat() if r[12] else None,
            "cancelled_at_utc": r[13].isoformat() if r[13] else None,
        }
        for r in rows
    ]
