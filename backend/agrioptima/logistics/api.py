"""
AgriOptima AI — API Layer

Exposes agrioptima.main.run_agrioptima_logistics() as an HTTP endpoint so
the buyer dashboard (or any frontend) can call the full pipeline —
geocoding -> routing -> vehicle selection -> 3-model comparison ->
landed cost -> farmer transparency — in a single POST request.

Does NOT reimplement any logic; it only validates the incoming JSON shape
and passes it straight through to the existing pipeline.

RUN
---
    pip install fastapi uvicorn
    export ORS_API_KEY="your_key_here"   # optional — falls back to OSRM, then haversine

    Run from the directory ABOVE agrioptima/ (same convention as main.py):
        uvicorn agrioptima.api:app --reload --host 0.0.0.0 --port 8000

    Then open http://localhost:8000/docs for interactive testing (Swagger UI).

EXAMPLE REQUEST BODY (POST /run-logistics)
-------------------------------------------
{
  "crop": "tomato",
  "farmer_price_per_kg": 25,
  "farmers": [
    {"name": "Farmer A", "quantity_kg": 3000, "latlon": [30.90, 75.85], "price_per_kg": 22, "reliability_score": 91},
    {"name": "Farmer B", "quantity_kg": 3000, "pincode": "141001", "price_per_kg": 24, "reliability_score": 88},
    {"name": "Farmer C", "quantity_kg": 4000, "latlon": [31.00, 75.95], "price_per_kg": 21, "reliability_score": 94}
  ],
  "buyer": {"name": "Azadpur Mandi", "latlon": [28.70, 77.16]},
  "collection_hub": {"name": "Example Collection Hub", "latlon": [30.80, 75.80]},
  "max_landed_cost_per_kg": 30
}
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agrioptima.main import run_agrioptima_logistics


app = FastAPI(
    title="AgriOptima AI — Logistics Pipeline",
    description="Geocoding -> routing -> vehicle selection -> 3-model comparison -> landed cost -> farmer transparency.",
    version="0.1.0",
)

# Wide open for hackathon dev — tighten allow_origins to your real frontend
# URL before any deployment beyond the demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# REQUEST SCHEMA
#   Mirrors the shipment dict shape expected by main.validate_shipment(),
#   including the pincode-OR-latlon flexibility.
# ---------------------------------------------------------------------------

class LocationPoint(BaseModel):
    name: str
    latlon: Optional[List[float]] = Field(None, example=[30.90, 75.85])
    pincode: Optional[str] = Field(None, example="141001")


class FarmerInput(LocationPoint):
    quantity_kg: float = Field(..., gt=0, example=3000)
    price_per_kg: Optional[float] = Field(None, gt=0, example=22)
    reliability_score: Optional[float] = Field(None, ge=0, le=100, example=91)


class ShipmentRequest(BaseModel):
    crop: str = Field(..., example="tomato")
    farmer_price_per_kg: float = Field(..., gt=0, example=25)
    farmers: List[FarmerInput]
    buyer: LocationPoint
    collection_hub: Optional[LocationPoint] = None
    max_landed_cost_per_kg: Optional[float] = Field(None, gt=0, example=30)


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "AgriOptima AI logistics pipeline is running.",
        "endpoints": ["/run-logistics (POST)"],
    }


@app.post("/run-logistics")
def run_logistics(shipment: ShipmentRequest):
    """
    Runs the full pipeline: validates input, resolves pincodes/latlon,
    calculates all applicable models (Direct / Multi-farmer / Collection-hub),
    picks the best one, computes landed cost per farmer, and returns
    everything needed to render both the buyer dashboard and the farmer
    transparency screen.
    """
    shipment_dict = shipment.model_dump(exclude_none=True)

    try:
        result = run_agrioptima_logistics(shipment_dict)
    except ValueError as e:
        # Validation errors from main.validate_shipment() — bad input, not a server bug.
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

    return result
