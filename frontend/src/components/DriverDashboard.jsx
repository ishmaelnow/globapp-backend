import { useState, useEffect } from 'react';
import { getAssignedRide, updateRideStatus, getDriverRides, updateDriverLocation } from '../services/driverService';
import { getDriverAccessToken, clearDriverAuth } from '../utils/auth';

const DriverDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedRide, setAssignedRide] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [location, setLocation] = useState({ lat: '', lng: '', heading_deg: '', speed_mph: '', accuracy_m: '' });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);

  const accessToken = getDriverAccessToken();

  useEffect(() => {
    if (activeTab === 'assigned') {
      loadAssignedRide();
    } else if (activeTab === 'rides') {
      loadMyRides();
    }
  }, [activeTab]);

  const loadAssignedRide = async () => {
    try {
      const ride = await getAssignedRide(accessToken);
      setAssignedRide(ride);
    } catch (err) {
      if (err.response?.status === 401) {
        clearDriverAuth();
        if (onLogout) onLogout();
      }
      setAssignedRide(null);
    }
  };

  const loadMyRides = async () => {
    try {
      const rides = await getDriverRides(null, 50, accessToken);
      setMyRides(rides);
    } catch (err) {
      setError('Failed to load rides');
    }
  };

  const handleStatusUpdate = async (rideId, newStatus) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateRideStatus(rideId, newStatus, accessToken);
      setSuccess(`Ride status updated to ${newStatus}`);
      loadAssignedRide();
      loadMyRides();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError(null);
    setSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        setLocation({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          heading_deg: heading !== null && heading !== undefined ? Math.round(heading) : '',
          speed_mph: speed !== null && speed !== undefined ? Math.round(speed * 2.237) : '', // Convert m/s to mph
          accuracy_m: accuracy ? Math.round(accuracy) : '',
        });
        setGettingLocation(false);
        setSuccess('Location detected! Click "Update Location" to save.');
      },
      (err) => {
        setGettingLocation(false);
        let errorMsg = 'Failed to get location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable.';
            break;
          case err.TIMEOUT:
            errorMsg = 'Location request timed out.';
            break;
        }
        setError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (locationWatchId !== null) {
      // Stop tracking
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
      setSuccess('Location tracking stopped');
      setError(null);
      return;
    }

    setError(null);
    setSuccess('Starting location tracking...');

    let hasReceivedLocation = false; // Track if we've received at least one location

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        hasReceivedLocation = true;
        setError(null); // Clear any previous errors when we get a location
        
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        const locationData = {
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          heading_deg: heading !== null && heading !== undefined ? Math.round(heading) : '',
          speed_mph: speed !== null && speed !== undefined ? Math.round(speed * 2.237) : '',
          accuracy_m: accuracy ? Math.round(accuracy) : '',
        };
        setLocation(locationData);
        
        // Auto-update location to server
        updateDriverLocation({
          lat: parseFloat(locationData.lat),
          lng: parseFloat(locationData.lng),
          heading_deg: locationData.heading_deg ? parseFloat(locationData.heading_deg) : null,
          speed_mph: locationData.speed_mph ? parseFloat(locationData.speed_mph) : null,
          accuracy_m: locationData.accuracy_m ? parseFloat(locationData.accuracy_m) : null,
        }, accessToken)
          .then(() => {
            setSuccess('Location updated automatically');
          })
          .catch((err) => {
            console.error('Failed to update location:', err);
            // Don't show error for server update failures, just log them
          });
      },
      (err) => {
        // Only show error if we haven't received any location yet
        // If we've received at least one location, timeout errors are less critical
        if (!hasReceivedLocation) {
          let errorMsg = 'Location tracking error: ';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable location access.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable.';
              break;
            case err.TIMEOUT:
              errorMsg = 'Location request timed out. Trying again...';
              break;
            default:
              errorMsg = 'Location tracking error: ' + err.message;
          }
          setError(errorMsg);
        } else {
          // If we've received location before, just log the error
          console.warn('Location tracking error (but tracking continues):', err.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Increased timeout to 10 seconds
        maximumAge: 5000, // Accept cached location up to 5 seconds old
      }
    );

    setLocationWatchId(watchId);
    setSuccess('Location tracking started! Your location will update automatically.');
  };

  const handleLocationUpdate = async () => {
    if (!location.lat || !location.lng) {
      setError('Please get your location first');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateDriverLocation({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng),
        heading_deg: location.heading_deg ? parseFloat(location.heading_deg) : null,
        speed_mph: location.speed_mph ? parseFloat(location.speed_mph) : null,
        accuracy_m: location.accuracy_m ? parseFloat(location.accuracy_m) : null,
      }, accessToken);
      setSuccess('Location updated successfully');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup location watch on unmount
  useEffect(() => {
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation?.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      enroute: 'bg-purple-100 text-purple-800',
      arrived: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      assigned: 'enroute',
      enroute: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
    };
    return statusFlow[currentStatus];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Driver Dashboard</h2>
        <button
          onClick={() => {
            clearDriverAuth();
            if (onLogout) onLogout();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${
            activeTab === 'assigned'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Assigned Ride
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${
            activeTab === 'location'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Update Location
        </button>
        <button
          onClick={() => setActiveTab('rides')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${
            activeTab === 'rides'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Rides
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {activeTab === 'assigned' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Assigned Ride</h3>
            <button
              onClick={loadAssignedRide}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {assignedRide ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Rider Information</h4>
                  <p className="text-gray-900">{assignedRide.rider_name}</p>
                  <p className="text-gray-600">{assignedRide.rider_phone_masked}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(assignedRide.status)}`}>
                    {assignedRide.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Pickup</h4>
                  <p className="text-gray-900">{assignedRide.pickup}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Destination</h4>
                  <p className="text-gray-900">{assignedRide.dropoff}</p>
                </div>
              </div>

              {getNextStatus(assignedRide.status) && (
                <button
                  onClick={() => handleStatusUpdate(assignedRide.ride_id, getNextStatus(assignedRide.status))}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : `Mark as ${getNextStatus(assignedRide.status)}`}
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(assignedRide.ride_id, 'completed')}
                  disabled={loading || assignedRide.status === 'completed'}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Complete Ride
                </button>
                <button
                  onClick={() => handleStatusUpdate(assignedRide.ride_id, 'cancelled')}
                  disabled={loading || assignedRide.status === 'cancelled'}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Cancel Ride
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No assigned ride at the moment</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'location' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Update Location</h3>
          
          {/* GPS Location Buttons */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={getCurrentLocation}
                disabled={gettingLocation || loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {gettingLocation ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Get My Location
                  </>
                )}
              </button>
              <button
                onClick={startLocationTracking}
                disabled={gettingLocation || loading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  locationWatchId !== null
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {locationWatchId !== null ? 'Stop Auto-Update' : 'Start Auto-Update'}
              </button>
            </div>
            {locationWatchId !== null && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">📍 Auto-updating location every few seconds...</p>
              </div>
            )}
          </div>

          {/* Location Display (Read-only) */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Location:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {location.lat || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {location.lng || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                  <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {location.heading_deg ? `${location.heading_deg}°` : 'Not available'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
                  <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {location.speed_mph ? `${location.speed_mph} mph` : 'Not available'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accuracy</label>
                  <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                    {location.accuracy_m ? `±${location.accuracy_m} meters` : 'Not available'}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLocationUpdate}
              disabled={loading || !location.lat || !location.lng}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Location to Server'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rides' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">My Rides</h3>
            <button
              onClick={loadMyRides}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {myRides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No rides found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myRides.map((ride) => (
                    <tr key={ride.ride_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono">{ride.ride_id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm">{ride.rider_name}</td>
                      <td className="px-6 py-4 text-sm">{ride.pickup}</td>
                      <td className="px-6 py-4 text-sm">{ride.dropoff}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ride.assigned_at_utc ? new Date(ride.assigned_at_utc).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;

