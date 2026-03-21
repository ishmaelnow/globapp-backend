/**
 * Remember the rider's phone + active ride so we can poll /rides/my-rides
 * and show a persistent "your ride" banner without asking every time.
 */
import { getBookings } from './localStorage';

const ACTIVE_RIDE_ID_KEY = 'globapp_active_ride_id';
const LAST_PHONE_KEY = 'globapp_rider_last_phone';

export function setActiveRideSession(rideId, riderPhoneRaw) {
  if (rideId) {
    localStorage.setItem(ACTIVE_RIDE_ID_KEY, String(rideId));
  }
  if (riderPhoneRaw && String(riderPhoneRaw).trim()) {
    localStorage.setItem(LAST_PHONE_KEY, String(riderPhoneRaw).trim());
  }
}

export function getActiveRideId() {
  return localStorage.getItem(ACTIVE_RIDE_ID_KEY) || '';
}

export function getLastRiderPhone() {
  return localStorage.getItem(LAST_PHONE_KEY) || '';
}

export function clearActiveRideId() {
  localStorage.removeItem(ACTIVE_RIDE_ID_KEY);
}

/** Remember phone only (e.g. after loading My Bookings from API). */
export function setLastRiderPhone(riderPhoneRaw) {
  if (riderPhoneRaw && String(riderPhoneRaw).trim()) {
    localStorage.setItem(LAST_PHONE_KEY, String(riderPhoneRaw).trim());
  }
}

/** Phone to use for my-rides polling: saved session, else most recent local booking */
export function getPreferredRiderPhone() {
  const saved = getLastRiderPhone();
  if (saved) return saved;
  try {
    const e164 = localStorage.getItem('globapp_rider_phone_e164');
    if (e164 && String(e164).trim()) return String(e164).trim();
  } catch {
    /* ignore */
  }
  const bookings = getBookings();
  for (const b of bookings) {
    if (b.rider_phone) return String(b.rider_phone).trim();
  }
  return '';
}
