"""
AgriOptima AI — Master Pipeline

DATA FLOW
---------
    shipment (dict)
        │
        ▼
    validate_shipment()               <- catches bad input early, resolves
        │                                 pincodes to lat/lon if used
        ▼
    calculate_model_1()  ─┐           <- always runs (no-consolidation baseline)
    calculate_model_2()  ─┼─ models/  <- runs only if >= 2 farmers
    calculate_model_3()  ─┘           <- runs only if a collection_hub is given
        │
        │   each model internally calls the SAME common engine:
        │       logistics/transport_cost.py  -> calculate_transport()
        │           ├─ logistics/routing.py     (distance/ETA)
        │           ├─ logistics/packaging.py   (weight/volume)
        │           └─ logistics/vehicles.py    (cheapest suitable truck)
        │   Model 2 (and multi-farmer Model 3 collection) additionally use:
        │       optimization/route_optimizer.py -> optimize_pickup_route()
        │
        ▼
    compare_logistics_models()        <- optimization/model_optimizer.py
        │   scores every available model on cost/ETA/utilisation/trips/
        │   handling/route-efficiency, picks the best overall
        ▼
    calculate_procurement_plan_landed_cost()   <- logistics/landed_cost.py
        │   purchase + allocated transport share + handling + wastage + risk,
        │   per farmer AND blended across the whole shipment
        ▼
    buyer pricing                     <- farmer_price_per_kg + logistics_cost_per_kg
        ▼
    final JSON returned to caller


LOCATIONS: pincode OR lat/lon
------------------------------
Every farmer/buyer/collection_hub can be given EITHER:
    "latlon": [28.70, 77.16]
or
    "pincode": "110001"
If both are given, "latlon" wins. Pincodes are resolved once, up front,
using logistics/pincode_resolver.py — everything downstream (routing,
optimization, models) only ever sees lat/lon, unchanged from before.


RUN
---
    export ORS_API_KEY="your_key_here"   # optional — falls back to OSRM, then haversine
    python3 -m agrioptima.main
    (run from the directory ABOVE agrioptima/, so the package import works)
"""

from typing import Optional

from agrioptima.models.model_1_direct import calculate_model_1
from agrioptima.models.model_2_multi_farmer import calculate_model_2
from agrioptima.models.model_3_collection_hub import calculate_model_3
from agrioptima.optimization.model_optimizer import compare_logistics_models
from agrioptima.logistics.pincode_resolver import resolve_pincode_or_raise
from agrioptima.logistics.landed_cost import FarmerLot, calculate_procurement_plan_landed_cost
from agrioptima.data.crop_profiles import DEFAULT_RELIABILITY_SCORE


# ---------------------------------------------------------------------------
# LOCATION RESOLUTION (pincode OR latlon)
# ---------------------------------------------------------------------------

def _resolve_location(point: dict, label: str) -> tuple:
    """Returns (lat, lon) for a farmer/buyer/hub dict. Prefers 'latlon' if
    present; otherwise resolves 'pincode' via the India Post lookup table."""
    if point.get("latlon") is not None:
        latlon = point["latlon"]
        if len(latlon) != 2:
            raise ValueError(f"{label}: latlon must be [lat, lon]")
        lat, lon = latlon
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise ValueError(f"{label}: latlon {latlon} is out of valid range")
        return tuple(latlon)

    if point.get("pincode"):
        return resolve_pincode_or_raise(point["pincode"], label)

    raise ValueError(f"{label}: must have either 'latlon' or 'pincode'")


# ---------------------------------------------------------------------------
# INPUT VALIDATION
# ---------------------------------------------------------------------------

def validate_shipment(shipment: dict) -> None:
    if "crop" not in shipment or not shipment["crop"]:
        raise ValueError("shipment.crop is required")

    if "farmer_price_per_kg" not in shipment or shipment["farmer_price_per_kg"] <= 0:
        raise ValueError("shipment.farmer_price_per_kg must be > 0")

    farmers = shipment.get("farmers")
    if not farmers:
        raise ValueError("shipment.farmers must be a non-empty list")

    seen_names = set()
    for f in farmers:
        if "name" not in f or not f["name"]:
            raise ValueError("Every farmer needs a 'name'")
        if f["name"] in seen_names:
            raise ValueError(f"Duplicate farmer name: {f['name']}")
        seen_names.add(f["name"])

        if "quantity_kg" not in f or f["quantity_kg"] <= 0:
            raise ValueError(f"{f['name']}: quantity_kg must be a positive number")

        _resolve_location(f, f["name"])  # raises if neither latlon nor pincode resolves

        if "price_per_kg" in f and f["price_per_kg"] is not None and f["price_per_kg"] <= 0:
            raise ValueError(f"{f['name']}: price_per_kg must be > 0 if given")

        if "reliability_score" in f and f["reliability_score"] is not None:
            rs = f["reliability_score"]
            if not (0 <= rs <= 100):
                raise ValueError(f"{f['name']}: reliability_score must be 0-100")

    buyer = shipment.get("buyer")
    if not buyer or "name" not in buyer:
        raise ValueError("shipment.buyer must have a 'name'")
    _resolve_location(buyer, "buyer")

    hub = shipment.get("collection_hub")
    if hub:
        if "name" not in hub:
            raise ValueError("shipment.collection_hub must have a 'name'")
        _resolve_location(hub, "collection_hub")


def _normalize_point(p: dict) -> dict:
    """Resolves pincode->latlon if needed, returns a copy with 'latlon' set as a tuple."""
    out = dict(p)
    out["latlon"] = _resolve_location(p, p.get("name", "location"))
    return out


# ---------------------------------------------------------------------------
# BUYER PRICING  (farmer never pays transport)
# ---------------------------------------------------------------------------

def calculate_buyer_pricing(farmer_price_per_kg: float, logistics_cost_per_kg: float) -> dict:
    return {
        "farmer_price_per_kg": farmer_price_per_kg,
        "logistics_cost_per_kg": logistics_cost_per_kg,
        "buyer_final_price_per_kg": round(farmer_price_per_kg + logistics_cost_per_kg, 2),
        "farmer_receives_per_kg": farmer_price_per_kg,
    }


# ---------------------------------------------------------------------------
# MASTER FUNCTION
# ---------------------------------------------------------------------------

def run_agrioptima_logistics(shipment: dict) -> dict:
    validate_shipment(shipment)

    crop = shipment["crop"]
    farmer_price_per_kg = shipment["farmer_price_per_kg"]
    farmers = [_normalize_point(f) for f in shipment["farmers"]]
    buyer = _normalize_point(shipment["buyer"])
    hub: Optional[dict] = _normalize_point(shipment["collection_hub"]) if shipment.get("collection_hub") else None

    total_quantity_kg = sum(f["quantity_kg"] for f in farmers)

    models_run = {}

    # Model 1 always runs — it's the no-consolidation baseline.
    models_run["MODEL_1_DIRECT"] = calculate_model_1(farmers, buyer, crop)

    # Model 2 only makes sense with 2+ farmers to consolidate.
    if len(farmers) >= 2:
        models_run["MODEL_2_MULTI_FARMER_DIRECT"] = calculate_model_2(farmers, buyer, crop)

    # Model 3 only runs if a collection hub was provided.
    if hub is not None:
        models_run["MODEL_3_COLLECTION_HUB"] = calculate_model_3(farmers, buyer, hub, crop)

    comparison = compare_logistics_models(list(models_run.values()))
    recommended = comparison["recommended_model"]

    buyer_pricing = calculate_buyer_pricing(farmer_price_per_kg, recommended["cost_per_kg"])

    # Landed cost per farmer, allocating the recommended model's transport
    # rate by quantity (see logistics/landed_cost.py for why: transport is
    # a shared truck/route under Models 2 and 3, not an independent leg).
    lots = [
        FarmerLot(
            farmer_id=f["name"],
            price_per_kg=f.get("price_per_kg") or farmer_price_per_kg,
            quantity_kg=f["quantity_kg"],
            crop=crop,
            reliability_score=f.get("reliability_score") or DEFAULT_RELIABILITY_SCORE,
        )
        for f in farmers
    ]
    landed_cost = calculate_procurement_plan_landed_cost(
        lots,
        allocated_transport_cost_per_kg=recommended["cost_per_kg"],
        max_landed_cost_per_kg=shipment.get("max_landed_cost_per_kg"),
    )

    return {
        "shipment_summary": {
            "crop": crop,
            "total_quantity_kg": total_quantity_kg,
            "farmer_price_per_kg": farmer_price_per_kg,
        },
        "models": models_run,
        "model_comparison": comparison["scores"],
        "recommended_model": recommended,
        "buyer_pricing": buyer_pricing,
        "landed_cost": landed_cost,
    }


# ---------------------------------------------------------------------------
# DEMO — matches the plan's exact worked example (Punjab farmers -> Delhi)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    shipment = {
        "crop": "tomato",
        "farmer_price_per_kg": 25,
        "farmers": [
            {"name": "Farmer A", "quantity_kg": 3000, "latlon": [30.90, 75.85], "price_per_kg": 22, "reliability_score": 91},
            {"name": "Farmer B", "quantity_kg": 3000, "latlon": [30.95, 75.90], "price_per_kg": 24, "reliability_score": 88},
            {"name": "Farmer C", "quantity_kg": 4000, "latlon": [31.00, 75.95], "price_per_kg": 21, "reliability_score": 94},
        ],
        "buyer": {"name": "Azadpur Mandi", "latlon": [28.70, 77.16]},
        "collection_hub": {"name": "Example Collection Hub", "latlon": [30.80, 75.80]},
        "max_landed_cost_per_kg": 30,
    }

    result = run_agrioptima_logistics(shipment)
    print(json.dumps(result, indent=2))
