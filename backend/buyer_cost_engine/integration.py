"""
Integration glue between the logistics pipeline (agrioptima.main) and the
Buyer Cost Engine.

Kept as a separate function (not merged into either module) so the two
team's code stays decoupled, per the integration plan: "The Buyer Cost
Engine does not calculate route, truck, toll, distance or 3PL pricing.
It receives a fixed JSON-style output from the logistics module."

Usage:
    from agrioptima.main import run_agrioptima_logistics
    from buyer_cost_engine.integration import run_full_buyer_quote

    shipment = {...}  # same shape run_agrioptima_logistics() takes
    quote = run_full_buyer_quote(shipment, delivery_mode="EXPRESS")
"""

from typing import Optional

from .models import LogisticsInput, BuyerOrderInput
from .engine import calculate_final_buyer_cost


def build_logistics_input_from_result(logistics_result: dict, delivery_mode: str = "EXPRESS") -> LogisticsInput:
    """
    logistics_result: the full dict returned by agrioptima.main.run_agrioptima_logistics().
    Pulls total_cost/cost_per_kg from recommended_model, and eta_hours from
    the winning model's own entry in `models` (recommended_model itself
    doesn't carry eta_hours — see agrioptima/main.py).
    """
    recommended = logistics_result["recommended_model"]
    winning_model_name = recommended["name"]
    winning_model_detail = logistics_result["models"][winning_model_name]

    return LogisticsInput(
        total_cost=recommended["total_cost"],
        cost_per_kg=recommended["cost_per_kg"],
        eta_hours=winning_model_detail["eta_hours"],
        delivery_mode=delivery_mode,
    )


def run_full_buyer_quote(
    shipment: dict,
    delivery_mode: str = "EXPRESS",
    platform_fee_rate: Optional[float] = None,
    compliance_rate: Optional[float] = None,
) -> dict:
    """
    Runs the full pipeline: agrioptima logistics -> buyer cost engine.
    shipment: same shape run_agrioptima_logistics() takes (crop, farmer_price_per_kg,
              farmers[], buyer, optional collection_hub, optional max_landed_cost_per_kg).
    Returns both the logistics result and the final buyer cost breakdown together.
    """
    # Imported here (not at module top) to keep buyer_cost_engine importable
    # standalone, without requiring agrioptima to be on the path for tests
    # that don't need the full logistics pipeline.
    from agrioptima.main import run_agrioptima_logistics

    logistics_result = run_agrioptima_logistics(shipment)
    logistics_input = build_logistics_input_from_result(logistics_result, delivery_mode)

    total_quantity_kg = logistics_result["shipment_summary"]["total_quantity_kg"]
    order = BuyerOrderInput(
        crop=shipment["crop"],
        quantity_kg=total_quantity_kg,
        farmer_price_per_kg=shipment["farmer_price_per_kg"],
        compliance_rate=compliance_rate,
        platform_fee_rate=platform_fee_rate,
    )

    buyer_quote = calculate_final_buyer_cost(order, logistics_input)

    return {
        "logistics_result": logistics_result,
        "buyer_quote": buyer_quote,
    }
