
#? clamp() func just makes sure a score never goes below 0 or above 100, even if the math would push it outside that range

def clamp(value: float) -> int:
    return round(max(0, min(100, value)))

#? crop_opportunity_score() func takes 7 individual scores (each 0–100) and combines them using fixed weights (25% soil, 20% climate, etc.) into one final number

def crop_opportunity_score(parts: dict[str, int]) -> int:
    return clamp(
        parts["soil_fit"] * 0.25
        + parts["climate_fit"] * 0.20
        + parts["water_fit"] * 0.15
        + parts["buyer_demand"] * 0.15
        + parts["price_opportunity"] * 0.10
        + parts["profitability"] * 0.10
        - parts["saturation_risk"] * 0.05
    )

''' confidence() — separate from the opportunity score. It answers "how much do we actually trust this recommendation?" 
It goes up if: the farm's soil/climate/water fit is strong, the farmer gave real Soil Health Card data (not manual guess), 
and more live data sources were successfully fetched '''

def soil_fit(profile: dict, crop: dict) -> int:
    # How well N/P/K compare to the crop's minimum requirement.
    # 100 if the farm meets or exceeds all three minimums; scaled down if below.
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
    # Already passed eligibility, so this only runs for eligible crops — still scale gracefully
    return clamp(60 + (farm_level - crop_need) * 20)


def climate_fit(average_forecast_temperature_c: float, ideal_min: float = 20, ideal_max: float = 35) -> int:
    if ideal_min <= average_forecast_temperature_c <= ideal_max:
        return 100
    distance = min(abs(average_forecast_temperature_c - ideal_min), abs(average_forecast_temperature_c - ideal_max))
    return max(0, round(100 - distance * 12))
    
def confidence(parts: dict[str, int], live_signal_count: int, soil_source: str) -> int:
    # Confidence means evidence completeness and fit, not success probability.
    source_bonus = 10 if soil_source in {"soil_health_card", "lab_report"} else 0
    live_bonus = min(10, live_signal_count * 3)
    farm_fit = (parts["soil_fit"] + parts["climate_fit"] + parts["water_fit"]) / 3
    return clamp(55 + farm_fit * 0.25 + source_bonus + live_bonus)