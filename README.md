# AgriOptima AI — Team 1 (Farmer Intelligence)

A crop recommendation backend that helps a farmer select a viable crop using deterministic agronomic rules first, then a transparent, source-labelled scoring system. Built for Apple Silicon macOS.

> **Core safety rule:** A crop must pass hard agronomic eligibility (season, soil pH, water, budget, crop rotation) before it ever receives a market/opportunity score. Live weather or market data can influence ranking, but can never override a hard rejection.

---

## What this does

Given a farmer's profile (soil, irrigation, season, budget, location), the system:

1. Runs the farm against 6 candidate crops through deterministic eligibility rules
2. Rejects crops that fail (with plain-language reasons and reason codes)
3. Scores the remaining eligible crops 0–100 using a transparent, fixed-weight formula
4. Returns the top 5 ranked recommendations with score breakdowns, confidence, and data source labels

No crop suitability, price, yield, or demand claim is ever invented. When live data is unavailable, the system uses a clearly labelled neutral/cached fallback instead of guessing.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Pydantic |
| Database | PostgreSQL 16 (via Docker), SQLAlchemy, Alembic |
| External data | Open-Meteo (weather, no key needed), data.gov.in/AGMARKNET (mandi prices, free registered key) |
| Testing | pytest |

---

## Project structure

```
agrioptima-ai/
├── README.md
├── .gitignore
├── docker-compose.yml
├── docs/
├── backend/
│   ├── requirements.txt
│   ├── .env                  # local secrets — never committed
│   ├── .env.example
│   ├── alembic.ini
│   ├── alembic/
│   └── app/
│       ├── main.py                       # FastAPI entrypoint (in progress)
│       ├── config.py
│       ├── data/
│       │   ├── crop_profiles.v1.json     # 6 crop profiles with sourced pH ranges
│       │   └── crop_profiles.README.md   # data source documentation
│       ├── api/
│       ├── adapters/
│       │   ├── open_meteo.py             # live weather, no key required
│       │   └── data_gov_mandi.py         # mandi prices, requires free API key
│       ├── db/
│       │   ├── session.py
│       │   └── models.py                 # Farmer, Farm, CropRecommendation, ExternalDataCache
│       ├── schemas/
│       │   └── farmer.py                 # FarmerRecommendationRequest (Pydantic validation)
│       ├── services/
│       │   ├── eligibility.py            # hard agronomic rejection rules
│       │   ├── score.py                  # transparent 0–100 scoring formula
│       │   └── recommendation_service.py # orchestrates eligibility + scoring + adapters
│       └── tests/
└── frontend/                              # not yet built
```

---

## Setup (Apple Silicon macOS)

### 1. Prerequisites
- Python 3.12 (`brew install python@3.12`)
- Docker Desktop (for PostgreSQL)
- Git

### 2. Clone and enter the project
```bash
cd ~/Documents/agrioptima-ai
```

### 3. Create and activate the virtual environment
```bash
cd backend
/opt/homebrew/bin/python3.12 -m venv .agrioptima-ai
source .agrioptima-ai/bin/activate
python --version   # should print Python 3.12.x
```

### 4. Install dependencies
```bash
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

### 5. Start the database
```bash
cd ~/Documents/agrioptima-ai
docker compose up -d
docker compose ps   # confirm agrioptima-postgres is running
```

### 6. Configure environment variables
```bash
cd backend
cp .env.example .env
```
Edit `.env` and fill in:
- `DATABASE_URL` — already pre-filled for local Docker Postgres
- `DATA_GOV_API_KEY` and `DATA_GOV_MANDI_RESOURCE_ID` — free registration at [data.gov.in](https://www.data.gov.in). Optional for initial development; the mandi adapter fails safely (returns `None`) without it.

**Never commit `.env`.** Only `.env.example` (with placeholder values) belongs in git.

### 7. Run tests
```bash
pytest -q
```

---

## Data sources

| Source | Requires key? | Used for |
|---|---|---|
| Open-Meteo | No | Live weather forecast (temperature, rainfall) |
| data.gov.in / AGMARKNET | Yes (free) | Mandi wholesale prices |
| Local crop profile JSON | N/A (team-maintained) | Agronomic eligibility thresholds — see `app/data/crop_profiles.README.md` for exact sourcing per crop |

All external data is labelled by source and freshness (live / cached / unavailable) in the API response — nothing is presented as more certain than it is.

---

## Current status

✅ **Done and tested:**
- Environment, Docker/Postgres, project structure
- Database models (`farmers`, `farms`, `crop_recommendations`, `external_data_cache`)
- Farmer input validation schema
- Crop profile data (6 crops: Tomato, Chilli, Maize, Paddy, Onion, Bajra) with sourced pH ranges
- Deterministic eligibility engine (season, pH, water, budget, rotation rules)
- Transparent scoring formula (soil fit, climate fit, water fit, buyer demand, price, profitability, saturation risk)
- Open-Meteo weather adapter
- data.gov.in mandi price adapter (with safe timeout/fallback handling)
- Recommendation orchestration service (ties eligibility + scoring + adapters together)
- 7+ passing automated tests

⏳ **In progress / not yet started:**
- FastAPI endpoint (`main.py`) exposing `POST /crop/recommend`
- Alembic database migration (tables not yet created in Postgres)
- Persisting Farmer/Farm/CropRecommendation records to the database
- Real buyer demand scoring (currently neutral placeholder)
- End-to-end API test (`test_api.py`)
- Frontend (React) — not started

---

## Running tests

```bash
cd backend
source .agrioptima-ai/bin/activate
pytest -q          # quiet summary
pytest -v          # verbose, lists every test by name
```

---

## Contributing / Git workflow

```bash
git checkout -b feature/your-feature-name
# make changes
pytest -q                    # must pass before committing
git add <specific files>     # avoid `git add .` — double check .env and venv are excluded
git commit -m "feat(team-a): description of change"
git push -u origin feature/your-feature-name
```

Before every push, confirm nothing sensitive is staged:
```bash
git status
```
`backend/.env` and `backend/.agrioptima-ai/` should never appear as tracked or staged files.