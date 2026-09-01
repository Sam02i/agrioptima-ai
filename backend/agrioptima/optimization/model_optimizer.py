"""
AgriOptima AI — Model Comparison & Recommendation Engine

Scores Model 1 / Model 2 / (optional) Model 3 against each other on:

    0.45 x Cost Score
    0.15 x ETA Score
    0.15 x Vehicle Utilisation Score
    0.10 x Trip Score
    0.10 x Handling Score
    0.05 x Route Efficiency Score

Every sub-score is normalised to 0-100 RELATIVE to the models being
compared (best of the group = 100), since there's no fixed absolute
scale for "good cost per kg" across arbitrary crops/routes — what
matters here is which of the AVAILABLE options is best.

    Cost / ETA / Trips / Handling / Route distance: LOWER is better.
    Vehicle utilisation: HIGHER is better (closer to full truck).
"""

from typing import Dict, List

WEIGHTS = {
    "cost": 0.45,
    "eta": 0.15,
    "utilisation": 0.15,
    "trips": 0.10,
    "handling": 0.10,
    "route_efficiency": 0.05,
}


def _lower_is_better_score(value: float, values: List[float]) -> float:
    """100 for the best (lowest) value in the group, scaled down for worse ones."""
    best, worst = min(values), max(values)
    if best == worst:
        return 100.0
    return round(100 * (worst - value) / (worst - best), 1)


def _higher_is_better_score(value: float, values: List[float]) -> float:
    best, worst = max(values), min(values)
    if best == worst:
        return 100.0
    return round(100 * (value - worst) / (best - worst), 1)


def _score_model(model: dict, all_models: List[dict]) -> dict:
    costs = [m["cost_per_kg"] for m in all_models]
    etas = [m["eta_hours"] for m in all_models]
    utils = [m.get("weight_utilisation_pct", 0) for m in all_models]
    trips = [m.get("trips_required", 1) for m in all_models]
    handling = [m.get("handling_points", 1) for m in all_models]
    distances = [
        m.get("route_distance_km") or m.get("total_route_distance_km") or 0
        for m in all_models
    ]

    cost_score = _lower_is_better_score(model["cost_per_kg"], costs)
    eta_score = _lower_is_better_score(model["eta_hours"], etas)
    util_score = _higher_is_better_score(model.get("weight_utilisation_pct", 0), utils)
    trip_score = _lower_is_better_score(model.get("trips_required", 1), trips)
    handling_score = _lower_is_better_score(model.get("handling_points", 1), handling)
    route_score = _lower_is_better_score(
        model.get("route_distance_km") or model.get("total_route_distance_km") or 0, distances
    )

    overall = round(
        WEIGHTS["cost"] * cost_score
        + WEIGHTS["eta"] * eta_score
        + WEIGHTS["utilisation"] * util_score
        + WEIGHTS["trips"] * trip_score
        + WEIGHTS["handling"] * handling_score
        + WEIGHTS["route_efficiency"] * route_score,
        1,
    )

    return {
        "model": model["model"],
        "cost_score": cost_score,
        "eta_score": eta_score,
        "utilisation_score": util_score,
        "trip_score": trip_score,
        "handling_score": handling_score,
        "route_efficiency_score": route_score,
        "overall_score": overall,
    }


def _build_reason(winner: dict, others: List[dict]) -> str:
    reasons = {
        "MODEL_1_DIRECT": (
            "There is only one farmer (or farmers are too far apart to share "
            "a route economically), so shipping direct without any "
            "consolidation is cheapest overall."
        ),
        "MODEL_2_MULTI_FARMER_DIRECT": (
            "Farmers are geographically close together and one truck can "
            "collect all produce before direct delivery. This avoids the "
            "additional collection hub handling cost."
        ),
        "MODEL_3_COLLECTION_HUB": (
            "Farmers are geographically spread out, so consolidating at a "
            "collection hub and running one large truck to the buyer is "
            "cheaper than either a multi-stop pickup or shipping every "
            "farmer's truck independently."
        ),
    }
    return reasons.get(winner["model"], "This model produced the lowest overall logistics cost per kg.")


def compare_logistics_models(models: List[dict]) -> dict:
    """
    models: list of 1-3 result dicts from calculate_model_1/2/3
            (each must at least have: model, cost_per_kg, eta_hours,
            trips_required, handling_points, weight_utilisation_pct,
            and either route_distance_km or total_route_distance_km).

    Returns the ranked scores plus a recommendation with savings vs the
    other model(s). With only one model available (e.g. a single farmer,
    where Model 2/3 don't apply), that model wins by default — there is
    nothing to compare it against.
    """
    if not models:
        raise ValueError("compare_logistics_models needs at least 1 model to compare")

    if len(models) == 1:
        only = models[0]
        return {
            "scores": [{
                "model": only["model"], "cost_score": 100.0, "eta_score": 100.0,
                "utilisation_score": 100.0, "trip_score": 100.0,
                "handling_score": 100.0, "route_efficiency_score": 100.0,
                "overall_score": 100.0,
            }],
            "recommended_model": {
                "name": only["model"],
                "reason": (
                    "Only one farmer is in this shipment, so Model 2 (multi-farmer "
                    "pickup) and Model 3 (collection hub) don't apply — direct "
                    "farmer-to-buyer is the only option."
                ),
                "total_cost": only["total_cost"],
                "cost_per_kg": only["cost_per_kg"],
                "overall_score": 100.0,
            },
        }

    scores = [_score_model(m, models) for m in models]
    scores_by_model = {s["model"]: s for s in scores}

    winner_score = max(scores, key=lambda s: s["overall_score"])
    winner = next(m for m in models if m["model"] == winner_score["model"])
    others = [m for m in models if m["model"] != winner["model"]]

    savings = {}
    for other in others:
        key = f"savings_vs_{other['model'].split('_')[0].lower()}_{other['model'].split('_')[1].lower()}"
        savings[f"savings_vs_{other['model']}"] = round(
            (other["cost_per_kg"] - winner["cost_per_kg"]) * winner["total_quantity_kg"], 2
        )

    return {
        "scores": scores,
        "recommended_model": {
            "name": winner["model"],
            "reason": _build_reason(winner, others),
            "total_cost": winner["total_cost"],
            "cost_per_kg": winner["cost_per_kg"],
            "overall_score": winner_score["overall_score"],
        },
        **savings,
    }
