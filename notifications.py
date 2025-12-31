"""
Notification Service for GlobApp
Handles sending notifications for ride events (booking, assignment, status updates)
"""

from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import json
import psycopg
from psycopg.errors import UndefinedTable
import os

# Database connection helper (import from app.py or define here)
def db_conn():
    """Get database connection"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")
    return psycopg.connect(database_url)


# Notification types
NOTIFICATION_TYPES = {
    "ride_booked": {
        "title": "Ride Booked",
        "message_rider": "Your ride from {pickup} to {dropoff} has been booked. We're finding you a driver.",
        "message_admin": "New ride request: {rider_name} from {pickup} to {dropoff}",
    },
    "ride_assigned": {
        "title": "Ride Assigned",
        "message_rider": "Your driver {driver_name} is on the way! They'll arrive shortly.",
        "message_driver": "You've been assigned a ride: {rider_name} from {pickup} to {dropoff}",
        "message_admin": "Ride assigned: {driver_name} assigned to {rider_name}'s ride",
    },
    "ride_enroute": {
        "title": "Driver En Route",
        "message_rider": "Your driver {driver_name} is on the way to {pickup}",
        "message_driver": "You're en route to pick up {rider_name}",
    },
    "ride_arrived": {
        "title": "Driver Arrived",
        "message_rider": "Your driver {driver_name} has arrived at {pickup}",
        "message_driver": "You've arrived at the pickup location",
    },
    "ride_in_progress": {
        "title": "Ride Started",
        "message_rider": "Your ride with {driver_name} has started. Enjoy your trip!",
        "message_driver": "Ride in progress with {rider_name}",
    },
    "ride_completed": {
        "title": "Ride Completed",
        "message_rider": "Your ride has been completed. Thank you for using GlobApp!",
        "message_driver": "Ride completed with {rider_name}",
    },
    "ride_cancelled": {
        "title": "Ride Cancelled",
        "message_rider": "Your ride has been cancelled.",
        "message_driver": "Ride cancelled: {rider_name}'s ride",
    },
}


def create_notification(
    ride_id: UUID,
    recipient_type: str,  # 'rider', 'driver', 'admin'
    notification_type: str,
    recipient_id: Optional[UUID] = None,
    driver_id: Optional[UUID] = None,
    channel: str = "in_app",
    metadata: Optional[Dict[str, Any]] = None,
) -> Optional[UUID]:
    """
    Create a notification record in the database
    
    Args:
        ride_id: UUID of the ride
        recipient_type: 'rider', 'driver', or 'admin'
        notification_type: Type of notification (e.g., 'ride_booked', 'ride_assigned')
        recipient_id: UUID of the recipient (rider_id, driver_id, or None for admin)
        driver_id: UUID of the driver (if applicable)
        channel: 'in_app', 'sms', 'email', or 'push'
        metadata: Additional data for the notification
    
    Returns:
        UUID of the created notification, or None if creation failed
    """
    if notification_type not in NOTIFICATION_TYPES:
        print(f"Warning: Unknown notification type: {notification_type}")
        return None
    
    notification_config = NOTIFICATION_TYPES[notification_type]
    
    # Build message based on recipient type
    message_template_key = f"message_{recipient_type}"
    if message_template_key not in notification_config:
        # Fallback to generic message
        message = notification_config.get("message", f"Notification: {notification_type}")
    else:
        message = notification_config[message_template_key]
    
    # Format message with metadata
    if metadata:
        try:
            message = message.format(**metadata)
        except KeyError as e:
            print(f"Warning: Missing metadata key {e} for notification {notification_type}")
            # Use unformatted message if formatting fails
            pass
    
    title = notification_config["title"]
    notification_id = uuid4()
    created_at_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    
    try:
        with db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO notifications (
                        id, ride_id, driver_id, recipient_type, recipient_id,
                        notification_type, title, message, channel, status,
                        metadata_json, created_at_utc
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        str(notification_id),
                        str(ride_id),
                        str(driver_id) if driver_id else None,
                        recipient_type,
                        str(recipient_id) if recipient_id else None,
                        notification_type,
                        title,
                        message,
                        channel,
                        "pending",
                        json.dumps(metadata or {}),
                        created_at_utc,
                    ),
                )
                conn.commit()
        return notification_id
    except UndefinedTable:
        print("Info: notifications table not found. Run migration 005_add_notifications_table.sql")
        return None
    except Exception as e:
        print(f"Warning: Failed to create notification: {e}")
        return None


def notify_ride_booked(ride_id: UUID, rider_name: str, pickup: str, dropoff: str, rider_phone: Optional[str] = None):
    """Send notifications when a ride is booked"""
    metadata = {
        "rider_name": rider_name,
        "pickup": pickup,
        "dropoff": dropoff,
    }
    
    # Notify rider (use ride_id as recipient_id for riders - they can query by ride_id)
    create_notification(
        ride_id=ride_id,
        recipient_type="rider",
        notification_type="ride_booked",
        recipient_id=ride_id,  # Use ride_id as recipient_id for riders
        channel="in_app",
        metadata=metadata,
    )
    
    # Notify admin (broadcast)
    create_notification(
        ride_id=ride_id,
        recipient_type="admin",
        notification_type="ride_booked",
        recipient_id=None,  # Admin notifications are broadcast
        channel="in_app",
        metadata=metadata,
    )


def notify_ride_assigned(ride_id: UUID, driver_id: UUID, driver_name: str, rider_name: str, pickup: str, dropoff: str):
    """Send notifications when a ride is assigned to a driver"""
    metadata = {
        "driver_name": driver_name,
        "rider_name": rider_name,
        "pickup": pickup,
        "dropoff": dropoff,
    }
    
    # Notify rider (use ride_id as recipient_id for riders)
    create_notification(
        ride_id=ride_id,
        recipient_type="rider",
        notification_type="ride_assigned",
        recipient_id=ride_id,  # Use ride_id as recipient_id for riders
        driver_id=driver_id,
        channel="in_app",
        metadata=metadata,
    )
    
    # Notify driver
    create_notification(
        ride_id=ride_id,
        recipient_type="driver",
        notification_type="ride_assigned",
        recipient_id=driver_id,
        driver_id=driver_id,
        channel="in_app",
        metadata=metadata,
    )
    
    # Notify admin
    create_notification(
        ride_id=ride_id,
        recipient_type="admin",
        notification_type="ride_assigned",
        recipient_id=None,
        driver_id=driver_id,
        channel="in_app",
        metadata=metadata,
    )


def notify_ride_status_update(
    ride_id: UUID,
    driver_id: UUID,
    driver_name: str,
    rider_name: str,
    pickup: str,
    dropoff: str,
    status: str,
):
    """Send notifications when ride status is updated"""
    status_to_notification_type = {
        "enroute": "ride_enroute",
        "arrived": "ride_arrived",
        "in_progress": "ride_in_progress",
        "completed": "ride_completed",
        "cancelled": "ride_cancelled",
    }
    
    notification_type = status_to_notification_type.get(status)
    if not notification_type:
        return  # Unknown status, skip notification
    
    metadata = {
        "driver_name": driver_name,
        "rider_name": rider_name,
        "pickup": pickup,
        "dropoff": dropoff,
    }
    
    # Notify rider (use ride_id as recipient_id for riders)
    create_notification(
        ride_id=ride_id,
        recipient_type="rider",
        notification_type=notification_type,
        recipient_id=ride_id,  # Use ride_id as recipient_id for riders
        driver_id=driver_id,
        channel="in_app",
        metadata=metadata,
    )
    
    # Notify driver
    create_notification(
        ride_id=ride_id,
        recipient_type="driver",
        notification_type=notification_type,
        recipient_id=driver_id,
        driver_id=driver_id,
        channel="in_app",
        metadata=metadata,
    )
    
    # Notify admin for important status changes
    if status in ("completed", "cancelled"):
        create_notification(
            ride_id=ride_id,
            recipient_type="admin",
            notification_type=notification_type,
            recipient_id=None,
            driver_id=driver_id,
            channel="in_app",
            metadata=metadata,
        )

