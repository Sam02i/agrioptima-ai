from datetime import date, datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from backend.models.crop_listing import ListingStatus, DeclaredGrade, PackagingType

class CropListingCreate(BaseModel):
    crop_name: str = Field(..., json_schema_extra={"example": "Tomato"}, description="Name of the crop (e.g. Tomato, Onion)")
    crop_variety: Optional[str] = Field(None, json_schema_extra={"example": "Pusa Ruby"}, description="Specific crop variety")
    quantity_kg: float = Field(..., json_schema_extra={"example": 5000.0}, description="Total listed quantity in KG (> 0)")
    price_per_kg: float = Field(..., json_schema_extra={"example": 24.0}, description="Price per KG in INR (> 0)")
    minimum_order_quantity_kg: float = Field(..., json_schema_extra={"example": 500.0}, description="Minimum order quantity in KG (> 0, <= quantity_kg)")
    
    harvest_date: Optional[date] = Field(None, json_schema_extra={"example": "2026-08-27"})
    expected_harvest_date: Optional[date] = Field(None, json_schema_extra={"example": "2026-09-20"})
    availability_date: Optional[date] = Field(None, json_schema_extra={"example": "2026-08-27"})

    declared_grade: Optional[DeclaredGrade] = Field(DeclaredGrade.UNASSESSED, json_schema_extra={"example": "GRADE_A"})
    packaging_type: Optional[PackagingType] = Field(PackagingType.LOOSE, json_schema_extra={"example": "CRATE"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "Fresh tomatoes harvested from the registered farm"})
    listing_status: Optional[ListingStatus] = Field(ListingStatus.AVAILABLE, json_schema_extra={"example": "AVAILABLE"})

    @field_validator("crop_name")
    @classmethod
    def check_crop_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Crop name cannot be empty.")
        return v.strip()

    @field_validator("quantity_kg")
    @classmethod
    def check_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError(f"Quantity must be greater than 0. Received: {v}")
        return v

    @field_validator("price_per_kg")
    @classmethod
    def check_price(cls, v: float) -> float:
        if v <= 0:
            raise ValueError(f"Price per KG must be greater than 0. Received: {v}")
        return v

    @field_validator("minimum_order_quantity_kg")
    @classmethod
    def check_moq(cls, v: float) -> float:
        if v <= 0:
            raise ValueError(f"Minimum order quantity must be greater than 0. Received: {v}")
        return v

    @model_validator(mode="after")
    def check_moq_vs_quantity(self):
        if self.minimum_order_quantity_kg > self.quantity_kg:
            raise ValueError(
                f"Minimum order quantity ({self.minimum_order_quantity_kg} kg) "
                f"cannot exceed total listed quantity ({self.quantity_kg} kg)."
            )
        return self

class CropListingUpdate(BaseModel):
    crop_name: Optional[str] = Field(None, json_schema_extra={"example": "Tomato"})
    crop_variety: Optional[str] = Field(None, json_schema_extra={"example": "Pusa Ruby"})
    quantity_kg: Optional[float] = Field(None, json_schema_extra={"example": 5000.0})
    available_quantity_kg: Optional[float] = Field(None, json_schema_extra={"example": 4500.0})
    price_per_kg: Optional[float] = Field(None, json_schema_extra={"example": 24.0})
    minimum_order_quantity_kg: Optional[float] = Field(None, json_schema_extra={"example": 500.0})
    harvest_date: Optional[date] = Field(None)
    expected_harvest_date: Optional[date] = Field(None)
    availability_date: Optional[date] = Field(None)
    declared_grade: Optional[DeclaredGrade] = Field(None)
    packaging_type: Optional[PackagingType] = Field(None)
    description: Optional[str] = Field(None)
    listing_status: Optional[ListingStatus] = Field(None)

    @field_validator("crop_name")
    @classmethod
    def check_crop_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError("Crop name cannot be empty.")
        return v.strip() if v else v

    @field_validator("quantity_kg")
    @classmethod
    def check_quantity(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError(f"Quantity must be greater than 0. Received: {v}")
        return v

    @field_validator("available_quantity_kg")
    @classmethod
    def check_avail_quantity(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError(f"Available quantity cannot be negative. Received: {v}")
        return v

    @field_validator("price_per_kg")
    @classmethod
    def check_price(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError(f"Price per KG must be greater than 0. Received: {v}")
        return v

    @field_validator("minimum_order_quantity_kg")
    @classmethod
    def check_moq(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError(f"Minimum order quantity must be greater than 0. Received: {v}")
        return v

class CropListingAvailabilityUpdate(BaseModel):
    available_quantity_kg: float = Field(..., json_schema_extra={"example": 4300.0}, description="Updated available quantity in KG (>= 0)")

    @field_validator("available_quantity_kg")
    @classmethod
    def check_avail_qty(cls, v: float) -> float:
        if v < 0:
            raise ValueError(f"Available quantity cannot be negative. Received: {v}")
        return v

class CropListingImageCreate(BaseModel):
    image_url: str = Field(..., json_schema_extra={"example": "https://example.com/images/tomato1.jpg"})

class CropListingImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    listing_id: str
    image_url: str
    uploaded_at: datetime

class CropListingCreateResponse(BaseModel):
    listing_id: str
    farmer_id: str
    farm_id: str
    crop_name: str
    crop_variety: Optional[str] = None
    quantity_kg: float
    available_quantity_kg: float
    price_per_kg: float
    declared_grade: DeclaredGrade
    listing_status: ListingStatus
    message: str = "Crop listing created successfully"

class FarmerSummaryShort(BaseModel):
    id: str
    name: str

class FarmSummaryShort(BaseModel):
    id: str
    district: Optional[str] = None
    state: Optional[str] = None

class CropSummary(BaseModel):
    name: str
    variety: Optional[str] = None
    harvest_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None

class QuantitySummary(BaseModel):
    listed_quantity_kg: float
    available_quantity_kg: float

class PricingSummary(BaseModel):
    price_per_kg: float
    minimum_order_quantity_kg: float

class LocationSummary(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    state: Optional[str] = None

class CropListingDetailResponse(BaseModel):
    listing_id: str
    farmer: FarmerSummaryShort
    farm: FarmSummaryShort
    crop: CropSummary
    quantity: QuantitySummary
    pricing: PricingSummary
    declared_grade: DeclaredGrade
    packaging_type: Optional[PackagingType] = None
    description: Optional[str] = None
    listing_status: ListingStatus
    location: LocationSummary
    images: List[CropListingImageResponse] = []
    created_at: datetime
    updated_at: datetime
