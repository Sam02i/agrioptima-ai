<div align="center">

# AgriOptimaᴬᴵ

### From soil intelligence to trusted sale—one connected agricultural platform

[![Live Demo](https://img.shields.io/badge/OPEN_LIVE_DEMO-AgriOptimaᴬᴵ-c7f633?style=for-the-badge&labelColor=153f2e)](https://agrioptima-rczdd6u2n-samikshas-projects-3b436fe6.vercel.app/)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000?logo=vercel)](https://vercel.com/)
[![Render](https://img.shields.io/badge/API-Render-6c4cff)](https://render.com/)

**Farmer guidance · Soil health · Mandi prices · Produce quality · Buyer intelligence · Logistics · Traceable trade**

</div>

---

## Why AgriOptimaᴬᴵ?

Agricultural decisions are usually fragmented. A farmer may receive crop advice in one place, check mandi prices somewhere else, negotiate without reliable quality evidence, and lose visibility after dispatch. Buyers face the reverse problem: scattered farmer records, uncertain quality, unclear credit risk, and expensive logistics.

AgriOptimaᴬᴵ connects these decisions into one explainable workflow for farmers and buyers. It does not treat estimates as facts: every important result is identified as confirmed, externally sourced, model-predicted, or a regional planning estimate.

| Farmer needs | Buyer needs | AgriOptimaᴬᴵ connects |
|---|---|---|
| Simple crop and fertilizer actions | Reliable produce discovery | Shared farmer and listing records |
| Fair price context | Comparable suppliers | Mandi references and landed cost |
| Proof of produce quality | Reduced receiving risk | Freshness evidence and passports |
| Visibility after sale | Delivery visibility | Shared orders and route tracking |

## Three-minute demo

1. Open the **Farmer workspace** and select the example farmer.
2. Review the current-crop plan and explainable recommendations.
3. Open **Soil & fertilizer** to see deficiencies, alternatives, and data provenance.
4. Use **Prices & listing** to compare mandi references and publish produce.
5. Switch to the **Buyer workspace** and open Marketplace.
6. Compare sellers, inspect a farmer, and create an order.
7. Open Orders or Produce Passports to track delivery and verify received quality.

> Render’s free backend can sleep while inactive. The first data request may take approximately one minute while it wakes up.

## Connected workflow

```mermaid
flowchart LR
    A["Farmer profile"] --> B["Soil and crop guidance"]
    B --> C["Mandi-informed listing"]
    C --> D["Buyer marketplace"]
    D --> E["Supplier comparison"]
    E --> F["Saved order"]
    F --> G["Shipment route"]
    G --> H["Produce passport"]
    H --> I["Receiving inspection"]
    I --> J["Payment record"]
```

## What works today

### Farmer workspace

- Connected farmer, farm, irrigation, crop, budget, and soil profiles
- Current-crop guidance designed not to force an unfamiliar crop choice
- Explainable crop rankings, economics, confidence, and rejection reasons
- Soil Health Card upload with editable draft and confirmation
- Nutrient status translated into understandable field actions
- Multiple fertilizer alternatives with dosage and timing guidance
- Recent AGMARKNET mandi references for pricing decisions
- Manual produce listings with images, grade, quantity, packaging, and price
- Freshness assessment before listing or dispatch
- Orders, shipment route, passport, inspection, and payment visibility
- Multilingual interface and read-aloud support

### Buyer workspace

- Farmer-backed produce marketplace with crop-specific imagery
- Search and filters for crop, grade, distance, and availability
- Farmer profiles and side-by-side supplier comparison
- Price, freshness, reliability, distance, quantity, and landed-cost evidence
- Persistent marketplace order creation
- Buyer-specific orders and digital produce passports
- Receiving-image verification through the freshness engine
- Explainable credit score, position, draw, and repayment simulations
- Supplier scoring and direct/pooled/hub logistics optimization

### Shared trust layer

- One order record visible to both farmer and buyer
- Persistent shipments, passports, payments, inspections, and audit events
- Dispatch and receiving quality checkpoints
- Explicit source and confidence labels
- Graceful unavailable states instead of fabricated live data

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ React + TypeScript frontend                                 │
│ Landing experience │ Farmer workspace │ Buyer workspace    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS JSON API
┌────────────────────────────▼────────────────────────────────┐
│ FastAPI application                                         │
│ Crop │ Soil │ Marketplace │ Freshness │ Credit │ Logistics │
│ Orders │ Shipments │ Passports │ Inspections │ Payments     │
└──────────────┬───────────────────────┬──────────────────────┘
               │                       │
┌──────────────▼─────────────┐  ┌──────▼──────────────────────┐
│ PostgreSQL / local stores  │  │ External/model intelligence │
│ Farmers, results, trade    │  │ AGMARKNET, weather, Keras   │
└────────────────────────────┘  └─────────────────────────────┘
```

| Layer | Technology |
|---|---|
| Web experience | React 19, TypeScript, Vite, Tailwind CSS, Motion |
| Maps | Leaflet and OpenStreetMap |
| API | Python 3.12, FastAPI, Pydantic |
| Persistence | PostgreSQL/Neon, SQLAlchemy; SQLite prototype stores |
| ML and images | TensorFlow/Keras, Pillow, NumPy |
| External data | Open-Meteo and data.gov.in/AGMARKNET |
| Hosting | Vercel frontend and Render API |
| Verification | pytest, TypeScript compiler, Vite production build |

## Data integrity by design

| Label | Meaning |
|---|---|
| **Confirmed** | Reviewed by a farmer, operator, laboratory, or buyer |
| **Live/cached external** | Retrieved from a named provider with a timestamp |
| **Model prediction** | Produced by a versioned model with confidence evidence |
| **Regional estimate** | Planning fallback—not a laboratory measurement |
| **Demo record** | Synthetic example retained only to demonstrate the workflow |

No unconfirmed Soil Health Card extraction should be used as a fertilizer measurement. Fertilizer guidance is decision support and requires regional agronomic validation before field deployment.

## Repository map

```text
agrioptima-ai/
├── frontend/
│   └── src/
│       ├── agriloop/          # Landing experience
│       ├── buyerExact/        # Buyer intelligence workspace
│       ├── components/        # Farmer and shared experiences
│       ├── api/               # Frontend API clients
│       └── i18n/              # Language support
├── backend/
│   ├── app/
│   │   ├── api/               # Domain API routes
│   │   ├── adapters/          # Weather and mandi integrations
│   │   ├── services/          # Recommendation and persistence logic
│   │   ├── db/                # SQLAlchemy models and sessions
│   │   └── tests/             # Backend verification
│   ├── models/                # Freshness model artifact
│   └── data/                  # Development stores and uploads
├── data/                      # Supporting model datasets
├── docs/
└── docker-compose.yml
```

## Run locally

### Requirements

- Python 3.12
- Node.js 20+
- npm
- Docker Desktop for local PostgreSQL

### Backend

```bash
cd backend
python3.12 -m venv .agrioptima-ai
source .agrioptima-ai/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configure `backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://agrioptima:agrioptima_local_only@localhost:5432/agrioptima
DATA_GOV_API_KEY=your_optional_data_gov_key
DATA_GOV_MANDI_RESOURCE_ID=your_optional_resource_id
WEATHER_CACHE_MINUTES=360
MANDI_CACHE_MINUTES=720
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start PostgreSQL and the API:

```bash
docker compose up -d
cd backend
source .agrioptima-ai/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API health and documentation:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend uses this production-safe API configuration:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Open `http://localhost:5173`.

## Freshness model

The tomato classifier is loaded lazily from:

```text
backend/models/tomato_fgrade_5class/tomato_fgrade_5class.keras
```

Check readiness through `GET /freshness/health`. If the artifact cannot load, the API returns an explicit unavailable response rather than generating a fake score.

## Main API groups

| Domain | Endpoints |
|---|---|
| Platform | `GET /health`, `GET /docs` |
| Crop guidance | `POST /crop/recommend` |
| Farmers | `GET /farmers`, `GET /farmers/{farmer_id}` |
| Soil | `GET /soil/advisory/{farmer_id}`, `POST /soil/cards/extract` |
| Marketplace | `GET/POST /marketplace/listings`, `GET /marketplace/mandi-prices` |
| Freshness | `POST /freshness/tomato/predict`, `POST /freshness/tomato/inspect` |
| Trade | `POST /trade/orders`, `GET /trade/orders` |
| Tracking | `GET /trade/shipments/{shipment_id}` |
| Inspection/payment | `POST /trade/orders/{id}/inspections`, `PATCH /trade/orders/{id}/payment` |
| Buyer intelligence | `/credit`, `/ranking`, and `/logistics` groups |

The interactive FastAPI documentation is the canonical schema reference.

## Verify changes

```bash
cd backend
source .agrioptima-ai/bin/activate
pytest -q

cd ../frontend
npm run lint
npm run build
```

## Production status

The integrated prototype is appropriate for a hackathon demonstration. Before field production, it still needs:

- Authentication, farmer consent, and role-based permissions
- Complete migration of local SQLite workflows to managed PostgreSQL
- Private object storage for soil cards and produce images
- Tested OCR with unit detection and field-level confidence
- Agronomist-reviewed regional recommendation rules
- Real GPS, notification, and payment integrations
- Monitoring, rate limiting, backups, secret rotation, and security testing
- Offline-first workflows and reviewed language translations
- Field validation with farmers, FPOs, buyers, laboratories, and agronomists

## Security

- Never commit `.env`, connection strings, API keys, farmer documents, or credentials.
- Treat soil reports and financial records as sensitive personal information.
- Use anonymized data for demonstrations and model development.
- Rotate a credential immediately if it is exposed in an issue, commit, screenshot, or chat.

## License

No open-source license has been declared. Until one is added, this repository should be treated as **all rights reserved**.

---

<div align="center">

**AgriOptimaᴬᴵ — understandable decisions, verifiable quality, connected trade.**

[Try the live platform](https://agrioptima-rczdd6u2n-samikshas-projects-3b436fe6.vercel.app/) · [Explore the API locally](http://127.0.0.1:8000/docs)

</div>
