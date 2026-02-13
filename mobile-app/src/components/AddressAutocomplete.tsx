import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../config/keys';

interface AddressAutocompleteProps {
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  name: string;
  required?: boolean;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Start typing an address...',
  name,
  required = false,
}) => {
  const [query, setQuery] = useState(value || '');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Fetch predictions from Google Places API
  const fetchPredictions = async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Google Maps API key not configured');
      return;
    }

    setLoading(true);

    try {
      // Try Places API (New) first
      const newApiUrl = 'https://places.googleapis.com/v1/places:autocomplete';
      const newApiResponse = await fetch(newApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        },
        body: JSON.stringify({
          input: input,
          locationBias: {
            regionCode: 'US',
          },
        }),
      });

      if (newApiResponse.ok) {
        const data = await newApiResponse.json();
        if (data.suggestions) {
          const formattedPredictions: Prediction[] = data.suggestions.map((suggestion: any) => ({
            place_id: suggestion.placePrediction.placeId,
            description: suggestion.placePrediction.text.text,
            structured_formatting: {
              main_text: suggestion.placePrediction.text.text.split(',')[0],
              secondary_text: suggestion.placePrediction.text.text.split(',').slice(1).join(',').trim(),
            },
          }));
          setPredictions(formattedPredictions);
          setShowSuggestions(formattedPredictions.length > 0);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log('Places API (New) error, trying legacy API:', error);
    }

    // Fallback to legacy Places API
    try {
      const legacyApiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:us`;
      const legacyApiResponse = await fetch(legacyApiUrl);

      if (legacyApiResponse.ok) {
        const data = await legacyApiResponse.json();
        if (data.predictions) {
          setPredictions(data.predictions);
          setShowSuggestions(data.predictions.length > 0);
        }
      }
    } catch (error) {
      console.error('Error fetching predictions from legacy Places API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced input handler
  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(name, text);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      if (!isSelecting) {
        fetchPredictions(text);
      }
    }, 300);
  };

  // Handle prediction selection
  const handleSelectPrediction = async (prediction: Prediction) => {
    setIsSelecting(true);
    setQuery(prediction.description);
    onChange(name, prediction.description);
    setPredictions([]);
    setShowSuggestions(false);
    setLoading(false);

    // Small delay to ensure state updates
    setTimeout(() => {
      setIsSelecting(false);
    }, 100);
  };

  // Handle focus
  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (query.length >= 3 && predictions.length === 0) {
      fetchPredictions(query);
    }
  };

  // Handle blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for tap events
    blurTimeoutRef.current = setTimeout(() => {
      if (!isSelecting) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={query}
        onChangeText={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit={false}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      )}

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestions && predictions.length > 0}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.suggestionsContainer}>
            <ScrollView
              keyboardShouldPersistTaps="always"
              style={styles.suggestionsList}
            >
              {predictions.map((prediction) => (
                <TouchableOpacity
                  key={prediction.place_id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectPrediction(prediction)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionMainText}>
                    {prediction.structured_formatting?.main_text || prediction.description.split(',')[0]}
                  </Text>
                  {prediction.structured_formatting?.secondary_text && (
                    <Text style={styles.suggestionSecondaryText}>
                      {prediction.structured_formatting.secondary_text}
                    </Text>
                  )}
                  {!prediction.structured_formatting?.secondary_text && prediction.description.includes(',') && (
                    <Text style={styles.suggestionSecondaryText}>
                      {prediction.description.split(',').slice(1).join(',').trim()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    right: 12,
    top: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddressAutocomplete;
































