"""
AgriOptima AI — Vehicle Selection Logic

Cheapest suitable vehicle for a given required weight/volume/distance.
Logic unchanged from transport_cost_mvp.py — only the rate card moved
to data/vehicle_profiles.py.

If a single vehicle can't cover the load on weight AND/OR volume, splits
across multiple trips of whichever vehicle type is cheapest overall
(Phase 1.1 — simple split, not a full mixed-fleet optimizer).
"""

import math
from typing import Optional

from agrioptima.data.vehicle_profiles import VEHICLE_TABLE, Vehicle

LOW_UTILISATION_THRESHOLD_PCT = 60


def _cheapest_single_vehicle(required_weight_kg: float, required_volume_m3: float,
                              distance_km: float) -> Optional[dict]:
    """Returns the cheapest single vehicle that satisfies BOTH weight and volume, or None."""
    candidates = [
        v for v in VEHICLE_TABLE
        if v.max_payload_kg >= required_weight_kg
        and v.max_volume_m3 >= required_volume_m3
    ]
    if not candidates:
        return None

    def transport_cost(v: Vehicle) -> float:
        return distance_km * v.rate_per_km

    best = min(candidates, key=transport_cost)
    cost = transport_cost(best)
    weight_utilisation = round((required_weight_kg / best.max_payload_kg) * 100, 1)
    volume_utilisation = round((required_volume_m3 / best.max_volume_m3) * 100, 1)
    binding_utilisation = max(weight_utilisation, volume_utilisation)
    binding_dimension = "weight" if weight_utilisation >= volume_utilisation else "volume"

    result = {
        "vehicle": best.name,
        "capacity_kg": best.max_payload_kg,
        "capacity_m3": best.max_volume_m3,
        "rate_per_km": best.rate_per_km,
        "distance_km": distance_km,
        "trips_required": 1,
        "weight_utilisation_pct": weight_utilisation,
        "volume_utilisation_pct": volume_utilisation,
        "binding_constraint": binding_dimension,
        "total_transport_cost": round(cost, 2),
    }
    if binding_utilisation < LOW_UTILISATION_THRESHOLD_PCT:
        result["warning"] = (
            f"Low {binding_dimension} utilisation ({binding_utilisation}%). "
            f"Consider shipment consolidation with nearby farmers."
        )
    return result


def select_vehicle(required_weight_kg: float, required_volume_m3: float,
                    distance_km: float) -> dict:
    if distance_km < 0:
        raise ValueError(f"distance_km cannot be negative, got {distance_km}")

    single = _cheapest_single_vehicle(required_weight_kg, required_volume_m3, distance_km)
    if single:
        return single

    # Load exceeds the largest vehicle on weight and/or volume -> split across trips.
    best_plan = None
    for v in VEHICLE_TABLE:
        trips_by_weight = math.ceil(required_weight_kg / v.max_payload_kg)
        trips_by_volume = math.ceil(required_volume_m3 / v.max_volume_m3)
        trips_needed = max(trips_by_weight, trips_by_volume)
        total_cost = trips_needed * distance_km * v.rate_per_km

        plan = {
            "vehicle": v.name,
            "capacity_kg": v.max_payload_kg,
            "capacity_m3": v.max_volume_m3,
            "rate_per_km": v.rate_per_km,
            "distance_km": distance_km,
            "trips_required": trips_needed,
            "total_transport_cost": round(total_cost, 2),
            "weight_utilisation_pct": round((required_weight_kg / (trips_needed * v.max_payload_kg)) * 100, 1),
            "volume_utilisation_pct": round((required_volume_m3 / (trips_needed * v.max_volume_m3)) * 100, 1),
            "note": f"Load exceeds a single vehicle's capacity — split into {trips_needed} trips of {v.name}.",
        }
        if best_plan is None or plan["total_transport_cost"] < best_plan["total_transport_cost"]:
            best_plan = plan

    return best_plan
