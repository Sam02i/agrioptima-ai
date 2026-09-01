import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base

class PrimaryGoal(str, enum.Enum):
    MAXIMIZE_PROFIT = "maximize_profit"
    REDUCE_RISK = "reduce_risk"
    REDUCE_WATER_USAGE = "reduce_water_usage"
    STABLE_INCOME = "stable_income"

class RiskPreference(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

class FarmerNeeds(Base):
    __tablename__ = "farmer_needs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    investment_budget = Column(Float, default=0.0, nullable=False)
    primary_goal = Column(
        SQLEnum(PrimaryGoal, values_callable=lambda x: [e.value for e in x]),
        default=PrimaryGoal.MAXIMIZE_PROFIT,
        nullable=False
    )

    needs_crop_recommendation = Column(Boolean, default=True, nullable=False)
    needs_market_access = Column(Boolean, default=False, nullable=False)
    needs_logistics = Column(Boolean, default=False, nullable=False)
    needs_soil_advisory = Column(Boolean, default=False, nullable=False)

    preferred_market_distance_km = Column(Float, nullable=True)
    risk_preference = Column(
        SQLEnum(RiskPreference, values_callable=lambda x: [e.value for e in x]),
        default=RiskPreference.MODERATE,
        nullable=False
    )

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer = relationship("Farmer", back_populates="needs")
