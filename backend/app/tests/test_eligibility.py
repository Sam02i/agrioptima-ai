# backend/app/tests/test_eligibility.py
from app.services.eligibility import evaluate_eligibility

# Testing farmer profile for comparisons
PROFILE = {
    "area_acres": 3,
    "season": "Kharif",
    "irrigation": "limited",
    "soil_ph": 6.8,
    "nitrogen": 72,
    "phosphorus": 48,
    "potassium": 55,
    "previous_crop": "Onion",
    "investment_budget_rupees": 240000,
}

# Test crop profile that is stored in the crop.JSON file
PADDY = {
    "crop": "Paddy",
    "seasons": ["Kharif"],
    "min_ph": 5.5,
    "max_ph": 7.0,
    "water_requirement": "high",
    "minimum_investment_rupees_per_acre": 45000,
}


def test_paddy_is_rejected_before_scoring_when_water_is_limited():
    rejection = evaluate_eligibility(PROFILE, PADDY)
    assert rejection is not None
    assert "INSUFFICIENT_IRRIGATION" in rejection.codes

#assert statements — pytest handles pass/fail reporting

#! pytest app/tests/test_eligibility.py -q
