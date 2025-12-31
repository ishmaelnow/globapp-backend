import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRideWithDriver, getDriverLocation, calculateDistance, calculateETA } from '../services/rideTrackingService';
import { getPublicApiKey } from '../utils/auth';
import api from '../config/api';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RideTracking = ({ rideId }) => {
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  // Load ride data
  const loadRideData = async () => {
    if (!rideId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get ride details
      const rideData = await getRideWithDriver(rideId);
      setRide(rideData);
      
      // Geocode pickup and dropoff
      const pickup = await geocodeAddress(rideData.pickup);
      const dropoff = await geocodeAddress(rideData.dropoff);
      setPickupCoords(pickup);
      setDropoffCoords(dropoff);
      
      // If ride has driver, get driver location
      if (rideData.driver_id) {
        try {
          const location = await api.get(`/rides/${rideId}/driver-location`);
          setDriverLocation(location.data);
          
          // Calculate ETA
          if (location.data.lat && location.data.lng && pickup) {
            const distance = calculateDistance(
              location.data.lat,
              location.data.lng,
              pickup[0],
              pickup[1]
            );
            const speed = location.data.speed_mph || 30; // Default 30 mph
            const etaMinutes = calculateETA(distance, speed);
            setEta(etaMinutes);
          }
        } catch (err) {
          console.log('Driver location not available:', err);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load ride tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Update driver location periodically
  useEffect(() => {
    if (!rideId || !ride?.driver_id) return;
    
    loadRideData();
    const interval = setInterval(() => {
      // Update driver location every 10 seconds
      api.get(`/rides/${rideId}/driver-location`)
        .then(response => {
          setDriverLocation(response.data);
          
          // Recalculate ETA
          if (response.data.lat && response.data.lng && pickupCoords) {
            const distance = calculateDistance(
              response.data.lat,
              response.data.lng,
              pickupCoords[0],
              pickupCoords[1]
            );
            const speed = response.data.speed_mph || 30;
            const etaMinutes = calculateETA(distance, speed);
            setEta(etaMinutes);
          }
        })
        .catch(err => console.log('Failed to update driver location:', err));
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [rideId, ride?.driver_id, pickupCoords]);

  // Initial load
  useEffect(() => {
    loadRideData();
  }, [rideId]);

  // Fit map bounds when coordinates are available
  useEffect(() => {
    if (mapRef.current && (pickupCoords || dropoffCoords || driverLocation)) {
      const bounds = [];
      if (pickupCoords) bounds.push(pickupCoords);
      if (dropoffCoords) bounds.push(dropoffCoords);
      if (driverLocation?.lat && driverLocation?.lng) {
        bounds.push([driverLocation.lat, driverLocation.lng]);
      }
      
      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [pickupCoords, dropoffCoords, driverLocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ride not found</p>
      </div>
    );
  }

  // Determine center point for map
  const center = pickupCoords || [37.7749, -122.4194]; // Default to San Francisco

  return (
    <div className="space-y-4">
      {/* ETA Display */}
      {eta !== null && ride.status !== 'completed' && ride.status !== 'cancelled' && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estimated Arrival</p>
              <p className="text-2xl font-bold text-primary-600">
                {eta} {eta === 1 ? 'minute' : 'minutes'}
              </p>
            </div>
            {driverLocation?.speed_mph && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Speed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round(driverLocation.speed_mph)} mph
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-96 w-full">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Pickup Marker */}
            {pickupCoords && (
              <Marker position={pickupCoords} icon={pickupIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Pickup</p>
                    <p className="text-sm">{ride.pickup}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Dropoff Marker */}
            {dropoffCoords && (
              <Marker position={dropoffCoords} icon={dropoffIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Dropoff</p>
                    <p className="text-sm">{ride.dropoff}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Driver Marker */}
            {driverLocation?.lat && driverLocation?.lng && (
              <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">Driver</p>
                    {ride.driver_name && <p className="text-sm">{ride.driver_name}</p>}
                    {driverLocation.speed_mph && (
                      <p className="text-xs text-gray-500">
                        {Math.round(driverLocation.speed_mph)} mph
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Route Line */}
            {pickupCoords && dropoffCoords && (
              <Polyline
                positions={[pickupCoords, dropoffCoords]}
                color="#3b82f6"
                weight={3}
                opacity={0.7}
              />
            )}
            
            {/* Driver to Pickup Line */}
            {driverLocation?.lat && driverLocation?.lng && pickupCoords && (
              <Polyline
                positions={[[driverLocation.lat, driverLocation.lng], pickupCoords]}
                color="#10b981"
                weight={2}
                opacity={0.5}
                dashArray="10, 5"
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-semibold capitalize">{ride.status}</p>
          </div>
          {ride.driver_name && (
            <div>
              <p className="text-gray-600">Driver</p>
              <p className="font-semibold">{ride.driver_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideTracking;

