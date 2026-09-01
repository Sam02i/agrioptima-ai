from typing import List, Optional
from fastapi import APIRouter, Depends, status, Path, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.crop_listing import ListingStatus, DeclaredGrade
from backend.schemas.crop_listing import (
    CropListingCreate,
    CropListingUpdate,
    CropListingAvailabilityUpdate,
    CropListingImageCreate,
    CropListingImageResponse,
    CropListingCreateResponse,
    CropListingDetailResponse,
)
from backend.services.crop_listing_service import CropListingService

router = APIRouter(prefix="", tags=["Crop Listings"])

@router.post(
    "/farmers/{farmer_id}/farms/{farm_id}/crop-listings",
    response_model=CropListingCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Crop Listing for a Farm",
    description="Creates a new crop listing associated with a specific registered farm owned by the farmer. Automatically inherits location coordinates, district, and state."
)
def create_crop_listing(
    farmer_id: str = Path(..., description="UUID of the farmer"),
    farm_id: str = Path(..., description="UUID of the farm owned by the farmer"),
    listing_in: CropListingCreate = ...,
    db: Session = Depends(get_db)
):
    return CropListingService.create_crop_listing(db, farmer_id, farm_id, listing_in)

@router.get(
    "/crop-listings/{listing_id}",
    response_model=CropListingDetailResponse,
    summary="Get Single Crop Listing",
    description="Retrieves comprehensive details of a single crop listing including farmer summary, farm info, crop specs, quantity, pricing, grade, and images."
)
def get_crop_listing(
    listing_id: str = Path(..., description="UUID of the crop listing"),
    db: Session = Depends(get_db)
):
    return CropListingService.get_crop_listing_by_id(db, listing_id)

@router.get(
    "/farmers/{farmer_id}/crop-listings",
    response_model=List[CropListingDetailResponse],
    summary="Get All Crop Listings for a Farmer",
    description="Retrieves all crop listings created by a farmer across their farms. Supports optional filtering by farm_id, crop_name, and listing_status."
)
def get_farmer_crop_listings(
    farmer_id: str = Path(..., description="UUID of the farmer"),
    farm_id: Optional[str] = Query(None, description="Filter by farm ID"),
    crop_name: Optional[str] = Query(None, description="Filter by crop name (e.g. Tomato)"),
    status: Optional[ListingStatus] = Query(None, description="Filter by listing status (e.g. AVAILABLE, DRAFT, SOLD_OUT)"),
    db: Session = Depends(get_db)
):
    return CropListingService.get_farmer_crop_listings(db, farmer_id, farm_id, crop_name, status)

@router.get(
    "/farms/{farm_id}/crop-listings",
    response_model=List[CropListingDetailResponse],
    summary="Get All Crop Listings for a Specific Farm",
    description="Retrieves all crops listed from a specific farm."
)
def get_farm_crop_listings(
    farm_id: str = Path(..., description="UUID of the farm"),
    db: Session = Depends(get_db)
):
    return CropListingService.get_farm_crop_listings(db, farm_id)

@router.patch(
    "/crop-listings/{listing_id}",
    response_model=CropListingDetailResponse,
    summary="Update Crop Listing Details",
    description="Partially updates crop listing details such as variety, quantity, price, MOQ, harvest date, grade, packaging, or description."
)
def update_crop_listing(
    listing_id: str = Path(..., description="UUID of the crop listing"),
    listing_in: CropListingUpdate = ...,
    db: Session = Depends(get_db)
):
    return CropListingService.update_crop_listing(db, listing_id, listing_in)

@router.patch(
    "/crop-listings/{listing_id}/availability",
    response_model=CropListingDetailResponse,
    summary="Update Available Quantity / Stock",
    description="Controlled endpoint to update available stock in KG. Automatically sets status to SOLD_OUT if available quantity reaches 0, or restores to AVAILABLE if stock is added back."
)
def update_availability(
    listing_id: str = Path(..., description="UUID of the crop listing"),
    avail_in: CropListingAvailabilityUpdate = ...,
    db: Session = Depends(get_db)
):
    return CropListingService.update_availability(db, listing_id, avail_in)

@router.post(
    "/crop-listings/{listing_id}/cancel",
    response_model=CropListingDetailResponse,
    summary="Soft-Cancel Crop Listing",
    description="Sets the crop listing status to CANCELLED without hard deleting the database record."
)
def cancel_crop_listing(
    listing_id: str = Path(..., description="UUID of the crop listing"),
    db: Session = Depends(get_db)
):
    return CropListingService.cancel_crop_listing(db, listing_id)

@router.post(
    "/crop-listings/{listing_id}/images",
    response_model=CropListingImageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Image to Crop Listing",
    description="Associates an image URL with a crop listing for visual display."
)
def add_crop_listing_image(
    listing_id: str = Path(..., description="UUID of the crop listing"),
    image_in: CropListingImageCreate = ...,
    db: Session = Depends(get_db)
):
    return CropListingService.add_crop_listing_image(db, listing_id, image_in)

@router.get(
    "/crop-listings",
    response_model=List[CropListingDetailResponse],
    summary="Search & Filter Crop Listings",
    description="Search and filter active crop listings by crop name, state, district, maximum price, minimum available quantity, declared grade, and status."
)
def search_crop_listings(
    crop_name: Optional[str] = Query(None, description="Filter by crop name (case-insensitive)"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    maximum_price: Optional[float] = Query(None, description="Filter listings with price_per_kg <= maximum_price"),
    minimum_quantity: Optional[float] = Query(None, description="Filter listings with available_quantity_kg >= minimum_quantity"),
    declared_grade: Optional[DeclaredGrade] = Query(None, description="Filter by declared grade (GRADE_A, GRADE_B, GRADE_C, UNASSESSED)"),
    listing_status: Optional[ListingStatus] = Query(None, description="Filter by listing status (e.g. AVAILABLE)"),
    db: Session = Depends(get_db)
):
    return CropListingService.search_crop_listings(
        db,
        crop_name=crop_name,
        state=state,
        district=district,
        maximum_price=maximum_price,
        minimum_quantity=minimum_quantity,
        declared_grade=declared_grade,
        listing_status=listing_status
    )
