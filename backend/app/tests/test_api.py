from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---------------------------------------------------------------------------
# Fake data for mocked adapters
# ---------------------------------------------------------------------------

FAKE_WEATHER = {
    "provider": "open_meteo",
    "source_url": "https://fake",
    "fetched_at": "2026-08-31T00:00:00",
    "expires_at": "2026-09-01T00:00:00",
    "daily_temperature_max_c": [32, 33, 31, 34, 30, 32, 33],
    "daily_temperature_min_c": [22, 23, 21, 24, 20, 22, 23],
    "daily_precipitation_mm": [0, 2, 5, 0, 1, 0, 3],
    "daily_et0_mm": [4.5, 4.8, 4.2, 5.0, 4.0, 4.5, 4.7],
}

FAKE_NASA = {
    "provider": "nasa_power",
    "source_url": "https://fake",
    "fetched_at": "2026-08-31T00:00:00",
    "latitude": 19.997,
    "longitude": 73.789,
    "start_date": "20260801",
    "end_date": "20260830",
    "daily_temperature_c": [30, 31, 29, 32, 28, 30, 31, 30, 29, 31] * 3,
    "average_temperature_c": 30.2,
    "total_precipitation_mm": 120.5,
    "record_count": 30,
}

FAKE_MANDI_TOMATO = {
    "provider": "data_gov_india_agmarknet",
    "source_url": "https://fake",
    "fetched_at": "2026-08-31T00:00:00",
    "expires_at": "2026-09-01T00:00:00",
    "records": [
        {"market": "Nashik APMC", "commodity": "Tomato", "modal_price": 2500, "min_price": 2000, "max_price": 3000, "arrival_date": "31/08/2026"},
        {"market": "Pune APMC", "commodity": "Tomato", "modal_price": 2200, "min_price": 1800, "max_price": 2600, "arrival_date": "31/08/2026"},
        {"market": "Mumbai APMC", "commodity": "Tomato", "modal_price": 2800, "min_price": 2400, "max_price": 3200, "arrival_date": "31/08/2026"},
        {"market": "Aurangabad APMC", "commodity": "Tomato", "modal_price": 2100, "min_price": 1700, "max_price": 2500, "arrival_date": "31/08/2026"},
        {"market": "Indore APMC", "commodity": "Tomato", "modal_price": 2300, "min_price": 1900, "max_price": 2700, "arrival_date": "31/08/2026"},
    ],
}


def _fake_mandi(commodity: str, district: str | None = None):
    """Return slightly different fake data per crop."""
    data = dict(FAKE_MANDI_TOMATO)
    data["records"] = [
        {**r, "commodity": commodity, "market": f"Market_{i} APMC"}
        for i, r in enumerate(FAKE_MANDI_TOMATO["records"])
    ]
    return data


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@patch("app.services.recommendation_service.fetch_open_meteo", new_callable=AsyncMock, return_value=FAKE_WEATHER)
@patch("app.services.recommendation_service.fetch_nasa_power", new_callable=AsyncMock, return_value=FAKE_NASA)
@patch("app.services.recommendation_service.fetch_mandi_records", new_callable=AsyncMock, side_effect=_fake_mandi)
def test_health_check(_mandi, _nasa, _weather):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "services" in data


@patch("app.services.recommendation_service.fetch_open_meteo", new_callable=AsyncMock, return_value=FAKE_WEATHER)
@patch("app.services.recommendation_service.fetch_nasa_power", new_callable=AsyncMock, return_value=FAKE_NASA)
@patch("app.services.recommendation_service.fetch_mandi_records", new_callable=AsyncMock, side_effect=_fake_mandi)
def test_crop_recommend_rejects_paddy_with_limited_irrigation(_mandi, _nasa, _weather):
    payload = {
        "name": "Test Farmer",
        "village": "Test Village",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.997,
        "longitude": 73.789,
        "area_acres": 3,
        "season": "Kharif",
        "irrigation": "limited",
        "soil_ph": 6.8,
        "nitrogen": 72,
        "phosphorus": 48,
        "potassium": 55,
        "soil_source": "soil_health_card",
        "previous_crop": "Onion",
        "investment_budget_rupees": 240000,
        "sowing_period": "June-July",
    }

    response = client.post("/crop/recommend", json=payload)
    assert response.status_code == 200

    data = response.json()
    rejected_crops = [r["crop"] for r in data["rejected"]]
    assert "Paddy" in rejected_crops
    assert "Onion" in rejected_crops

    recommended_crops = [r["crop"] for r in data["recommendations"]]
    assert "Paddy" not in recommended_crops


def test_crop_recommend_rejects_invalid_season():
    payload = {
        "name": "Test Farmer",
        "village": "Test Village",
        "district": "Nashik",
        "area_acres": 3,
        "season": "InvalidSeason",
        "irrigation": "limited",
        "soil_ph": 6.8,
        "nitrogen": 72,
        "phosphorus": 48,
        "potassium": 55,
        "soil_source": "soil_health_card",
        "previous_crop": "Onion",
        "investment_budget_rupees": 240000,
        "sowing_period": "June-July",
    }

    response = client.post("/crop/recommend", json=payload)
    assert response.status_code == 422


@patch("app.services.recommendation_service.fetch_open_meteo", new_callable=AsyncMock, return_value=FAKE_WEATHER)
@patch("app.services.recommendation_service.fetch_nasa_power", new_callable=AsyncMock, return_value=FAKE_NASA)
@patch("app.services.recommendation_service.fetch_mandi_records", new_callable=AsyncMock, side_effect=_fake_mandi)
def test_crop_recommend_returns_nonempty_recommendations(_mandi, _nasa, _weather):
    payload = {
        "name": "Test Farmer",
        "village": "Test Village",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.997,
        "longitude": 73.789,
        "area_acres": 3,
        "season": "Kharif",
        "irrigation": "limited",
        "soil_ph": 6.8,
        "nitrogen": 72,
        "phosphorus": 48,
        "potassium": 55,
        "soil_source": "soil_health_card",
        "previous_crop": "Onion",
        "investment_budget_rupees": 240000,
        "sowing_period": "June-July",
    }
    response = client.post("/crop/recommend", json=payload)
    data = response.json()
    assert len(data["recommendations"]) > 0
    for rec in data["recommendations"]:
        assert 0 <= rec["opportunity_score"] <= 100
        assert 0 <= rec["confidence"] <= 100
        assert "score_breakdown" in rec
        assert "reason_codes" in rec


@patch("app.services.recommendation_service.fetch_open_meteo", new_callable=AsyncMock, return_value=FAKE_WEATHER)
@patch("app.services.recommendation_service.fetch_nasa_power", new_callable=AsyncMock, return_value=FAKE_NASA)
@patch("app.services.recommendation_service.fetch_mandi_records", new_callable=AsyncMock, side_effect=_fake_mandi)
def test_crop_recommend_includes_economics(_mandi, _nasa, _weather):
    """Verify profitability data is in the response."""
    payload = {
        "name": "Test Farmer",
        "village": "Test Village",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.997,
        "longitude": 73.789,
        "area_acres": 3,
        "season": "Kharif",
        "irrigation": "limited",
        "soil_ph": 6.8,
        "nitrogen": 72,
        "phosphorus": 48,
        "potassium": 55,
        "soil_source": "soil_health_card",
        "previous_crop": "Onion",
        "investment_budget_rupees": 240000,
        "sowing_period": "June-July",
    }
    response = client.post("/crop/recommend", json=payload)
    data = response.json()
    rec = data["recommendations"][0]
    assert "expected_revenue_rs_per_acre" in rec
    assert "expected_profit_rs_per_acre" in rec
    assert "cost_of_cultivation_rs_per_acre" in rec
    assert rec["expected_revenue_rs_per_acre"] > 0


@patch("app.services.recommendation_service.fetch_open_meteo", new_callable=AsyncMock, return_value=FAKE_WEATHER)
@patch("app.services.recommendation_service.fetch_nasa_power", new_callable=AsyncMock, return_value=FAKE_NASA)
@patch("app.services.recommendation_service.fetch_mandi_records", new_callable=AsyncMock, side_effect=_fake_mandi)
def test_crop_recommend_includes_farmer_id(_mandi, _nasa, _weather):
    """Verify farmer_id is returned for DB persistence."""
    payload = {
        "name": "Test Farmer",
        "village": "Test Village",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.997,
        "longitude": 73.789,
        "area_acres": 3,
        "season": "Kharif",
        "irrigation": "limited",
        "soil_ph": 6.8,
        "nitrogen": 72,
        "phosphorus": 48,
        "potassium": 55,
        "soil_source": "soil_health_card",
        "previous_crop": "Onion",
        "investment_budget_rupees": 240000,
        "sowing_period": "June-July",
    }
    response = client.post("/crop/recommend", json=payload)
    data = response.json()
    assert "farmer_id" in data
    assert data["farmer_id"] is not None
    assert data["farmer_id"].startswith("FARMER_")


def test_credit_buyers_returns_selectable_buyers():
    response = client.get("/credit/buyers")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    assert data["buyers"]
    assert all(buyer.startswith("BUYER_") for buyer in data["buyers"])

    score_response = client.get(f"/credit/buyer/{data['buyers'][0]}/score")
    assert score_response.status_code == 200
    assert score_response.json()["buyer_id"] == data["buyers"][0]


def test_supplier_ranking_scores_and_rejects_candidates():
    response = client.post("/ranking/score", json={
        "rfq": {
            "crop_name": "Tomato", "required_quantity": 1000,
            "minimum_quality_grade": "B", "maximum_acceptable_price": 32,
        },
        "candidates": [
            {"lot_id": "LOT_1", "farmer_name": "Asha Farms", "crop_name": "Tomato",
             "price_per_unit": 28, "available_quantity": 1200, "quality_grade": "A",
             "farmer_reliability": 90},
            {"lot_id": "LOT_2", "farmer_name": "Costly Farms", "crop_name": "Tomato",
             "price_per_unit": 40, "available_quantity": 1200, "quality_grade": "A"},
        ],
    })
    assert response.status_code == 200
    results = response.json()["results"]
    assert results[0]["eligible"] is True
    assert results[0]["ranking_score"] > 0
    assert results[1]["eligible"] is False
    assert "maximum" in results[1]["rejection_reason"]


@patch("agrioptima.logistics.routing.get_distance_km_osrm", return_value=None)
def test_logistics_buyer_quote_compares_models(_osrm):
    response = client.post("/logistics/buyer-quote", json={
        "crop": "tomato", "farmer_price_per_kg": 25,
        "farmers": [
            {"name": "Farmer A", "quantity_kg": 3000, "latlon": [30.90, 75.85], "price_per_kg": 22, "reliability_score": 91},
            {"name": "Farmer B", "quantity_kg": 3000, "latlon": [30.95, 75.90], "price_per_kg": 24, "reliability_score": 88},
        ],
        "buyer": {"name": "Azadpur Mandi", "latlon": [28.70, 77.16]},
        "collection_hub": {"name": "Ludhiana Hub", "latlon": [30.80, 75.80]},
        "max_landed_cost_per_kg": 35,
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["logistics_result"]["models"]) == 3
    assert data["logistics_result"]["recommended_model"]["name"].startswith("MODEL_")
    assert data["buyer_quote"]["final_buyer_cost"] > 0
    assert data["buyer_quote"]["final_cost_per_kg"] > 25


def test_marketplace_exposes_imported_farmer_data():
    summary = client.get("/marketplace/summary")
    assert summary.status_code == 200
    assert summary.json()["farmer_count"] == 3
    assert summary.json()["available_listing_count"] == 5

    farmers = client.get("/marketplace/farmers")
    assert farmers.status_code == 200
    assert farmers.json()["count"] == 3
    assert all("phone" not in farmer for farmer in farmers.json()["farmers"])

    listings = client.get("/marketplace/listings")
    assert listings.status_code == 200
    assert listings.json()["count"] == 5
