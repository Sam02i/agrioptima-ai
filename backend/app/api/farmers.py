from datetime import date
# will be used for soil_test_date
from typing import Literal

from pydantic import BaseModel, Field, model_validator
# Base_model the class every schema inherits form 
# model_validator lets you write custom validation logic under multiple fields
# Field lets you add validation to a field

class FarmerRecommendationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    village: str = Field(min_length=2, max_length=160)
    district: str = Field(min_length=2, max_length=160)
    state: str | None = None

    # taking default values
    #* Longitude's valid range is -180 to 180
    #* Latitude's valid range -90 to 90
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

    #* Capped at 10,000 acres as a sanity ceiling.
    #* gt = 0 "Farm cant have negative area"
    area_acres: float = Field(gt=0, le=10000)

    #&No default value given, so this field is required. Must be exactly one of these three strings.


    season: Literal["Kharif", "Rabi", "Zaid"]
    irrigation: Literal["none", "limited", "adequate"]

    soil_ph: float = Field(ge=3.0, le=10.0)
    nitrogen: float = Field(ge=0)
    phosphorus: float = Field(ge=0)
    potassium: float = Field(ge=0)

    soil_source: Literal["soil_health_card", "lab_report", "manual_entry"]
    soil_test_date: date | None = None
    previous_crop: str = Field(min_length=2, max_length=64)
    investment_budget_rupees: int = Field(gt=0) # most not be zero
    sowing_period: str = Field(min_length=2, max_length=64)

#free-text field describing the intended sowing window
    @model_validator(mode="after")
    def require_complete_coordinates(self):
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Provide both latitude and longitude, or leave both empty.")
        return self

