"""
Distance Calculator - Calculates distance and estimates duration between two points.
Uses Haversine formula for distance calculation.
"""
import math
from typing import Tuple


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
    
    def parse_address_to_coords(self, address: str) -> Tuple[float, float] | None:
        """
        Parse address string to extract coordinates.
        
        For MVP, this is a placeholder. In production, you would use:
        - Google Maps Geocoding API
        - OpenStreetMap Nominatim
        - Or other geocoding service
        
        Current implementation: returns None (caller should handle)
        
        Args:
            address: Address string
        
        Returns:
            Tuple of (lat, lng) or None if parsing fails
        """
        # Placeholder: return None
        # In production, integrate with geocoding API
        return None


