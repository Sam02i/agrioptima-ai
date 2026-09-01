import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base

class SoilDataSource(str, enum.Enum):
    VERIFIED_LAB = "VERIFIED_LAB"
    SOIL_HEALTH_CARD = "SOIL_HEALTH_CARD"
    FARMER_ENTERED = "FARMER_ENTERED"
    REGIONAL_ESTIMATE = "REGIONAL_ESTIMATE"
    UNKNOWN = "UNKNOWN"

class Farm(Base):
    __tablename__ = "farms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    farm_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_acres = Column(Float, nullable=False)

    irrigation_type = Column(String(50), nullable=True)
    water_availability = Column(String(50), nullable=True)

    soil_data_source = Column(
        SQLEnum(SoilDataSource, values_callable=lambda x: [e.value for e in x]),
        default=SoilDataSource.UNKNOWN,
        nullable=False
    )
    soil_test_date = Column(Date, nullable=True)

    # Soil chemical/physical properties (Nullable for flexibility)
    ph = Column(Float, nullable=True)
    nitrogen = Column(Float, nullable=True)
    phosphorus = Column(Float, nullable=True)
    potassium = Column(Float, nullable=True)
    organic_carbon = Column(Float, nullable=True)

    # Crop History
    previous_crop = Column(String(100), nullable=True)
    current_crop = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer = relationship("Farmer", back_populates="farms")
