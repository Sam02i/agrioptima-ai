import json
import os
from pathlib import Path

from app.services.eligibility import evaluate_eligibility
from app.services.score import (
    crop_opportunity_score,
    confidence,
    soil_fit,
    water_fit,
    climate_fit,
)
from app.adapters.open_meteo import fetch_open_meteo
from app.adapters.data_gov_mandi import fetch_mandi_records

CROP_DATA_PATH = Path(__file__).parent.parent / "data" / "crop_profiles.v1.json"


def load_crop_profiles() -> list[dict]:
    with open(CROP_DATA_PATH) as f:
        return json.load(f)


async def build_recommendation(profile: dict) -> dict:
    crops = load_crop_profiles()

    eligible_crops = []
    rejected_crops = []

    # Step 1: run hard eligibility for every crop
    for crop in crops:
        rejection = evaluate_eligibility(profile, crop)
        if rejection:
            rejected_crops.append({
                "crop": rejection.crop,
                "rejection_codes": rejection.codes,
                "explanation": rejection.explanation,
            })
        else:
            eligible_crops.append(crop)

    # Step 2: fetch live weather once (shared across all eligible crops for this farm)
    live_signal_count = 0
    average_temp = 27.0  # neutral fallback if weather is unavailable
    weather_status = "unavailable"

    if profile.get("latitude") is not None and profile.get("longitude") is not None:
        try:
            weather = await fetch_open_meteo(profile["latitude"], profile["longitude"])
            temps = weather["daily_temperature_max_c"]
            average_temp = sum(temps) / len(temps)
            weather_status = "live"
            live_signal_count += 1
        except Exception:
            weather_status = "unavailable"

    # Step 3: score each eligible crop
    recommendations = []
    for crop in eligible_crops:
        parts = {
            "soil_fit": soil_fit(profile, crop),
            "climate_fit": climate_fit(average_temp),
            "water_fit": water_fit(profile["irrigation"], crop["water_requirement"]),
            "buyer_demand": 50,       # neutral until real RFQ data exists
            "price_opportunity": 50,  # neutral until mandi data is wired in
            "profitability": 50,      # neutral until real cost/price data available
            "saturation_risk": 30,    # neutral baseline
        }

        score = crop_opportunity_score(parts)
        conf = confidence(parts, live_signal_count, profile["soil_source"])

        recommendations.append({
            "crop": crop["crop"],
            "opportunity_score": score,
            "confidence": conf,
            "score_breakdown": parts,
            "reference_yield_kg_per_acre": crop["reference_yield_kg_per_acre"],
        })

    # Step 4: sort best-first, keep top 5
    recommendations.sort(key=lambda r: r["opportunity_score"], reverse=True)
    recommendations = recommendations[:5]

    return {
        "season": profile["season"],
        "data_status": {
            "weather": weather_status,
            "soil": profile["soil_source"],
        },
        "recommendations": recommendations,
        "rejected": rejected_crops,
    }