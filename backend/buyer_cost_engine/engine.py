"""
Buyer Cost Engine — main entry point.

    FINAL BUYER COST = Crop Cost + Logistics Cost + Platform Fee
                      + Spoilage Cost + Compliance Cost

This module owns: Crop Cost, Platform Fee, Spoilage Cost, Compliance Cost.
Logistics Cost is NOT calculated here — it's received as a fixed JSON-style
input from the logistics module (see models.LogisticsInput), keeping team
responsibilities separate exactly as specced.
"""

from decimal import Decimal, ROUND_HALF_UP

from .models import LogisticsInput, BuyerOrderInput
from .platform_fee import calculate_platform_fee
from .spoilage import calculate_spoilage_cost
from .compliance import calculate_compliance_cost


def _money(value: Decimal) -> float:
    """Rounds to 2dp using ROUND_HALF_UP (so 25.735 -> 25.74), returns a plain float."""
    return float(Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def calculate_final_buyer_cost(order: BuyerOrderInput, logistics: LogisticsInput) -> dict:
    quantity_kg = Decimal(str(order.quantity_kg))
    farmer_price = Decimal(str(order.farmer_price_per_kg))
    logistics_cost = Decimal(str(logistics.total_cost))

    platform_fee_rate = Decimal(str(order.platform_fee_rate)) if order.platform_fee_rate is not None else None
    compliance_rate = Decimal(str(order.compliance_rate)) if order.compliance_rate is not None else None

    # Crop Cost = Quantity x Farmer Price/kg
    crop_cost = quantity_kg * farmer_price

    # Platform Fee = Crop Cost x Platform Fee Rate
    platform_fee = calculate_platform_fee(crop_cost, platform_fee_rate)

    # Spoilage Cost = Quantity x Farmer Price/kg x Spoilage Rate (crop + ETA lookup)
    spoilage = calculate_spoilage_cost(quantity_kg, farmer_price, order.crop, logistics.eta_hours)

    # Compliance Cost = Crop Cost x Applicable Compliance Rate
    compliance_cost = calculate_compliance_cost(crop_cost, compliance_rate)

    final_buyer_cost = crop_cost + logistics_cost + platform_fee + spoilage["spoilage_cost"] + compliance_cost
    final_cost_per_kg = final_buyer_cost / quantity_kg if quantity_kg > 0 else Decimal("0")

    return {
        "crop": order.crop,
        "quantity_kg": float(quantity_kg),
        "delivery_mode": logistics.delivery_mode,
        "breakdown": {
            "crop_cost": _money(crop_cost),
            "logistics_cost": _money(logistics_cost),
            "platform_fee": _money(platform_fee),
            "spoilage_cost": _money(spoilage["spoilage_cost"]),
            "compliance_cost": _money(compliance_cost),
        },
        "spoilage_detail": {
            "spoilage_rate_pct": _money(spoilage["spoilage_rate"] * 100),
            "eta_hours_used": spoilage["eta_hours_used"],
        },
        "logistics_detail": {
            "total_cost": logistics.total_cost,
            "cost_per_kg": logistics.cost_per_kg,
            "eta_hours": logistics.eta_hours,
            "delivery_mode": logistics.delivery_mode,
        },
        "final_buyer_cost": _money(final_buyer_cost),
        "final_cost_per_kg": _money(final_cost_per_kg),
    }
