import { useState, useEffect, useMemo } from 'react';
import { getBookings } from '../utils/localStorage';
import { getMyRides, cancelRide, ACTIVE_RIDE_STATUSES, CANCELLABLE_RIDE_STATUSES } from '../services/rideService';
import { setLastRiderPhone, clearActiveRideId, getLastRiderPhone } from '../utils/riderSession';

const isOpenRideStatus = (s) => ACTIVE_RIDE_STATUSES.includes(String(s || '').toLowerCase());
const canCancelRideStatus = (s) => CANCELLABLE_RIDE_STATUSES.includes(String(s || '').toLowerCase());

const MyBookings = ({ onViewRideDetails, onRideSessionChanged }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  /** Start false so we never flash “Loading…” forever if boot throws or deploy is stale */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useApi, setUseApi] = useState(false);
  const [copiedRideId, setCopiedRideId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  
  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'fare', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [searchQuery, setSearchQuery] = useState('');

  /** Must be defined BEFORE boot effect (effect used to run before this line → ReferenceError → stuck loading). */
  const syncRiderPhoneForBanner = (rides, phoneHint) => {
    const hint = phoneHint !== undefined && phoneHint !== null ? String(phoneHint).trim() : '';
    if (hint) {
      setLastRiderPhone(hint);
      return;
    }
    const p = phoneNumber.trim();
    if (p) {
      setLastRiderPhone(p);
      return;
    }
    const withPhone = (rides || []).find((r) => r.rider_phone);
    if (withPhone?.rider_phone) setLastRiderPhone(String(withPhone.rider_phone));
  };

  const loadBookingsFromStorage = (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const savedBookings = getBookings();
      setBookings(savedBookings);
      setFilteredBookings(savedBookings);
      setUseApi(false);
      syncRiderPhoneForBanner(savedBookings);
      onRideSessionChanged?.();
    } catch (err) {
      console.error('Error loading bookings from storage:', err);
      setError('Failed to load bookings from browser storage');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const digitCount = (s) => String(s || '').replace(/\D/g, '').length;

    try {
      const fromSession = (getLastRiderPhone() || '').trim();
      let fromE164 = '';
      try {
        fromE164 = (localStorage.getItem('globapp_rider_phone_e164') || '').trim();
      } catch {
        /* ignore */
      }
      const pref = fromSession || fromE164;

      if (digitCount(pref) >= 10) {
        setPhoneNumber(pref);
        setError(null);
        try {
          const savedBookings = getBookings();
          setBookings(savedBookings);
          setUseApi(false);
          syncRiderPhoneForBanner(savedBookings, pref);
          onRideSessionChanged?.();
        } catch (e2) {
          console.error(e2);
          setBookings([]);
        }

        (async () => {
          try {
            const response = await getMyRides(pref);
            if (cancelled) return;
            const rides = response.rides || [];
            setBookings(rides);
            setLastRiderPhone(pref);
            setUseApi(true);
            syncRiderPhoneForBanner(rides, pref);
            onRideSessionChanged?.();
          } catch (err) {
            console.error('Error loading rides on open:', err);
            if (!cancelled) {
              setError(
                err?.message?.includes('timed out')
                  ? 'Server did not respond in time. Showing saved browser list — tap “Load from Server” to retry.'
                  : 'Could not load from server. Showing saved browser list — tap “Load from Server” to retry.'
              );
            }
          }
        })();
      } else {
        loadBookingsFromStorage({ silent: true });
      }
    } catch (e) {
      console.error('MyBookings boot error:', e);
      setError('Could not open My Bookings. Use Refresh or reload the page.');
      try {
        const local = getBookings();
        setBookings(local);
        setUseApi(false);
      } catch {
        setBookings([]);
      }
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time boot
  }, []);

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
      setLastRiderPhone(phoneNumber.trim());
      setBookings(rides);
      setFilteredBookings(rides);
      setUseApi(true);
      onRideSessionChanged?.();
    } catch (err) {
      console.error('Error loading bookings from API:', err);
      setError('Failed to load ride history. Please check your phone number and try again.');
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

  const activeRideBooking = useMemo(() => {
    const opens = bookings.filter((b) => isOpenRideStatus(b.status));
    if (!opens.length) return null;
    return [...opens].sort(
      (a, b) =>
        new Date(b.created_at_utc || b.booked_at || 0) -
        new Date(a.created_at_utc || a.booked_at || 0)
    )[0];
  }, [bookings]);

  const phoneForCancel = (booking) => {
    const p = phoneNumber.trim();
    if (p) return p;
    if (booking?.rider_phone) return String(booking.rider_phone).trim();
    return '';
  };

  const handleCancelRide = async (booking, e) => {
    e?.stopPropagation?.();
    const phone = phoneForCancel(booking);
    if (!phone) {
      setError('Enter your phone number above and click “Load from Server”, or use a booking saved with your full phone (local list).');
      return;
    }
    if (!window.confirm('Cancel this ride?')) return;
    setCancellingId(booking.ride_id);
    setError(null);
    try {
      await cancelRide(booking.ride_id, phone);
      clearActiveRideId();
      try {
        const response = await getMyRides(phone);
        const rides = response.rides || [];
        setBookings(rides);
        setUseApi(true);
        setPhoneNumber(phone);
        setLastRiderPhone(phone);
      } catch {
        if (useApi) await loadBookingsFromApi();
        else loadBookingsFromStorage();
      }
      onRideSessionChanged?.();
    } catch (err) {
      setError(err?.message || 'Could not cancel ride');
    } finally {
      setCancellingId(null);
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

  const getStatusLabel = (status) => {
    const labels = {
      requested: 'Requested',
      assigned: 'Assigned',
      enroute: 'On the way',
      arrived: 'Arrived at pickup',
      in_progress: 'Ride in progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
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

        {activeRideBooking && (
          <div className="mb-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 shadow-md">
            <p className="text-xs font-bold uppercase text-emerald-800 tracking-wide">Active ride</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {getStatusLabel(activeRideBooking.status)} — pickup:{' '}
              <span className="font-normal text-gray-700">{activeRideBooking.pickup || '—'}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onViewRideDetails?.(activeRideBooking.ride_id)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700"
              >
                Track &amp; chat
              </button>
              {canCancelRideStatus(activeRideBooking.status) && (
                <button
                  type="button"
                  disabled={cancellingId === activeRideBooking.ride_id}
                  onClick={(e) => handleCancelRide(activeRideBooking, e)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {cancellingId === activeRideBooking.ride_id ? 'Cancelling…' : 'Cancel ride'}
                </button>
              )}
            </div>
            {!phoneForCancel(activeRideBooking) && (
              <p className="mt-2 text-sm text-amber-800">
                To cancel server-loaded rides, type your phone above and use <strong>Load from Server</strong> first.
              </p>
            )}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {useApi && bookings.length === 0
                ? 'No rides for this phone on the server'
                : 'No bookings yet'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {useApi && bookings.length === 0
                ? 'If you expected a trip, confirm the phone matches the one used when booking, then tap “Load from Server”.'
                : !useApi && String(phoneNumber).replace(/\D/g, '').length >= 10
                  ? 'Tap “Load from Server” to fetch your trips from the server.'
                  : 'Book a ride or enter your phone and load from the server to see history here.'}
            </p>
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
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.created_at_utc || booking.booked_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white z-10">
                      <div className="flex flex-wrap gap-2">
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
                        {isOpenRideStatus(booking.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewRideDetails) onViewRideDetails(fullRideId);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                            title="Track and message"
                          >
                            Track / chat
                          </button>
                        )}
                        {canCancelRideStatus(booking.status) && (
                          <button
                            onClick={(e) => handleCancelRide(booking, e)}
                            disabled={cancellingId === fullRideId}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50"
                          >
                            {cancellingId === fullRideId ? '…' : 'Cancel'}
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

