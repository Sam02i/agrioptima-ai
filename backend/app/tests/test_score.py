import pytest
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


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

SAMPLE_PARTS = {
    "soil_fit": 90,
    "climate_fit": 80,
    "water_fit": 85,
    "rainfall_fit": 75,
    "buyer_demand": 70,
    "price_opportunity": 75,
    "profitability": 72,
    "saturation_risk": 30,
}

TOMATO_CROP = {
    "crop": "Tomato",
    "min_ph": 6.0, "max_ph": 7.0,
    "water_requirement": "medium",
    "minimum_n": 55, "minimum_p": 35, "minimum_k": 40,
    "ideal_temp_min_c": 20, "ideal_temp_max_c": 35,
    "demand_score_base": 75,
    "national_avg_price_rs_per_quintal": 2500,
    "cost_of_cultivation_rs_per_acre": 45000,
    "reference_yield_kg_per_acre": 9000,
    "state_yields": {"Maharashtra": 9500, "Karnataka": 8800},
}

WHEAT_CROP = {
    "crop": "Wheat",
    "min_ph": 6.0, "max_ph": 7.5,
    "water_requirement": "medium",
    "minimum_n": 50, "minimum_p": 25, "minimum_k": 20,
    "ideal_temp_min_c": 10, "ideal_temp_max_c": 25,
    "demand_score_base": 85,
    "national_avg_price_rs_per_quintal": 2250,
    "cost_of_cultivation_rs_per_acre": 28000,
    "reference_yield_kg_per_acre": 4800,
    "state_yields": {"Punjab": 5800},
}

HIGH_VALUE_CROP = {
    "crop": "Chilli",
    "demand_score_base": 80,
    "national_avg_price_rs_per_quintal": 12000,
    "cost_of_cultivation_rs_per_acre": 55000,
    "reference_yield_kg_per_acre": 2400,
    "state_yields": {"Andhra Pradesh": 3200},
}

LOSING_CROP = {
    "crop": "TestLosing",
    "national_avg_price_rs_per_quintal": 500,
    "cost_of_cultivation_rs_per_acre": 80000,
    "reference_yield_kg_per_acre": 1000,
    "state_yields": {},
}


# ---------------------------------------------------------------------------
# crop_opportunity_score
# ---------------------------------------------------------------------------

def test_opportunity_score_is_within_range():
    score = crop_opportunity_score(SAMPLE_PARTS)
    assert 0 <= score <= 100


def test_opportunity_score_matches_expected_value():
    score = crop_opportunity_score(SAMPLE_PARTS)
    # 90*.22 + 80*.18 + 85*.12 + 75*.10 + 70*.15 + 75*.10 + 72*.10 - 30*.05 = 75.6 -> 76
    assert score == 76


def test_opportunity_score_all_zeros():
    parts = {k: 0 for k in SAMPLE_PARTS}
    assert crop_opportunity_score(parts) == 0


def test_opportunity_score_all_hundred():
    parts = {k: 100 for k in SAMPLE_PARTS}
    # 100*(0.22+0.18+0.12+0.10+0.15+0.10+0.10) - 100*0.05 = 97 - 5 = 92
    assert crop_opportunity_score(parts) == 92


# ---------------------------------------------------------------------------
# confidence
# ---------------------------------------------------------------------------

def test_confidence_is_within_range():
    result = confidence(SAMPLE_PARTS, live_signal_count=2, soil_source="soil_health_card")
    assert 0 <= result <= 100


def test_confidence_higher_with_real_soil_source():
    with_card = confidence(SAMPLE_PARTS, live_signal_count=0, soil_source="soil_health_card")
    with_manual = confidence(SAMPLE_PARTS, live_signal_count=0, soil_source="manual_entry")
    assert with_card > with_manual


def test_confidence_increases_with_live_signals():
    low = confidence(SAMPLE_PARTS, live_signal_count=0, soil_source="manual_entry")
    high = confidence(SAMPLE_PARTS, live_signal_count=4, soil_source="soil_health_card")
    assert high > low


def test_confidence_live_bonus_caps_at_15():
    """Live signal bonus should not exceed 15."""
    c3 = confidence(SAMPLE_PARTS, live_signal_count=3, soil_source="manual_entry")
    c10 = confidence(SAMPLE_PARTS, live_signal_count=10, soil_source="manual_entry")
    # After 3 signals (12 bonus), adding more shouldn't add beyond 15
    assert c10 - c3 <= 5  # small difference from farm_fit rounding


# ---------------------------------------------------------------------------
# soil_fit
# ---------------------------------------------------------------------------

def test_soil_fit_perfect_when_all_met():
    profile = {"nitrogen": 60, "phosphorus": 40, "potassium": 50}
    assert soil_fit(profile, TOMATO_CROP) == 100


def test_soil_fit_scales_down_when_deficient():
    profile = {"nitrogen": 30, "phosphorus": 20, "potassium": 25}
    score = soil_fit(profile, TOMATO_CROP)
    # N: 30/55=0.545, P: 20/35=0.571, K: 25/40=0.625, avg=0.58 -> 58
    assert 55 <= score <= 60


def test_soil_fit_clamped_at_100_when_excess():
    profile = {"nitrogen": 200, "phosphorus": 150, "potassium": 120}
    assert soil_fit(profile, TOMATO_CROP) == 100


# ---------------------------------------------------------------------------
# water_fit
# ---------------------------------------------------------------------------

def test_water_fit_100_when_adequate():
    assert water_fit("adequate", "medium") == 100


def test_water_fit_100_when_limited_and_low():
    assert water_fit("limited", "low") == 100


def test_water_fit_penalty_when_insufficient():
    score = water_fit("limited", "high")
    # limited=2, high=3 -> 2 < 3, penalty applies
    assert score < 100


def test_water_fit_none_irrigation():
    score = water_fit("none", "medium")
    # none=0, medium=2 -> 0 < 2
    assert score < 100


# ---------------------------------------------------------------------------
# climate_fit
# ---------------------------------------------------------------------------

def test_climate_fit_perfect_in_range():
    crop = {"ideal_temp_min_c": 20, "ideal_temp_max_c": 35}
    assert climate_fit(28, crop) == 100


def test_climate_fit_drops_outside_range():
    crop = {"ideal_temp_min_c": 20, "ideal_temp_max_c": 35}
    score = climate_fit(45, crop)  # 10C above ideal max
    assert score < 100


def test_climate_fit_very_cold():
    crop = {"ideal_temp_min_c": 20, "ideal_temp_max_c": 35}
    score = climate_fit(0, crop)
    assert score == 0


def test_climate_fit_uses_crop_defaults():
    """When crop has no ideal temps, defaults to 20-35."""
    score_in = climate_fit(28, {})  # should be 100 (within 20-35)
    score_out = climate_fit(50, {})  # should be 0
    assert score_in == 100
    assert score_out == 0


# ---------------------------------------------------------------------------
# climate_fit_from_nasa
# ---------------------------------------------------------------------------

def test_climate_fit_from_nasa_valid_data():
    nasa = {"average_temperature_c": 28.5}
    score = climate_fit_from_nasa(nasa, TOMATO_CROP)
    assert score == 100  # 28.5 is within 20-35


def test_climate_fit_from_nasa_cold():
    nasa = {"average_temperature_c": 5.0}
    score = climate_fit_from_nasa(nasa, TOMATO_CROP)
    assert score < 50  # way below 20-35 range


def test_climate_fit_from_nasa_none_data():
    assert climate_fit_from_nasa(None, TOMATO_CROP) is None


def test_climate_fit_from_nasa_missing_temp():
    assert climate_fit_from_nasa({"other_field": 123}, TOMATO_CROP) is None


def test_climate_fit_from_nasa_wheat_in_winter():
    """Wheat likes 10-25C. NASA says 18C average — should be perfect."""
    nasa = {"average_temperature_c": 18.0}
    score = climate_fit_from_nasa(nasa, WHEAT_CROP)
    assert score == 100


# ---------------------------------------------------------------------------
# buyer_demand_score
# ---------------------------------------------------------------------------

def test_buyer_demand_no_data_returns_baseline():
    crop = {"demand_score_base": 75}
    assert buyer_demand_score(None, crop) == 75


def test_buyer_demand_broad_market():
    """50+ unique markets = very broad demand."""
    records = [{"market": f"Market_{i}"} for i in range(60)]
    mandi = {"records": records}
    crop = {"demand_score_base": 75}
    score = buyer_demand_score(mandi, crop)
    assert score == 95  # min(95, 75+20)


def test_buyer_demand_good_market():
    """20-49 markets = good demand."""
    records = [{"market": f"Market_{i}"} for i in range(30)]
    mandi = {"records": records}
    crop = {"demand_score_base": 75}
    score = buyer_demand_score(mandi, crop)
    assert score == 90  # min(90, 75+15)


def test_buyer_demand_moderate_market():
    """5-19 markets = moderate demand."""
    records = [{"market": f"Market_{i}"} for i in range(10)]
    mandi = {"records": records}
    crop = {"demand_score_base": 75}
    score = buyer_demand_score(mandi, crop)
    assert score == 85  # min(85, 75+10)


def test_buyer_demand_no_markets_in_records():
    """Records exist but no market field -> 0 unique markets -> reduced score."""
    records = [{"commodity": "Tomato", "modal_price": 100}]
    mandi = {"records": records}
    crop = {"demand_score_base": 75}
    score = buyer_demand_score(mandi, crop)
    # No market field -> unique_markets=0 -> max(20, 75-20) = 55
    assert score == 55


# ---------------------------------------------------------------------------
# price_opportunity_score
# ---------------------------------------------------------------------------

def test_price_opportunity_no_data():
    assert price_opportunity_score(None) == 50


def test_price_opportunity_single_record():
    mandi = {"records": [{"modal_price": 2000}]}
    assert price_opportunity_score(mandi) == 50


def test_price_opportunity_above_median():
    """Latest price above median = good opportunity."""
    records = [
        {"modal_price": 3000},
        {"modal_price": 1500},
        {"modal_price": 1600},
        {"modal_price": 1400},
    ]
    mandi = {"records": records}
    score = price_opportunity_score(mandi)
    assert score > 50


def test_price_opportunity_below_median():
    """Latest price below median = poor opportunity."""
    records = [
        {"modal_price": 800},
        {"modal_price": 2000},
        {"modal_price": 2100},
        {"modal_price": 1900},
    ]
    mandi = {"records": records}
    score = price_opportunity_score(mandi)
    assert score < 50


def test_price_opportunity_handles_bad_data():
    records = [
        {"modal_price": "not_a_number"},
        {"modal_price": 0},
        {"modal_price": 1500},
    ]
    mandi = {"records": records}
    assert price_opportunity_score(mandi) == 50  # only 1 valid price


# ---------------------------------------------------------------------------
# profitability_score
# ---------------------------------------------------------------------------

def test_profitability_with_state_yield():
    """Tomato in Maharashtra: 9500 kg/acre, Rs2500/q, cost Rs45000."""
    score = profitability_score(TOMATO_CROP, "Maharashtra")
    # revenue = 95 * 2500 = 237500, profit = 192500, margin = 427%
    assert score >= 90


def test_profitability_with_reference_yield():
    """When state not in state_yields, use reference."""
    score = profitability_score(TOMATO_CROP, "Bihar")
    # Bihar not in state_yields -> use reference 9000 kg/acre
    # revenue = 90 * 2500 = 225000, profit = 180000, margin = 400%
    assert score >= 90


def test_profitability_no_state():
    score = profitability_score(TOMATO_CROP, None)
    assert score >= 80  # still profitable with reference yield


def test_profitability_losing_money():
    """When cost > revenue, score should be low."""
    score = profitability_score(LOSING_CROP, None)
    # revenue = 10 * 500 = 5000, cost = 80000, margin = -93.75% -> 0
    assert score == 0


def test_profitability_breakeven():
    """Near breakeven should score around 40."""
    crop = {
        "national_avg_price_rs_per_quintal": 1000,
        "cost_of_cultivation_rs_per_acre": 100000,
        "reference_yield_kg_per_acre": 10000,
        "state_yields": {},
    }
    # revenue = 100 * 1000 = 100000, cost = 100000, margin = 0%
    score = profitability_score(crop, None)
    assert 35 <= score <= 45


def test_profitability_chilli_high_value():
    """Chilli: high price but moderate yield."""
    score = profitability_score(HIGH_VALUE_CROP, "Andhra Pradesh")
    # revenue = 32 * 12000 = 384000, cost = 55000, margin = 598%
    assert score >= 95


def test_profitability_missing_data():
    crop = {"national_avg_price_rs_per_quintal": 0, "cost_of_cultivation_rs_per_acre": 0}
    assert profitability_score(crop, None) == 50


# ---------------------------------------------------------------------------
# saturation_risk_score
# ---------------------------------------------------------------------------

def test_saturation_no_data():
    assert saturation_risk_score(None) == 30


def test_saturation_few_records():
    """Less than 3 records = neutral."""
    mandi = {"records": [{"modal_price": 1000}, {"modal_price": 1100}]}
    assert saturation_risk_score(mandi) == 30


def test_saturation_stable_market():
    """Narrow spread = stable = low risk."""
    records = [{"modal_price": 1000 + i * 10} for i in range(10)]
    mandi = {"records": records}
    score = saturation_risk_score(mandi)
    assert score <= 25  # spread is very small


def test_saturation_volatile_market():
    """Wide spread = volatile = high risk."""
    records = [
        {"modal_price": 100},
        {"modal_price": 5000},
        {"modal_price": 200},
        {"modal_price": 4500},
        {"modal_price": 150},
    ]
    mandi = {"records": records}
    score = saturation_risk_score(mandi)
    assert score >= 55  # spread > 2x median


def test_saturation_extreme_volatility():
    """Extreme spread = very high risk."""
    records = [
        {"modal_price": 50},
        {"modal_price": 10000},
        {"modal_price": 60},
        {"modal_price": 9500},
        {"modal_price": 55},
    ]
    mandi = {"records": records}
    score = saturation_risk_score(mandi)
    assert score == 70  # spread > 3x median


# ---------------------------------------------------------------------------
# rainfall_fit
# ---------------------------------------------------------------------------
def test_rainfall_fit_perfect_match():
    """50mm actual -> 250mm seasonal, crop needs 300mm -> ratio 0.83 -> 95"""
    crop = {"optimal_rainfall_mm": 300}
    score = rainfall_fit(50, crop, 5)
    assert score >= 90

def test_rainfall_fit_low_rain_high_water_crop():
    """Low rain, banana needs 1000mm -> poor fit"""
    crop = {"optimal_rainfall_mm": 1000}
    score = rainfall_fit(50, crop, 5)  # 250mm vs 1000mm = 0.25 ratio
    assert score <= 40

def test_rainfall_fit_high_rain_low_water_crop():
    """High rain, bajra needs 350mm -> poor fit (too much water)"""
    crop = {"optimal_rainfall_mm": 350}
    score = rainfall_fit(200, crop, 5)  # 1000mm vs 350mm = 2.86 ratio
    assert score <= 40

def test_rainfall_fit_no_data():
    crop = {"optimal_rainfall_mm": 500}
    score = rainfall_fit(100, crop, 5)  # 500mm vs 500mm -> perfect
    assert score >= 90


# ---------------------------------------------------------------------------
# generate_climate_context
# ---------------------------------------------------------------------------
def test_climate_context_low_rainfall():
    crops = [
        {"crop": "Banana", "water_requirement": "high", "optimal_rainfall_mm": 1000},
        {"crop": "Green Gram", "water_requirement": "low", "optimal_rainfall_mm": 400},
    ]
    ctx = generate_climate_context(50, 30.0, crops, "Kharif")
    assert ctx["rainfall_status"] in ("well_below_normal", "below_normal")
    assert "Green Gram" in ctx["preferred_crops"]

def test_climate_context_high_rainfall():
    crops = [
        {"crop": "Banana", "water_requirement": "high", "optimal_rainfall_mm": 1000},
        {"crop": "Bajra", "water_requirement": "low", "optimal_rainfall_mm": 350},
        {"crop": "Cotton", "water_requirement": "medium", "optimal_rainfall_mm": 600},
    ]
    ctx = generate_climate_context(200, 30.0, crops, "Kharif")
    assert ctx["rainfall_status"] == "above_normal"
    assert "Banana" in ctx["preferred_crops"]

def test_climate_context_no_rainfall_data():
    ctx = generate_climate_context(None, 28.0, [], "Kharif")
    assert ctx["rainfall_status"] == "unknown"


# ---------------------------------------------------------------------------
# clamp
# ---------------------------------------------------------------------------

def test_clamp_below_zero():
    from app.services.score import clamp
    assert clamp(-10) == 0


def test_clamp_above_hundred():
    from app.services.score import clamp
    assert clamp(150) == 100


def test_clamp_normal():
    from app.services.score import clamp
    assert clamp(67.3) == 67
