"""
Nominatim (OpenStreetMap) geocoding adapter.
Call only after an explicit user action (button click).
Maximum 1 request per second. Cache exact queries for at least 24 hours.
"""
import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
APP_USER_AGENT = "AgriOptimaAI-TeamA/1.0 (student prototype)"


async def search_place_once(query: str) -> list[dict]:
    """
    Call only after an explicit user action. Cache exact queries for at least 24 hours.
    Returns at most 5 results with label, lat, lon, provider, and attribution.
    """
    params = {
        "q": query,
        "format": "jsonv2",
        "addressdetails": 1,
        "countrycodes": "in",
        "limit": 5,
    }
    headers = {
        "User-Agent": APP_USER_AGENT,
        "Accept-Language": "en",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(NOMINATIM_URL, params=params, headers=headers)
        response.raise_for_status()
        raw = response.json()
    return [
        {
            "label": item["display_name"],
            "latitude": float(item["lat"]),
            "longitude": float(item["lon"]),
            "provider": "openstreetmap_nominatim",
            "attribution": "© OpenStreetMap contributors, ODbL",
        }
        for item in raw
    ]
