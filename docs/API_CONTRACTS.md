# AgriOptima AI — API Contracts

Base URL: `http://127.0.0.1:8000`

---

## POST /crop/recommend

Main recommendation endpoint. Takes a farmer profile, returns ranked crop recommendations.

**Request:**
```json
{
  "name": "Ramesh Patil",
  "village": "Pimpalgaon",
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
  "sowing_period": "June-July"
}
```

**Response (200):**
```json
{
  "season": "Kharif",
  "farmer_id": "FARMER_CA927953",
  "data_status": {
    "weather": "live",
    "nasa_climate": "live",
    "soil": "soil_health_card"
  },
  "recommendations": [
    {
      "crop": "Tomato",
      "opportunity_score": 78,
      "confidence": 82,
      "reference_yield_kg_per_acre": 9500,
      "expected_revenue_rs_per_acre": 237500,
      "expected_profit_rs_per_acre": 192500,
      "cost_of_cultivation_rs_per_acre": 45000,
      "score_breakdown": {
        "soil_fit": 85,
        "climate_fit": 90,
        "water_fit": 100,
        "buyer_demand": 85,
        "price_opportunity": 62,
        "profitability": 95,
        "saturation_risk": 40
      },
      "reason_codes": [
        "SOIL_COMPATIBLE",
        "LIVE_WEATHER_USED",
        "NASA_CLIMATE_DATA_USED",
        "LIVE_MANDI_DATA_USED",
        "HIGH_PROFITABILITY"
      ],
      "explanations": [
        "Soil nutrient levels meet or exceed Tomato's minimum requirements.",
        "Live weather forecast was used to assess climate fit.",
        "30-day historical climate data from NASA POWER was used for robust climate scoring.",
        "Live mandi arrival and price data was used for demand and price scoring.",
        "Strong expected profit margin based on Tomato yields and market prices."
      ],
      "sources": [
        {"provider": "soil_health_card", "type": "soil"},
        {"provider": "open_meteo", "status": "live"},
        {"provider": "nasa_power", "status": "live"},
        {"provider": "data_gov_india_agmarknet", "status": "live"}
      ]
    }
  ],
  "rejected": [
    {
      "crop": "Paddy",
      "rejection_codes": ["INSUFFICIENT_IRRIGATION"],
      "explanation": "Paddy requires high water availability. This farm is recorded as limited irrigation."
    }
  ]
}
```

**Errors:**
- `422` — Invalid input (bad season, missing required fields)

**Compatibility alias:** `POST /api/v1/crop-recommendations`

---

## GET /health

```json
// Response: 200
{"status": "ok"}
```

---

## GET /api/v1/pincode/{pincode}

Look up latitude/longitude for a 6-digit Indian pincode.

```json
// GET /api/v1/pincode/411001
// Response: 200
{
  "pincode": "411001",
  "latitude": 18.508,
  "longitude": 73.8687
}
```

---

## GET /api/v1/farmers

List all farmers with farm count.

```json
// Response: 200
[
  {
    "farmer_id": "FARMER_CA927953",
    "name": "Test Farmer",
    "village": "Pimpalgaon",
    "district": "Nashik",
    "state": "Maharashtra",
    "farm_count": 1,
    "created_at": "2026-08-31T18:14:33"
  }
]
```

---

## GET /api/v1/farmers/{farmer_id}

Get a single farmer with their farms and crop recommendations.

```json
// GET /api/v1/farmers/FARMER_CA927953
// Response: 200
{
  "farmer_id": "FARMER_CA927953",
  "name": "Test Farmer",
  "village": "Pimpalgaon",
  "district": "Nashik",
  "state": "Maharashtra",
  "farms": [
    {
      "farm_id": "FARM_A1B2C3D4",
      "area_acres": 3.0,
      "season": "Kharif",
      "irrigation": "limited",
      "soil_ph": 6.8,
      "latitude": 19.997,
      "longitude": 73.789
    }
  ],
  "created_at": "2026-08-31T18:14:33"
}
```

---

## POST /api/v1/farmers

Create a new farmer with a farm.

```json
// Request: same as crop/recommend payload
// Response: 200
{
  "farmer_id": "FARMER_XXXX",
  "farm_id": "FARM_XXXX"
}
```
