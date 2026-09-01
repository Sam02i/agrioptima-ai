from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from backend.models.farmer_needs import PrimaryGoal, RiskPreference
from backend.utils.validators import validate_budget

class FarmerNeedsBase(BaseModel):
    investment_budget: float = Field(..., json_schema_extra={"example": 80000}, description="Available investment budget in INR (>= 0)")
    primary_goal: PrimaryGoal = Field(PrimaryGoal.MAXIMIZE_PROFIT, json_schema_extra={"example": "maximize_profit"})
    needs_crop_recommendation: bool = Field(True, json_schema_extra={"example": True})
    needs_market_access: bool = Field(True, json_schema_extra={"example": True})
    needs_logistics: bool = Field(True, json_schema_extra={"example": True})
    needs_soil_advisory: bool = Field(True, json_schema_extra={"example": True})
    preferred_market_distance_km: Optional[float] = Field(150.0, json_schema_extra={"example": 150})
    risk_preference: RiskPreference = Field(RiskPreference.MODERATE, json_schema_extra={"example": "moderate"})

    @field_validator("investment_budget")
    @classmethod
    def check_budget(cls, v: float) -> float:
        return validate_budget(v)

class FarmerNeedsCreate(FarmerNeedsBase):
    pass

class FarmerNeedsUpdate(BaseModel):
    investment_budget: Optional[float] = Field(None, json_schema_extra={"example": 80000})
    primary_goal: Optional[PrimaryGoal] = Field(None, json_schema_extra={"example": "maximize_profit"})
    needs_crop_recommendation: Optional[bool] = Field(None)
    needs_market_access: Optional[bool] = Field(None)
    needs_logistics: Optional[bool] = Field(None)
    needs_soil_advisory: Optional[bool] = Field(None)
    preferred_market_distance_km: Optional[float] = Field(None)
    risk_preference: Optional[RiskPreference] = Field(None)

    @field_validator("investment_budget")
    @classmethod
    def check_budget(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            return validate_budget(v)
        return v

class FarmerNeedsResponse(FarmerNeedsBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: str
    created_at: datetime
    updated_at: datetime
