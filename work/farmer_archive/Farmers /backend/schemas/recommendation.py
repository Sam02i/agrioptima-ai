from typing import Optional
from pydantic import BaseModel, Field
from backend.models.farm import SoilDataSource
from backend.models.farmer_needs import PrimaryGoal, RiskPreference

class LocationContext(BaseModel):
    state: str = Field(..., json_schema_extra={"example": "Maharashtra"})
    district: str = Field(..., json_schema_extra={"example": "Nashik"})
    latitude: float = Field(..., json_schema_extra={"example": 20.011})
    longitude: float = Field(..., json_schema_extra={"example": 73.79})

class FarmContext(BaseModel):
    area_acres: float = Field(..., json_schema_extra={"example": 3.5})
    irrigation_type: Optional[str] = Field(None, json_schema_extra={"example": "drip"})
    water_availability: Optional[str] = Field(None, json_schema_extra={"example": "medium"})

class SoilContext(BaseModel):
    ph: Optional[float] = Field(None, json_schema_extra={"example": 6.8})
    nitrogen: Optional[float] = Field(None, json_schema_extra={"example": 210.0})
    phosphorus: Optional[float] = Field(None, json_schema_extra={"example": 32.0})
    potassium: Optional[float] = Field(None, json_schema_extra={"example": 180.0})
    organic_carbon: Optional[float] = Field(None, json_schema_extra={"example": 0.65})
    source: SoilDataSource = Field(SoilDataSource.UNKNOWN, json_schema_extra={"example": "SOIL_HEALTH_CARD"})

class HistoryContext(BaseModel):
    previous_crop: Optional[str] = Field(None, json_schema_extra={"example": "onion"})
    current_crop: Optional[str] = Field(None, json_schema_extra={"example": None})

class FarmerPreferencesContext(BaseModel):
    investment_budget: Optional[float] = Field(None, json_schema_extra={"example": 80000.0})
    risk_preference: Optional[RiskPreference] = Field(None, json_schema_extra={"example": "moderate"})
    primary_goal: Optional[PrimaryGoal] = Field(None, json_schema_extra={"example": "maximize_profit"})

class DataQualityContext(BaseModel):
    soil_confidence: str = Field(..., json_schema_extra={"example": "HIGH"}, description="Confidence level: HIGH, MEDIUM, LOW, VERY_LOW")
    profile_completion: int = Field(..., json_schema_extra={"example": 85}, description="Completeness percentage 0-100")

class RecommendationContextResponse(BaseModel):
    farm_id: str
    location: LocationContext
    farm: FarmContext
    soil: SoilContext
    history: HistoryContext
    farmer_preferences: FarmerPreferencesContext
    data_quality: DataQualityContext
