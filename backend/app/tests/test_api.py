from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_crop_recommend_rejects_paddy_with_limited_irrigation():
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


def test_crop_recommend_returns_nonempty_recommendations():
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