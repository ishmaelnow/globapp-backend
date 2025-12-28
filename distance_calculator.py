"""
Distance Calculator - Calculates distance and estimates duration between two points.
Uses Haversine formula for distance calculation.
Supports geocoding addresses to coordinates using OpenStreetMap Nominatim.
"""
import math
import requests
from typing import Tuple, Optional
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)


class DistanceCalculator:
    """Calculates distance and duration between geographic coordinates."""
    
    # Earth's radius in miles
    EARTH_RADIUS_MILES = 3959.0
    
    # Average speed for duration estimation (miles per hour)
    AVERAGE_SPEED_MPH = 30.0
    
    def calculate_distance(
        self,
        pickup_lat: float,
        pickup_lng: float,
        dropoff_lat: float,
        dropoff_lng: float
    ) -> float:
        """
        Calculate distance between two points using Haversine formula.
        
        Args:
            pickup_lat: Pickup latitude
            pickup_lng: Pickup longitude
            dropoff_lat: Dropoff latitude
            dropoff_lng: Dropoff longitude
        
        Returns:
            Distance in miles
        """
        # Convert to radians
        lat1_rad = math.radians(pickup_lat)
        lat2_rad = math.radians(dropoff_lat)
        delta_lat = math.radians(dropoff_lat - pickup_lat)
        delta_lng = math.radians(dropoff_lng - pickup_lng)
        
        # Haversine formula
        a = (
            math.sin(delta_lat / 2) ** 2 +
            math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))
        distance_miles = self.EARTH_RADIUS_MILES * c
        
        return round(distance_miles, 2)
    
    def estimate_duration(self, distance_miles: float) -> float:
        """
        Estimate duration based on distance.
        
        Args:
            distance_miles: Distance in miles
        
        Returns:
            Estimated duration in minutes
        """
        if distance_miles <= 0:
            return 0.0
        
        # Simple heuristic: assume average speed
        duration_hours = distance_miles / self.AVERAGE_SPEED_MPH
        duration_minutes = duration_hours * 60
        
        # Add a small buffer for traffic/stopping
        duration_minutes = duration_minutes * 1.2
        
        return round(duration_minutes, 1)
    
    def geocode_address(self, address: str) -> Optional[Tuple[float, float]]:
        """
        Geocode an address to coordinates using OpenStreetMap Nominatim API.
        
        Args:
            address: Address string (e.g., "123 Main St, San Francisco, CA")
        
        Returns:
            Tuple of (lat, lng) or None if geocoding fails
        """
        if not address or not address.strip():
            return None
        
        try:
            # Use Nominatim API (free, no API key required)
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                "q": address,
                "format": "json",
                "limit": 1,
                "addressdetails": 1
            }
            headers = {
                "User-Agent": "GlobApp/1.0"  # Required by Nominatim
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    lat = float(data[0]["lat"])
                    lng = float(data[0]["lon"])
                    return (lat, lng)
            
            return None
        except Exception as e:
            # If geocoding fails, return None (caller can handle fallback)
            # Log error for debugging
            import logging
            logging.error(f"Geocoding failed for '{address}': {e}")
            return None
    
    def calculate_distance_from_addresses(
        self,
        pickup_address: str,
        dropoff_address: str
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Calculate distance and duration from two addresses.
        
        Args:
            pickup_address: Pickup address string
            dropoff_address: Dropoff address string
        
        Returns:
            Tuple of (distance_miles, duration_minutes) or (None, None) if geocoding fails
        """
        import logging
        
        # Geocode both addresses (with rate limiting between calls)
        pickup_coords = self.geocode_address(pickup_address)
        
        # Wait before second geocoding request (Nominatim rate limit: 1 req/sec)
        time.sleep(1)
        
        dropoff_coords = self.geocode_address(dropoff_address)
        
        if not pickup_coords:
            logging.warning(f"Failed to geocode pickup address: {pickup_address}")
            return (None, None)
        
        if not dropoff_coords:
            logging.warning(f"Failed to geocode dropoff address: {dropoff_address}")
            return (None, None)
        
        pickup_lat, pickup_lng = pickup_coords
        dropoff_lat, dropoff_lng = dropoff_coords
        
        logging.info(f"Geocoded: {pickup_address} -> ({pickup_lat}, {pickup_lng})")
        logging.info(f"Geocoded: {dropoff_address} -> ({dropoff_lat}, {dropoff_lng})")
        
        # Calculate distance
        distance_miles = self.calculate_distance(
            pickup_lat, pickup_lng,
            dropoff_lat, dropoff_lng
        )
        
        # Estimate duration
        duration_minutes = self.estimate_duration(distance_miles)
        
        logging.info(f"Calculated distance: {distance_miles} miles, duration: {duration_minutes} minutes")
        
        return (distance_miles, duration_minutes)




