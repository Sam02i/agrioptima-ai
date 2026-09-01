"""
AgriOptima AI — Landed Cost Calculator

Folded in from the standalone landed_cost.py, adapted for the fact that
transport is now decided by whichever of Model 1/2/3 wins — not always
an independent farmer->buyer leg. So the transport component of each
farmer's landed cost is their fair SHARE of the recommended model's
total transport cost, allocated by quantity:

    farmer_transport_cost = recommended_model.cost_per_kg x farmer.quantity_kg

Everything else matches the plan's original formula exactly:

    Total landed cost = Purchase cost
                       + Transport cost (allocated share, see above)
                       + Handling / wastage
                       + Risk penalty
"""

from dataclasses import dataclass
from typing import List, Optional

from agrioptima.data.crop_profiles import (
    WASTAGE_RATE_BY_CROP,
    HANDLING_COST_PER_KG,
    RISK_PENALTY_PER_KG_AT_MAX_RISK,
    DEFAULT_RELIABILITY_SCORE,
)


def estimate_wastage_cost(quantity_kg: float, crop: str, price_per_kg: float) -> dict:
    rate = WASTAGE_RATE_BY_CROP.get(crop.lower(), WASTAGE_RATE_BY_CROP["default"])
    wastage_kg = round(quantity_kg * rate, 1)
    wastage_cost = round(wastage_kg * price_per_kg, 2)
    return {
        "wastage_rate_pct": round(rate * 100, 1),
        "wastage_kg": wastage_kg,
        "wastage_cost": wastage_cost,
    }


def estimate_risk_penalty(quantity_kg: float, reliability_score: float) -> dict:
    """
    reliability_score: 0-100 (higher = more reliable). A new farmer with no
    history should default to DEFAULT_RELIABILITY_SCORE (60), per the plan's
    rule "don't unfairly label new farmers bad."
    """
    risk_score = max(0.0, 100 - reliability_score)
    penalty_per_kg = round((risk_score / 100) * RISK_PENALTY_PER_KG_AT_MAX_RISK, 3)
    penalty_cost = round(penalty_per_kg * quantity_kg, 2)
    return {
        "reliability_score": reliability_score,
        "risk_score": round(risk_score, 1),
        "risk_penalty_per_kg": penalty_per_kg,
        "risk_penalty_cost": penalty_cost,
    }


@dataclass
class FarmerLot:
    farmer_id: str
    price_per_kg: float
    quantity_kg: float
    crop: str
    reliability_score: float = DEFAULT_RELIABILITY_SCORE


def calculate_farmer_landed_cost(lot: FarmerLot, allocated_transport_cost_per_kg: float) -> dict:
    """
    allocated_transport_cost_per_kg: the recommended model's blended
    cost_per_kg (same rate applied to every farmer in the shipment, since
    they all share the same truck/route in Models 2 and 3).
    """
    purchase_cost = round(lot.price_per_kg * lot.quantity_kg, 2)
    transport_cost = round(allocated_transport_cost_per_kg * lot.quantity_kg, 2)
    handling_cost = round(HANDLING_COST_PER_KG * lot.quantity_kg, 2)
    wastage = estimate_wastage_cost(lot.quantity_kg, lot.crop, lot.price_per_kg)
    risk = estimate_risk_penalty(lot.quantity_kg, lot.reliability_score)

    total_landed_cost = round(
        purchase_cost + transport_cost + handling_cost + wastage["wastage_cost"] + risk["risk_penalty_cost"],
        2,
    )
    landed_cost_per_kg = round(total_landed_cost / lot.quantity_kg, 2)

    return {
        "farmer_id": lot.farmer_id,
        "quantity_kg": lot.quantity_kg,
        "price_per_kg": lot.price_per_kg,
        "breakdown": {
            "purchase_cost": purchase_cost,
            "transport_cost": transport_cost,
            "handling_cost": handling_cost,
            "wastage_cost": wastage["wastage_cost"],
            "risk_penalty_cost": risk["risk_penalty_cost"],
        },
        "wastage_detail": wastage,
        "risk_detail": risk,
        "total_landed_cost": total_landed_cost,
        "landed_cost_per_kg": landed_cost_per_kg,
    }


def calculate_procurement_plan_landed_cost(
    lots: List[FarmerLot],
    allocated_transport_cost_per_kg: float,
    max_landed_cost_per_kg: Optional[float] = None,
) -> dict:
    farmer_results = [calculate_farmer_landed_cost(lot, allocated_transport_cost_per_kg) for lot in lots]

    total_quantity_kg = sum(r["quantity_kg"] for r in farmer_results)
    total_landed_cost = round(sum(r["total_landed_cost"] for r in farmer_results), 2)
    blended_cost_per_kg = round(total_landed_cost / total_quantity_kg, 2)

    result = {
        "farmers": farmer_results,
        "total_quantity_kg": total_quantity_kg,
        "total_landed_cost": total_landed_cost,
        "blended_landed_cost_per_kg": blended_cost_per_kg,
    }

    if max_landed_cost_per_kg is not None:
        result["within_buyer_budget"] = blended_cost_per_kg <= max_landed_cost_per_kg
        result["max_landed_cost_per_kg"] = max_landed_cost_per_kg

    return result
