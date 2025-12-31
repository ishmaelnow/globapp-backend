import { useState, useEffect } from 'react';
import { getPaymentReports } from '../services/adminService';
import { getAdminApiKey } from '../utils/auth';

const PaymentReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    provider: '',
  });

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = getAdminApiKey();
      const data = await getPaymentReports(
        filters.startDate || null,
        filters.endDate || null,
        filters.provider || null,
        apiKey
      );
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load payment reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
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
        <p className="mt-4 text-gray-600">Loading payment reports...</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={filters.provider}
              onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Providers</option>
              <option value="stripe">Stripe</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReports}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reports?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(reports.summary.total_revenue_usd)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Payments</h3>
            <p className="text-3xl font-bold text-gray-900">{reports.summary.total_payments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Rides</h3>
            <p className="text-3xl font-bold text-gray-900">{reports.summary.total_rides}</p>
          </div>
        </div>
      )}

      {/* Revenue by Provider */}
      {reports?.by_provider && reports.by_provider.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Provider</h3>
          <div className="space-y-3">
            {reports.by_provider.map((item) => (
              <div key={item.provider} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium capitalize">{item.provider}</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.revenue_usd)}</p>
                  <p className="text-sm text-gray-500">{item.payment_count} payments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue by Status */}
      {reports?.by_status && reports.by_status.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Status</h3>
          <div className="space-y-3">
            {reports.by_status.map((item) => (
              <div key={item.status} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium capitalize">{item.status.replace('_', ' ')}</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.revenue_usd)}</p>
                  <p className="text-sm text-gray-500">{item.payment_count} payments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Revenue Chart */}
      {reports?.daily_revenue && reports.daily_revenue.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h3>
          <div className="space-y-2">
            {reports.daily_revenue.slice(0, 10).map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-primary-600 h-6 rounded"
                      style={{
                        width: `${(day.revenue_usd / Math.max(...reports.daily_revenue.map(d => d.revenue_usd))) * 100}%`,
                      }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(day.revenue_usd)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{day.payment_count} payments</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentReports;

