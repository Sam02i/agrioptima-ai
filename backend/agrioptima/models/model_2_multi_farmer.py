"""
AgriOptima AI — Model 2: Multiple Nearby Farmers -> ONE Truck -> Buyer

    Farmer A -> Farmer B -> Farmer C -> Buyer   (order optimized, NOT assumed)

There is NO collection centre here. ONE truck drives an optimized
multi-stop pickup route across all selected farmers, then goes straight
to the buyer. The truck is sized ONCE, for the TOTAL combined shipment
(all farmers' quantities together), and travels the full optimized
route distance.

    Total Transport Cost = Total Optimized Route Distance x Vehicle Rate

This is intentionally NOT:
    Farmer -> Collection Centre  +  Collection Centre -> Buyer
(that is Model 3).
"""

from typing import List, Dict

from agrioptima.logistics.packaging import get_required_weight_and_volume
from agrioptima.logistics.vehicles import select_vehicle
from agrioptima.optimization.route_optimizer import optimize_pickup_route


def calculate_model_2(farmers: List[Dict], buyer: Dict, crop: str) -> dict:
    """
    farmers: list of {"name": str, "latlon": (lat, lon), "quantity_kg": float}
    buyer:   {"name": str, "latlon": (lat, lon)}
    """
    if len(farmers) < 2:
        raise ValueError("Model 2 requires at least 2 farmers (single farmer -> use Model 1)")
    for f in farmers:
        if f["quantity_kg"] <= 0:
            raise ValueError(f"{f['name']}: quantity_kg must be > 0")

    # 1. Optimize the pickup sequence ending at the buyer.
    route = optimize_pickup_route(farmers, buyer)

    # 2. Combine ALL farmers' quantities into one total shipment.
    total_quantity_kg = sum(f["quantity_kg"] for f in farmers)
    packaging = get_required_weight_and_volume(total_quantity_kg, crop)

    # 3. Select ONE truck for the total shipment, over the FULL optimized
    #    route distance (not per-leg — one truck drives the whole route).
    vehicle_result = select_vehicle(
        packaging["required_weight_kg"],
        packaging["required_volume_m3"],
        route["total_distance_km"],
    )
    vehicle_result["cost_per_kg"] = round(
        vehicle_result["total_transport_cost"] / total_quantity_kg, 2
    )

    return {
        "model": "MODEL_2_MULTI_FARMER_DIRECT",
        "farmers": len(farmers),
        "total_quantity_kg": total_quantity_kg,
        "optimized_route": route["order"],
        "total_route_distance_km": route["total_distance_km"],
        "vehicle": vehicle_result["vehicle"],
        "total_cost": vehicle_result["total_transport_cost"],
        "cost_per_kg": vehicle_result["cost_per_kg"],
        "eta_hours": route["total_duration_hr"],
        "trips_required": vehicle_result.get("trips_required", 1),
        "handling_points": len(farmers) + 1,   # each farmer pickup + 1 buyer drop, ONE truck throughout
        "weight_utilisation_pct": vehicle_result["weight_utilisation_pct"],
        "details": {
            "packaging": packaging,
            "vehicle_selection": vehicle_result,
            "route_legs": route["legs"],
            "optimization_method": route["method"],
        },
    }
