from sqlalchemy import (
    BigInteger, Integer, String, Numeric, ForeignKey, TIMESTAMP, Date,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    public_id: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    village: Mapped[str] = mapped_column(String(160), nullable=False)
    district: Mapped[str] = mapped_column(String(160), nullable=False)
    state: Mapped[str] = mapped_column(String(80), nullable=True)

    created_at: Mapped["TIMESTAMP"] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    # FIX: was 'Farms' (plural), must be 'Farm' (singular) to match class name
    farms: Mapped[list["Farm"]] = relationship(back_populates="farmer")
    crop_recommendations: Mapped[list["CropRecommendation"]] = relationship(back_populates="farmer")


class Farm(Base):
    __tablename__ = "farms"
    __table_args__ = (
        CheckConstraint("area_acres > 0", name="check_area_acres_positive"),
        CheckConstraint("irrigation IN ('none', 'limited', 'adequate')", name="check_irrigation_values"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    public_id: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    farmer_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("farmers.id"), nullable=False)

    area_acres: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=True)

    season: Mapped[str] = mapped_column(String(16), nullable=False)
    irrigation: Mapped[str] = mapped_column(String(16), nullable=False)

    soil_ph: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False)
    nitrogen: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    phosphorus: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    potassium: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    soil_source: Mapped[str] = mapped_column(String(64), nullable=False)
    soil_test_date: Mapped["Date"] = mapped_column(Date, nullable=True)

    previous_crop: Mapped[str] = mapped_column(String(64), nullable=False)
    investment_budget_paise: Mapped[int] = mapped_column(BigInteger, nullable=False)
    sowing_period: Mapped[str] = mapped_column(String(64), nullable=False)

    created_at: Mapped["TIMESTAMP"] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    farmer: Mapped["Farmer"] = relationship(back_populates="farms")
    crop_recommendations: Mapped[list["CropRecommendation"]] = relationship(back_populates="farm")


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"
    __table_args__ = (
        CheckConstraint("opportunity_score BETWEEN 0 AND 100", name="check_opportunity_score_range"),
        CheckConstraint("confidence BETWEEN 0 AND 100", name="check_confidence_range"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    public_id: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    farmer_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("farmers.id"), nullable=False)
    farm_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("farms.id"), nullable=False)

    crop: Mapped[str] = mapped_column(String(64), nullable=False)
    opportunity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)

    score_breakdown: Mapped[dict] = mapped_column(JSONB, nullable=False)
    reason_codes: Mapped[dict] = mapped_column(JSONB, nullable=False)
    explanations: Mapped[dict] = mapped_column(JSONB, nullable=False)
    source_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)

    created_at: Mapped["TIMESTAMP"] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    farmer: Mapped["Farmer"] = relationship(back_populates="crop_recommendations")
    farm: Mapped["Farm"] = relationship(back_populates="crop_recommendations")


class ExternalDataCache(Base):
    __tablename__ = "external_data_cache"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    cache_key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    fetched_at: Mapped["TIMESTAMP"] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
