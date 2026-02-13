import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DriverLogin = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Driver Login Screen</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default DriverLogin;

