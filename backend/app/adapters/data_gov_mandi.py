import os
from datetime import datetime, timedelta, timezone
import httpx

BASE_URL = "https://api.data.gov.in/resource"


async def fetch_mandi_records(commodity: str, district: str | None = None) -> dict | None:
    api_key = os.getenv("DATA_GOV_API_KEY")
    resource_id = os.getenv("DATA_GOV_MANDI_RESOURCE_ID")

    if not api_key or not resource_id or "replace" in api_key:
        return None

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 100,
        "filters[commodity]": commodity,
    }
    if district:
        params["filters[district]"] = district

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{BASE_URL}/{resource_id}", params=params)
            response.raise_for_status()
            payload = response.json()
    except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError):
        return None

    records = payload.get("records", [])
    if not records:
        return None

    return {
        "provider": "data_gov_india_agmarknet",
        "source_url": str(response.url).replace(api_key, "REDACTED"),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
        "records": records,
    }
