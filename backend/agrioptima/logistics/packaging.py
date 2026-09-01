"""
AgriOptima AI — Packaging Logic

Converts a raw quantity (kg) of a crop into required WEIGHT and VOLUME,
using the packaging profiles in data/crop_profiles.py. Logic unchanged
from transport_cost_mvp.py — only the constants moved to data/.
"""

import math

from agrioptima.data.crop_profiles import CROP_PACKAGING


def get_required_weight_and_volume(quantity_kg: float, crop: str) -> dict:
    """
    Converts a raw quantity (kg) of a given crop into required weight AND
    required volume, using the crop's packaging profile. Adds a 5% safety
    margin on both dimensions.
    """
    if quantity_kg <= 0:
        raise ValueError(f"quantity_kg must be > 0, got {quantity_kg}")

    profile = CROP_PACKAGING.get(crop.lower(), CROP_PACKAGING["default"])
    num_packages = math.ceil(quantity_kg / profile["package_weight_kg"])
    total_volume_m3 = num_packages * profile["package_volume_m3"]

    return {
        "crop": crop,
        "num_packages": num_packages,
        "package_weight_kg": profile["package_weight_kg"],
        "package_volume_m3": profile["package_volume_m3"],
        "required_weight_kg": round(quantity_kg * 1.05, 1),
        "required_volume_m3": round(total_volume_m3 * 1.05, 2),
    }
