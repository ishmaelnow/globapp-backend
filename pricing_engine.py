"""
Pricing Engine - Calculates ride fares based on distance, duration, and surge.
"""
import os
from typing import Dict


class PricingEngine:
    """Calculates ride fares with configurable pricing parameters."""
    
    def __init__(self):
        # Load pricing configuration from environment variables with defaults
        self.base_fare_usd = float(os.getenv("GLOBAPP_BASE_FARE_USD", "3.00"))
        self.per_mile_usd = float(os.getenv("GLOBAPP_PER_MILE_USD", "2.80"))
        self.per_minute_usd = float(os.getenv("GLOBAPP_PER_MINUTE_USD", "0.40"))
        self.minimum_fare_usd = float(os.getenv("GLOBAPP_MINIMUM_FARE_USD", "5.00"))
        self.booking_fee_usd = float(os.getenv("GLOBAPP_BOOKING_FEE_USD", "0.00"))
    
    def calculate_fare(
        self,
        distance_miles: float,
        duration_minutes: float,
        surge_multiplier: float = 1.0
    ) -> Dict:
        """
        Calculate fare breakdown for a ride.
        
        Args:
            distance_miles: Distance in miles
            duration_minutes: Duration in minutes
            surge_multiplier: Surge pricing multiplier (default: 1.0)
        
        Returns:
            Dictionary with fare breakdown:
            {
                "base_fare": float,
                "distance_fare": float,
                "time_fare": float,
                "booking_fee": float,
                "surge_multiplier": float,
                "subtotal": float,
                "taxes": float,
                "total_estimated": float
            }
        """
        # Calculate component fares
        base_fare = self.base_fare_usd
        distance_fare = round(distance_miles * self.per_mile_usd, 2)
        time_fare = round(duration_minutes * self.per_minute_usd, 2)
        booking_fee = self.booking_fee_usd
        
        # Calculate subtotal before surge
        subtotal = base_fare + distance_fare + time_fare + booking_fee
        
        # Apply surge multiplier
        subtotal_with_surge = round(subtotal * surge_multiplier, 2)
        
        # Apply minimum fare rule
        total_estimated = max(subtotal_with_surge, self.minimum_fare_usd)
        
        # Round to 2 decimal places
        total_estimated = round(total_estimated, 2)
        
        # Taxes (set to 0 for now, can be added later)
        taxes = 0.00
        
        return {
            "base_fare": round(base_fare, 2),
            "distance_fare": distance_fare,
            "time_fare": time_fare,
            "booking_fee": round(booking_fee, 2),
            "surge_multiplier": surge_multiplier,
            "subtotal": round(subtotal, 2),
            "taxes": taxes,
            "total_estimated": total_estimated
        }
    
    def usd_to_cents(self, usd: float) -> int:
        """Convert USD to cents (integer)."""
        return int(round(usd * 100))
    
    def cents_to_usd(self, cents: int) -> float:
        """Convert cents to USD (float)."""
        return round(cents / 100.0, 2)




