import { useState, useEffect } from 'react';
import { getRidesHistory, listDrivers } from '../services/adminService';
import { getAdminApiKey } from '../utils/auth';

const EnhancedRideHistory = () => {
  const [history, setHistory] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    driverId: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
  });

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = getAdminApiKey();
      const [historyData, driversData] = await Promise.all([
        getRidesHistory(
          filters.status || null,
          filters.driverId || null,
          filters.startDate || null,
          filters.endDate || null,
          pagination.limit,
          pagination.offset,
          apiKey
        ),
        listDrivers(apiKey),
      ]);
      setHistory(historyData);
      setDrivers(driversData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [pagination]);

  const getStatusColor = (status) => {
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
        <p className="mt-4 text-gray-600">Loading ride history...</p>
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

  const totalPages = Math.ceil((history?.total || 0) / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="assigned">Assigned</option>
              <option value="enroute">En Route</option>
              <option value="arrived">Arrived</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
              onClick={() => {
                setPagination({ ...pagination, offset: 0 });
                loadHistory();
              }}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {history && (
        <div className="text-sm text-gray-600">
          Showing {history.rides.length} of {history.total} rides
        </div>
      )}

      {/* Rides Table */}
      {history?.rides && history.rides.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ride ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.rides.map((ride) => (
                <tr key={ride.ride_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {ride.ride_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ride.rider_name}</div>
                    <div className="text-sm text-gray-500">{ride.rider_phone_masked}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {ride.pickup}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {ride.dropoff}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ride.driver_name ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ride.driver_name}</div>
                        <div className="text-sm text-gray-500">{ride.driver_phone}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ride.status)}`}>
                      {ride.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {ride.estimated_price_usd ? formatCurrency(ride.estimated_price_usd) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ride.created_at_utc
                      ? new Date(ride.created_at_utc).toLocaleString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {history && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
              disabled={pagination.offset === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
              disabled={pagination.offset + pagination.limit >= history.total}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRideHistory;

