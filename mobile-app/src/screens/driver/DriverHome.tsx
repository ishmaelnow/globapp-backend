import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DriverHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver App</Text>
      <Text style={styles.subtitle}>Manage your rides</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

