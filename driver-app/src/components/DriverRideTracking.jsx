import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRideDetails, geocodeAddress, getCurrentDriverLocation, calculateDistance, calculateETA } from '../services/rideTrackingService';

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

const DriverRideTracking = ({ rideId, driverLocation: externalDriverLocation = null }) => {
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(externalDriverLocation);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [etaToPickup, setEtaToPickup] = useState(null);
  const [etaToDropoff, setEtaToDropoff] = useState(null);
  const [distanceToPickup, setDistanceToPickup] = useState(null);
  const [distanceToDropoff, setDistanceToDropoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Load ride details
  useEffect(() => {
    if (!rideId) return;

    const loadRideDetails = async () => {
      try {
        setLoading(true);
        const rideData = await getRideDetails(rideId);
        setRide(rideData);

        // Geocode pickup and dropoff addresses
        const pickup = await geocodeAddress(rideData.pickup);
        const dropoff = await geocodeAddress(rideData.dropoff);
        
        if (pickup) setPickupCoords(pickup);
        if (dropoff) setDropoffCoords(dropoff);
      } catch (err) {
        console.error('Error loading ride details:', err);
        setError('Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };

    loadRideDetails();
  }, [rideId]);

  // Get driver's current location
  useEffect(() => {
    if (externalDriverLocation) {
      setDriverLocation(externalDriverLocation);
      return;
    }

    const updateDriverLocation = () => {
      getCurrentDriverLocation()
        .then(loc => {
          setDriverLocation(loc);
        })
        .catch(err => {
          console.error('Error getting driver location:', err);
        });
    };

    // Get initial location
    updateDriverLocation();

    // Update location every 10 seconds
    const interval = setInterval(updateDriverLocation, 10000);

    return () => clearInterval(interval);
  }, [externalDriverLocation]);

  // Calculate distances and ETAs
  useEffect(() => {
    if (!driverLocation || (!pickupCoords && !dropoffCoords)) return;

    if (pickupCoords && driverLocation.lat && driverLocation.lng) {
      const dist = calculateDistance(
        driverLocation.lat,
        driverLocation.lng,
        pickupCoords.lat,
        pickupCoords.lng
      );
      setDistanceToPickup(dist);
      setEtaToPickup(calculateETA(dist));
    }

    if (dropoffCoords && pickupCoords) {
      const dist = calculateDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        dropoffCoords.lat,
        dropoffCoords.lng
      );
      setDistanceToDropoff(dist);
      setEtaToDropoff(calculateETA(dist));
    }
  }, [driverLocation, pickupCoords, dropoffCoords]);

  // Fit map bounds to show all markers
  useEffect(() => {
    if (!mapRef.current) return;

    const bounds = [];
    if (driverLocation?.lat && driverLocation?.lng) {
      bounds.push([driverLocation.lat, driverLocation.lng]);
    }
    if (pickupCoords) {
      bounds.push([pickupCoords.lat, pickupCoords.lng]);
    }
    if (dropoffCoords) {
      bounds.push([dropoffCoords.lat, dropoffCoords.lng]);
    }

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [driverLocation, pickupCoords, dropoffCoords]);

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Determine center point for map
  const centerLat = pickupCoords?.lat || (driverLocation?.lat || 37.7749);
  const centerLng = pickupCoords?.lng || (driverLocation?.lng || -122.4194);

  return (
    <div className="space-y-4">
      {/* ETA and Distance Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {distanceToPickup !== null && etaToPickup !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">📍 To Pickup</h4>
            <p className="text-green-700">
              <span className="font-medium">{distanceToPickup.toFixed(1)} miles</span>
              {' • '}
              <span className="font-medium">~{etaToPickup} min</span>
            </p>
          </div>
        )}
        {distanceToDropoff !== null && etaToDropoff !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 To Dropoff</h4>
            <p className="text-blue-700">
              <span className="font-medium">{distanceToDropoff.toFixed(1)} miles</span>
              {' • '}
              <span className="font-medium">~{etaToDropoff} min</span>
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Driver location */}
          {driverLocation?.lat && driverLocation?.lng && (
            <Marker
              position={[driverLocation.lat, driverLocation.lng]}
              icon={driverIcon}
            >
              <Popup>
                <div>
                  <strong>Your Location</strong>
                  <br />
                  {driverLocation.accuracy && `Accuracy: ±${Math.round(driverLocation.accuracy)}m`}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Pickup location */}
          {pickupCoords && (
            <Marker
              position={[pickupCoords.lat, pickupCoords.lng]}
              icon={pickupIcon}
            >
              <Popup>
                <div>
                  <strong>📍 Pickup</strong>
                  <br />
                  {ride?.pickup}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dropoff location */}
          {dropoffCoords && (
            <Marker
              position={[dropoffCoords.lat, dropoffCoords.lng]}
              icon={dropoffIcon}
            >
              <Popup>
                <div>
                  <strong>🎯 Dropoff</strong>
                  <br />
                  {ride?.dropoff}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route line from driver to pickup */}
          {driverLocation?.lat && driverLocation?.lng && pickupCoords && (
            <Polyline
              positions={[
                [driverLocation.lat, driverLocation.lng],
                [pickupCoords.lat, pickupCoords.lng]
              ]}
              color="green"
              weight={3}
              opacity={0.7}
            />
          )}

          {/* Route line from pickup to dropoff */}
          {pickupCoords && dropoffCoords && (
            <Polyline
              positions={[
                [pickupCoords.lat, pickupCoords.lng],
                [dropoffCoords.lat, dropoffCoords.lng]
              ]}
              color="blue"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Dropoff</span>
        </div>
      </div>
    </div>
  );
};

export default DriverRideTracking;

