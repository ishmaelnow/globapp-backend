/**
 * Universal Address Normalizer
 * 
 * Normalizes addresses from Google Places Autocomplete to be more compatible
 * with Nominatim (OpenStreetMap) geocoding. This ensures accurate distance
 * and fare calculations regardless of location.
 * 
 * The normalization process:
 * 1. Removes highway exit details and directional indicators
 * 2. Simplifies airport addresses to standard format
 * 3. Removes redundant location qualifiers
 * 4. Preserves essential address components (street, city, state, country)
 */

/**
 * Normalizes an address for geocoding compatibility
 * @param {string} address - The address string from Google Places Autocomplete
 * @returns {string} - Normalized address suitable for Nominatim geocoding
 */
export const normalizeAddressForGeocoding = (address) => {
  if (!address || typeof address !== 'string') {
    return address || '';
  }

  let normalized = address.trim();

  // 1. Handle airport addresses (universal pattern)
  // Match common airport patterns: "Airport Name Exit To...", "Airport Name, City, State"
  const airportPatterns = [
    // DFW patterns
    /DFW Airport.*?Exit.*?/i,
    /Dallas\/Fort Worth International Airport.*?Exit.*?/i,
    // Generic airport exit patterns
    /([A-Z]{3})\s+Airport.*?Exit.*?/i, // JFK Airport Exit..., LAX Airport Exit...
    /([A-Z]{3})\s+International Airport.*?Exit.*?/i,
  ];

  for (const pattern of airportPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      // Extract airport code or name
      const airportCode = match[1] || 'Airport';
      // Find city and state from the remaining address
      const cityStateMatch = normalized.match(/,?\s*([^,]+),\s*([A-Z]{2}),?\s*(USA)?/i);
      if (cityStateMatch) {
        const city = cityStateMatch[1].trim();
        const state = cityStateMatch[2].trim();
        normalized = `${airportCode} Airport, ${city}, ${state}, USA`;
        break;
      }
    }
  }

  // 2. Remove highway exit details and directional indicators
  // Patterns like "Exit To Sh 121 Nb", "Exit 12A", "Exit To I-35E N"
  normalized = normalized
    .replace(/\bExit\s+To\s+[^,]+/gi, '') // "Exit To Sh 121 Nb" -> ""
    .replace(/\bExit\s+\d+[A-Z]?\s+To\s+[^,]+/gi, '') // "Exit 12A To Highway" -> ""
    .replace(/\b(Nb|Sb|Eb|Wb|N|S|E|W|North|South|East|West)\s*,/gi, '') // Remove directional indicators
    .replace(/,\s*(Nb|Sb|Eb|Wb|N|S|E|W)\s*,/gi, ',') // Remove standalone directionals
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // 3. Remove redundant qualifiers that Nominatim doesn't need
  const redundantPatterns = [
    /\b(Exit|To|Via|Near|At)\s+/gi, // Remove "Exit", "To", "Via", "Near", "At" at start
    /,\s*(Exit|To|Via|Near|At)\s+/gi, // Remove these mid-address
  ];

  for (const pattern of redundantPatterns) {
    normalized = normalized.replace(pattern, ' ');
  }

  // 4. Handle highway/road name variations
  // Convert "Sh 121" -> "State Highway 121" or keep as "SH 121"
  normalized = normalized.replace(/\bSh\s+(\d+)/gi, 'State Highway $1');

  // 5. Clean up multiple commas and spaces
  normalized = normalized
    .replace(/,\s*,+/g, ',') // Multiple commas -> single comma
    .replace(/\s+,/g, ',') // Space before comma -> comma
    .replace(/,\s+/g, ', ') // Normalize comma spacing
    .replace(/\s{2,}/g, ' ') // Multiple spaces -> single space
    .trim();

  // 6. Ensure proper address format: "Street, City, State, Country"
  // If address doesn't end with country, add USA if it has a US state code
  const hasUSState = /\b([A-Z]{2}),?\s*(USA)?$/i.test(normalized);
  if (hasUSState && !normalized.match(/USA$/i)) {
    normalized = normalized.replace(/\b([A-Z]{2})$/i, '$1, USA');
  }

  // 7. Handle specific known problematic patterns
  // Remove "Unnamed Road" or similar vague descriptors if we have better info
  if (normalized.includes('Unnamed Road') || normalized.includes('Unnamed')) {
    // Try to extract city/state and use that instead
    const cityStateMatch = normalized.match(/,?\s*([^,]+),\s*([A-Z]{2})/i);
    if (cityStateMatch) {
      const city = cityStateMatch[1].trim();
      const state = cityStateMatch[2].trim();
      normalized = `${city}, ${state}, USA`;
    }
  }

  // 8. Final cleanup: remove leading/trailing commas and normalize
  normalized = normalized
    .replace(/^,\s*/, '') // Remove leading comma
    .replace(/,\s*$/, '') // Remove trailing comma
    .trim();

  // If normalization resulted in empty or too short address, return original
  if (normalized.length < 5) {
    return address.trim();
  }

  return normalized;
};

/**
 * Gets a standardized address from Google Places Details API
 * This can be used to fetch the formatted address after selecting from autocomplete
 * @param {string} placeId - Google Places place_id
 * @param {string} apiKey - Google Places API key
 * @returns {Promise<string>} - Standardized address from Google Places
 */
export const getStandardizedAddress = async (placeId, apiKey) => {
  if (!placeId || !apiKey) {
    return null;
  }

  try {
    // Try Places API (New) first
    const newApiUrl = `https://places.googleapis.com/v1/places/${placeId}`;
    const newApiResponse = await fetch(newApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'formattedAddress',
      },
    });

    if (newApiResponse.ok) {
      const data = await newApiResponse.json();
      return data.formattedAddress || null;
    }

    // Fallback to legacy Places API
    const legacyApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=formatted_address&key=${encodeURIComponent(apiKey)}`;
    const legacyApiResponse = await fetch(legacyApiUrl);

    if (legacyApiResponse.ok) {
      const data = await legacyApiResponse.json();
      return data.result?.formatted_address || null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching standardized address:', error);
    return null;
  }
};

/**
 * Extracts city and state from an address string
 * Useful for fallback normalization
 * @param {string} address - Address string
 * @returns {Object|null} - Object with city and state, or null if not found
 */
export const extractCityState = (address) => {
  if (!address) return null;

  const match = address.match(/,?\s*([^,]+),\s*([A-Z]{2})(?:,\s*USA)?$/i);
  if (match) {
    return {
      city: match[1].trim(),
      state: match[2].trim().toUpperCase(),
    };
  }

  return null;
};
































