"""
AgriOptima AI — Pincode Resolver

Lets a farmer/buyer/hub be specified as a plain 6-digit Indian PIN code
instead of raw lat/long. Folded in from the standalone pincode_distance.py
so the rest of the system (routing, packaging, vehicles, models) never
has to know the difference — everything downstream still works in
lat/lon, exactly as before.

Backed by data/pincode_latlong_lookup.csv (India Post pincode dataset,
averaged per pincode across all post offices sharing that code).
"""

import csv
import os
from typing import Optional

LOOKUP_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "pincode_latlong_lookup.csv")


def _load_pincode_lookup(path: str = LOOKUP_PATH) -> dict:
    lookup = {}
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lookup[row["pincode"].strip()] = (
                float(row["latitude"]),
                float(row["longitude"]),
            )
    return lookup


PINCODE_LOOKUP = _load_pincode_lookup()


def resolve_pincode(pincode: str) -> Optional[tuple]:
    """
    Returns (latitude, longitude) for a pincode, or None if not found.
    Accepts pincode as str or int; normalises to a 6-digit string.
    """
    key = str(pincode).strip().zfill(6)
    return PINCODE_LOOKUP.get(key)


def resolve_pincode_or_raise(pincode: str, label: str = "location") -> tuple:
    coords = resolve_pincode(pincode)
    if coords is None:
        raise ValueError(
            f"{label}: pincode '{pincode}' not found in lookup table. "
            f"Check for typos, or the pincode may not have a matching "
            f"India Post record in this dataset — use latlon instead."
        )
    return coords
