"""
Buyer Cost Engine — data shapes.

LogisticsInput mirrors the exact JSON contract from the integration plan:

    {
        "total_cost": 8500,
        "cost_per_kg": 1.70,
        "eta_hours": 14,
        "delivery_mode": "SHARED"
    }

This is deliberately the ONLY thing the Buyer Cost Engine takes from the
logistics module — no route/truck/toll/distance details leak in here,
matching the "separation of responsibilities" the plan calls for.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class LogisticsInput:
    total_cost: float
    cost_per_kg: float
    eta_hours: float
    delivery_mode: str = "EXPRESS"  # "EXPRESS" | "SHARED", per the blueprint's two modes

    @classmethod
    def from_recommended_model(cls, recommended_model: dict, eta_hours: float,
                                delivery_mode: str = "EXPRESS") -> "LogisticsInput":
        """
        Builds a LogisticsInput straight from agrioptima.main's
        run_agrioptima_logistics() output — specifically its
        `recommended_model` dict and the winning model's `eta_hours`
        (main.py's recommended_model doesn't carry eta_hours itself, so it's
        passed in separately from `result["models"][recommended_model_name]`).
        """
        return cls(
            total_cost=recommended_model["total_cost"],
            cost_per_kg=recommended_model["cost_per_kg"],
            eta_hours=eta_hours,
            delivery_mode=delivery_mode,
        )


@dataclass
class BuyerOrderInput:
    crop: str
    quantity_kg: float
    farmer_price_per_kg: float
    compliance_rate: Optional[float] = None   # None -> use config default
    platform_fee_rate: Optional[float] = None  # None -> use config default
