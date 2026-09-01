"""
AgriOptima AI — Crop Packaging & Wastage Profiles (data only)

CROP_PACKAGING is pulled verbatim from transport_cost_mvp.py.
WASTAGE_RATE_BY_CROP is pulled verbatim from landed_cost.py, kept here
so all crop-specific constants live in one data file, per the
requested data/crop_profiles.py architecture.

⚠️ Illustrative estimates — replace with real packaging dimensions and
historical spoilage data for your supported crops before relying on them.
"""

CROP_PACKAGING = {
    "banana":  {"package_weight_kg": 13, "package_volume_m3": 0.090},
    "mango":   {"package_weight_kg": 20, "package_volume_m3": 0.040},
    "potato":  {"package_weight_kg": 50, "package_volume_m3": 0.080},
    "onion":   {"package_weight_kg": 50, "package_volume_m3": 0.075},
    "tomato":  {"package_weight_kg": 20, "package_volume_m3": 0.035},
    "default": {"package_weight_kg": 25, "package_volume_m3": 0.050},
}

WASTAGE_RATE_BY_CROP = {
    "banana": 0.03,
    "mango": 0.04,
    "tomato": 0.05,
    "onion": 0.015,
    "potato": 0.02,
    "default": 0.03,
}

# Planning defaults for landed-cost calculations (logistics/landed_cost.py).
HANDLING_COST_PER_KG = 0.40           # loading/crating/unloading, flat estimate
RISK_PENALTY_PER_KG_AT_MAX_RISK = 1.50  # Rs/kg penalty if risk score = 100
DEFAULT_RELIABILITY_SCORE = 60.0      # used when a farmer has no track record yet
