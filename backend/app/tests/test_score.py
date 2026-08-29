from app.services.score import crop_opportunity_score, confidence


SAMPLE_PARTS = {
    "soil_fit": 90,
    "climate_fit": 80,
    "water_fit": 85,
    "buyer_demand": 70,
    "price_opportunity": 75,
    "profitability": 72,
    "saturation_risk": 30,
}


def test_opportunity_score_is_within_range():
    score = crop_opportunity_score(SAMPLE_PARTS)
    assert 0 <= score <= 100


def test_opportunity_score_matches_expected_value():
    score = crop_opportunity_score(SAMPLE_PARTS)
    # 90*.25 + 80*.20 + 85*.15 + 70*.15 + 75*.10 + 72*.10 - 30*.05 = 74.95 -> rounds to 75
    assert score == 75

def test_confidence_is_within_range():
    result = confidence(SAMPLE_PARTS, live_signal_count=2, soil_source="soil_health_card")
    assert 0 <= result <= 100


def test_confidence_higher_with_real_soil_source():
    with_card = confidence(SAMPLE_PARTS, live_signal_count=0, soil_source="soil_health_card")
    with_manual = confidence(SAMPLE_PARTS, live_signal_count=0, soil_source="manual_entry")
    assert with_card > with_manual