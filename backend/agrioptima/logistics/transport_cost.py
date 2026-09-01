"""
AgriOptima AI — Common Transport Engine

This is the ONE reusable function every leg of every model (1, 2, 3) calls.
It wires together routing -> packaging -> vehicle selection, exactly like
the original transport_cost_mvp.py get_transport_cost(), just relocated so
Model 2's multi-stop legs and Model 3's hub legs can both call it without
duplicating any routing/packaging/vehicle logic.

    TransportCost = Distance (km) x Vehicle Rate (Rs/km)   [x trips if split]
"""

from agrioptima.logistics.routing import get_distance_km
from agrioptima.logistics.packaging import get_required_weight_and_volume
from agrioptima.logistics.vehicles import select_vehicle


def calculate_transport(
    origin: str,
    destination: str,
    origin_latlon: tuple,
    dest_latlon: tuple,
    quantity_kg: float,
    crop: str = "default",
) -> dict:
    """
    The common transport engine. Every leg in Model 1, Model 2 and Model 3
    reuses this function wherever a single point-to-point leg is needed.

    Returns the standard shape:
        {
            "route": {origin, destination, distance_km, duration_hr, source},
            "quantity_kg": ...,
            "packaging": {crop, num_packages, required_weight_kg, required_volume_m3, ...},
            "vehicle": ...,
            "capacity_kg": ...,
            "capacity_m3": ...,
            "rate_per_km": ...,
            "trips_required": ...,
            "total_transport_cost": ...,
            "cost_per_kg": ...,
            ... (utilisation / warning fields from vehicle selection)
        }
    """
    if quantity_kg <= 0:
        raise ValueError(f"quantity_kg must be > 0, got {quantity_kg}")

    route = get_distance_km(origin, destination, origin_latlon, dest_latlon)

    packaging = get_required_weight_and_volume(quantity_kg, crop)
    vehicle_result = select_vehicle(
        packaging["required_weight_kg"],
        packaging["required_volume_m3"],
        route["distance_km"],
    )
    vehicle_result["cost_per_kg"] = round(vehicle_result["total_transport_cost"] / quantity_kg, 2)

    return {
        "route": {
            "origin": origin,
            "destination": destination,
            "distance_km": route["distance_km"],
            "duration_hr": route["duration_hr"],
            "source": route["source"],
        },
        "quantity_kg": quantity_kg,
        "packaging": packaging,
        **vehicle_result,
    }
