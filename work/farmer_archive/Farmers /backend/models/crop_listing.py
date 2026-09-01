import uuid
import enum
from datetime import datetime, date
from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base

class ListingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    AVAILABLE = "AVAILABLE"
    SOLD_OUT = "SOLD_OUT"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"

class DeclaredGrade(str, enum.Enum):
    GRADE_A = "GRADE_A"
    GRADE_B = "GRADE_B"
    GRADE_C = "GRADE_C"
    UNASSESSED = "UNASSESSED"

class PackagingType(str, enum.Enum):
    LOOSE = "LOOSE"
    CRATE = "CRATE"
    SACK = "SACK"
    BOX = "BOX"
    BAG = "BAG"
    BULK = "BULK"
    OTHER = "OTHER"

class CropListing(Base):
    __tablename__ = "crop_listings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)

    crop_name = Column(String(100), nullable=False, index=True)
    crop_variety = Column(String(100), nullable=True)

    quantity_kg = Column(Float, nullable=False)
    available_quantity_kg = Column(Float, nullable=False)

    price_per_kg = Column(Float, nullable=False, index=True)
    minimum_order_quantity_kg = Column(Float, nullable=False)

    harvest_date = Column(Date, nullable=True)
    expected_harvest_date = Column(Date, nullable=True)
    availability_date = Column(Date, nullable=True)

    declared_grade = Column(
        SQLEnum(DeclaredGrade, values_callable=lambda x: [e.value for e in x]),
        default=DeclaredGrade.UNASSESSED,
        nullable=False
    )

    packaging_type = Column(
        SQLEnum(PackagingType, values_callable=lambda x: [e.value for e in x]),
        default=PackagingType.LOOSE,
        nullable=True
    )

    description = Column(Text, nullable=True)

    listing_status = Column(
        SQLEnum(ListingStatus, values_callable=lambda x: [e.value for e in x]),
        default=ListingStatus.AVAILABLE,
        nullable=False,
        index=True
    )

    # Location auto-inherited from Farm/Farmer
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    district = Column(String(50), nullable=True, index=True)
    state = Column(String(50), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer = relationship("Farmer", backref="crop_listings")
    farm = relationship("Farm", backref="crop_listings")
    images = relationship("CropListingImage", back_populates="listing", cascade="all, delete-orphan")

class CropListingImage(Base):
    __tablename__ = "crop_listing_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    listing_id = Column(String(36), ForeignKey("crop_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    listing = relationship("CropListing", back_populates="images")
