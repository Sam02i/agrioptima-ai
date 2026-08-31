def clamp(value: float) -> int:
    return round(max(0, min(100, value)))


def crop_opportunity_score(parts: dict[str, int]) -> int:
    """Weighted composite score from 8 signals."""
    return clamp(
        parts["soil_fit"] * 0.22
        + parts["climate_fit"] * 0.18
        + parts["water_fit"] * 0.12
        + parts["rainfall_fit"] * 0.10
        + parts["buyer_demand"] * 0.15
        + parts["price_opportunity"] * 0.10
        + parts["profitability"] * 0.10
        - parts["saturation_risk"] * 0.05
    )


def soil_fit(profile: dict, crop: dict) -> int:
    """How well N/P/K compare to the crop's minimum requirement."""
    n_ratio = min(1.0, profile["nitrogen"] / crop["minimum_n"]) if crop["minimum_n"] else 1.0
    p_ratio = min(1.0, profile["phosphorus"] / crop["minimum_p"]) if crop["minimum_p"] else 1.0
    k_ratio = min(1.0, profile["potassium"] / crop["minimum_k"]) if crop["minimum_k"] else 1.0
    return clamp((n_ratio + p_ratio + k_ratio) / 3 * 100)


def water_fit(profile_irrigation: str, crop_water_requirement: str) -> int:
    irrigation_rank = {"none": 0, "limited": 2, "adequate": 3}
    water_rank = {"low": 1, "medium": 2, "high": 3}
    farm_level = irrigation_rank[profile_irrigation]
    crop_need = water_rank[crop_water_requirement]
    if farm_level >= crop_need:
        return 100
    return clamp(60 + (farm_level - crop_need) * 20)


def climate_fit(average_temp_c: float, crop: dict) -> int:
    """Climate fit using crop-specific ideal temperature range."""
    ideal_min = crop.get("ideal_temp_min_c", 20)
    ideal_max = crop.get("ideal_temp_max_c", 35)
    if ideal_min <= average_temp_c <= ideal_max:
        return 100
    distance = min(abs(average_temp_c - ideal_min), abs(average_temp_c - ideal_max))
    return max(0, round(100 - distance * 8))


def climate_fit_from_nasa(nasa_data: dict, crop: dict) -> int:
    """
    Use NASA POWER 30-day historical data for a more robust climate score.
    Falls back to basic climate_fit if NASA data is unavailable.
    """
    if not nasa_data or nasa_data.get("average_temperature_c") is None:
        return None
    avg = nasa_data["average_temperature_c"]
    return climate_fit(avg, crop)


def buyer_demand_score(mandi_data: dict | None, crop: dict) -> int:
    """
    Estimate buyer demand from mandi market breadth.
    
    Logic: More mandis actively trading a crop = broader buyer demand.
    Base score from national demand pattern, adjusted by market count.
    """
    base = crop.get("demand_score_base", 50)

    if not mandi_data or not mandi_data.get("records"):
        return base

    records = mandi_data["records"]
    unique_markets = len(set(r.get("market", "") for r in records if r.get("market")))
    
    # More markets actively trading = stronger demand signal
    if unique_markets >= 50:
        return min(95, base + 20)  # Very broad market
    elif unique_markets >= 20:
        return min(90, base + 15)  # Good market breadth
    elif unique_markets >= 5:
        return min(85, base + 10)  # Moderate market
    elif unique_markets >= 1:
        return base                 # Limited data, use baseline
    else:
        return max(20, base - 20)


def price_opportunity_score(mandi_data: dict | None) -> int:
    """
    Price opportunity: is the current price above or below the median?
    Above median = good time to sell = higher score.
    """
    if not mandi_data or not mandi_data.get("records"):
        return 50

    records = mandi_data["records"]
    modal_prices = []
    for r in records:
        try:
            price = float(r.get("modal_price", 0))
            if price > 0:
                modal_prices.append(price)
        except (ValueError, TypeError):
            continue

    if len(modal_prices) < 2:
        return 50

    latest = modal_prices[0]
    median = sorted(modal_prices)[len(modal_prices) // 2]
    
    if median <= 0:
        return 50

    pct_above = (latest - median) / median * 100
    return clamp(50 + pct_above * 2)


def profitability_score(crop: dict, state: str | None = None) -> int:
    """
    Profitability based on:
    - Expected yield (state-specific if available, else reference)
    - Market price
    - Cost of cultivation
    
    Returns 0-100 score where higher = better profit margin.
    """
    price = crop.get("national_avg_price_rs_per_quintal", 0)
    cost = crop.get("cost_of_cultivation_rs_per_acre", 1)
    
    # Use state yield if available, else reference
    state_yields = crop.get("state_yields", {})
    if state and state in state_yields:
        yield_kg = state_yields[state]
    else:
        yield_kg = crop.get("reference_yield_kg_per_acre", 0)

    if cost <= 0 or yield_kg <= 0 or price <= 0:
        return 50

    # Revenue = yield (quintals) * price per quintal
    yield_quintals = yield_kg / 100
    revenue = yield_quintals * price
    profit = revenue - cost
    margin_pct = (profit / cost) * 100 if cost > 0 else 0

    # Scale: -20% margin = 0 score, 0% = 40, 50%+ margin = 90-100
    if margin_pct < -20:
        return 0
    elif margin_pct < 0:
        return clamp(20 + (margin_pct + 20) * 1)
    elif margin_pct < 50:
        return clamp(40 + margin_pct * 1)
    else:
        return clamp(90 + min(10, (margin_pct - 50) * 0.2))


def saturation_risk_score(mandi_data: dict | None) -> int:
    """
    Saturation risk based on price spread across markets.
    Wide price spread = volatile/uncertain market = higher risk.
    Narrow spread = stable market = lower risk.
    Score 0-100 where higher = more saturated (hurts the overall score).
    """
    if not mandi_data or not mandi_data.get("records"):
        return 30  # Neutral when no data

    records = mandi_data["records"]
    modal_prices = []
    for r in records:
        try:
            p = float(r.get("modal_price", 0))
            if p > 0:
                modal_prices.append(p)
        except (ValueError, TypeError):
            continue

    if len(modal_prices) < 3:
        return 30

    min_p = min(modal_prices)
    max_p = max(modal_prices)
    median_p = sorted(modal_prices)[len(modal_prices) // 2]
    
    if median_p <= 0:
        return 30

    # Price spread ratio: (max - min) / median
    spread = (max_p - min_p) / median_p if median_p > 0 else 0
    
    # Wide spread = volatile market = higher saturation risk
    if spread > 3.0:
        return 70  # Very volatile
    elif spread > 2.0:
        return 55  # Volatile
    elif spread > 1.0:
        return 40  # Moderate
    elif spread > 0.5:
        return 25  # Stable
    else:
        return 15  # Very stable


def rainfall_fit(actual_rainfall_mm: float, crop: dict, season_months: int = 3) -> int:
    """
    Score how well actual rainfall matches a crop's water needs.
    
    actual_rainfall_mm: total rainfall in the recent period (e.g., 30 days from NASA)
    crop: crop profile with optimal_rainfall_mm (annual)
    season_months: how many months remain in the growing season
    
    Returns 0-100 where higher = crop's water needs match current rainfall.
    """
    optimal = crop.get("optimal_rainfall_mm", 500)
    if optimal <= 0:
        return 50

    # Extrapolate 30-day rainfall to seasonal
    estimated_seasonal = actual_rainfall_mm * (season_months * 30 / 30)
    ratio = estimated_seasonal / optimal if optimal > 0 else 1.0

    # Perfect match: ratio near 1.0
    if 0.8 <= ratio <= 1.2:
        return 95
    elif 0.6 <= ratio <= 1.4:
        return 80
    elif 0.4 <= ratio <= 1.6:
        return 60
    elif 0.2 <= ratio <= 1.8:
        return 40
    else:
        return 20


def generate_climate_context(
    actual_rainfall_mm: float | None,
    average_temp_c: float,
    eligible_crops: list[dict],
    season: str,
) -> dict:
    """
    Analyze actual weather vs crop needs and generate a human-readable context.
    This is the 'reasoning layer' that explains WHY certain crops are preferred.
    """
    context = {
        "rainfall_status": "unknown",
        "rainfall_mm": actual_rainfall_mm,
        "temperature_status": "normal",
        "temperature_c": average_temp_c,
        "key_insight": "",
        "preferred_crops": [],
        "caution_crops": [],
    }

    if actual_rainfall_mm is None:
        context["key_insight"] = "Weather data unavailable. Recommendations based on general agronomic rules."
        return context

    # Categorize rainfall: 30-day → extrapolate to seasonal
    # Kharif (Jun-Oct) ≈ 5 months, Rabi (Nov-Mar) ≈ 5 months
    season_months = 5 if season in ("Kharif", "Rabi") else 3
    estimated_seasonal = actual_rainfall_mm * season_months

    # Compare to median optimal of eligible crops
    optimal_values = [c.get("optimal_rainfall_mm", 500) for c in eligible_crops]
    median_optimal = sorted(optimal_values)[len(optimal_values) // 2] if optimal_values else 500

    if estimated_seasonal < median_optimal * 0.6:
        context["rainfall_status"] = "well_below_normal"
        context["key_insight"] = (
            f"Rainfall is significantly below normal this season (estimated {estimated_seasonal:.0f}mm vs typical {median_optimal:.0f}mm). "
            f"Low-water crops are strongly preferred. Avoid water-heavy crops like Paddy and Sugarcane."
        )
        # Prefer low-water crops
        context["preferred_crops"] = [
            c["crop"] for c in eligible_crops
            if c.get("water_requirement") == "low"
        ]
        context["caution_crops"] = [
            c["crop"] for c in eligible_crops
            if c.get("water_requirement") == "high"
        ]
    elif estimated_seasonal < median_optimal * 0.85:
        context["rainfall_status"] = "below_normal"
        context["key_insight"] = (
            f"Rainfall is slightly below normal (estimated {estimated_seasonal:.0f}mm vs typical {median_optimal:.0f}mm). "
            f"Prefer crops with low-to-medium water needs."
        )
        context["preferred_crops"] = [
            c["crop"] for c in eligible_crops
            if c.get("water_requirement") in ("low", "medium")
        ]
    elif estimated_seasonal > median_optimal * 1.3:
        context["rainfall_status"] = "above_normal"
        context["key_insight"] = (
            f"Rainfall is above normal this season (estimated {estimated_seasonal:.0f}mm vs typical {median_optimal:.0f}mm). "
            f"Water-heavy crops like Paddy and Sugarcane will thrive. Drainage-sensitive crops may face waterlogging risk."
        )
        context["preferred_crops"] = [
            c["crop"] for c in eligible_crops
            if c.get("water_requirement") == "high"
        ]
    else:
        context["rainfall_status"] = "near_normal"
        context["key_insight"] = (
            f"Rainfall is near normal this season (estimated {estimated_seasonal:.0f}mm, typical {median_optimal:.0f}mm). "
            f"Most crops should receive adequate water."
        )

    # Temperature context
    if average_temp_c > 38:
        context["temperature_status"] = "very_hot"
        context["key_insight"] += " Extreme heat may stress heat-sensitive crops."
    elif average_temp_c < 15:
        context["temperature_status"] = "cold"
        context["key_insight"] += " Cold conditions favor Rabi season crops."

    return context


def confidence(parts: dict[str, int], live_signal_count: int, soil_source: str) -> int:
    """How much evidence supports this recommendation."""
    source_bonus = 10 if soil_source in {"soil_health_card", "lab_report"} else 0
    live_bonus = min(15, live_signal_count * 4)
    farm_fit = (parts["soil_fit"] + parts["climate_fit"] + parts["water_fit"]) / 3
    return clamp(50 + farm_fit * 0.25 + source_bonus + live_bonus)
