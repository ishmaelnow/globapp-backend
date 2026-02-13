import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationBadge from '../components/NotificationBadge';
import { useNotifications } from '../hooks/useNotifications';

// Screens
import AppSelector from '../screens/AppSelector';

// Rider Screens
import RiderBooking from '../screens/rider/RiderBooking';
import RiderHistory from '../screens/rider/RiderHistory';
import RiderNotifications from '../screens/rider/RiderNotifications';
import RiderSettings from '../screens/rider/RiderSettings';
import RideDetails from '../screens/rider/RideDetails';

// Driver Screens (will be created - using placeholder for now)
import DriverLogin from '../screens/driver/DriverLogin';
import DriverHome from '../screens/driver/DriverHome';
import DriverHistory from '../screens/driver/DriverHistory';

// Admin Screens (will be created - using placeholder for now)
import AdminLogin from '../screens/admin/AdminLogin';
import AdminHome from '../screens/admin/AdminHome';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Rider Stack Navigator (includes tabs + details screen)
const RiderStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderTabs" component={RiderTabs} />
      <Stack.Screen name="RideDetails" component={RideDetails} />
    </Stack.Navigator>
  );
};

// Rider Tab Navigator
const RiderTabs = () => {
  const { unreadCount } = useNotifications(null, 30000); // Poll every 30 seconds for badge

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="RiderBooking"
        component={RiderBooking}
        options={{
          tabBarLabel: 'Book',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🚗</Text>,
        }}
      />
      <Tab.Screen
        name="RiderHistory"
        component={RiderHistory}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="RiderNotifications"
        component={RiderNotifications}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <Text style={{ color, fontSize: 20 }}>🔔</Text>
              <NotificationBadge count={unreadCount} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="RiderSettings"
        component={RiderSettings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Driver Tab Navigator
const DriverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="DriverHistory"
        component={DriverHistory}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Driver Stack (with Login)
const DriverStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverLogin" component={DriverLogin} />
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
    </Stack.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AdminDrivers"
        component={AdminHome}
        options={{
          tabBarLabel: 'Drivers',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="AdminRides"
        component={AdminHome}
        options={{
          tabBarLabel: 'Rides',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🚗</Text>,
        }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminHome}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Stack (with Login)
const AdminStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminLogin" component={AdminLogin} />
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AppSelector"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="AppSelector" component={AppSelector} />
        <Stack.Screen name="RiderStack" component={RiderStackNavigator} />
        <Stack.Screen name="DriverStack" component={DriverStack} />
        <Stack.Screen name="AdminStack" component={AdminStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

