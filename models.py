from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base

class Ride(Base):
    __tablename__ = "rides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rider_name = Column(String, nullable=False)
    rider_phone = Column(String, nullable=False)
    pickup = Column(String, nullable=False)
    dropoff = Column(String, nullable=False)
    service_type = Column(String, nullable=False)

    estimated_distance_miles = Column(Float, nullable=False)
    estimated_duration_min = Column(Float, nullable=False)
    estimated_price_usd = Column(Float, nullable=False)

    status = Column(String, default="requested")
    created_at_utc = Column(DateTime, default=datetime.utcnow)
