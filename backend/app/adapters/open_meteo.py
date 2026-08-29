from datetime import datetime, timedelta, timezone
import httpx

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def fetch_open_meteo(latitude: float, longitude: float) -> dict:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
        "timezone": "auto",
        "forecast_days": 7,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        raw = response.json()

    daily = raw["daily"]
    return {
        "provider": "open_meteo",
        "source_url": str(response.url),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=6)).isoformat(),
        "daily_temperature_max_c": daily["temperature_2m_max"],
        "daily_temperature_min_c": daily["temperature_2m_min"],
        "daily_precipitation_mm": daily["precipitation_sum"],
        "daily_et0_mm": daily["et0_fao_evapotranspiration"],
    }