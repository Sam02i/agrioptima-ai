from fastapi import APIRouter
from app.schemas.farmer import FarmerRecommendationRequest
from app.services.recommendation_service import build_recommendation

router = APIRouter(prefix="/api/v1", tags=["recommendations"])


@router.post("/crop-recommendations")
async def create_crop_recommendations(request: FarmerRecommendationRequest):
    """
    Canonical compatibility route for crop recommendations.
    POST /crop/recommend is the primary endpoint (defined in main.py).
    This alias exists for backward compatibility with Teams B and C.
    """
    return await build_recommendation(request.model_dump())
