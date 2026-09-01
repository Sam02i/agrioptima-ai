"""
AgriOptima AI — Model 3: Farmers -> Collection Hub -> Buyer

    Farmer A ──┐
    Farmer B ──┼──> Collection Hub ──> Main Truck ──> Buyer
    Farmer C ──┘

STEP 1 (collection): all selected farmers are picked up and consolidated
at the hub. If there's more than one farmer, this reuses the SAME
multi-stop route optimizer as Model 2 (nearby farmers can share a
pickup route on the way to the hub) — but sized and priced ONLY for
the farmer->hub leg, with ONE collection vehicle sized for the total
farmer quantity.

STEP 2 (consolidation): quantities are summed at the hub.

STEP 3 (hub -> buyer): the common transport engine moves the full
consolidated shipment from the hub to the buyer in one large truck.

    Model 3 Total Cost = Farmer Collection Cost + Hub -> Buyer Cost
"""

from typing import List, Dict

from agrioptima.logistics.transport_cost import calculate_transport
from agrioptima.logistics.packaging import get_required_weight_and_volume
from agrioptima.logistics.vehicles import select_vehicle
from agrioptima.optimization.route_optimizer import optimize_pickup_route


def _collect_to_hub(farmers: List[Dict], hub: Dict, crop: str) -> dict:
    """STEP 1: farmers -> hub. Single farmer = one direct leg via the common
    engine. Multiple farmers = one optimized shared pickup route (like
    Model 2) ending at the hub, priced with ONE collection vehicle."""
    total_quantity_kg = sum(f["quantity_kg"] for f in farmers)

    if len(farmers) == 1:
        leg = calculate_transport(
            origin=farmers[0]["name"],
            destination=hub["name"],
            origin_latlon=farmers[0]["latlon"],
            dest_latlon=hub["latlon"],
            quantity_kg=total_quantity_kg,
            crop=crop,
        )
        return {
            "collection_cost": leg["total_transport_cost"],
            "collection_distance_km": leg["route"]["distance_km"],
            "collection_duration_hr": leg["route"]["duration_hr"],
            "collection_vehicle": leg["vehicle"],
            "collection_route": {"order": [farmers[0]["name"], hub["name"]], "legs": [leg["route"]],
                                  "method": "single_farmer_direct"},
        }

    route = optimize_pickup_route(farmers, hub)
    packaging = get_required_weight_and_volume(total_quantity_kg, crop)
    vehicle_result = select_vehicle(
        packaging["required_weight_kg"], packaging["required_volume_m3"], route["total_distance_km"]
    )
    return {
        "collection_cost": vehicle_result["total_transport_cost"],
        "collection_distance_km": route["total_distance_km"],
        "collection_duration_hr": route["total_duration_hr"],
        "collection_vehicle": vehicle_result["vehicle"],
        "collection_route": route,
        "collection_vehicle_detail": vehicle_result,
    }


def calculate_model_3(farmers: List[Dict], buyer: Dict, hub: Dict, crop: str) -> dict:
    """
    farmers: list of {"name": str, "latlon": (lat, lon), "quantity_kg": float}
    buyer:   {"name": str, "latlon": (lat, lon)}
    hub:     {"name": str, "latlon": (lat, lon)}
    """
    if not farmers:
        raise ValueError("Model 3 requires at least 1 farmer")
    if hub is None:
        raise ValueError("Model 3 requires a collection_hub location")
    for f in farmers:
        if f["quantity_kg"] <= 0:
            raise ValueError(f"{f['name']}: quantity_kg must be > 0")

    total_quantity_kg = sum(f["quantity_kg"] for f in farmers)

    # STEP 1: collection.
    collection = _collect_to_hub(farmers, hub, crop)

    # STEP 2: consolidation (just bookkeeping — quantities already summed).

    # STEP 3: hub -> buyer, full consolidated shipment, common engine.
    hub_leg = calculate_transport(
        origin=hub["name"],
        destination=buyer["name"],
        origin_latlon=hub["latlon"],
        dest_latlon=buyer["latlon"],
        quantity_kg=total_quantity_kg,
        crop=crop,
    )

    total_cost = round(collection["collection_cost"] + hub_leg["total_transport_cost"], 2)
    total_distance_km = round(collection["collection_distance_km"] + hub_leg["route"]["distance_km"], 1)
    eta_hours = round(collection["collection_duration_hr"] + hub_leg["route"]["duration_hr"], 2)
    trips_required = 1 + hub_leg.get("trips_required", 1)  # 1 collection trip (or route) + hub->buyer trips

    return {
        "model": "MODEL_3_COLLECTION_HUB",
        "total_quantity_kg": total_quantity_kg,
        "collection_cost": round(collection["collection_cost"], 2),
        "hub_to_buyer_cost": hub_leg["total_transport_cost"],
        "total_cost": total_cost,
        "cost_per_kg": round(total_cost / total_quantity_kg, 2),
        "collection_routes": [collection["collection_route"]],
        "main_vehicle": hub_leg["vehicle"],
        "eta_hours": eta_hours,
        "trips_required": trips_required,
        "handling_points": len(farmers) + 2,  # farmer pickups + hub touch + buyer drop
        "weight_utilisation_pct": hub_leg["weight_utilisation_pct"],
        "total_route_distance_km": total_distance_km,
        "details": {
            "collection_vehicle": collection["collection_vehicle"],
            "hub_leg": hub_leg,
        },
    }
