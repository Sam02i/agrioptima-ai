from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.farmer import (
    FarmerCreate,
    FarmerUpdate,
    FarmerResponse,
    FarmerCreateResponse,
    FarmerProfileCompleteResponse,
)
from backend.schemas.farm import FarmCreate, FarmUpdate, FarmResponse
from backend.schemas.farmer_needs import FarmerNeedsCreate, FarmerNeedsUpdate, FarmerNeedsResponse
from backend.schemas.recommendation import RecommendationContextResponse
from backend.services.farmer_service import FarmerService

router = APIRouter(prefix="", tags=["Farmers & Farms Management"])

@router.post(
    "/farmers",
    response_model=FarmerCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Farmer Profile",
    description="Registers a new farmer in the system. Ensures phone number uniqueness."
)
def create_farmer(farmer_in: FarmerCreate, db: Session = Depends(get_db)):
    return FarmerService.create_farmer(db, farmer_in)

@router.get(
    "/farmers/{farmer_id}",
    response_model=FarmerProfileCompleteResponse,
    summary="Get Complete Farmer Profile",
    description="Retrieves complete farmer profile including registered farms, farmer needs, calculated completion score, and profile status."
)
def get_complete_farmer_profile(
    farmer_id: str = Path(..., description="UUID of the farmer"),
    db: Session = Depends(get_db)
):
    return FarmerService.get_complete_profile(db, farmer_id)

@router.patch(
    "/farmers/{farmer_id}",
    response_model=FarmerResponse,
    summary="Update Farmer Profile",
    description="Partially updates existing farmer identity information."
)
def update_farmer(
    farmer_in: FarmerUpdate,
    farmer_id: str = Path(..., description="UUID of the farmer"),
    db: Session = Depends(get_db)
):
    return FarmerService.update_farmer(db, farmer_id, farmer_in)

@router.post(
    "/farmers/{farmer_id}/farms",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Farm to Farmer",
    description="Registers a new farm owned/managed by the farmer."
)
def add_farm(
    farm_in: FarmCreate,
    farmer_id: str = Path(..., description="UUID of the farmer"),
    db: Session = Depends(get_db)
):
    return FarmerService.create_farm(db, farmer_id, farm_in)

@router.patch(
    "/farms/{farm_id}",
    response_model=FarmResponse,
    summary="Update Farm Details",
    description="Partially updates farm location, soil data, or crop history."
)
def update_farm(
    farm_in: FarmUpdate,
    farm_id: str = Path(..., description="UUID of the farm"),
    db: Session = Depends(get_db)
):
    return FarmerService.update_farm(db, farm_id, farm_in)

@router.put(
    "/farmers/{farmer_id}/needs",
    response_model=FarmerNeedsResponse,
    summary="Upsert Farmer Needs & Goals",
    description="Creates or updates investment budget, risk preferences, primary goal, and service requirements for a farmer."
)
def upsert_farmer_needs(
    needs_in: FarmerNeedsCreate,
    farmer_id: str = Path(..., description="UUID of the farmer"),
    db: Session = Depends(get_db)
):
    return FarmerService.upsert_farmer_needs(db, farmer_id, needs_in)

@router.get(
    "/farms/{farm_id}/recommendation-context",
    response_model=RecommendationContextResponse,
    summary="Fetch ML Crop Recommendation Context",
    description="Generates a clean, structured JSON payload consumable directly by the ML Crop Recommendation Engine. Includes location, farm specs, soil params, crop history, preferences, and data quality metrics."
)
def get_recommendation_context(
    farm_id: str = Path(..., description="UUID of the farm"),
    db: Session = Depends(get_db)
):
    return FarmerService.get_recommendation_context(db, farm_id)
