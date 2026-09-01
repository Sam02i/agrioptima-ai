from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
from backend.models.farm import SoilDataSource
from backend.utils.validators import (
    validate_latitude,
    validate_longitude,
    validate_ph,
    validate_area,
)

class SoilData(BaseModel):
    ph: Optional[float] = Field(None, json_schema_extra={"example": 6.8}, description="Soil pH level (0-14)")
    nitrogen: Optional[float] = Field(None, json_schema_extra={"example": 210.0}, description="Nitrogen content (kg/ha)")
    phosphorus: Optional[float] = Field(None, json_schema_extra={"example": 32.0}, description="Phosphorus content (kg/ha)")
    potassium: Optional[float] = Field(None, json_schema_extra={"example": 180.0}, description="Potassium content (kg/ha)")
    organic_carbon: Optional[float] = Field(None, json_schema_extra={"example": 0.65}, description="Organic Carbon percentage")
    source: Optional[SoilDataSource] = Field(SoilDataSource.UNKNOWN, json_schema_extra={"example": "SOIL_HEALTH_CARD"})

class FarmCreate(BaseModel):
    farm_name: str = Field(..., json_schema_extra={"example": "Main Farm"}, description="Descriptive name for the farm")
    latitude: float = Field(..., json_schema_extra={"example": 20.011}, description="Latitude coordinate (-90 to 90)")
    longitude: float = Field(..., json_schema_extra={"example": 73.79}, description="Longitude coordinate (-180 to 180)")
    area_acres: float = Field(..., json_schema_extra={"example": 3.5}, description="Total farm area in acres (> 0)")

    irrigation_type: Optional[str] = Field(None, json_schema_extra={"example": "drip"}, description="e.g. drip, canal, rainfed, sprinkler")
    water_availability: Optional[str] = Field(None, json_schema_extra={"example": "medium"}, description="e.g. high, medium, low")

    soil_data_source: Optional[SoilDataSource] = Field(SoilDataSource.UNKNOWN, json_schema_extra={"example": "SOIL_HEALTH_CARD"})
    soil_test_date: Optional[date] = Field(None, json_schema_extra={"example": "2026-06-10"})

    ph: Optional[float] = Field(None, json_schema_extra={"example": 6.8})
    nitrogen: Optional[float] = Field(None, json_schema_extra={"example": 210.0})
    phosphorus: Optional[float] = Field(None, json_schema_extra={"example": 32.0})
    potassium: Optional[float] = Field(None, json_schema_extra={"example": 180.0})
    organic_carbon: Optional[float] = Field(None, json_schema_extra={"example": 0.65})

    previous_crop: Optional[str] = Field(None, json_schema_extra={"example": "onion"})
    current_crop: Optional[str] = Field(None, json_schema_extra={"example": None})

    @field_validator("latitude")
    @classmethod
    def check_lat(cls, v: float) -> float:
        return validate_latitude(v)

    @field_validator("longitude")
    @classmethod
    def check_lon(cls, v: float) -> float:
        return validate_longitude(v)

    @field_validator("area_acres")
    @classmethod
    def check_area(cls, v: float) -> float:
        return validate_area(v)

    @field_validator("ph")
    @classmethod
    def check_ph(cls, v: Optional[float]) -> Optional[float]:
        return validate_ph(v)

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = Field(None, json_schema_extra={"example": "Main Farm"})
    latitude: Optional[float] = Field(None, json_schema_extra={"example": 20.011})
    longitude: Optional[float] = Field(None, json_schema_extra={"example": 73.79})
    area_acres: Optional[float] = Field(None, json_schema_extra={"example": 3.5})

    irrigation_type: Optional[str] = Field(None, json_schema_extra={"example": "drip"})
    water_availability: Optional[str] = Field(None, json_schema_extra={"example": "medium"})

    soil_data_source: Optional[SoilDataSource] = Field(None)
    soil_test_date: Optional[date] = Field(None)

    ph: Optional[float] = Field(None)
    nitrogen: Optional[float] = Field(None)
    phosphorus: Optional[float] = Field(None)
    potassium: Optional[float] = Field(None)
    organic_carbon: Optional[float] = Field(None)

    previous_crop: Optional[str] = Field(None)
    current_crop: Optional[str] = Field(None)

    @field_validator("latitude")
    @classmethod
    def check_lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            return validate_latitude(v)
        return v

    @field_validator("longitude")
    @classmethod
    def check_lon(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            return validate_longitude(v)
        return v

    @field_validator("area_acres")
    @classmethod
    def check_area(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            return validate_area(v)
        return v

    @field_validator("ph")
    @classmethod
    def check_ph(cls, v: Optional[float]) -> Optional[float]:
        return validate_ph(v)

class FarmResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: str
    farm_name: str
    latitude: float
    longitude: float
    area_acres: float
    irrigation_type: Optional[str]
    water_availability: Optional[str]
    soil: SoilData
    previous_crop: Optional[str]
    current_crop: Optional[str]
    created_at: datetime
    updated_at: datetime
