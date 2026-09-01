import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base

class ProfileStatus(str, enum.Enum):
    INCOMPLETE = "INCOMPLETE"
    PARTIAL = "PARTIAL"
    COMPLETE = "COMPLETE"

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, index=True, nullable=False)
    email = Column(String(100), nullable=True)
    state = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    village = Column(String(100), nullable=False)
    preferred_language = Column(String(10), default="hi", nullable=False)
    profile_status = Column(
        SQLEnum(ProfileStatus, values_callable=lambda x: [e.value for e in x]),
        default=ProfileStatus.INCOMPLETE,
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    needs = relationship("FarmerNeeds", back_populates="farmer", uselist=False, cascade="all, delete-orphan")
