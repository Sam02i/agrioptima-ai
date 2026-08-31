# AgriOptima AI — Demo Script

## Prerequisites

- Docker running (PostgreSQL)
- Python 3.12+ with venv activated
- Node.js 18+
- `.env` file configured with `DATA_GOV_API_KEY`

## Step 1: Start Services

**Terminal 1 — Database:**
```bash
cd ~/Documents/agrioptima-ai
docker compose up -d postgres
```

**Terminal 2 — Backend:**
```bash
cd ~/Documents/agrioptima-ai/backend
source .agrioptima-ai/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 3 — Frontend:**
```bash
cd ~/Documents/agrioptima-ai/frontend
npm run dev
```

Open `http://127.0.0.1:5173` in browser.

## Step 2: Run Tests (Optional — show engineering rigor)

```bash
cd ~/Documents/agrioptima-ai/backend
pytest app/tests/ -v
```

Expected: 58 tests, all passing, under 2 seconds.

## Step 3: Demo — Farmer from Nashik

Fill in the form:
| Field | Value |
|-------|-------|
| Name | Ramesh Patil |
| Village | Pimpalgaon |
| District | Nashik |
| State | Maharashtra |
| Pincode | 422001 |
| Area | 3 acres |
| Season | Kharif |
| Irrigation | limited |
| Previous Crop | Onion |
| Budget | 240000 |

**Show:** Pincode auto-fills coordinates (19.997, 73.789). District auto-fills soil NPK.

Click **Get Crop Recommendations**.

**Walk through results:**
1. Paddy and Onion are **rejected** (limited irrigation / rotation rule)
2. Top recommendation is Tomato with score 75-80
3. **Score breakdown** shows all 7 signals — soil, climate, water, demand, price, profitability, saturation
4. **Economics panel** shows cost ₹45K, revenue ₹2.3L, profit ₹1.9L per acre
5. **Reason codes** explain why — SOIL_COMPATIBLE, LIVE_WEATHER_USED, NASA_CLIMATE_DATA_USED, LIVE_MANDI_DATA_USED
6. **Sources** show data came from Soil Health Card + Open-Meteo + NASA POWER + AGMARKNET

## Step 4: Demo — Different Scenario (Pune, Rabi season)

Change to:
| Field | Value |
|-------|-------|
| Pincode | 411001 |
| Season | Rabi |
| Irrigation | adequate |
| Previous Crop | Wheat |
| Budget | 350000 |

**Show:** Different crop rankings. Wheat rejected by rotation rule. Potato and Chickpea now eligible.

## Step 5: Demo — Show DB Persistence

```bash
docker compose exec postgres psql -U agrioptima -d agrioptima -c \
  "SELECT f.name, r.crop, r.opportunity_score, r.confidence \
   FROM crop_recommendations r \
   JOIN farmers f ON r.farmer_id = f.id \
   ORDER BY r.created_at DESC LIMIT 10;"
```

**Show:** All previous recommendations are saved with scores and breakdowns.

## Step 6: Demo — Pincode Lookup

Show the API directly:
```bash
curl http://127.0.0.1:8000/api/v1/pincode/560001
```
Returns Bangalore coordinates instantly.

```bash
curl http://127.0.0.1:8000/api/v1/pincode/700001
```
Returns Kolkata coordinates.

## Key Talking Points

1. **Transparent scoring** — Every crop score is explainable with 7 weighted signals
2. **No black box** — Farmers see exactly why a crop was recommended or rejected
3. **Real data** — Live weather from NASA POWER, live mandi prices from 500+ markets
4. **Fast** — Results in 2-3 seconds (weather + mandi fetched in parallel)
5. **Free** — All data sources are free (Open-Meteo, NASA POWER, data.gov.in)
6. **Persistent** — Every recommendation saved to Postgres for tracking
7. **24 crops** — Covers major Indian crops across Kharif, Rabi, and Zaid seasons

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API test hangs | Already fixed — tests use mocks |
| Mandi data unavailable | Check `DATA_GOV_API_KEY` in `.env` |
| Slow first request | Normal — Open-Meteo + NASA POWER are fetched. Subsequent requests for same location are cached |
| Port 8000 in use | `pkill -f uvicorn` |
| Frontend won't start | `cd frontend && npm install && npm run dev` |
