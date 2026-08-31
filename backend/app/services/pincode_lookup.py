"""
Pincode → Latitude/Longitude lookup.
Loads the CSV once at import time and exposes a fast dict lookup.
"""

import csv
import os
from pathlib import Path

_CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "pincode_latlong_lookup.csv"

# pincode (str) → {"latitude": float, "longitude": float}
_PINCODE_DB: dict[str, dict[str, float]] = {}


def _load() -> None:
    if _PINCODE_DB:
        return
    if not _CSV_PATH.exists():
        return
    with open(_CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pc = row.get("pincode", "").strip()
            lat = row.get("latitude", "").strip()
            lng = row.get("longitude", "").strip()
            if pc and lat and lng:
                try:
                    _PINCODE_DB[pc] = {
                        "latitude": float(lat),
                        "longitude": float(lng),
                    }
                except ValueError:
                    continue


def lookup(pincode: str) -> dict | None:
    """
    Return {"latitude": ..., "longitude": ...} for a 6-digit Indian pincode,
    or None if not found.
    """
    _load()
    return _PINCODE_DB.get(str(pincode).strip())
