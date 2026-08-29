import asyncio
from app.adapters.data_gov_mandi import fetch_mandi_records


def test_fetch_mandi_records_does_not_crash():
    result = asyncio.run(fetch_mandi_records(commodity="Tomato"))
    # Either None (no data / timeout / bad key) or a properly shaped dict — never a crash
    if result is not None:
        assert result["provider"] == "data_gov_india_agmarknet"
        assert "records" in result