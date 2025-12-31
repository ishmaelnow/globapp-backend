import { useState, useEffect } from 'react';
import {
  listDrivers,
  createDriver,
  getAvailableDrivers,
  getDriverPresence,
  listDispatchRides,
  assignRide,
  getActiveRides,
} from '../services/adminService';
import { getAdminApiKey, saveAdminApiKey } from '../utils/auth';
import { ADMIN_API_KEY } from '../config/api';
import Notifications from './Notifications';

const AdminDashboard = () => {
  // Use embedded ADMIN_API_KEY if available, otherwise fallback to localStorage
  const getInitialApiKey = () => {
    const localStorageKey = getAdminApiKey();
    if (localStorageKey && localStorageKey.trim()) {
      return localStorageKey;
    }
    return ADMIN_API_KEY || '';
  };
  const [apiKey, setApiKey] = useState(getInitialApiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(false); // Hide by default if embedded key exists
  const [activeTab, setActiveTab] = useState('drivers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Check if we have an embedded API key
  const hasEmbeddedKey = ADMIN_API_KEY && ADMIN_API_KEY.trim();

  // Drivers state
  const [drivers, setDrivers] = useState([]);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '', pin: '', is_active: true });

  // Dispatch state
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [driverPresence, setDriverPresence] = useState([]);
  const [dispatchRides, setDispatchRides] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [selectedRideId, setSelectedRideId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  useEffect(() => {
    // Auto-load if we have an API key (embedded or from localStorage)
    // Also save to localStorage so interceptor can use it
    if (apiKey && apiKey.trim()) {
      saveAdminApiKey(apiKey); // Save so interceptor can use it
      loadData();
    } else if (hasEmbeddedKey) {
      // If embedded key exists but apiKey state is empty, use embedded key
      setApiKey(ADMIN_API_KEY);
      saveAdminApiKey(ADMIN_API_KEY); // Save so interceptor can use it
    } else {
      // Check localStorage for saved key
      const savedKey = getAdminApiKey();
      if (savedKey && savedKey.trim()) {
        setApiKey(savedKey);
      }
    }
  }, [activeTab, apiKey, hasEmbeddedKey]);

  // Debug: Log drivers state whenever it changes
  useEffect(() => {
    console.log('DEBUG: Drivers state changed:', {
      count: drivers.length,
      activeCount: drivers.filter(d => d.is_active).length,
      activeTab,
      drivers: drivers.map(d => ({ id: d.id || d.driver_id, name: d.name, is_active: d.is_active }))
    });
  }, [drivers, activeTab]);

  const loadData = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      if (activeTab === 'drivers') {
        const data = await listDrivers(apiKey);
        setDrivers(data);
      } else if (activeTab === 'available') {
        const data = await getAvailableDrivers(5, apiKey);
        setAvailableDrivers(data);
      } else if (activeTab === 'presence') {
        const data = await getDriverPresence(apiKey);
        setDriverPresence(data);
      } else if (activeTab === 'rides') {
        // Load rides and drivers in parallel
        try {
          const [ridesData, availableData, allDriversData] = await Promise.all([
            listDispatchRides('requested', 50, apiKey),
            getAvailableDrivers(5, apiKey),
            listDrivers(apiKey), // Load all drivers for assignment dropdown
          ]);
          console.log('Rides tab - Loaded rides data:', ridesData);
          console.log('Rides tab - Loaded available drivers:', availableData);
          console.log('Rides tab - Loaded all drivers:', allDriversData);
          console.log('Rides tab - Drivers array type:', Array.isArray(allDriversData));
          console.log('Rides tab - Active drivers count:', allDriversData?.filter(d => d.is_active).length || 0);
          
          setDispatchRides(ridesData || []);
          setAvailableDrivers(availableData || []);
          
          // CRITICAL: Set drivers state for the dropdown - ensure it's an array
          if (Array.isArray(allDriversData)) {
            setDrivers(allDriversData);
            console.log('Rides tab - Drivers state set successfully, count:', allDriversData.length);
          } else {
            console.error('Rides tab - allDriversData is not an array:', allDriversData);
            setDrivers([]);
          }
        } catch (driverError) {
          console.error('Rides tab - Error loading drivers:', driverError);
          // Try to load drivers separately if combined call fails
          try {
            const allDriversData = await listDrivers(apiKey);
            console.log('Rides tab - Loaded drivers separately:', allDriversData);
            if (Array.isArray(allDriversData)) {
              setDrivers(allDriversData);
            }
          } catch (separateError) {
            console.error('Rides tab - Failed to load drivers separately:', separateError);
            setDrivers([]);
          }
        }
      } else if (activeTab === 'active') {
        const data = await getActiveRides(50, apiKey);
        setActiveRides(data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load data';
      setError(errorMessage);
      // Don't clear existing data on error, just show the error
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    saveAdminApiKey(apiKey);
    setSuccess('API key saved');
    loadData();
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createDriver(newDriver, apiKey);
      setSuccess('Driver created successfully');
      setNewDriver({ name: '', phone: '', vehicle: '', pin: '', is_active: true });
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRide = async () => {
    if (!selectedRideId || !selectedDriverId) {
      setError('Please select both ride and driver');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await assignRide(selectedRideId, selectedDriverId, apiKey);
      setSuccess('Ride assigned successfully');
      setSelectedRideId('');
      setSelectedDriverId('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign ride');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-800',
      stale: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRideStatusColor = (status) => {
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      enroute: 'bg-purple-100 text-purple-800',
      arrived: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Only show API key entry screen if no key available (neither embedded nor localStorage)
  if (!apiKey || !apiKey.trim()) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin API Key</h2>
        <p className="text-gray-600 mb-6">Enter your admin API key to access the dashboard</p>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey || ''}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Admin API Key"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
          >
            Save & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="flex items-center gap-2">
          {/* Only show API key input if user wants to override, or if no embedded key */}
          {showApiKeyInput || !hasEmbeddedKey ? (
            <>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={handleSaveApiKey}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="API Key"
              />
              <button
                onClick={() => {
                  setApiKey('');
                  saveAdminApiKey('');
                  setShowApiKeyInput(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              title="Override API key"
            >
              API Key
            </button>
          )}
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {['drivers', 'available', 'presence', 'rides', 'active', 'notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
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

      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Driver</h3>
            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Vehicle (optional)"
                  value={newDriver.vehicle}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="password"
                  placeholder="PIN (optional)"
                  value={newDriver.pin}
                  onChange={(e) => setNewDriver({ ...newDriver, pin: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Driver'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">All Drivers</h3>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                        <td className="px-6 py-4 text-sm">{driver.masked_phone}</td>
                        <td className="px-6 py-4 text-sm">{driver.vehicle || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${driver.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {driver.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {driver.created_at_utc ? new Date(driver.created_at_utc).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'available' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Available Drivers</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableDrivers.map((driver) => (
                    <tr key={driver.driver_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                      <td className="px-6 py-4 text-sm">{driver.masked_phone}</td>
                      <td className="px-6 py-4 text-sm">{driver.vehicle || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        {driver.lat && driver.lng ? `${driver.lat.toFixed(4)}, ${driver.lng.toFixed(4)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {driver.last_seen_utc ? new Date(driver.last_seen_utc).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'presence' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Driver Presence</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age (seconds)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driverPresence.map((driver) => (
                    <tr key={driver.driver_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{driver.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {driver.lat && driver.lng ? `${driver.lat.toFixed(4)}, ${driver.lng.toFixed(4)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {driver.last_seen_utc ? new Date(driver.last_seen_utc).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {driver.age_seconds !== null ? Math.round(driver.age_seconds) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rides' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Requested Rides</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Ride</label>
                  <select
                    value={selectedRideId}
                    onChange={(e) => setSelectedRideId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    disabled={loading || dispatchRides.length === 0}
                  >
                    <option value="">{dispatchRides.length === 0 ? 'No rides available' : 'Select Ride'}</option>
                    {dispatchRides.map((ride) => (
                      <option key={ride.ride_id} value={ride.ride_id}>
                        {ride.rider_name} - {ride.pickup} → {ride.dropoff}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Driver 
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Debug: {drivers.length} total, {drivers.filter(d => d.is_active).length} active)
                    </span>
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    disabled={loading}
                  >
                    <option value="">
                      {loading 
                        ? 'Loading drivers...' 
                        : drivers.length === 0
                          ? 'No drivers loaded - Check console'
                          : drivers.filter(d => d.is_active).length === 0 
                            ? 'No active drivers' 
                            : 'Select Driver'}
                    </option>
                    {drivers.length > 0 ? (
                      drivers
                        .filter(driver => driver.is_active) // Only show active drivers
                        .map((driver) => {
                          // Handle both 'id' (from listDrivers) and 'driver_id' (from getAvailableDrivers)
                          const driverId = driver.id || driver.driver_id;
                          if (!driverId) {
                            console.warn('Driver missing id/driver_id:', driver);
                            return null;
                          }
                          return (
                            <option key={driverId} value={driverId}>
                              {driver.name} - {driver.vehicle || 'No vehicle'}
                            </option>
                          );
                        })
                        .filter(Boolean) // Remove any null entries
                    ) : (
                      <option value="" disabled>No drivers available</option>
                    )}
                  </select>
                  {drivers.length === 0 && !loading && (
                    <p className="mt-1 text-xs text-red-600">
                      ⚠️ No drivers loaded. Open browser console (F12) and check for errors.
                    </p>
                  )}
                  {drivers.filter(d => d.is_active).length > 0 && availableDrivers.length === 0 && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Note: No drivers have updated location recently. You can still assign to active drivers.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleAssignRide}
                disabled={loading || !selectedRideId || !selectedDriverId}
                className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Assign Ride'}
              </button>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dispatchRides.map((ride) => (
                      <tr key={ride.ride_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono">{ride.ride_id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm">{ride.rider_name}</td>
                        <td className="px-6 py-4 text-sm">{ride.pickup}</td>
                        <td className="px-6 py-4 text-sm">{ride.dropoff}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRideStatusColor(ride.status)}`}>
                            {ride.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {ride.created_at_utc ? new Date(ride.created_at_utc).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Active Rides</h3>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enroute</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrived</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeRides.map((ride) => (
                    <tr key={ride.ride_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono">{ride.ride_id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm">{ride.rider_name}</td>
                      <td className="px-6 py-4 text-sm">{ride.driver_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRideStatusColor(ride.status)}`}>
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ride.assigned_at_utc ? new Date(ride.assigned_at_utc).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ride.enroute_at_utc ? new Date(ride.enroute_at_utc).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ride.arrived_at_utc ? new Date(ride.arrived_at_utc).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <Notifications />
      )}
    </div>
  );
};

export default AdminDashboard;

