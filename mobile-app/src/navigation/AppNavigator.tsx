import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppSelector from '../screens/AppSelector';
import RiderHome from '../screens/rider/RiderHome';
import DriverHome from '../screens/driver/DriverHome';
import AdminHome from '../screens/admin/AdminHome';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AppSelector">
        <Stack.Screen
          name="AppSelector"
          component={AppSelector}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Rider"
          component={RiderHome}
          options={{ title: 'Rider App' }}
        />
        <Stack.Screen
          name="Driver"
          component={DriverHome}
          options={{ title: 'Driver App' }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminHome}
          options={{ title: 'Admin App' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

