from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.farmer import FarmerRecommendationRequest
from app.services.recommendation_service import build_recommendation
from app.services.persistence import persist_recommendation
from app.db.session import SessionLocal
from app.api.farmers import router as farmers_router
from app.api.pincode import router as pincode_router

app = FastAPI(title="AgriOptima AI — Team 1 Farmer Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Include API routers
app.include_router(farmers_router)
app.include_router(pincode_router)


@app.get("/health")
def health():
    return {"status": "ok"}


# Canonical route (PRD section 33.4)
@app.post("/crop/recommend")
# Compatibility alias — not shown in Swagger
@app.post("/api/v1/crop-recommendations", include_in_schema=False)
async def crop_recommend(request: FarmerRecommendationRequest):
    profile = request.model_dump()
    try:
        result = await build_recommendation(profile)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Persist to database (best-effort — don't fail the request if DB is down)
    farmer_id = None
    try:
        db = SessionLocal()
        try:
            farmer_id = persist_recommendation(db, profile, result)
        finally:
            db.close()
    except Exception:
        pass  # DB persistence is non-critical

    result["farmer_id"] = farmer_id
    return result
