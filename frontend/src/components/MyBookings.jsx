import { useState, useEffect } from 'react';
import { getBookings } from '../utils/localStorage';
import { getMyRides } from '../services/rideService';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useApi, setUseApi] = useState(false);
  const [copiedRideId, setCopiedRideId] = useState(null);

  useEffect(() => {
    // Try to load from localStorage first (backward compatibility)
    loadBookingsFromStorage();
  }, []);

  const loadBookingsFromStorage = () => {
    setLoading(true);
    setError(null);
    try {
      const savedBookings = getBookings();
      setBookings(savedBookings);
      setUseApi(false);
    } catch (error) {
      console.error('Error loading bookings from storage:', error);
      setError('Failed to load bookings from browser storage');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsFromApi = async () => {
    if (!phoneNumber || !phoneNumber.trim()) {
      setError('Please enter your phone number to view ride history');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getMyRides(phoneNumber.trim());
      setBookings(response.rides || []);
      setUseApi(true);
    } catch (err) {
      console.error('Error loading bookings from API:', err);
      setError('Failed to load ride history. Please check your phone number and try again.');
      // Fallback to localStorage if API fails
      loadBookingsFromStorage();
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
            <p className="text-gray-600">
              {useApi 
                ? 'View your ride history from the server (works across devices)' 
                : 'View your ride history from browser storage (local only)'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && loadBookingsFromApi()}
              />
              <button
                onClick={loadBookingsFromApi}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Load from Server
              </button>
            </div>
            <button
              onClick={loadBookingsFromStorage}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {useApi ? 'Load Local' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">Book your first ride to see it here!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ride ID <span className="text-gray-400 font-normal normal-case">(click to copy)</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rider Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booked At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => {
                  const fullRideId = booking.ride_id || '';
                  
                  const handleCopyRideId = (rideId, e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(rideId).then(() => {
                      setCopiedRideId(rideId);
                      setTimeout(() => setCopiedRideId(null), 2000);
                    });
                  };
                  
                  return (
                  <tr key={booking.ride_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 group">
                        <div 
                          className="text-sm font-mono text-gray-900 cursor-pointer hover:text-primary-600 transition-colors" 
                          title={`Click to copy: ${fullRideId}`}
                          onClick={(e) => handleCopyRideId(fullRideId, e)}
                        >
                          {fullRideId}
                        </div>
                        <button
                          onClick={(e) => handleCopyRideId(fullRideId, e)}
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Copy Ride ID"
                        >
                          {copiedRideId === fullRideId ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.rider_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.rider_phone_masked || booking.rider_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {booking.pickup}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {booking.dropoff}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {booking.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.created_at_utc || booking.booked_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

