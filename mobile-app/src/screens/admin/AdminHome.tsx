import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  listDrivers,
  createDriver,
  listDispatchRides,
  assignRide,
  getActiveRides,
  getAutoAssignmentSetting,
  updateAutoAssignmentSetting,
  autoAssignRide,
  getAvailableDrivers,
} from '../../services/adminService';
import { getAdminApiKey, clearAllAuth } from '../../utils/auth';
import { ADMIN_API_KEY } from '../../config/api';

const Tab = createBottomTabNavigator();

interface Driver {
  id?: string;
  driver_id?: string;
  name: string;
  phone?: string;
  masked_phone?: string;
  vehicle?: string;
  is_active: boolean;
}

interface Ride {
  ride_id: string;
  rider_name: string;
  pickup: string;
  dropoff: string;
  status: string;
  created_at_utc?: string;
  assigned_driver_id?: string;
}

// Drivers Tab Component
const DriversTab: React.FC<{ apiKey: string; onRefresh: () => void }> = ({ apiKey, onRefresh }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    vehicle: '',
    pin: '',
    is_active: true,
  });

  const loadDrivers = async () => {
    try {
      const data = await listDrivers(apiKey);
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to load drivers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [apiKey]);

  const handleCreateDriver = async () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.pin) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createDriver(newDriver, apiKey);
      Alert.alert('Success', 'Driver created successfully');
      setNewDriver({ name: '', phone: '', vehicle: '', pin: '', is_active: true });
      setShowCreateForm(false);
      loadDrivers();
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create driver');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drivers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.addButtonText}>{showCreateForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showCreateForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create New Driver</Text>
          {/* Create form fields would go here - simplified for now */}
          <TouchableOpacity style={styles.submitButton} onPress={handleCreateDriver}>
            <Text style={styles.submitButtonText}>Create Driver</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadDrivers();
          }} />
        }
      >
        {drivers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No drivers found</Text>
          </View>
        ) : (
          drivers.map((driver) => {
            const driverId = driver.id || driver.driver_id || '';
            return (
              <View key={driverId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{driver.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      driver.is_active ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {driver.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardText}>
                  Phone: {driver.masked_phone || driver.phone || 'N/A'}
                </Text>
                <Text style={styles.cardText}>Vehicle: {driver.vehicle || 'N/A'}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

// Rides Tab Component
const RidesTab: React.FC<{ apiKey: string; autoAssignmentEnabled: boolean }> = ({
  apiKey,
  autoAssignmentEnabled: propAutoAssignmentEnabled,
}) => {
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(propAutoAssignmentEnabled);
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const loadData = async () => {
    try {
      const [ridesData, driversData] = await Promise.all([
        listDispatchRides('requested', 50, apiKey),
        listDrivers(apiKey),
      ]);
      setRides(Array.isArray(ridesData) ? ridesData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Also load auto-assignment setting for this tab
    const loadAutoAssignment = async () => {
      try {
        const settings = await getAutoAssignmentSetting(apiKey);
        setAutoAssignmentEnabled(settings.enabled || false);
      } catch (error) {
        console.error('Failed to load auto-assignment:', error);
      }
    };
    loadAutoAssignment();
  }, [apiKey]);

  const handleAssignRide = async () => {
    if (!selectedRideId || !selectedDriverId) {
      Alert.alert('Error', 'Please select both ride and driver');
      return;
    }

    try {
      await assignRide(selectedRideId, selectedDriverId, apiKey);
      Alert.alert('Success', 'Ride assigned successfully');
      setSelectedRideId('');
      setSelectedDriverId('');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to assign ride');
    }
  };

  const handleAutoAssign = async (rideId: string) => {
    try {
      const result = await autoAssignRide(rideId, apiKey);
      Alert.alert(
        'Success',
        `Ride auto-assigned to ${result.driver_name} (${result.distance_miles} miles away)`
      );
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to auto-assign ride');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requested Rides</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadData();
          }} />
        }
      >
        {rides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requested rides</Text>
          </View>
        ) : (
          rides.map((ride) => (
            <View key={ride.ride_id} style={styles.card}>
              <Text style={styles.cardTitle}>{ride.rider_name}</Text>
              <Text style={styles.cardText}>From: {ride.pickup}</Text>
              <Text style={styles.cardText}>To: {ride.dropoff}</Text>
              <Text style={styles.cardText}>Status: {ride.status}</Text>

              {autoAssignmentEnabled && (
                <TouchableOpacity
                  style={styles.autoAssignButton}
                  onPress={() => handleAutoAssign(ride.ride_id)}
                >
                  <Text style={styles.autoAssignButtonText}>Auto-Assign</Text>
                </TouchableOpacity>
              )}

              {!autoAssignmentEnabled && (
                <View style={styles.assignContainer}>
                  <Text style={styles.selectLabel}>Select Driver:</Text>
                  {/* Driver selection would go here - simplified */}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// Settings Tab Component
const SettingsTab: React.FC<{ apiKey: string; onLogout: () => void }> = ({
  apiKey,
  onLogout,
}) => {
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await getAutoAssignmentSetting(apiKey);
      setAutoAssignmentEnabled(data.enabled || false);
    } catch (error: any) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [apiKey]);

  const handleToggleAutoAssignment = async (value: boolean) => {
    setUpdating(true);
    try {
      await updateAutoAssignmentSetting(value, apiKey);
      setAutoAssignmentEnabled(value);
      globalAutoAssignmentEnabled = value; // Update global state
      Alert.alert('Success', `Auto-assignment ${value ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update setting');
      // Revert toggle on error
      setAutoAssignmentEnabled(!value);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>System Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Auto-Assignment</Text>
            <Text style={styles.settingDescription}>
              Automatically assign the closest available driver to rides
            </Text>
          </View>
          <Switch
            value={autoAssignmentEnabled}
            onValueChange={handleToggleAutoAssignment}
            disabled={updating}
            trackColor={{ false: '#ddd', true: '#FF9800' }}
            thumbColor={autoAssignmentEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {autoAssignmentEnabled && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              When enabled, you can use the "Auto-Assign" button on requested rides to
              automatically assign the closest driver.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Shared state for auto-assignment (using React Context would be better, but keeping it simple)
let globalAutoAssignmentEnabled = false;
let globalApiKey = '';

// Main AdminHome Component - renders different tabs based on route
const AdminHome: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [apiKey, setApiKey] = useState('');
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedKey = await getAdminApiKey();
        const keyToUse = storedKey || ADMIN_API_KEY || '';
        setApiKey(keyToUse);
        globalApiKey = keyToUse;

        if (keyToUse) {
          // Load auto-assignment setting
          try {
            const settings = await getAutoAssignmentSetting(keyToUse);
            const enabled = settings.enabled || false;
            setAutoAssignmentEnabled(enabled);
            globalAutoAssignmentEnabled = enabled;
          } catch (error) {
            console.error('Failed to load auto-assignment setting:', error);
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApiKey();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAllAuth();
          navigation.replace('AdminLogin');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  if (!apiKey) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No API key found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('AdminLogin')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine which tab to show based on route name
  const routeName = route.name;
  
  if (routeName === 'AdminDrivers') {
    return <DriversTab apiKey={apiKey} onRefresh={() => {}} />;
  }
  
  if (routeName === 'AdminRides') {
    return <RidesTab apiKey={apiKey} autoAssignmentEnabled={autoAssignmentEnabled} />;
  }
  
  if (routeName === 'AdminSettings') {
    return <SettingsTab apiKey={apiKey} onLogout={handleLogout} />;
  }

  // Default to Drivers tab
  return <DriversTab apiKey={apiKey} onRefresh={() => {}} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#FF9800',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#999',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  autoAssignButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  autoAssignButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  assignContainer: {
    marginTop: 12,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingsSection: {
    padding: 16,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AdminHome;
