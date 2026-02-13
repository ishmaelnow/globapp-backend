import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AppSelector = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GlobApp</Text>
      <Text style={styles.subtitle}>Choose your app</Text>

      <TouchableOpacity
        style={[styles.button, styles.riderButton]}
        onPress={() => navigation.navigate('RiderStack')}
      >
        <Text style={styles.buttonText}>Rider</Text>
        <Text style={styles.buttonSubtext}>Book a ride</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.driverButton]}
        onPress={() => navigation.navigate('DriverStack')}
      >
        <Text style={styles.buttonText}>Driver</Text>
        <Text style={styles.buttonSubtext}>Manage rides</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.adminButton]}
        onPress={() => navigation.navigate('AdminStack')}
      >
        <Text style={styles.buttonText}>Admin</Text>
        <Text style={styles.buttonSubtext}>Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    maxWidth: 300,
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  riderButton: {
    backgroundColor: '#4CAF50',
  },
  driverButton: {
    backgroundColor: '#2196F3',
  },
  adminButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});

export default AppSelector;


































