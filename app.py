from fastapi import FastAPI, Header, HTTPException, Depends
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

app = FastAPI(title="GlobApp API", version="1.0.0")

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


def require_public_key(x_api_key: str | None):
    # If PUBLIC_KEY is not set, do not block (keeps backward compatibility)
    if not PUBLIC_KEY:
        return
    if x_api_key != PUBLIC_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def require_public_key_configured(x_api_key: str | None):
    """
    For endpoints that MUST be protected by the public/driver key.
    This avoids accidentally running location tracking with no key configured.
    """
    if not PUBLIC_KEY:
        raise HTTPException(status_code=500, detail="PUBLIC API key is not configured")
    if x_api_key != PUBLIC_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def require_admin_key(x_api_key: str | None):
    # Admin endpoints should be protected once ADMIN_KEY is set
    if not ADMIN_KEY:
        raise HTTPException(status_code=500, detail="ADMIN API key is not configured")
    if x_api_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


def db_conn():
    if not DB_URL:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not configured")
    return psycopg.connect(DB_URL)


def mask_phone(phone: str) -> str:
    # minimal masking: keep last 4
    if not phone:
        return phone
    digits = "".join([c for c in phone if c.isdigit()])
    if len(digits) < 4:
        return "***"
    return f"***{digits[-4:]}"


# -----------------------------
# PIN hashing (no external deps)
# -----------------------------
def _hash_pin(pin: str, salt: str) -> str:
    # PBKDF2-HMAC-SHA256
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
    # constant-time compare
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

    # exp check
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
    # store only hash in DB
    h = hashlib.sha256(raw_token.encode("utf-8")).digest()
    return _b64url_encode(h)


def make_refresh_token() -> str:
    # random long token, not a JWT
    return secrets.token_urlsafe(48)


def get_bearer_token(authorization: str | None = Header(default=None, alias="Authorization")) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    return parts[1].strip()


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
    # Real product: admin sets an initial PIN (or you do OTP later).
    # Optional for now; if omitted, driver cannot login until a PIN is set.
    pin: Optional[str] = None


class DriverLoginIn(BaseModel):
    phone: str
    pin: str
    device_id: Optional[str] = None


class DriverRefreshIn(BaseModel):
    refresh_token: str
    device_id: Optional[str] = None


# Phase 2: driver location payload
class DriverLocationUpsert(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    heading_deg: float | None = Field(default=None, ge=0, le=360)
    speed_mph: float | None = Field(default=None, ge=0)
    accuracy_m: float | None = Field(default=None, ge=0)


# -----------------------------
# Existing (keep)
# -----------------------------
@app.get("/api/")
def api_root():
    return {
        "status": "ok",
        "service": "globapp",
        "message": "Real backend is live.",
    }


@app.get("/api/health")
def health():
    return {"ok": True}


# -----------------------------
# v1 (stable contract)
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
    now_utc = datetime.now(timezone.utc).isoformat()
    return {"utc": now_utc}


# -----------------------------
# Rides (PUBLIC key)
# -----------------------------
@app.post("/api/v1/rides/quote")
def rides_quote(payload: RideQuoteIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_public_key(x_api_key)

    estimated_distance_miles = 2.6
    estimated_duration_min = 8
    base = 4.00
    per_mile = 1.00
    price = round(base + per_mile * estimated_distance_miles, 2)

    return {
        "service_type": payload.service_type,
        "estimated_distance_miles": estimated_distance_miles,
        "estimated_duration_min": estimated_duration_min,
        "estimated_price_usd": price,
    }


@app.post("/api/v1/rides")
def create_ride(payload: RideCreateIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_public_key(x_api_key)

    estimated_distance_miles = 2.6
    estimated_duration_min = 8
    base = 4.00
    per_mile = 1.00
    estimated_price_usd = round(base + per_mile * estimated_distance_miles, 2)

    ride_id = uuid4()
    created_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO rides (
                        id, rider_name, rider_phone, pickup, dropoff, service_type,
                        estimated_distance_miles, estimated_duration_min, estimated_price_usd,
                        status, created_at_utc
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        str(ride_id),
                        payload.rider_name,
                        payload.rider_phone,
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")

    return {"ride_id": str(ride_id), "status": "requested", "created_at_utc": created_at_utc.isoformat()}


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
            "is_active": r[4],
            "created_at_utc": r[5].isoformat() if r[5] else None,
        }
        for r in rows
    ]


@app.post("/api/v1/drivers")
def create_driver(payload: DriverCreateIn, x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    require_admin_key(x_api_key)

    driver_id = uuid4()
    created_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    # Optional PIN setup (recommended). If pin provided, store salted hash.
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
                        payload.phone,
                        payload.vehicle,
                        payload.is_active,
                        created_at_utc,
                        pin_salt,
                        pin_hash,
                    ),
                )
                conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB insert failed: {e}")

    return {
        "id": str(driver_id),
        "status": "created",
        "created_at_utc": created_at_utc.isoformat(),
        "masked_phone": mask_phone(payload.phone),
        "pin_set": True if payload.pin else False,
    }


# -----------------------------
# Driver auth (real product path)
# -----------------------------
@app.post("/api/v1/driver/login")
def driver_login(payload: DriverLoginIn):
    """
    Driver logs in with phone + PIN.
    Returns access_token (JWT) + refresh_token.
    """
    # find driver by phone
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
                    (payload.phone,),
                )
                row = cur.fetchone()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB read failed: {e}")

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    driver_id = UUID(str(row[0]))
    pin_salt = row[1]
    pin_hash = row[2]
    is_active = row[3]

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
    """
    Rotates refresh token: old one revoked, new one issued.
    """
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

                # Revoke old token
                cur.execute(
                    """
                    UPDATE driver_refresh_tokens
                    SET revoked_at_utc = %s
                    WHERE id = %s
                    """,
                    (now_naive, token_row_id),
                )

                # Issue new refresh token
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
# Phase 2 — Step 1: Driver location tracking (DB + API)
# =========================================================

@app.put("/api/v1/driver/location")
def upsert_my_location(
    payload: DriverLocationUpsert,
    driver_id: UUID = Depends(require_driver_access_token),
):
    """
    Real product endpoint:
    - Driver app sends Authorization: Bearer <access_token>
    - driver_id derived from token (no copy/paste mismatch risk)
    """
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


# Keep your existing admin-read endpoints (Phase 2)
@app.get("/api/v1/drivers/{driver_id}/location")
def get_driver_location(
    driver_id: UUID,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
):
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
