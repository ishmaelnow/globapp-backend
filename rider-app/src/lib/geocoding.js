// Address search using OpenStreetMap Nominatim API (free, no API key needed)

export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=5`,
      {
        headers: {
          'User-Agent': 'GlobApp-Rider/1.0',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item) => ({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}
