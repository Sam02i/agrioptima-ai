"""Logistics model comparison and final buyer-cost API."""
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

from agrioptima.main import run_agrioptima_logistics
from buyer_cost_engine.integration import run_full_buyer_quote

router = APIRouter(prefix="/logistics", tags=["Logistics Optimizer"])


class LocationPoint(BaseModel):
    name: str = Field(min_length=1)
    latlon: Optional[list[float]] = None
    pincode: Optional[str] = None

    @model_validator(mode="after")
    def require_location(self):
        if self.latlon is None and not self.pincode:
            raise ValueError("Provide either latlon or pincode")
        if self.latlon is not None and len(self.latlon) != 2:
            raise ValueError("latlon must contain [latitude, longitude]")
        return self


class FarmerInput(LocationPoint):
    quantity_kg: float = Field(gt=0)
    price_per_kg: Optional[float] = Field(default=None, gt=0)
    reliability_score: Optional[float] = Field(default=None, ge=0, le=100)


class LogisticsRequest(BaseModel):
    crop: str = Field(min_length=1)
    farmer_price_per_kg: float = Field(gt=0)
    farmers: list[FarmerInput] = Field(min_length=1)
    buyer: LocationPoint
    collection_hub: Optional[LocationPoint] = None
    max_landed_cost_per_kg: Optional[float] = Field(default=None, gt=0)
    delivery_mode: str = "SHARED"
    platform_fee_rate: Optional[float] = Field(default=None, ge=0, le=1)
    compliance_rate: Optional[float] = Field(default=None, ge=0, le=1)


def _shipment(request: LogisticsRequest) -> dict:
    data = request.model_dump(exclude_none=True)
    for field in ("delivery_mode", "platform_fee_rate", "compliance_rate"):
        data.pop(field, None)
    return data


@router.get("/health")
def health():
    return {"status": "ok", "models": [
        "MODEL_1_DIRECT", "MODEL_2_MULTI_FARMER_DIRECT", "MODEL_3_COLLECTION_HUB"
    ]}


@router.post("/optimize")
def optimize(request: LogisticsRequest):
    try:
        return run_agrioptima_logistics(_shipment(request))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Logistics optimization failed: {exc}")


@router.post("/buyer-quote")
def buyer_quote(request: LogisticsRequest):
    try:
        return run_full_buyer_quote(
            _shipment(request), delivery_mode=request.delivery_mode,
            platform_fee_rate=request.platform_fee_rate,
            compliance_rate=request.compliance_rate,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Buyer quote failed: {exc}")
