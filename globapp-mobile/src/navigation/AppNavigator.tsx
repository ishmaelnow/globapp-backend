import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import AppSelector from '../screens/AppSelector';

// Rider Screens
import RiderBooking from '../screens/rider/RiderBooking';
import RiderHistory from '../screens/rider/RiderHistory';
import RiderNotifications from '../screens/rider/RiderNotifications';
import RiderSettings from '../screens/rider/RiderSettings';

// Driver Screens
import DriverLogin from '../screens/driver/DriverLogin';
import DriverHome from '../screens/driver/DriverHome';
import DriverHistory from '../screens/driver/DriverHistory';

// Admin Screens
import AdminLogin from '../screens/admin/AdminLogin';
import AdminHome from '../screens/admin/AdminHome';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Rider Tab Navigator
const RiderTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: Boolean(false),
      }}
    >
      <Tab.Screen
        name="RiderBooking"
        component={RiderBooking}
        options={{
          tabBarLabel: 'Book',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📱</Text>,
        }}
      />
      <Tab.Screen
        name="RiderHistory"
        component={RiderHistory}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="RiderNotifications"
        component={RiderNotifications}
        options={{
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="RiderSettings"
        component={RiderSettings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
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
        headerShown: Boolean(false),
      }}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="DriverHistory"
        component={DriverHistory}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Driver Stack (with Login)
const DriverStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: Boolean(false) }}>
      <Stack.Screen name="DriverLogin" component={DriverLogin} />
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
    </Stack.Navigator>
  );
};

// Admin Stack (with Login)
const AdminStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: Boolean(false) }}>
      <Stack.Screen name="AdminLogin" component={AdminLogin} />
      <Stack.Screen name="AdminHome" component={AdminHome} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AppSelector">
        <Stack.Screen 
          name="AppSelector" 
          component={AppSelector}
          options={{ headerShown: Boolean(false) }}
        />
        <Stack.Screen 
          name="RiderStack" 
          component={RiderTabs}
          options={{ headerShown: Boolean(false) }}
        />
        <Stack.Screen 
          name="DriverStack" 
          component={DriverStack}
          options={{ headerShown: Boolean(false) }}
        />
        <Stack.Screen 
          name="AdminStack" 
          component={AdminStackNavigator}
          options={{ headerShown: Boolean(false) }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

