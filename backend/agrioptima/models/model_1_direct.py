"""
AgriOptima AI — Model 1: Direct Farmer to Buyer

    Farmer -> Truck -> Buyer / Mandi

This is the SINGLE-FARMER shipment model. When run with exactly one
farmer it reproduces the plan's exact example (one distance, one
vehicle, one cost). When run with several farmers (used purely as a
"no consolidation" baseline for comparison against Model 2/3), every
farmer ships an INDEPENDENT truck straight to the buyer — there is no
shared pickup route and no hub. Results are summed:

    total_cost      = sum of each farmer's own truck cost
    route_distance  = sum of each farmer's own farmer->buyer distance
    eta_hours       = the LONGEST single leg (trucks run in parallel,
                       so the shipment is only as fast as the slowest one)
"""

from typing import List, Dict

from agrioptima.logistics.transport_cost import calculate_transport


def calculate_model_1(farmers: List[Dict], buyer: Dict, crop: str) -> dict:
    """
    farmers: list of {"name": str, "latlon": (lat, lon), "quantity_kg": float}
    buyer:   {"name": str, "latlon": (lat, lon)}
    """
    if not farmers:
        raise ValueError("Model 1 requires at least one farmer")

    legs = []
    for farmer in farmers:
        if farmer["quantity_kg"] <= 0:
            raise ValueError(f"{farmer['name']}: quantity_kg must be > 0")
        leg = calculate_transport(
            origin=farmer["name"],
            destination=buyer["name"],
            origin_latlon=farmer["latlon"],
            dest_latlon=buyer["latlon"],
            quantity_kg=farmer["quantity_kg"],
            crop=crop,
        )
        legs.append({"farmer": farmer["name"], **leg})

    total_quantity_kg = sum(f["quantity_kg"] for f in farmers)
    total_cost = round(sum(leg["total_transport_cost"] for leg in legs), 2)
    total_distance_km = round(sum(leg["route"]["distance_km"] for leg in legs), 1)
    eta_hours = round(max(leg["route"]["duration_hr"] for leg in legs), 2)
    total_trips = sum(leg.get("trips_required", 1) for leg in legs)

    vehicles_used = sorted({leg["vehicle"] for leg in legs})
    vehicle_summary = vehicles_used[0] if len(vehicles_used) == 1 else f"Mixed ({', '.join(vehicles_used)})"

    # Average utilisation across legs, weighted by quantity — used later by
    # the model comparison/scoring step.
    avg_weight_util = round(
        sum(leg["weight_utilisation_pct"] * f["quantity_kg"] for leg, f in zip(legs, farmers)) / total_quantity_kg, 1
    )

    return {
        "model": "MODEL_1_DIRECT",
        "total_quantity_kg": total_quantity_kg,
        "route_distance_km": total_distance_km,
        "vehicle": vehicle_summary,
        "total_cost": total_cost,
        "cost_per_kg": round(total_cost / total_quantity_kg, 2),
        "eta_hours": eta_hours,
        "trips_required": total_trips,
        "handling_points": len(farmers) + 1,   # each farmer pickup + 1 buyer drop
        "weight_utilisation_pct": avg_weight_util,
        "details": {"legs": legs},
    }
