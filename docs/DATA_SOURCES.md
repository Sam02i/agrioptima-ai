# AgriOptima AI — Data Sources

## Live External APIs

### 1. Open-Meteo (Weather Forecast)
- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Purpose:** 7-day daily forecast — temperature max/min, precipitation, ET0
- **Key required:** No (free, unlimited)
- **Used in:** `app/adapters/open_meteo.py`
- **Caching:** 6-hour in-memory cache, rounded to ~1km precision
- **Fallback:** Default average temperature (27°C) if unavailable

### 2. NASA POWER (Historical Climate)
- **URL:** `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Purpose:** 30-day historical daily temperature and precipitation
- **Key required:** No (free public API)
- **Used in:** `app/adapters/nasa_power.py`
- **Parameters:** `T2M` (temperature), `PRECTOTCORR` (precipitation)
- **Community:** AG (Agriculture)
- **Fallback:** Open-Meteo 7-day forecast if unavailable

### 3. data.gov.in AGMARKNET (Mandi Prices)
- **URL:** `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
- **Purpose:** Live daily mandi wholesale prices — modal, min, max prices per market
- **Key required:** Yes (free registration at data.gov.in)
- **Used in:** `app/adapters/data_gov_mandi.py`
- **Caching:** 12-hour in-memory cache per (commodity, district) pair
- **Note:** Python's default User-Agent is blocked — uses browser-like header
- **Retry:** Up to 3 attempts with 45-second timeout per attempt
- **Returns:** Up to 500 records per crop with market name, commodity, modal_price, min_price, max_price

## Local Static Data

### 4. Crop Profiles (`app/data/crop_profiles.v1.json`)
- **24 crops** with agronomic data sourced from:
  - pH ranges: TNAU Agritech Portal, ICAR, ICRISAT, FAO
  - Yields: DES Ministry of Agriculture 2023-24
  - Prices: CACP (Commission for Agricultural Costs and Prices)
  - Costs: CACP + state agricultural university estimates
- **Per crop:** seasons, pH range, water requirement, NPK minimums, ideal temps, state-level yields, national avg price, cost of cultivation, demand baseline

### 5. Pincode Lookup (`app/data/pincode_latlong_lookup.csv`)
- **19,276 Indian pincodes** with latitude/longitude
- **Purpose:** Auto-fill farm coordinates from pincode input
- **Loaded:** Once at startup into a Python dict
- **Endpoint:** `GET /api/v1/pincode/{pincode}`

### 6. District Soil Estimates (`frontend/src/api/regions.ts`)
- **50+ districts** across 14 states with typical soil NPK and pH values
- **Source:** Soil Health Card scheme averages (India.gov.in)
- **Purpose:** Auto-fill soil data when farmer enters district name
- **Note:** Estimates only — farmer can override with actual values

## Scoring Data Flow

```
Farmer Input (pincode → lat/lng)
        ↓
Open-Meteo ──→ 7-day forecast ──→ climate_fit (if NASA unavailable)
NASA POWER ──→ 30-day average ──→ climate_fit (preferred)
AGMARKNET  ──→ live prices     ──→ price_opportunity, buyer_demand, saturation_risk
Crop JSON  ──→ yields, costs   ──→ profitability
Soil Input ──→ NPK values      ──→ soil_fit
```

## API Key Setup

1. Go to https://data.gov.in
2. Register for a free account
3. Go to "My API Key" → copy your key
4. Add to `backend/.env`:
   ```
   DATA_GOV_API_KEY=your_key_here
   ```
