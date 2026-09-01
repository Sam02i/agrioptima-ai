"""
AgriOptima AI — Routing Engine

Distance/ETA logic, refactored out of the original transport_cost_mvp.py
with NO change to behaviour. Priority order is unchanged:

    1. OpenRouteService (if ORS_API_KEY env var is set)
    2. OSRM public demo server (free, no key)
    3. Haversine straight-line x road_factor (offline fallback)

SECURITY NOTE: never hardcode ORS_API_KEY. Set it as an env var:
    export ORS_API_KEY="your_key_here"
"""

import os
import math
from typing import Optional

import requests


def get_distance_km_osrm(origin_latlon: tuple, dest_latlon: tuple) -> Optional[dict]:
    """
    Free, no-signup routing via the public OSRM demo server.
    Uses real OpenStreetMap road data (not straight-line).
    NOTE: OSRM expects (longitude, latitude) order — opposite of normal lat/lon.
    """
    lat1, lon1 = origin_latlon
    lat2, lon2 = dest_latlon
    url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"
    params = {"overview": "false"}
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("code") != "Ok":
            return None
        route = data["routes"][0]
        return {
            "distance_km": route["distance"] / 1000,
            "duration_hr": route["duration"] / 3600,
            "source": "osrm",
        }
    except Exception:
        return None


def get_distance_km_ors(origin_latlon: tuple, dest_latlon: tuple, api_key: str) -> Optional[dict]:
    """
    OpenRouteService directions API — free tier (2,000 req/day, no billing).
    NOTE: ORS also expects (longitude, latitude) order, same as OSRM.
    """
    lat1, lon1 = origin_latlon
    lat2, lon2 = dest_latlon
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": api_key, "Content-Type": "application/json"}
    body = {"coordinates": [[lon1, lat1], [lon2, lat2]]}
    try:
        resp = requests.post(url, json=body, headers=headers, timeout=10)
        data = resp.json()
        summary = data["routes"][0]["summary"]
        return {
            "distance_km": summary["distance"] / 1000,
            "duration_hr": summary["duration"] / 3600,
            "source": "openrouteservice",
        }
    except Exception:
        return None


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def validate_latlon(latlon: tuple, label: str = "coordinate") -> None:
    """Raises ValueError on obviously invalid lat/long input."""
    if latlon is None or len(latlon) != 2:
        raise ValueError(f"Invalid {label}: expected (lat, lon), got {latlon!r}")
    lat, lon = latlon
    try:
        lat, lon = float(lat), float(lon)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid {label}: non-numeric values {latlon!r}")
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        raise ValueError(
            f"Invalid {label}: ({lat}, {lon}) is out of range "
            f"(lat must be -90..90, lon must be -180..180)"
        )


def get_distance_km(origin: str, destination: str,
                     origin_latlon: tuple, dest_latlon: tuple,
                     road_factor: float = 1.3) -> dict:
    """
    Distance source priority:
      1. OpenRouteService (if ORS_API_KEY env var is set) — tried first since
         it's a proper hosted service with a real free-tier quota
      2. OSRM (free, no key, public demo server — used only if ORS unavailable)
      3. Haversine straight-line x road_factor (final offline fallback)
    """
    validate_latlon(origin_latlon, f"origin_latlon ({origin})")
    validate_latlon(dest_latlon, f"dest_latlon ({destination})")

    ors_key = os.environ.get("ORS_API_KEY")
    if ors_key:
        ors_result = get_distance_km_ors(origin_latlon, dest_latlon, ors_key)
        if ors_result:
            return ors_result

    osrm_result = get_distance_km_osrm(origin_latlon, dest_latlon)
    if osrm_result:
        return osrm_result

    straight_line = haversine_km(*origin_latlon, *dest_latlon)
    distance_km = straight_line * road_factor
    return {
        "distance_km": round(distance_km, 1),
        "duration_hr": round(distance_km / 45, 2),
        "source": "haversine_fallback (no live routing API reachable — planning estimate only)",
    }
