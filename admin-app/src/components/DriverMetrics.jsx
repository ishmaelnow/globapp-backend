import { useState, useEffect } from 'react';
import { getDriverMetrics, listDrivers } from '../services/adminService';
import { getAdminApiKey } from '../utils/auth';

const DriverMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    driverId: '',
    startDate: '',
    endDate: '',
  });

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = getAdminApiKey();
      const [metricsData, driversData] = await Promise.all([
        getDriverMetrics(
          filters.driverId || null,
          filters.startDate || null,
          filters.endDate || null,
          apiKey
        ),
        listDrivers(apiKey),
      ]);
      setMetrics(metricsData);
      setDrivers(driversData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load driver metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Loading driver metrics...</p>
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={filters.driverId}
              onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Drivers</option>
              {drivers.map((driver) => (
                <option key={driver.id || driver.driver_id} value={driver.id || driver.driver_id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadMetrics}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      {metrics?.overall && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Drivers</h3>
            <p className="text-3xl font-bold text-primary-600">{metrics.overall.total_drivers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Rides</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.overall.total_rides}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {metrics.overall.completion_rate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Fare</h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(metrics.overall.avg_fare_usd)}
            </p>
          </div>
        </div>
      )}

      {/* Driver Performance Table */}
      {metrics?.drivers && metrics.drivers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Rides</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Distance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Ride</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.drivers.map((driver) => (
                <tr key={driver.driver_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{driver.driver_name}</div>
                      <div className="text-sm text-gray-500">{driver.driver_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.total_rides}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.completed_rides}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        driver.completion_rate >= 90
                          ? 'bg-green-100 text-green-800'
                          : driver.completion_rate >= 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {driver.completion_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.avg_distance_miles.toFixed(1)} mi
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(driver.total_revenue_usd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.last_ride_at
                      ? new Date(driver.last_ride_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DriverMetrics;

