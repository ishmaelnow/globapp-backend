import { useEffect, useState } from 'react';
import { getDriverWallet } from '../services/driverService';

const fmtUsd = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function DriverWallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDriverWallet(20);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Wallet</h3>
          <p className="text-gray-600">Your earnings from completed trips</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Available balance</p>
          <p className="text-3xl font-bold text-gray-900">{fmtUsd(data?.available_balance_usd)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total earned</p>
          <p className="text-3xl font-bold text-gray-900">{fmtUsd(data?.total_earned_usd)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Trips completed</p>
          <p className="text-3xl font-bold text-gray-900">{data?.trips_completed ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900">Recent trips</h4>
        <span className="text-sm text-gray-500">{data?.currency || 'USD'}</span>
      </div>

      {loading && !data ? (
        <div className="text-center py-10 text-gray-600">Loading…</div>
      ) : (data?.recent_trips?.length || 0) === 0 ? (
        <div className="text-center py-10 text-gray-600">No completed trips yet.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trip</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Completed</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pickup</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dropoff</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Fare</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recent_trips.map((t) => (
                <tr key={t.ride_id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-mono text-gray-700">{String(t.ride_id).slice(0, 8)}…</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{fmtDate(t.completed_at_utc)}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{t.pickup}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{t.dropoff}</td>
                  <td className="px-5 py-3 text-sm text-gray-900 text-right font-semibold">{fmtUsd(t.fare_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Balance is calculated from completed trips. If a payment record exists, it uses the payment amount; otherwise it uses the trip’s estimated fare.
      </div>
    </div>
  );
}

