import asyncio
from app.adapters.open_meteo import fetch_open_meteo


def test_fetch_open_meteo_returns_expected_shape():
    result = asyncio.run(fetch_open_meteo(latitude=19.997, longitude=73.789))

    assert result["provider"] == "open_meteo"
    assert "fetched_at" in result
    assert "expires_at" in result
    assert len(result["daily_temperature_max_c"]) == 7
    assert len(result["daily_temperature_min_c"]) == 7
    assert len(result["daily_precipitation_mm"]) == 7
    assert len(result["daily_et0_mm"]) == 7

    