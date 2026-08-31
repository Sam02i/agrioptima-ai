"""
NASA POWER historical climate adapter (PRD section 11.3).
Provides long-term daily temperature and precipitation.
Fallback/secondary source when Open-Meteo forecast is unavailable.
No API key required for the POWER API v2 public endpoint.
"""
import httpx
from datetime import datetime, timedelta, timezone

NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"


async def fetch_nasa_power(
    latitude: float,
    longitude: float,
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict | None:
    """
    Fetch daily temperature and precipitation from NASA POWER.
    Returns None on failure (safe fallback pattern).
    Default range: last 30 days.
    """
    if not start_date:
        end = datetime.now(timezone.utc) - timedelta(days=1)
        start = end - timedelta(days=29)
        start_date = start.strftime("%Y%m%d")
        end_date = end.strftime("%Y%m%d")

    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start_date,
        "end": end_date,
        "format": "JSON",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(NASA_POWER_URL, params=params)
            response.raise_for_status()
            raw = response.json()
    except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError):
        return None

    try:
        properties = raw["properties"]["parameter"]
        t2m = properties.get("T2M", {})
        prectot = properties.get("PRECTOTCORR", {})

        dates = sorted(t2m.keys())
        temperatures = [t2m[d] for d in dates if t2m[d] > -900]
        precipitations = [prectot[d] for d in dates if prectot.get(d, -999) > -900]

        avg_temp = sum(temperatures) / len(temperatures) if temperatures else None
        total_precip = sum(precipitations) if precipitations else None

        return {
            "provider": "nasa_power",
            "source_url": str(response.url),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily_temperature_c": temperatures,
            "average_temperature_c": avg_temp,
            "total_precipitation_mm": total_precip,
            "record_count": len(temperatures),
        }
    except (KeyError, TypeError, ZeroDivisionError):
        return None
