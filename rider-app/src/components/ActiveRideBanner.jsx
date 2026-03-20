import { useState, useEffect, useCallback } from 'react';
import { getActiveRideForPhone } from '../services/rideService';
import {
  getPreferredRiderPhone,
  setActiveRideSession,
  clearActiveRideId,
} from '../utils/riderSession';

const POLL_MS = 20000;

const statusLabels = {
  requested: 'Looking for a driver',
  assigned: 'Driver assigned',
  enroute: 'Driver on the way',
  arrived: 'Driver arrived',
  in_progress: 'Trip in progress',
};

/**
 * Sticky summary of the rider's current open ride + quick actions.
 */
const ActiveRideBanner = ({ onOpenRide, onActiveRideChange }) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');

  const refresh = useCallback(async () => {
    const p = getPreferredRiderPhone();
    setPhone(p);
    if (!p) {
      setRide(null);
      onActiveRideChange?.(null);
      setLoading(false);
      clearActiveRideId();
      return;
    }
    try {
      const active = await getActiveRideForPhone(p);
      setRide(active);
      onActiveRideChange?.(active);
      if (active?.ride_id) {
        setActiveRideSession(active.ride_id, p);
      } else {
        clearActiveRideId();
      }
    } catch {
      setRide(null);
      onActiveRideChange?.(null);
    } finally {
      setLoading(false);
    }
  }, [onActiveRideChange]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  if (!phone && !loading) {
    return null;
  }

  if (loading && !ride) {
    return (
      <div className="bg-slate-800/95 text-white px-4 py-3 text-center text-sm">
        Checking for an active ride…
      </div>
    );
  }

  if (!ride) {
    return null;
  }

  const st = String(ride.status || '').toLowerCase();
  const label = statusLabels[st] || 'Ride in progress';

  return (
    <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Your current ride</p>
          <p className="font-bold text-lg truncate">{label}</p>
          <p className="text-sm text-white/90 truncate">
            {ride.pickup ? `Pickup: ${ride.pickup}` : ''}
            {ride.driver_name ? ` · ${ride.driver_name}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenRide?.(ride.ride_id)}
            className="px-4 py-2.5 bg-white text-primary-700 rounded-lg font-semibold text-sm hover:bg-primary-50 shadow"
          >
            Track &amp; chat
          </button>
          <button
            type="button"
            onClick={() => refresh()}
            className="px-4 py-2.5 bg-white/15 text-white rounded-lg font-medium text-sm hover:bg-white/25 border border-white/30"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveRideBanner;
