from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os, time, uuid

from app.schemas.farmer import FarmerRecommendationRequest
from app.services.recommendation_service import build_recommendation
from app.services.persistence import persist_recommendation
from app.db.session import SessionLocal
from app.api.farmers import router as farmers_router
from app.api.pincode import router as pincode_router
from app.api.credit import router as credit_router
from app.api.freshness import router as freshness_router
from app.api.ranking import router as ranking_router
from app.api.logistics import router as logistics_router
from app.api.marketplace import router as marketplace_router
from app.api.soil import router as soil_router
from app.api.trade import router as trade_router

app = FastAPI(
    title="AgriOptima AI Platform",
    version="2.0.0",
    description="Integrated agricultural intelligence: crop recommendation, credit scoring, freshness assessment, and supplier ranking."
)

origins=[item.strip() for item in os.getenv("ALLOWED_ORIGINS","http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174").split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.middleware("http")
async def request_context(request:Request,call_next):
    request_id=request.headers.get("X-Request-ID") or uuid.uuid4().hex
    started=time.perf_counter(); response=await call_next(request)
    response.headers["X-Request-ID"]=request_id
    response.headers["X-Response-Time-Ms"]=str(round((time.perf_counter()-started)*1000,1))
    return response

# ── Routers ──
app.include_router(farmers_router)       # /farmers/*, /farms/*
app.include_router(pincode_router)       # /api/v1/pincode/*
app.include_router(credit_router)        # /credit/*
app.include_router(freshness_router)     # /freshness/*
app.include_router(ranking_router)       # /ranking/*
app.include_router(logistics_router)     # /logistics/*
app.include_router(marketplace_router)   # /marketplace/*
app.include_router(soil_router)          # /soil/*
app.include_router(trade_router)         # /trade/*


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "services": [
        "crop_recommendation", "pincode_lookup", "credit_scoring",
        "freshness_assessment", "supplier_ranking", "logistics_optimization",
        "buyer_cost_quote", "farmer_marketplace", "soil_intelligence", "persistent_trade_workflow"
    ]}


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
