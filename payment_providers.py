"""
Payment Providers - Abstract interface and implementations for payment processing.
Supports Stripe and Cash payment methods.
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional
import os


class PaymentProvider(ABC):
    """Abstract base class for payment providers."""
    
    @abstractmethod
    def create_intent(self, amount_cents: int, currency: str, metadata: dict) -> dict:
        """
        Create payment intent.
        
        Args:
            amount_cents: Amount in cents
            currency: Currency code (e.g., 'USD')
            metadata: Additional metadata
        
        Returns:
            Dictionary with payment intent details
        """
        pass
    
    @abstractmethod
    def confirm_payment(self, intent_id: str, payload: dict) -> dict:
        """
        Confirm/capture payment.
        
        Args:
            intent_id: Payment intent identifier
            payload: Additional payload data
        
        Returns:
            Dictionary with payment status
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier."""
        pass


class StripeProvider(PaymentProvider):
    """Stripe payment provider implementation."""
    
    def __init__(self):
        self.secret_key = os.getenv("STRIPE_SECRET_KEY")
        if not self.secret_key:
            raise ValueError("STRIPE_SECRET_KEY environment variable is not set")
        
        # Import stripe only if key is available
        try:
            import stripe
            self.stripe = stripe
            stripe.api_key = self.secret_key
        except ImportError:
            raise ImportError("stripe package is not installed. Install with: pip install stripe")
    
    def create_intent(self, amount_cents: int, currency: str, metadata: dict) -> dict:
        """Create Stripe PaymentIntent."""
        try:
            intent = self.stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                metadata=metadata,
                automatic_payment_methods={
                    'enabled': True,
                }
            )
            
            return {
                "intent_id": intent.id,
                "client_secret": intent.client_secret,
                "status": intent.status,
                "amount_cents": amount_cents,
                "currency": currency
            }
        except Exception as e:
            raise Exception(f"Stripe payment intent creation failed: {str(e)}")
    
    def confirm_payment(self, intent_id: str, payload: dict) -> dict:
        """Confirm Stripe PaymentIntent."""
        try:
            intent = self.stripe.PaymentIntent.retrieve(intent_id)
            
            # If already succeeded, return success
            if intent.status == "succeeded":
                return {
                    "status": "captured",
                    "intent_id": intent_id
                }
            
            # Otherwise, confirm the payment
            intent = self.stripe.PaymentIntent.confirm(intent_id)
            
            return {
                "status": intent.status,
                "intent_id": intent_id
            }
        except Exception as e:
            raise Exception(f"Stripe payment confirmation failed: {str(e)}")
    
    def get_provider_name(self) -> str:
        return "stripe"


class CashProvider(PaymentProvider):
    """Cash payment provider - offline payment method."""
    
    def create_intent(self, amount_cents: int, currency: str, metadata: dict) -> dict:
        """
        Create cash payment intent (no external API call).
        Returns pending_cash status immediately.
        """
        return {
            "intent_id": None,  # Cash doesn't have an intent ID
            "status": "pending_cash",
            "amount_cents": amount_cents,
            "currency": currency
        }
    
    def confirm_payment(self, intent_id: str, payload: dict) -> dict:
        """
        Confirm cash payment (typically done manually by driver/admin).
        For cash, we just return pending_cash status.
        """
        return {
            "status": "pending_cash",
            "intent_id": None
        }
    
    def get_provider_name(self) -> str:
        return "cash"


def get_payment_provider(provider_name: str) -> PaymentProvider:
    """
    Factory function to get payment provider instance.
    
    Args:
        provider_name: 'stripe' or 'cash'
    
    Returns:
        PaymentProvider instance
    """
    if provider_name == "stripe":
        # Check if Stripe is configured
        if not os.getenv("STRIPE_SECRET_KEY"):
            raise ValueError("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.")
        return StripeProvider()
    elif provider_name == "cash":
        return CashProvider()
    else:
        raise ValueError(f"Unknown payment provider: {provider_name}")


