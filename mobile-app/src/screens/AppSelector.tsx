import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AppSelector() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GlobApp</Text>
      <Text style={styles.subtitle}>Choose your app</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.riderButton]}
          onPress={() => navigation.navigate('Rider')}
        >
          <Text style={styles.buttonText}>🚗 Rider App</Text>
          <Text style={styles.buttonSubtext}>Book rides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.driverButton]}
          onPress={() => navigation.navigate('Driver')}
        >
          <Text style={styles.buttonText}>🚕 Driver App</Text>
          <Text style={styles.buttonSubtext}>Accept rides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={styles.buttonText}>⚙️ Admin App</Text>
          <Text style={styles.buttonSubtext}>Manage platform</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  button: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  riderButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  driverButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  adminButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

