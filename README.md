# AgriOptimaᴬᴵ

**Connected agricultural intelligence for farmers, buyers, quality verification, and farm-to-market trade.**

[![Try the live demo](https://img.shields.io/badge/Try%20the%20live%20demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://agrioptima-rczdd6u2n-samikshas-projects-3b436fe6.vercel.app/)

**[Open AgriOptimaᴬᴵ live →](https://agrioptima-rczdd6u2n-samikshas-projects-3b436fe6.vercel.app/)**

AgriOptimaᴬᴵ brings crop planning, soil-health guidance, mandi price discovery, produce listings, buyer intelligence, freshness assessment, credit scoring, logistics optimization, shipment tracking, and digital produce passports into one connected platform.

The application is designed around a simple principle: recommendations should be explainable, and measured, estimated, predicted, and demonstration data should never be presented as the same thing.

> **Status:** Hackathon-ready integrated prototype with a production-oriented data foundation. Authentication, managed infrastructure, field validation, and security hardening are still required before public production deployment.

## Highlights

### Farmer workspace

- Farmer profiles with farm, location, irrigation, crop, budget, and soil context
- Current-crop guidance that preserves the farmer's crop choice
- Explainable crop recommendations and rejection reasons
- Soil-health interpretation with practical fertilizer alternatives
- Soil Health Card upload, editable extraction draft, and farmer confirmation
- AGMARKNET mandi price references for better listing decisions
- Manual produce listings with images, quantity, grade, packaging, and price
- Produce freshness and quality assessment
- Shared orders, shipment progress, route maps, passports, and payment status
- Multilingual interface and read-aloud support

### Buyer workspace

- Produce marketplace backed by farmer listing records
- Crop-specific marketplace photographs and supplier profiles
- Side-by-side supplier comparison and estimated landed cost
- Persistent order creation from a marketplace listing
- Shared shipment tracking and digital produce passports
- Received-produce freshness verification
- Explainable buyer credit position and simulations
- Supplier scoring and logistics optimization
- Buyer-specific workspace state

### Trust and traceability

- One shared order record across the farmer and buyer portals
- Persistent shipments, passports, payments, inspections, and audit events
- Dispatch and receiving quality checkpoints
- Explicit provenance labels for confirmed, estimated, predicted, and demo data
- Safe fallbacks when an external data source or model is unavailable

## End-to-end journey

```mermaid
flowchart LR
    A[Farmer profile] --> B[Soil and crop guidance]
    B --> C[Mandi-informed produce listing]
    C --> D[Buyer marketplace]
    D --> E[Supplier comparison]
    E --> F[Saved order]
    F --> G[Shipment and live route]
    G --> H[Digital produce passport]
    H --> I[Receiving quality check]
    I --> J[Payment record]
```

## Technology

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Motion |
| Maps | Leaflet and OpenStreetMap |
| Backend | Python 3.12, FastAPI, Pydantic |
| Data | PostgreSQL/SQLAlchemy for core persistence; SQLite for the integrated marketplace and trade prototype |
| ML and image processing | TensorFlow/Keras, Pillow, NumPy |
| External intelligence | Open-Meteo and data.gov.in/AGMARKNET |
| Testing | pytest, TypeScript compiler, Vite production build |

## Repository structure

```text
agrioptima-ai/
├── frontend/                  # React farmer, buyer, and landing experiences
│   └── src/
│       ├── buyerExact/        # Buyer intelligence workspace
│       ├── components/        # Farmer workspace and shared components
│       ├── agriloop/          # Animated landing experience
│       ├── api/               # Typed frontend API clients
│       └── i18n/              # Global language support
├── backend/
│   ├── app/
│   │   ├── api/               # Farmer, soil, marketplace, trade, credit, etc.
│   │   ├── adapters/          # Weather and mandi integrations
│   │   ├── services/          # Recommendation and persistence logic
│   │   ├── db/                # SQLAlchemy models and sessions
│   │   └── tests/             # Backend tests
│   ├── models/                # Freshness model artifacts
│   └── data/                  # Local development databases and uploads
├── data/                      # Credit and model-supporting datasets
├── docs/                      # Supporting documentation
└── docker-compose.yml         # Local PostgreSQL service
```

## Local setup

### Requirements

- Python 3.12
- Node.js 20 or newer
- npm
- Docker Desktop, if using PostgreSQL

### 1. Configure the backend

```bash
cd backend
python3.12 -m venv .agrioptima-ai
source .agrioptima-ai/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
```

Configure `backend/.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://agrioptima:agrioptima_local_only@localhost:5432/agrioptima
DATA_GOV_API_KEY=your_data_gov_api_key
DATA_GOV_MANDI_RESOURCE_ID=your_agmarknet_resource_id
WEATHER_CACHE_MINUTES=360
MANDI_CACHE_MINUTES=720
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The data.gov.in credentials are optional for basic local operation. When they are absent or the public service is unavailable, the interface should identify mandi data as unavailable rather than inventing prices.

### 2. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

### 3. Start the API

```bash
cd backend
source .agrioptima-ai/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 4. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Freshness model

The tomato freshness engine expects the Keras model at:

```text
backend/models/tomato_fgrade_5class/tomato_fgrade_5class.keras
```

Check model availability with:

```text
GET /freshness/health
```

If the model is absent or cannot load, the API returns an explicit model-unavailable response instead of a fabricated score.

## Important API groups

| Area | Example endpoints |
|---|---|
| Platform | `GET /health` |
| Crop planning | `POST /crop/recommend` |
| Farmers | `GET /farmers`, `GET /farmers/{farmer_id}` |
| Soil health | `GET /soil/advisory/{farmer_id}`, `POST /soil/cards/extract` |
| Marketplace | `GET /marketplace/listings`, `POST /marketplace/listings` |
| Mandi prices | `GET /marketplace/mandi-prices?crop=Tomato&district=Nashik` |
| Freshness | `POST /freshness/tomato/predict`, `POST /freshness/tomato/inspect` |
| Trade workflow | `POST /trade/orders`, `GET /trade/orders` |
| Shipments | `GET /trade/shipments/{shipment_id}` |
| Quality inspections | `POST /trade/orders/{order_id}/inspections` |
| Payments | `PATCH /trade/orders/{order_id}/payment` |
| Buyer credit | `GET /credit/buyer/{buyer_id}/profile` |
| Supplier ranking | `POST /ranking/score` |
| Logistics | `POST /logistics/optimize` |

The interactive Swagger documentation is the canonical reference for request and response schemas.

## Soil Health Card workflow

The current workflow deliberately separates a saved document from a verified measurement:

1. The farmer uploads a photograph or PDF.
2. The backend stores the original file and creates a draft.
3. Draft values are displayed for review.
4. The farmer or assisted operator corrects and confirms the values.
5. Confirmed values can be used for soil and fertilizer guidance.

The current extractor uses the connected farm record as an explicitly labelled draft; it does **not** claim OCR accuracy. A production deployment should connect a tested OCR/document-understanding provider, validate units, preserve per-field confidence, and require manual review for uncertain values.

## Data provenance

AgriOptimaᴬᴵ uses four data classes:

| Label | Meaning |
|---|---|
| Confirmed | Entered or reviewed by the farmer, operator, laboratory, or buyer |
| Live/cached external | Retrieved from a named external source with a timestamp |
| Model prediction | Generated by a versioned model and accompanied by confidence/evidence |
| Regional estimate/demo | Planning fallback that must not be treated as a measured fact |

Fertilizer guidance is decision support, not a replacement for a laboratory test or qualified local agronomist.

## Testing

Backend:

```bash
cd backend
source .agrioptima-ai/bin/activate
pytest -q
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

The trade workflow test verifies that an order created from a listing is visible to both the corresponding buyer and farmer and that available listing quantity is reduced.

## Current limitations

- Authentication and role-based access control are not yet implemented.
- Marketplace and trade persistence currently use local SQLite files for the integrated prototype.
- Soil-card OCR requires a production document-understanding provider and labelled validation set.
- Live mandi coverage depends on the availability and quality of data.gov.in records.
- Recommendation and fertilizer rules require regional agronomist validation before field deployment.
- Payments are recorded as workflow state; no real payment gateway is connected.
- Map tracking represents saved shipment coordinates; a vehicle GPS feed is required for true real-time tracking.
- Large marketplace assets should be converted to optimized WebP/AVIF variants before deployment.

## Production roadmap

- Farmer and buyer authentication, consent, and role permissions
- Managed PostgreSQL and object storage with encryption and backups
- OCR integration with field-level confidence and unit normalization
- Real GPS, notification, and payment integrations
- Offline-first farmer flows for weak connectivity
- Monitoring, rate limiting, secrets management, and security testing
- Model registry, evaluation reports, drift monitoring, and rollback support
- Accessibility testing and complete reviewed translations
- Pilot validation with farmers, FPOs, buyers, laboratories, and agronomists

## Security

- Never commit `backend/.env`, API keys, farmer documents, model credentials, or production databases.
- Use anonymized datasets for demonstrations and model development.
- Collect and retain farmer data only with explicit consent.
- Treat Soil Health Cards and financial records as sensitive information.

If you discover a security issue, report it privately to the project maintainers rather than opening a public issue containing sensitive details.

## License

No open-source license has been declared yet. Until a license is added, the repository should be treated as **all rights reserved**.

---

Built to make agricultural decision support more understandable, connected, and accountable—from the field to the buyer's warehouse.
