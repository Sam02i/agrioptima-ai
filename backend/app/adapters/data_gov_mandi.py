from datetime import datetime, timedelta, timezone
import httpx
from app.config import DATA_GOV_API_KEY, DATA_GOV_MANDI_RESOURCE_ID

BASE_URL = "https://api.data.gov.in/resource"

# data.gov.in blocks Python's default User-Agent — use browser-like header
_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "application/json",
}

# In-memory cache: (commodity, district) → (fetched_at, data)
_cache: dict[tuple, tuple[datetime, dict]] = {}
_CACHE_TTL = timedelta(hours=12)


async def fetch_mandi_records(commodity: str, district: str | None = None) -> dict | None:
    api_key = DATA_GOV_API_KEY
    resource_id = DATA_GOV_MANDI_RESOURCE_ID

    if not api_key or not resource_id or "replace" in api_key:
        return None

    # Check cache first
    cache_key = (commodity, district or "")
    now = datetime.now(timezone.utc)
    if cache_key in _cache:
        fetched_at, cached = _cache[cache_key]
        if now - fetched_at < _CACHE_TTL:
            return cached

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 500,
        "filters[commodity]": commodity,
    }
    if district:
        params["filters[district]"] = district

    # Retry up to 2 times — data.gov.in can be slow
    response = None
    payload = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=45, follow_redirects=True, headers=_HEADERS) as client:
                response = await client.get(f"{BASE_URL}/{resource_id}", params=params)
                response.raise_for_status()
                payload = response.json()
                break
        except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError):
            continue
    else:
        # All retries failed
        return None

    records = payload.get("records", [])
    if not records:
        return None

    result = {
        "provider": "data_gov_india_agmarknet",
        "source_url": str(response.url).replace(api_key, "REDACTED"),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
        "records": records,
    }

    # Store in cache
    _cache[cache_key] = (now, result)
    return result
