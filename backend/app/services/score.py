
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


def confidence(parts: dict[str, int], live_signal_count: int, soil_source: str) -> int:
    # Confidence means evidence completeness and fit, not success probability.
    source_bonus = 10 if soil_source in {"soil_health_card", "lab_report"} else 0
    live_bonus = min(10, live_signal_count * 3)
    farm_fit = (parts["soil_fit"] + parts["climate_fit"] + parts["water_fit"]) / 3
    return clamp(55 + farm_fit * 0.25 + source_bonus + live_bonus)