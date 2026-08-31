from datetime import datetime, timedelta, timezone
import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Simple in-memory cache: (lat, lng rounded) → (fetched_at, data)
_cache: dict[tuple, tuple[datetime, dict]] = {}
_CACHE_TTL = timedelta(hours=6)


def _cache_key(lat: float, lng: float) -> tuple:
    """Round to 2 decimal places (~1 km precision) for cache grouping."""
    return (round(lat, 2), round(lng, 2))


async def fetch_open_meteo(latitude: float, longitude: float) -> dict:
    key = _cache_key(latitude, longitude)
    now = datetime.now(timezone.utc)

    # Return cached data if still fresh
    if key in _cache:
        fetched_at, cached_data = _cache[key]
        if now - fetched_at < _CACHE_TTL:
            return cached_data

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
        "timezone": "auto",
        "forecast_days": 7,
    }
    async with httpx.AsyncClient(timeout=8) as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        raw = response.json()

    daily = raw["daily"]
    result = {
        "provider": "open_meteo",
        "source_url": str(response.url),
        "fetched_at": now.isoformat(),
        "expires_at": (now + timedelta(hours=6)).isoformat(),
        "daily_temperature_max_c": daily["temperature_2m_max"],
        "daily_temperature_min_c": daily["temperature_2m_min"],
        "daily_precipitation_mm": daily["precipitation_sum"],
        "daily_et0_mm": daily["et0_fao_evapotranspiration"],
    }

    # Store in cache
    _cache[key] = (now, result)
    return result
