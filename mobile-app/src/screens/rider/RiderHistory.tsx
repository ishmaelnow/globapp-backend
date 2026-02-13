import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getMyRides } from '../../services/rideService';
import { getRiderPhone, setRiderPhone } from '../../utils/auth';

interface Ride {
  ride_id: string;
  rider_name: string;
  pickup: string;
  dropoff: string;
  service_type: string;
  status: string;
  estimated_distance_miles?: number;
  estimated_duration_min?: number;
  estimated_price_usd?: number;
  created_at_utc?: string;
  completed_at_utc?: string;
  driver_name?: string;
}

const RiderHistory: React.FC = () => {
  const navigation = useNavigation();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStoredPhone();
  }, []);

  useEffect(() => {
    if (phoneNumber) {
      loadRides();
    }
  }, [phoneNumber]);

  useEffect(() => {
    applyFilters();
  }, [rides, statusFilter]);

  const loadStoredPhone = async () => {
    try {
      const storedPhone = await getRiderPhone();
      if (storedPhone) {
        setPhoneNumber(storedPhone);
      }
    } catch (err) {
      console.error('Error loading stored phone:', err);
    }
  };

  const loadRides = async () => {
    if (!phoneNumber || !phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Store phone number for future use
      await setRiderPhone(phoneNumber.trim());

      const response = await getMyRides(phoneNumber.trim());
      const ridesList = response.rides || response || [];
      setRides(ridesList);
      setFilteredRides(ridesList);
    } catch (err: any) {
      console.error('Error loading rides:', err);
      setError(err.response?.data?.detail || 'Failed to load ride history. Please check your phone number and try again.');
      setRides([]);
      setFilteredRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rides];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ride) => ride.status === statusFilter);
    }

    setFilteredRides(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRides();
  }, [phoneNumber]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
      case 'enroute':
      case 'arrived':
        return '#2196F3';
      case 'cancelled':
        return '#f44336';
      case 'requested':
      case 'pending':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'requested':
        return 'Requested';
      case 'assigned':
        return 'Assigned';
      case 'enroute':
        return 'En Route';
      case 'arrived':
        return 'Arrived';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const handleRidePress = (ride: Ride) => {
    (navigation as any).navigate('RideDetails', { rideId: ride.ride_id });
  };

  const renderRideItem = ({ item }: { item: Ride }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => handleRidePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideHeaderLeft}>
          <Text style={styles.rideId}>Ride #{item.ride_id.substring(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.rideDate}>{formatDate(item.created_at_utc)}</Text>
      </View>

      <View style={styles.rideLocations}>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>From:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.pickup || 'N/A'}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>To:</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {item.dropoff || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.rideInfo}>
          {item.estimated_distance_miles && (
            <Text style={styles.rideInfoText}>
              {item.estimated_distance_miles.toFixed(1)} mi
            </Text>
          )}
          {item.estimated_duration_min && (
            <Text style={styles.rideInfoText}>
              {Math.round(item.estimated_duration_min)} min
            </Text>
          )}
          <Text style={styles.rideInfoText}>
            {item.service_type?.charAt(0).toUpperCase() + item.service_type?.slice(1) || 'Economy'}
          </Text>
        </View>
        {item.estimated_price_usd && (
          <Text style={styles.ridePrice}>
            ${item.estimated_price_usd.toFixed(2)}
          </Text>
        )}
      </View>

      {item.driver_name && (
        <View style={styles.driverInfo}>
          <Text style={styles.driverLabel}>Driver:</Text>
          <Text style={styles.driverName}>{item.driver_name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Rides</Text>
        <Text style={styles.subtitle}>View your ride history</Text>
      </View>

      {/* Phone Number Input */}
      <View style={styles.phoneInputContainer}>
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.loadButton, (!phoneNumber || loading) && styles.loadButtonDisabled]}
          onPress={loadRides}
          disabled={!phoneNumber || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loadButtonText}>Load</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      {rides.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by status:</Text>
          <View style={styles.filterButtons}>
            {['all', 'requested', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.filterButtonActive,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    statusFilter === status && styles.filterButtonTextActive,
                  ]}
                >
                  {status === 'all' ? 'All' : getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Rides List */}
      {loading && rides.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      ) : filteredRides.length === 0 && phoneNumber ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rides found</Text>
          <Text style={styles.emptySubtext}>
            {statusFilter !== 'all'
              ? `No rides with status "${getStatusLabel(statusFilter)}"`
              : 'Start booking rides to see them here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.ride_id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
          }
          ListEmptyComponent={
            !phoneNumber ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Enter your phone number to view rides</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  phoneInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  loadButtonDisabled: {
    opacity: 0.5,
  },
  loadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rideHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rideId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  rideDate: {
    fontSize: 12,
    color: '#666',
  },
  rideLocations: {
    marginBottom: 12,
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 50,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rideInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  rideInfoText: {
    fontSize: 12,
    color: '#666',
  },
  ridePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  driverLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default RiderHistory;
