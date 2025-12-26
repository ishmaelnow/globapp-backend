import { useState, useEffect } from 'react';
import { getAssignedRide, updateRideStatus, getDriverRides, updateDriverLocation } from '../services/driverService';
import { getDriverAccessToken, clearDriverAuth } from '../utils/auth';

const DriverDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedRide, setAssignedRide] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [location, setLocation] = useState({ lat: '', lng: '', heading_deg: '', speed_mph: '', accuracy_m: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleLocationUpdate = async () => {
    if (!location.lat || !location.lng) {
      setError('Latitude and longitude are required');
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
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={location.lat}
                  onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="40.7128"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={location.lng}
                  onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="-74.0060"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading (degrees)</label>
                <input
                  type="number"
                  step="any"
                  value={location.heading_deg}
                  onChange={(e) => setLocation({ ...location, heading_deg: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0-360"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Speed (mph)</label>
                <input
                  type="number"
                  step="any"
                  value={location.speed_mph}
                  onChange={(e) => setLocation({ ...location, speed_mph: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accuracy (meters)</label>
                <input
                  type="number"
                  step="any"
                  value={location.accuracy_m}
                  onChange={(e) => setLocation({ ...location, accuracy_m: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              onClick={handleLocationUpdate}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Location'}
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

