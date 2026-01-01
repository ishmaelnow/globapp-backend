import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RiderHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rider App</Text>
      <Text style={styles.subtitle}>Book your ride</Text>
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

