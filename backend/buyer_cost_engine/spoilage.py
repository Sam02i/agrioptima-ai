"""
Spoilage Rate = lookup based on Crop + ETA.
Spoilage Cost = Quantity x Farmer Price/kg x Spoilage Rate.

ETA is reused from the logistics module's output (not recalculated here),
per the integration contract — this also means spoilage automatically
gets worse if a slower delivery mode (e.g. SHARED/pooled) is chosen.
"""

from decimal import Decimal
from .config import SPOILAGE_BANDS, SPOILAGE_RATE_BEYOND_MAX_ETA


def get_spoilage_rate(crop: str, eta_hours: float) -> Decimal:
    bands = SPOILAGE_BANDS.get(crop.lower(), SPOILAGE_BANDS["default"])
    for max_hours, rate in bands:
        if eta_hours <= max_hours:
            return rate
    return SPOILAGE_RATE_BEYOND_MAX_ETA


def calculate_spoilage_cost(quantity_kg: Decimal, farmer_price_per_kg: Decimal,
                             crop: str, eta_hours: float) -> dict:
    rate = get_spoilage_rate(crop, eta_hours)
    cost = quantity_kg * farmer_price_per_kg * rate
    return {
        "spoilage_rate": rate,
        "spoilage_cost": cost,
        "eta_hours_used": eta_hours,
    }
