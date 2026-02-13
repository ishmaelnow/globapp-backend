import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../../hooks/useNotifications';
import { getRiderPhone } from '../../utils/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'pending' | 'read';
  recipient_type: string;
  recipient_id?: string;
  ride_id?: string;
  created_at_utc: string;
}

const RiderNotifications: React.FC = () => {
  const navigation = useNavigation();
  const [riderPhone, setRiderPhone] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    loading,
    error,
    lastUpdate,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications(riderPhone, 10000); // Poll every 10 seconds

  React.useEffect(() => {
    loadRiderPhone();
  }, []);

  const loadRiderPhone = async () => {
    try {
      const phone = await getRiderPhone();
      setRiderPhone(phone);
    } catch (err) {
      console.error('Error loading rider phone:', err);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === 'pending') {
      markAsRead(notification.id);
    }

    // Navigate to ride details if ride_id exists
    if (notification.ride_id) {
      (navigation as any).navigate('RideDetails', { rideId: notification.ride_id });
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert('Info', 'All notifications are already read');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} unread notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: markAllAsRead,
        },
      ]
    );
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => n.status === 'pending')
      : notifications;

  const onRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        item.status === 'pending' && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {item.status === 'pending' && (
            <View style={styles.unreadDot} />
          )}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>
            {formatTime(item.created_at_utc)}
          </Text>
          {item.ride_id && (
            <Text style={styles.rideId}>
              Ride #{item.ride_id.substring(0, 8)}
            </Text>
          )}
        </View>
      </View>
      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={() => markAsRead(item.id)}
        >
          <Text style={styles.markReadButtonText}>Mark read</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'unread' && styles.filterButtonTextActive,
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllButtonText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === 'unread'
              ? 'You\'re all caught up!'
              : 'You\'ll see ride updates and important messages here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#4CAF50" />
          }
          ListFooterComponent={
            lastUpdate ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  markAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllButtonText: {
    fontSize: 14,
    color: '#4CAF50',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  unreadCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  rideId: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e8f5e9',
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  markReadButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default RiderNotifications;
