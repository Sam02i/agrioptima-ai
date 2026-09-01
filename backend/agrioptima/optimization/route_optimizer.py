"""
AgriOptima AI — Multi-Stop Route Optimizer

Used by Model 2 (multiple nearby farmers -> ONE truck -> buyer) and
optionally by Model 3 (nearby farmers sharing a pickup route before the
collection hub).

Given a set of farmer stops and a fixed final destination (buyer or hub),
finds the pickup ORDER that minimises total distance travelled:

    - <= 8 farmers: brute-force all permutations (8! = 40,320, trivial).
      The starting farmer is optimized too (every permutation implicitly
      tries every possible start).
    - > 8 farmers: Nearest-Neighbor heuristic, tried once per possible
      starting farmer, keeping whichever start produced the shortest total
      route (a "greedy, multi-start" heuristic — avoids the combinatorial
      blowup of full permutations while still optimizing the start point).

Distances between every pair of stops are computed ONCE up front (a
distance matrix) using the common routing engine, then permutations/
heuristics just look values up — so we never re-hit the routing API
for the same pair twice.
"""

import itertools
from typing import List, Dict, Tuple

from agrioptima.logistics.routing import get_distance_km, validate_latlon

PERMUTATION_LIMIT = 8  # farmers count at/below which brute force is used


def build_distance_matrix(points: List[Dict]) -> Dict[Tuple[int, int], dict]:
    """
    points: list of {"name": str, "latlon": (lat, lon)}
    Returns {(i, j): route_dict} for every unordered pair (i < j), mirrored
    so matrix[(i, j)] == matrix[(j, i)] (driving distance treated as
    symmetric — a reasonable approximation for planning purposes).
    """
    for p in points:
        validate_latlon(p["latlon"], p["name"])

    matrix: Dict[Tuple[int, int], dict] = {}
    n = len(points)
    for i in range(n):
        for j in range(i + 1, n):
            route = get_distance_km(
                origin=points[i]["name"],
                destination=points[j]["name"],
                origin_latlon=points[i]["latlon"],
                dest_latlon=points[j]["latlon"],
            )
            matrix[(i, j)] = route
            matrix[(j, i)] = route
    return matrix


def _route_distance(order: List[int], matrix: Dict[Tuple[int, int], dict]) -> float:
    total = 0.0
    for a, b in zip(order, order[1:]):
        total += matrix[(a, b)]["distance_km"]
    return total


def _route_duration(order: List[int], matrix: Dict[Tuple[int, int], dict]) -> float:
    total = 0.0
    for a, b in zip(order, order[1:]):
        total += matrix[(a, b)]["duration_hr"]
    return total


def _brute_force_best_order(farmer_indices: List[int], buyer_index: int,
                             matrix: Dict[Tuple[int, int], dict]) -> List[int]:
    best_order, best_distance = None, float("inf")
    for perm in itertools.permutations(farmer_indices):
        order = list(perm) + [buyer_index]
        dist = _route_distance(order, matrix)
        if dist < best_distance:
            best_distance, best_order = dist, order
    return best_order


def _nearest_neighbor_from(start: int, farmer_indices: List[int], buyer_index: int,
                            matrix: Dict[Tuple[int, int], dict]) -> List[int]:
    remaining = [f for f in farmer_indices if f != start]
    order = [start]
    current = start
    while remaining:
        nxt = min(remaining, key=lambda f: matrix[(current, f)]["distance_km"])
        order.append(nxt)
        remaining.remove(nxt)
        current = nxt
    order.append(buyer_index)
    return order


def _multi_start_nearest_neighbor(farmer_indices: List[int], buyer_index: int,
                                   matrix: Dict[Tuple[int, int], dict]) -> List[int]:
    """Tries Nearest-Neighbor starting from each farmer, keeps the shortest result."""
    best_order, best_distance = None, float("inf")
    for start in farmer_indices:
        order = _nearest_neighbor_from(start, farmer_indices, buyer_index, matrix)
        dist = _route_distance(order, matrix)
        if dist < best_distance:
            best_distance, best_order = dist, order
    return best_order


def optimize_pickup_route(farmers: List[Dict], destination: Dict) -> dict:
    """
    farmers: list of {"name": str, "latlon": (lat, lon), "quantity_kg": float}
    destination: {"name": str, "latlon": (lat, lon)}  (buyer OR collection hub)

    Returns:
        {
            "order": [farmer_name, farmer_name, ..., destination_name],
            "total_distance_km": ...,
            "total_duration_hr": ...,
            "legs": [{"from": ..., "to": ..., "distance_km": ..., "duration_hr": ..., "source": ...}, ...],
            "method": "brute_force" | "nearest_neighbor_multi_start",
        }
    """
    if not farmers:
        raise ValueError("optimize_pickup_route requires at least one farmer")

    points = list(farmers) + [destination]
    buyer_index = len(points) - 1
    farmer_indices = list(range(len(farmers)))

    matrix = build_distance_matrix(points)

    if len(farmers) <= PERMUTATION_LIMIT:
        order = _brute_force_best_order(farmer_indices, buyer_index, matrix)
        method = "brute_force"
    else:
        order = _multi_start_nearest_neighbor(farmer_indices, buyer_index, matrix)
        method = "nearest_neighbor_multi_start"

    legs = []
    for a, b in zip(order, order[1:]):
        r = matrix[(a, b)]
        legs.append({
            "from": points[a]["name"],
            "to": points[b]["name"],
            "distance_km": round(r["distance_km"], 1),
            "duration_hr": round(r["duration_hr"], 2),
            "source": r["source"],
        })

    return {
        "order": [points[i]["name"] for i in order],
        "total_distance_km": round(_route_distance(order, matrix), 1),
        "total_duration_hr": round(_route_duration(order, matrix), 2),
        "legs": legs,
        "method": method,
    }
