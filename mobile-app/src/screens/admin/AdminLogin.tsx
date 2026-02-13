import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { setAdminApiKey, getAdminApiKey } from '../../utils/auth';
import { ADMIN_API_KEY } from '../../config/api';
import { listDrivers } from '../../services/adminService';

const AdminLogin: React.FC = () => {
  const navigation = useNavigation<any>();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if API key is already stored or embedded
    const checkExistingKey = async () => {
      try {
        const storedKey = await getAdminApiKey();
        const keyToUse = storedKey || ADMIN_API_KEY || '';
        
        if (keyToUse) {
          setApiKey(keyToUse);
          // Try to verify the key works
          try {
            await listDrivers(keyToUse);
            // Key works, navigate to home
            navigation.replace('AdminTabs', { screen: 'AdminDrivers' });
          } catch (err) {
            // Key doesn't work, stay on login
            console.log('Stored key invalid, staying on login');
          }
        }
      } catch (error) {
        console.error('Error checking existing key:', error);
      } finally {
        setChecking(false);
      }
    };

    checkExistingKey();
  }, [navigation]);

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your admin API key');
      return;
    }

    setLoading(true);
    try {
      // Test the API key by trying to list drivers
      await listDrivers(apiKey);
      
      // Save the API key
      await setAdminApiKey(apiKey);
      
      // Navigate to admin home
      navigation.replace('AdminTabs', { screen: 'AdminDrivers' });
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.detail || 'Invalid API key. Please check and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.checkingText}>Checking credentials...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Enter your admin API key to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Admin API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter admin API key"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {ADMIN_API_KEY && (
            <Text style={styles.hint}>
              Using embedded API key. You can override it above.
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  checkingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default AdminLogin;


