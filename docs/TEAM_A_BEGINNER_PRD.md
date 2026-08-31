# AgriOptima AI — Team A (Farmer Intelligence) PRD

## What Team A Owns

Team A builds the **farmer intelligence backend** — the system that takes a farmer's farm profile and returns ranked crop recommendations with transparent scoring.

## What the User Sees

1. A form where the farmer enters their profile (name, location, soil data, budget, season)
2. A ranked list of recommended crops with scores and explanations
3. Rejected crops with reasons why they were filtered out
4. Economics per acre (cost, revenue, profit) for each recommended crop

## Architecture

```
Frontend (React + Vite)
        ↓ POST /crop/recommend
FastAPI Backend (Team A)
        ↓
┌───────────────────────────────────┐
│  1. Eligibility Engine            │  5 hard rejection rules
│  2. Live Data Fetching            │  Open-Meteo, NASA POWER, AGMARKNET (parallel)
│  3. Scoring Engine                │  7-signal weighted formula (0-100)
│  4. Persistence                   │  Save to PostgreSQL
└───────────────────────────────────┘
        ↓
PostgreSQL (Farmer → Farm → CropRecommendation)
```

## Eligibility Rules (Hard Rejections)

Before scoring, each crop is checked against 5 rules. If any fail, the crop is rejected with a reason code:

| # | Rule | Reason Code | Logic |
|---|------|-------------|-------|
| 1 | Season | `SEASON_NOT_SUPPORTED` | Crop not available in selected season |
| 2 | Soil pH | `SOIL_PH_OUT_OF_RANGE` | Farm pH outside crop's tolerance range |
| 3 | Irrigation | `INSUFFICIENT_IRRIGATION` | Farm water supply below crop requirement |
| 4 | Budget | `BUDGET_INSUFFICIENT` | Per-acre investment below crop minimum |
| 5 | Rotation | `BASIC_ROTATION_RULE` | Same crop as previous season |

## Scoring Formula

Each eligible crop gets a 0–100 opportunity score from 7 signals:

| Signal | Weight | Source | Description |
|--------|--------|--------|-------------|
| Soil fit | 25% | Farmer input | N/P/K vs crop minimums |
| Climate fit | 20% | NASA POWER (30-day) or Open-Meteo (7-day) | Temperature vs crop's ideal range |
| Water fit | 15% | Farmer input | Irrigation vs crop water need |
| Buyer demand | 15% | AGMARKNET live data | Number of mandis actively trading |
| Price opportunity | 10% | AGMARKNET live data | Current price vs median |
| Profitability | 10% | Crop profiles + DES yields | Revenue minus cost of cultivation |
| Saturation risk | -5% | AGMARKNET live data | Price spread across markets |

**Confidence score** (separate 0–100) measures evidence quality, not success probability.

## Supported Crops (24)

Tomato, Chilli, Maize, Paddy, Onion, Bajra, Wheat, Soybean, Groundnut, Cotton, Sugarcane, Brinjal, Okra, Potato, Green Gram, Black Gram, Chickpea, Mustard, Sunflower, Banana, Turmeric, Ginger, Sesame, Castor

## Data Sources

| Source | Purpose | Key Required? |
|--------|---------|---------------|
| Open-Meteo | 7-day weather forecast | No |
| NASA POWER | 30-day historical climate | No |
| AGMARKNET (data.gov.in) | Live mandi prices + market breadth | Yes (free) |
| Crop profiles (JSON) | pH ranges, yields, costs, ideal temps | No (local) |
| Pincode lookup (CSV) | Pincode → lat/lng (19,276 pincodes) | No (local) |

## Database Schema

- **farmers** — name, village, district, state
- **farms** — area, coordinates, season, irrigation, soil NPK, budget
- **crop_recommendations** — crop, score, confidence, JSONB breakdowns
- **external_data_cache** — cached API responses with expiry

## Environment Variables

All loaded from `backend/.env` via `config.py`:

```
DATABASE_URL=postgresql+psycopg://agrioptima:agrioptima_local_only@localhost:5432/agrioptima
DATA_GOV_API_KEY=your_free_api_key
DATA_GOV_MANDI_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
```

## Tests

58 unit tests covering eligibility, scoring, adapters, API endpoints, and persistence. All tests mock external APIs to run in <2 seconds.
