from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, field_validator, ConfigDict
from backend.models.farmer import ProfileStatus
from backend.utils.validators import validate_indian_phone

class FarmerBase(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Ramesh Kumar"}, description="Full name of the farmer")
    phone: str = Field(..., json_schema_extra={"example": "9876543210"}, description="10-digit Indian mobile number")
    email: Optional[str] = Field(None, json_schema_extra={"example": "ramesh@example.com"}, description="Optional email address")
    state: str = Field(..., json_schema_extra={"example": "Maharashtra"}, description="State of residence/farm")
    district: str = Field(..., json_schema_extra={"example": "Nashik"}, description="District")
    village: str = Field(..., json_schema_extra={"example": "Demo Village"}, description="Village")
    preferred_language: str = Field("hi", json_schema_extra={"example": "hi"}, description="ISO language code (e.g., hi, mr, en)")

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_indian_phone(v)

class FarmerCreate(FarmerBase):
    pass

class FarmerUpdate(BaseModel):
    name: Optional[str] = Field(None, json_schema_extra={"example": "Ramesh Kumar"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "9876543210"})
    email: Optional[str] = Field(None, json_schema_extra={"example": "ramesh@example.com"})
    state: Optional[str] = Field(None, json_schema_extra={"example": "Maharashtra"})
    district: Optional[str] = Field(None, json_schema_extra={"example": "Nashik"})
    village: Optional[str] = Field(None, json_schema_extra={"example": "Demo Village"})
    preferred_language: Optional[str] = Field(None, json_schema_extra={"example": "hi"})

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return validate_indian_phone(v)
        return v

class FarmerResponse(FarmerBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    profile_status: ProfileStatus
    created_at: datetime
    updated_at: datetime

class FarmerCreateResponse(BaseModel):
    farmer_id: str
    profile_status: ProfileStatus
    profile_completion: int
    message: str = "Farmer profile created successfully"

class FarmerSummary(BaseModel):
    id: str
    name: str
    state: str
    district: str
    preferred_language: str

class FarmerProfileCompleteResponse(BaseModel):
    farmer: FarmerSummary
    farms: List[Dict[str, Any]]
    needs: Optional[Dict[str, Any]]
    profile_completion: int
    profile_status: ProfileStatus
