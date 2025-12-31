import { useState, useEffect } from 'react';
import { getBookings } from '../utils/localStorage';
import { getMyRides } from '../services/rideService';

const MyBookings = ({ onViewRideDetails }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useApi, setUseApi] = useState(false);
  const [copiedRideId, setCopiedRideId] = useState(null);
  
  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'fare', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [searchQuery, setSearchQuery] = useState('');

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
      setFilteredBookings(savedBookings);
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
      const rides = response.rides || [];
      setBookings(rides);
      setFilteredBookings(rides);
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

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.pickup?.toLowerCase().includes(query) ||
        booking.dropoff?.toLowerCase().includes(query) ||
        booking.rider_name?.toLowerCase().includes(query) ||
        booking.ride_id?.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'fare':
          aValue = a.final_fare_usd || a.estimated_price_usd || 0;
          bValue = b.final_fare_usd || b.estimated_price_usd || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at_utc || a.booked_at || 0);
          bValue = new Date(b.created_at_utc || b.booked_at || 0);
          break;
      }

      if (sortBy === 'date') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortBy === 'fare') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, sortBy, sortOrder, searchQuery]);

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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
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

          {/* Filters and Search */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, name, or ride ID..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="assigned">Assigned</option>
                  <option value="enroute">En Route</option>
                  <option value="arrived">Arrived</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="fare">Sort by Fare</option>
                  <option value="status">Sort by Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} rides
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
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
            <div className="mb-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              💡 <strong>Tip:</strong> Click anywhere on a row to view details, or use the buttons in the Actions column (scroll right if needed).
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '280px' }}>
                    Ride ID <span className="text-gray-400 font-normal normal-case">(click to copy)</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                    Rider Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '200px' }}>
                    Pickup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '200px' }}>
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                    Booked At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10" style={{ minWidth: '180px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => {
                  const fullRideId = booking.ride_id || '';
                  
                  const handleCopyRideId = (rideId, e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(rideId).then(() => {
                      setCopiedRideId(rideId);
                      setTimeout(() => setCopiedRideId(null), 2000);
                    });
                  };
                  
                  const handleRowClick = (e) => {
                    // Don't trigger if clicking on copy button or copy icon
                    if (e.target.closest('button') || e.target.closest('svg')) {
                      return;
                    }
                    if (onViewRideDetails) {
                      onViewRideDetails(fullRideId);
                    }
                  };
                  
                  return (
                  <tr 
                    key={booking.ride_id} 
                    className="hover:bg-primary-50 transition-colors cursor-pointer"
                    onClick={handleRowClick}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group min-w-0">
                        <div 
                          className="text-sm font-mono text-gray-900 break-all" 
                          title={`Click row to view details, or click ID to copy: ${fullRideId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRideId(fullRideId, e);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (onViewRideDetails) {
                              onViewRideDetails(fullRideId);
                            }
                          }}
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
                    <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white z-10">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewRideDetails) {
                              onViewRideDetails(fullRideId);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                          title="View ride details"
                        >
                          View Details
                        </button>
                        {booking.driver_id && ['assigned', 'enroute', 'arrived', 'in_progress'].includes(booking.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewRideDetails) {
                                onViewRideDetails(fullRideId);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            title="Track ride on map"
                          >
                            🗺️ Track
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

