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
        price_opportunity = 50  # neutral fallback
        mandi_status = "unavailable"

        mandi_result = await fetch_mandi_records(commodity=crop["crop"], district=profile.get("district"))
        if mandi_result and mandi_result.get("records"):
            try:
                modal_prices = [float(r.get("modal_price", 0)) for r in mandi_result["records"] if r.get("modal_price")]
                if modal_prices:
                    latest_modal_price = modal_prices[0]
                    median_price = sorted(modal_prices)[len(modal_prices) // 2]
                    if median_price > 0:
                        pct_above_median = (latest_modal_price - median_price) / median_price * 100
                        price_opportunity = max(0, min(100, round(50 + pct_above_median * 2)))
                        mandi_status = "live"
                        live_signal_count += 1
            except (ValueError, TypeError, ZeroDivisionError):
                price_opportunity = 50
                mandi_status = "unavailable"

        parts = {
            "soil_fit": soil_fit(profile, crop),
            "climate_fit": climate_fit(average_temp),
            "water_fit": water_fit(profile["irrigation"], crop["water_requirement"]),
            "buyer_demand": 50,       # neutral until real RFQ data exists
            "price_opportunity": price_opportunity,
            "profitability": 50,      # neutral until real cost/price data available
            "saturation_risk": 30,    # neutral baseline
        }

        score = crop_opportunity_score(parts)
        conf = confidence(parts, live_signal_count, profile["soil_source"])

        reason_codes = []
        explanations = []
        sources = []

        if parts["soil_fit"] >= 70:
            reason_codes.append("SOIL_COMPATIBLE")
            explanations.append(f"Soil nutrient levels meet or exceed {crop['crop']}'s minimum requirements.")
        if weather_status == "live":
            reason_codes.append("LIVE_WEATHER_USED")
            explanations.append("Live weather forecast was used to assess climate fit.")
        if mandi_status == "live":
            reason_codes.append("LIVE_MANDI_PRICE_USED")
            explanations.append("Recent mandi price data was used to assess price opportunity.")
        else:
            reason_codes.append("MANDI_PRICE_UNAVAILABLE")
            explanations.append("Live mandi price data was unavailable; a neutral price score was used instead.")

        sources.append({"provider": profile["soil_source"], "type": "soil"})
        sources.append({"provider": "open_meteo", "status": weather_status})
        sources.append({"provider": "data_gov_india_agmarknet", "status": mandi_status})

        recommendations.append({
            "crop": crop["crop"],
            "opportunity_score": score,
            "confidence": conf,
            "score_breakdown": parts,
            "reference_yield_kg_per_acre": crop["reference_yield_kg_per_acre"],
            "reason_codes": reason_codes,
            "explanations": explanations,
            "sources": sources,
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