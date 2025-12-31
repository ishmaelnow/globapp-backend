import { useState, useEffect } from 'react';
import { getPublicApiKey } from '../utils/auth';
import RideTracking from './RideTracking';
import Receipt from './Receipt';

const RideDetails = ({ initialRideId = null }) => {
  const [rideId, setRideId] = useState(initialRideId || '');
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (rideIdToSearch = null) => {
    const idToUse = rideIdToSearch || rideId;
    if (!idToUse || !idToUse.trim()) {
      setError('Please enter a ride ID');
      return;
    }

    setLoading(true);
    setError(null);
    setRideDetails(null);

    try {
      const apiKey = getPublicApiKey();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://globapp.app/api/v1';
      const response = await fetch(
        `${apiBaseUrl}/rides/${idToUse.trim()}`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ride not found. Please check the ride ID.');
        }
        throw new Error(`Failed to fetch ride details: ${response.statusText}`);
      }

      const data = await response.json();
      setRideDetails(data);
    } catch (err) {
      setError(err.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if initialRideId is provided
  useEffect(() => {
    if (initialRideId && initialRideId.trim() && !rideDetails) {
      setRideId(initialRideId);
      handleSearch(initialRideId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRideId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      requested: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      enroute: 'bg-purple-100 text-purple-800',
      arrived: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Ride Details</h2>
          <p className="text-gray-600">Search for a specific ride by entering the ride ID</p>
        </div>

        {/* Search Form */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={rideId}
            onChange={(e) => setRideId(e.target.value)}
            placeholder="Enter Ride ID (e.g., abc12345-...)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Ride Details */}
        {rideDetails && (
          <div className="space-y-6">
            {/* Ride Tracking Map - Show for active rides */}
            {isActiveRide && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Your Ride</h3>
                <RideTracking rideId={rideDetails.ride_id} />
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ride Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ride ID</p>
                  <p className="text-sm font-mono text-gray-900">{rideDetails.ride_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(rideDetails.status)}`}>
                    {rideDetails.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rider Name</p>
                  <p className="text-sm text-gray-900">{rideDetails.rider_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-sm text-gray-900">{rideDetails.rider_phone_masked}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="text-sm text-gray-900">{rideDetails.pickup}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="text-sm text-gray-900">{rideDetails.dropoff}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="text-sm text-gray-900 capitalize">{rideDetails.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booked At</p>
                  <p className="text-sm text-gray-900">{formatDate(rideDetails.created_at_utc)}</p>
                </div>
              </div>
            </div>

            {/* Fare Breakdown */}
            {rideDetails.fare_quote && rideDetails.fare_quote.breakdown && (
              <div className="bg-primary-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Fare Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Fare:</span>
                    <span className="text-gray-900 font-medium">
                      ${rideDetails.fare_quote.breakdown.base_fare?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance ({rideDetails.fare_quote.distance_miles} miles):</span>
                    <span className="text-gray-900 font-medium">
                      ${rideDetails.fare_quote.breakdown.distance_fare?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time ({rideDetails.fare_quote.duration_minutes} min):</span>
                    <span className="text-gray-900 font-medium">
                      ${rideDetails.fare_quote.breakdown.time_fare?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  {rideDetails.fare_quote.breakdown.booking_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Fee:</span>
                      <span className="text-gray-900 font-medium">
                        ${rideDetails.fare_quote.breakdown.booking_fee?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-primary-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total Estimated:</span>
                      <span className="text-xl font-bold text-primary-600">
                        ${rideDetails.fare_quote.total_estimated_usd?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  {rideDetails.final_fare_usd && (
                    <div className="flex justify-between mt-2 pt-2 border-t border-primary-200">
                      <span className="text-lg font-semibold text-gray-900">Final Fare:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${rideDetails.final_fare_usd.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info */}
            {rideDetails.payment && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="text-sm text-gray-900 capitalize">{rideDetails.payment.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      ${rideDetails.payment.amount_usd?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      rideDetails.payment.status === 'captured' || rideDetails.payment.status === 'succeeded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rideDetails.payment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="text-sm text-gray-900">{formatDate(rideDetails.payment.created_at_utc)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested:</span>
                  <span className="text-gray-900">{formatDate(rideDetails.created_at_utc)}</span>
                </div>
                {rideDetails.assigned_at_utc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned:</span>
                    <span className="text-gray-900">{formatDate(rideDetails.assigned_at_utc)}</span>
                  </div>
                )}
                {rideDetails.enroute_at_utc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">En Route:</span>
                    <span className="text-gray-900">{formatDate(rideDetails.enroute_at_utc)}</span>
                  </div>
                )}
                {rideDetails.arrived_at_utc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrived:</span>
                    <span className="text-gray-900">{formatDate(rideDetails.arrived_at_utc)}</span>
                  </div>
                )}
                {rideDetails.started_at_utc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="text-gray-900">{formatDate(rideDetails.started_at_utc)}</span>
                  </div>
                )}
                {rideDetails.completed_at_utc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="text-gray-900">{formatDate(rideDetails.completed_at_utc)}</span>
                  </div>
                )}
                {rideDetails.cancelled_at_utc && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancelled:</span>
                    <span className="text-gray-900">{formatDate(rideDetails.cancelled_at_utc)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt - Show for completed rides */}
            {(rideDetails.status === 'completed' || rideDetails.payment) && (
              <div>
                <Receipt ride={rideDetails} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideDetails;

