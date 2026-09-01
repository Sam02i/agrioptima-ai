import json
import asyncio
from pathlib import Path

from app.services.eligibility import evaluate_eligibility
from app.services.score import (
    crop_opportunity_score,
    confidence,
    soil_fit,
    water_fit,
    climate_fit,
    climate_fit_from_nasa,
    buyer_demand_score,
    price_opportunity_score,
    profitability_score,
    saturation_risk_score,
    rainfall_fit,
    generate_climate_context,
)
from app.adapters.open_meteo import fetch_open_meteo
from app.adapters.data_gov_mandi import fetch_mandi_records
from app.adapters.nasa_power import fetch_nasa_power

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

    # Step 2: fetch all live data in parallel
    has_coords = (
        profile.get("latitude") is not None
        and profile.get("longitude") is not None
    )

    # Build parallel tasks
    tasks = {}
    live_signal_count = 0

    # Weather (Open-Meteo forecast)
    if has_coords:
        tasks["weather"] = asyncio.create_task(
            fetch_open_meteo(profile["latitude"], profile["longitude"])
        )

    # Historical climate (NASA POWER — 30-day average)
    if has_coords:
        tasks["nasa"] = asyncio.create_task(
            fetch_nasa_power(profile["latitude"], profile["longitude"])
        )

    # Mandi data for each eligible crop
    mandi_tasks = {}
    for crop in eligible_crops:
        task = asyncio.create_task(
            fetch_mandi_records(
                commodity=crop["crop"],
                district=profile.get("district"),
            )
        )
        mandi_tasks[crop["crop"]] = task

    # Step 3: collect weather results
    average_temp = 27.0
    weather_status = "unavailable"
    nasa_data = None

    if "weather" in tasks:
        try:
            weather = await tasks["weather"]
            temps = weather["daily_temperature_max_c"]
            average_temp = sum(temps) / len(temps)
            weather_status = "live"
            live_signal_count += 1
        except Exception:
            weather_status = "unavailable"

    if "nasa" in tasks:
        try:
            nasa_data = await tasks["nasa"]
            if nasa_data and nasa_data.get("average_temperature_c"):
                live_signal_count += 1
        except Exception:
            nasa_data = None

    # Step 4: collect mandi results
    mandi_results = {}
    for crop_name, task in mandi_tasks.items():
        try:
            result = await task
            mandi_results[crop_name] = result
            if result and result.get("records"):
                live_signal_count += 1
        except Exception:
            mandi_results[crop_name] = None    # Step 4b: extract rainfall from NASA data
    actual_rainfall_mm = None
    if nasa_data and nasa_data.get("total_precipitation_mm") is not None:
        actual_rainfall_mm = nasa_data["total_precipitation_mm"]

    # Step 4c: generate climate context (the reasoning layer)
    climate_context = generate_climate_context(
        actual_rainfall_mm, average_temp, eligible_crops, profile["season"]
    )

    # Step 5: score each eligible crop
    state = profile.get("state")
    recommendations = []

    for crop in eligible_crops:
        crop_name = crop["crop"]
        mandi_result = mandi_results.get(crop_name)

        # Climate: prefer NASA 30-day, fallback to Open-Meteo 7-day
        nasa_climate = climate_fit_from_nasa(nasa_data, crop) if nasa_data else None
        if nasa_climate is not None:
            climate_score = nasa_climate
            climate_source = "nasa_power"
        else:
            climate_score = climate_fit(average_temp, crop)
            climate_source = "open_meteo" if weather_status == "live" else "default"

        # Rainfall fit: how well does this crop match actual rainfall?
        r_fit = 50  # default when no data
        if actual_rainfall_mm is not None:
            season_months = 5 if profile["season"] in ("Kharif", "Rabi") else 3
            r_fit = rainfall_fit(actual_rainfall_mm, crop, season_months)

        # Demand from mandi arrivals
        demand = buyer_demand_score(mandi_result, crop)

        # Price opportunity from mandi prices
        price_opp = price_opportunity_score(mandi_result)

        # Profitability from yield/price/cost
        profit = profitability_score(crop, state)

        # Saturation risk from mandi arrivals
        saturation = saturation_risk_score(mandi_result)

        parts = {
            "soil_fit": soil_fit(profile, crop),
            "climate_fit": climate_score,
            "water_fit": water_fit(profile["irrigation"], crop["water_requirement"]),
            "buyer_demand": demand,
            "price_opportunity": price_opp,
            "profitability": profit,
            "saturation_risk": saturation,
            "rainfall_fit": r_fit,
        }

        score = crop_opportunity_score(parts)
        conf = confidence(parts, live_signal_count, profile["soil_source"])

        # Build reason codes and explanations
        reason_codes = []
        explanations = []

        # --- RAINFALL-AWARE REASONING ---
        rainfall_status = climate_context["rainfall_status"]
        preferred = climate_context["preferred_crops"]
        caution = climate_context["caution_crops"]

        if rainfall_status in ("well_below_normal", "below_normal") and crop_name in preferred:
            reason_codes.append("RAINFALL_FAVORED")
            explanations.append(
                f"Rainfall is {rainfall_status.replace('_', ' ')} this season ("
                f"~{actual_rainfall_mm:.0f}mm in 30 days). {crop_name} needs only "
                f"{crop.get('water_requirement', 'medium')} water, making it a strong choice "
                f"when rain is scarce."
            )
        elif rainfall_status in ("well_below_normal", "below_normal") and crop_name in caution:
            reason_codes.append("RAINFALL_RISK")
            explanations.append(
                f"Rainfall is {rainfall_status.replace('_', ' ')} this season. "
                f"{crop_name} needs {crop.get('water_requirement', 'medium')} water "
                f"({crop.get('optimal_rainfall_mm', '?')}mm optimal), which may be hard to "
                f"meet without irrigation."
            )
        elif rainfall_status == "above_normal" and crop_name in preferred:
            reason_codes.append("RAINFALL_FAVORED")
            explanations.append(
                f"Rainfall is above normal this season (~{actual_rainfall_mm:.0f}mm in 30 days). "
                f"{crop_name} benefits from abundant water and should thrive."
            )

        # --- SOIL REASONING ---
        if parts["soil_fit"] >= 70:
            reason_codes.append("SOIL_COMPATIBLE")
            explanations.append(
                f"Soil nutrient levels meet or exceed {crop_name}'s minimum requirements."
            )
        elif parts["soil_fit"] < 40:
            reason_codes.append("SOIL_DEFICIENT")
            explanations.append(
                f"Soil nutrients are below {crop_name}'s minimum requirements. "
                f"Supplementation of N/P/K may be needed."
            )

        # --- DATA SOURCE REASONING ---
        if weather_status == "live":
            reason_codes.append("LIVE_WEATHER_USED")
            explanations.append("Live weather forecast was used to assess climate fit.")

        if climate_source == "nasa_power":
            reason_codes.append("NASA_CLIMATE_DATA_USED")
            explanations.append("30-day historical climate data from NASA POWER was used for robust climate scoring.")

        if mandi_result and mandi_result.get("records"):
            reason_codes.append("LIVE_MANDI_DATA_USED")
            explanations.append("Live mandi arrival and price data was used for demand and price scoring.")
        else:
            reason_codes.append("MANDI_DATA_UNAVAILABLE")
            explanations.append("Mandi data was unavailable; national averages were used.")

        # --- ECONOMIC REASONING ---
        if profit >= 70:
            reason_codes.append("HIGH_PROFITABILITY")
            explanations.append(f"Strong expected profit margin based on {crop_name} yields and market prices.")

        if saturation >= 60:
            reason_codes.append("SATURATION_RISK")
            explanations.append("High mandi arrivals suggest possible oversupply in nearby markets.")

        # --- WATER FIT REASONING ---
        if parts["water_fit"] >= 90 and crop.get("water_requirement") == "low":
            reason_codes.append("WATER_EFFICIENT")
            explanations.append(
                f"{crop_name} has low water needs ({crop.get('optimal_rainfall_mm', '?')}mm), "
                f"matching your {profile['irrigation']} irrigation setup well."
            )

        # Sources
        sources = [
            {"provider": profile["soil_source"], "type": "soil"},
            {"provider": "open_meteo", "status": weather_status},
            {"provider": "nasa_power", "status": "live" if nasa_data else "unavailable"},
            {"provider": "data_gov_india_agmarknet", "status": "live" if mandi_result else "unavailable"},
        ]

        # Calculate expected profit per acre
        state_yields = crop.get("state_yields", {})
        yield_kg = state_yields.get(state, crop.get("reference_yield_kg_per_acre", 0))
        price_per_q = crop.get("national_avg_price_rs_per_quintal", 0)
        cost_per_acre = crop.get("cost_of_cultivation_rs_per_acre", 0)
        revenue_per_acre = (yield_kg / 100) * price_per_q
        profit_per_acre = revenue_per_acre - cost_per_acre

        recommendations.append({
            "crop": crop_name,
            "opportunity_score": score,
            "confidence": conf,
            "score_breakdown": parts,
            "reference_yield_kg_per_acre": yield_kg,
            "expected_revenue_rs_per_acre": round(revenue_per_acre),
            "expected_profit_rs_per_acre": round(profit_per_acre),
            "cost_of_cultivation_rs_per_acre": cost_per_acre,
            "reason_codes": reason_codes,
            "explanations": explanations,
            "sources": sources,
        })

    # Step 6: sort best-first, keep top 5
    recommendations.sort(key=lambda r: r["opportunity_score"], reverse=True)
    recommendations = recommendations[:5]

    return {
        "season": profile["season"],
        "climate_context": climate_context,
        "data_status": {
            "weather": weather_status,
            "nasa_climate": "live" if nasa_data else "unavailable",
            "soil": profile["soil_source"],
        },
        "recommendations": recommendations,
        "rejected": rejected_crops,
    }
