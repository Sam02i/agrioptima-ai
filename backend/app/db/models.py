from sqlalchemy import (
    BigInteger, Integer, String, Numeric, ForeignKey, TIMESTAMP, Date,
    CheckConstraint, Text, Boolean, Float, JSON
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.session import Base
from datetime import date, datetime

JSON_VALUE=JSON().with_variant(JSONB,"postgresql")


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

    score_breakdown: Mapped[dict] = mapped_column(JSON_VALUE, nullable=False)
    reason_codes: Mapped[dict] = mapped_column(JSON_VALUE, nullable=False)
    explanations: Mapped[dict] = mapped_column(JSON_VALUE, nullable=False)
    source_snapshot: Mapped[dict] = mapped_column(JSON_VALUE, nullable=False)

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
    payload: Mapped[dict] = mapped_column(JSON_VALUE, nullable=False)

    fetched_at: Mapped["TIMESTAMP"] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), nullable=False)


# Production marketplace and trade tables use their own namespace so the
# original crop-recommendation schema remains backward compatible.
class MarketFarmer(Base):
    __tablename__ = "market_farmers"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    state: Mapped[str] = mapped_column(String(80), nullable=False)
    district: Mapped[str] = mapped_column(String(120), nullable=False)
    village: Mapped[str] = mapped_column(String(160), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(24), default="en")
    profile_status: Mapped[str] = mapped_column(String(32), default="COMPLETE")
    created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class MarketFarm(Base):
    __tablename__ = "market_farms"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    farmer_id: Mapped[str] = mapped_column(String(40), ForeignKey("market_farmers.id"), index=True)
    farm_name: Mapped[str] = mapped_column(String(160), default="My farm")
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    area_acres: Mapped[float] = mapped_column(Float, nullable=False)
    irrigation_type: Mapped[str] = mapped_column(String(40), default="limited")
    water_availability: Mapped[str] = mapped_column(String(40), default="medium")
    ph: Mapped[float | None] = mapped_column(Float)
    nitrogen: Mapped[float | None] = mapped_column(Float)
    phosphorus: Mapped[float | None] = mapped_column(Float)
    potassium: Mapped[float | None] = mapped_column(Float)
    previous_crop: Mapped[str | None] = mapped_column(String(80))
    current_crop: Mapped[str | None] = mapped_column(String(80))


class FarmerNeed(Base):
    __tablename__ = "market_farmer_needs"
    farmer_id: Mapped[str] = mapped_column(String(40), ForeignKey("market_farmers.id"), primary_key=True)
    investment_budget: Mapped[float | None] = mapped_column(Float)
    primary_goal: Mapped[str | None] = mapped_column(String(120))
    needs_crop_recommendation: Mapped[bool] = mapped_column(Boolean, default=True)
    needs_market_access: Mapped[bool] = mapped_column(Boolean, default=True)
    needs_logistics: Mapped[bool] = mapped_column(Boolean, default=True)
    needs_soil_advisory: Mapped[bool] = mapped_column(Boolean, default=True)
    preferred_market_distance_km: Mapped[float | None] = mapped_column(Float)
    risk_preference: Mapped[str | None] = mapped_column(String(40))


class CropListing(Base):
    __tablename__ = "market_crop_listings"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    farmer_id: Mapped[str] = mapped_column(String(40), ForeignKey("market_farmers.id"), index=True)
    farm_id: Mapped[str] = mapped_column(String(40), ForeignKey("market_farms.id"))
    crop_name: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    crop_variety: Mapped[str] = mapped_column(String(120), default="Local")
    quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    available_quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_kg: Mapped[float] = mapped_column(Float, nullable=False)
    minimum_order_quantity_kg: Mapped[float] = mapped_column(Float, default=100)
    harvest_date: Mapped[str | None] = mapped_column(String(40))
    expected_harvest_date: Mapped[str | None] = mapped_column(String(40))
    declared_grade: Mapped[str] = mapped_column(String(40), default="GRADE_A")
    packaging_type: Mapped[str] = mapped_column(String(40), default="CRATE")
    listing_status: Mapped[str] = mapped_column(String(40), default="AVAILABLE", index=True)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    district: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str] = mapped_column(String(80), nullable=False)
    image_data: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class TradeOrder(Base):
    __tablename__ = "trade_orders"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    listing_id: Mapped[str] = mapped_column(String(40), ForeignKey("market_crop_listings.id"))
    farmer_id: Mapped[str] = mapped_column(String(40), index=True)
    buyer_id: Mapped[str] = mapped_column(String(40), index=True)
    crop: Mapped[str] = mapped_column(String(80))
    quantity_kg: Mapped[float] = mapped_column(Float)
    price_per_kg: Mapped[float] = mapped_column(Float)
    total_amount: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(40), index=True)
    created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class TradeShipment(Base):
    __tablename__ = "trade_shipments"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    order_id: Mapped[str] = mapped_column(String(40), ForeignKey("trade_orders.id"), unique=True)
    status: Mapped[str] = mapped_column(String(40)); origin: Mapped[str | None] = mapped_column(String(240)); destination: Mapped[str | None] = mapped_column(String(240))
    origin_lat: Mapped[float | None] = mapped_column(Float); origin_lng: Mapped[float | None] = mapped_column(Float); current_lat: Mapped[float | None] = mapped_column(Float); current_lng: Mapped[float | None] = mapped_column(Float); destination_lat: Mapped[float | None] = mapped_column(Float); destination_lng: Mapped[float | None] = mapped_column(Float)
    driver: Mapped[str | None] = mapped_column(String(160)); vehicle: Mapped[str | None] = mapped_column(String(80)); eta: Mapped[str | None] = mapped_column(String(120)); progress: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class TradePassport(Base):
    __tablename__ = "trade_passports"
    id: Mapped[str] = mapped_column(String(40), primary_key=True); order_id: Mapped[str] = mapped_column(String(40), ForeignKey("trade_orders.id"), unique=True)
    dispatch_verified: Mapped[bool] = mapped_column(Boolean, default=False); receiving_verified: Mapped[bool] = mapped_column(Boolean, default=False); freshness_score: Mapped[float | None] = mapped_column(Float); quality_grade: Mapped[str | None] = mapped_column(String(40)); provenance: Mapped[dict] = mapped_column(JSON_VALUE, default=dict); updated_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class TradePayment(Base):
    __tablename__ = "trade_payments"
    id: Mapped[str] = mapped_column(String(40), primary_key=True); order_id: Mapped[str] = mapped_column(String(40), ForeignKey("trade_orders.id"), unique=True); amount_due: Mapped[float] = mapped_column(Float); amount_paid: Mapped[float] = mapped_column(Float, default=0); status: Mapped[str] = mapped_column(String(40)); provider: Mapped[str | None] = mapped_column(String(40)); provider_reference: Mapped[str | None] = mapped_column(String(160)); due_date: Mapped[date | None] = mapped_column(Date); updated_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class TradeInspection(Base):
    __tablename__ = "trade_inspections"
    id: Mapped[str] = mapped_column(String(40), primary_key=True); order_id: Mapped[str] = mapped_column(String(40), ForeignKey("trade_orders.id"), index=True); stage: Mapped[str] = mapped_column(String(20)); freshness_score: Mapped[float | None] = mapped_column(Float); quality_grade: Mapped[str | None] = mapped_column(String(40)); evidence_reference: Mapped[str | None] = mapped_column(String(500)); verified_by: Mapped[str] = mapped_column(String(80)); created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class TradeAuditEvent(Base):
    __tablename__ = "trade_audit_events"
    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer,"sqlite"), primary_key=True, autoincrement=True); order_id: Mapped[str | None] = mapped_column(String(40), index=True); event_type: Mapped[str] = mapped_column(String(80)); actor_id: Mapped[str | None] = mapped_column(String(80)); payload: Mapped[dict] = mapped_column(JSON_VALUE, default=dict); created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class AuthUser(Base):
    __tablename__ = "auth_users"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(500))
    role: Mapped[str] = mapped_column(String(20), index=True)
    profile_id: Mapped[str | None] = mapped_column(String(40), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class RefreshSession(Base):
    __tablename__ = "auth_refresh_sessions"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(40), ForeignKey("auth_users.id"), index=True)
    token_hash: Mapped[str] = mapped_column(String(128), unique=True)
    expires_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class SoilCardRecord(Base):
    __tablename__ = "soil_card_records"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    farmer_id: Mapped[str] = mapped_column(String(40), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    object_reference: Mapped[str] = mapped_column(String(1000))
    status: Mapped[str] = mapped_column(String(40), index=True)
    draft_values: Mapped[dict] = mapped_column(JSON_VALUE)
    confirmed_values: Mapped[dict | None] = mapped_column(JSON_VALUE)
    extraction_method: Mapped[str] = mapped_column(String(80))
    created_at: Mapped["TIMESTAMP"] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    confirmed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
