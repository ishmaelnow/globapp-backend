import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getRideDetails } from '../../services/rideService';
import Receipt from '../../components/Receipt';
import RideTracking from '../../components/RideTracking';

interface RideDetailsData {
  ride_id: string;
  rider_name: string;
  rider_phone_masked?: string;
  pickup: string;
  dropoff: string;
  service_type: string;
  status: string;
  estimated_distance_miles?: number;
  estimated_duration_min?: number;
  estimated_price_usd?: number;
  final_fare_usd?: number;
  created_at_utc?: string;
  assigned_at_utc?: string;
  enroute_at_utc?: string;
  arrived_at_utc?: string;
  in_progress_at_utc?: string;
  started_at_utc?: string;
  completed_at_utc?: string;
  cancelled_at_utc?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  fare_quote?: {
    distance_miles?: number;
    duration_minutes?: number;
    total_estimated_usd?: number;
    breakdown?: {
      base_fare?: number;
      distance_fare?: number;
      time_fare?: number;
      booking_fee?: number;
    };
  };
  payment?: {
    id: string;
    provider: string;
    status: string;
    amount_usd?: number;
    created_at_utc?: string;
    confirmed_at_utc?: string;
  };
}

const RideDetails: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { rideId } = route.params as { rideId: string };

  const [rideDetails, setRideDetails] = useState<RideDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rideId) {
      loadRideDetails();
    }
  }, [rideId]);

  const loadRideDetails = async () => {
    if (!rideId) {
      setError('Ride ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRideDetails(rideId);
      setRideDetails(data);
    } catch (err: any) {
      console.error('Error loading ride details:', err);
      if (err.response?.status === 404) {
        setError('Ride not found. Please check the ride ID.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load ride details');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
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
      case 'assigned':
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!rideDetails) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No ride details available</Text>
        </View>
      </View>
    );
  }

  const isActiveRide =
    rideDetails.driver_id &&
    ['assigned', 'enroute', 'arrived', 'in_progress'].includes(rideDetails.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ride Details</Text>
      </View>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rideDetails.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(rideDetails.status)}</Text>
        </View>
        {isActiveRide && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>● Live Tracking</Text>
          </View>
        )}
      </View>

      {/* Ride Tracking Map - Show for active rides */}
      {isActiveRide && (
        <View style={styles.trackingSection}>
          <RideTracking rideId={rideDetails.ride_id} />
        </View>
      )}

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ride Information</Text>
        <View style={styles.infoGrid}>
          <InfoRow label="Ride ID" value={rideDetails.ride_id} />
          <InfoRow label="Rider Name" value={rideDetails.rider_name} />
          {rideDetails.rider_phone_masked && (
            <InfoRow label="Phone" value={rideDetails.rider_phone_masked} />
          )}
          <InfoRow label="Service Type" value={rideDetails.service_type?.charAt(0).toUpperCase() + rideDetails.service_type?.slice(1)} />
          <InfoRow label="Booked At" value={formatDate(rideDetails.created_at_utc)} />
        </View>
      </View>

      {/* Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locations</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>📍 Pickup:</Text>
            <Text style={styles.locationText}>{rideDetails.pickup}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>🎯 Destination:</Text>
            <Text style={styles.locationText}>{rideDetails.dropoff}</Text>
          </View>
        </View>
      </View>

      {/* Fare Breakdown */}
      {rideDetails.fare_quote && rideDetails.fare_quote.breakdown && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>
          <View style={styles.fareCard}>
            <FareRow
              label="Base Fare"
              value={`$${rideDetails.fare_quote.breakdown.base_fare?.toFixed(2) || '0.00'}`}
            />
            <FareRow
              label={`Distance (${rideDetails.fare_quote.distance_miles?.toFixed(1) || '0'} mi)`}
              value={`$${rideDetails.fare_quote.breakdown.distance_fare?.toFixed(2) || '0.00'}`}
            />
            {rideDetails.fare_quote.breakdown.time_fare && rideDetails.fare_quote.breakdown.time_fare > 0 && (
              <FareRow
                label={`Time (${rideDetails.fare_quote.duration_minutes || 0} min)`}
                value={`$${rideDetails.fare_quote.breakdown.time_fare.toFixed(2)}`}
              />
            )}
            {rideDetails.fare_quote.breakdown.booking_fee && rideDetails.fare_quote.breakdown.booking_fee > 0 && (
              <FareRow
                label="Booking Fee"
                value={`$${rideDetails.fare_quote.breakdown.booking_fee.toFixed(2)}`}
              />
            )}
            <View style={styles.fareTotal}>
              <Text style={styles.fareTotalLabel}>Total Estimated:</Text>
              <Text style={styles.fareTotalValue}>
                ${rideDetails.fare_quote.total_estimated_usd?.toFixed(2) || '0.00'}
              </Text>
            </View>
            {rideDetails.final_fare_usd && (
              <View style={styles.fareTotal}>
                <Text style={styles.fareTotalLabel}>Final Fare:</Text>
                <Text style={[styles.fareTotalValue, { color: '#4CAF50' }]}>
                  ${rideDetails.final_fare_usd.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Payment Information */}
      {rideDetails.payment && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoGrid}>
            <InfoRow
              label="Payment Method"
              value={rideDetails.payment.provider?.charAt(0).toUpperCase() + rideDetails.payment.provider?.slice(1)}
            />
            <InfoRow
              label="Amount"
              value={`$${rideDetails.payment.amount_usd?.toFixed(2) || '0.00'}`}
            />
            <InfoRow
              label="Payment Status"
              value={rideDetails.payment.status}
            />
            <InfoRow
              label="Created At"
              value={formatDate(rideDetails.payment.created_at_utc)}
            />
          </View>
        </View>
      )}

      {/* Driver Information */}
      {rideDetails.driver_name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.infoGrid}>
            <InfoRow label="Driver Name" value={rideDetails.driver_name} />
            {rideDetails.driver_phone && (
              <InfoRow label="Driver Phone" value={rideDetails.driver_phone} />
            )}
            {rideDetails.assigned_at_utc && (
              <InfoRow label="Assigned At" value={formatDate(rideDetails.assigned_at_utc)} />
            )}
          </View>
        </View>
      )}

      {/* Status Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.timelineCard}>
          <TimelineItem label="Requested" date={rideDetails.created_at_utc} />
          {rideDetails.assigned_at_utc && (
            <TimelineItem label="Assigned" date={rideDetails.assigned_at_utc} />
          )}
          {rideDetails.enroute_at_utc && (
            <TimelineItem label="En Route" date={rideDetails.enroute_at_utc} />
          )}
          {rideDetails.arrived_at_utc && (
            <TimelineItem label="Arrived" date={rideDetails.arrived_at_utc} />
          )}
          {rideDetails.started_at_utc && (
            <TimelineItem label="Started" date={rideDetails.started_at_utc} />
          )}
          {rideDetails.completed_at_utc && (
            <TimelineItem label="Completed" date={rideDetails.completed_at_utc} />
          )}
          {rideDetails.cancelled_at_utc && (
            <TimelineItem label="Cancelled" date={rideDetails.cancelled_at_utc} />
          )}
        </View>
      </View>

      {/* Receipt - Show for completed rides */}
      {(rideDetails.status === 'completed' || rideDetails.payment) && (
        <View style={styles.section}>
          <Receipt ride={rideDetails} />
        </View>
      )}
    </ScrollView>
  );
};

// Helper Components
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const FareRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.fareRow}>
    <Text style={styles.fareLabel}>{label}</Text>
    <Text style={styles.fareValue}>{value}</Text>
  </View>
);

const TimelineItem: React.FC<{ label: string; date?: string }> = ({ label, date }) => {
  const formatDate = (dateString?: string) => {
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

  return (
    <View style={styles.timelineItem}>
      <Text style={styles.timelineLabel}>{label}:</Text>
      <Text style={styles.timelineDate}>{formatDate(date)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  locationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    minWidth: 100,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  fareCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fareTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
  },
  fareTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  fareTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timelineCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#666',
  },
  timelineDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trackingSection: {
    marginTop: 16,
  },
});

export default RideDetails;



