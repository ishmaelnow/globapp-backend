import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyRides } from '../../services/rideService';
import { getRiderPhone } from '../../utils/auth';

const RiderHistory = () => {
  const [rides, setRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedPhone = await getRiderPhone();
      if (!storedPhone) {
        setError('No phone number found. Please book a ride first.');
        setLoading(false);
        return;
      }

      // EXACT COPY from web app - send phone as-is
      const response = await getMyRides(storedPhone.trim());
      const rides = response.rides || [];
      setRides(rides);
      setFilteredRides(rides);
    } catch (err: any) {
      console.error('Error loading rides:', err);
      
      // Extract error message properly - handle Pydantic validation errors
      let errorMessage = 'Failed to load rides';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle Pydantic validation error format
        if (Array.isArray(errorData.detail)) {
          const firstError = errorData.detail[0];
          if (firstError?.msg) {
            errorMessage = firstError.msg;
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-load rides when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [loadRides])
  );

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...rides];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((ride) => ride.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.pickup?.toLowerCase().includes(query) ||
          ride.dropoff?.toLowerCase().includes(query) ||
          ride.rider_name?.toLowerCase().includes(query) ||
          ride.ride_id?.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

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
          aValue = new Date(a.created_at_utc || a.booked_at || 0).getTime();
          bValue = new Date(b.created_at_utc || b.booked_at || 0).getTime();
          break;
      }

      if (sortBy === 'status') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredRides(filtered);
  }, [rides, statusFilter, sortBy, sortOrder, searchQuery]);

  const formatDate = (dateString: string) => {
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
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: '#fbbf24',
      assigned: '#3b82f6',
      enroute: '#a855f7',
      arrived: '#6366f1',
      in_progress: '#f97316',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusBgColor = (status: string) => {
    const colors: Record<string, string> = {
      requested: '#fef3c7',
      assigned: '#dbeafe',
      enroute: '#f3e8ff',
      arrived: '#e0e7ff',
      in_progress: '#fed7aa',
      completed: '#d1fae5',
      cancelled: '#fee2e2',
    };
    return colors[status] || '#f3f4f6';
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const copyRideId = (rideId: string) => {
    Alert.alert('Ride ID Copied', rideId);
    // In a real app, you'd copy to clipboard
  };

  if (loading && rides.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Rides</Text>
          <Text style={styles.subtitle}>
            {filteredRides.length} of {rides.length} rides
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, name, or ride ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilter}>
                {['all', 'requested', 'assigned', 'enroute', 'arrived', 'in_progress', 'completed', 'cancelled'].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        statusFilter === status && styles.statusButtonActive,
                      ]}
                      onPress={() => setStatusFilter(status)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          statusFilter === status && styles.statusButtonTextActive,
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </View>

            <View style={styles.sortRow}>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => {
                  const options = ['date', 'fare', 'status'];
                  const currentIndex = options.indexOf(sortBy);
                  setSortBy(options[(currentIndex + 1) % options.length]);
                }}
              >
                <Text style={styles.sortButtonText}>
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOrderButton}
                onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Text style={styles.sortOrderText}>{sortOrder === 'asc' ? '↑' : '↓'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error.includes('UUID') 
                ? 'Unable to load rides. This is a known backend issue. Please try again later or contact support.'
                : error}
            </Text>
          </View>
        )}

        {/* Rides List */}
        {filteredRides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptyText}>
              {rides.length === 0
                ? 'Book your first ride to see it here!'
                : 'Try adjusting your filters'}
            </Text>
          </View>
        ) : (
          <View style={styles.ridesList}>
            {filteredRides.map((ride) => (
              <TouchableOpacity
                key={ride.ride_id}
                style={styles.rideCard}
                onPress={() => copyRideId(ride.ride_id)}
              >
                <View style={styles.rideHeader}>
                  <View style={styles.rideIdContainer}>
                    <Text style={styles.rideIdLabel}>Ride ID:</Text>
                    <Text style={styles.rideId}>{ride.ride_id?.slice(0, 8) || 'N/A'}...</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBgColor(ride.status) },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                      {ride.status?.charAt(0).toUpperCase() + ride.status?.slice(1).replace('_', ' ') || 'Unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.rideDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {ride.pickup || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {ride.dropoff || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(ride.created_at_utc || ride.booked_at)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fare:</Text>
                    <Text style={styles.fareValue}>
                      ${ride.final_fare_usd || ride.estimated_price_usd || '0.00'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  filterRow: {
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusFilter: {
    flexDirection: 'row',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  statusButtonActive: {
    backgroundColor: '#4CAF50',
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sortOrderButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOrderText: {
    fontSize: 18,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  ridesList: {
    padding: 16,
    gap: 12,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rideIdLabel: {
    fontSize: 12,
    color: '#666',
  },
  rideId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rideDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  fareValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
    textAlign: 'right',
  },
});

export default RiderHistory;
