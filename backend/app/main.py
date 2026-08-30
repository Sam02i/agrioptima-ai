from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.farmer import FarmerRecommendationRequest
from app.services.recommendation_service import build_recommendation

app = FastAPI(title="AgriOptima AI Farmer Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/crop/recommend")
async def crop_recommend(request: FarmerRecommendationRequest):
    try:
        return await build_recommendation(request.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))