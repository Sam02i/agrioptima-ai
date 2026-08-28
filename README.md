# crop_profiles.v1.json — Field Guide & Data Sources

This file explains what each field in `crop_profiles.v1.json` means and where its values came from.
It exists so the JSON file itself can stay clean, valid JSON (no comments allowed in JSON).

## Field meanings

| Field | Meaning |
|---|---|
| `crop` | Canonical crop name used everywhere in the app (API, UI, database). |
| `seasons` | Which growing seasons (`Kharif`, `Rabi`, `Zaid`) this crop is eligible in. |
| `min_ph` / `max_ph` | Acceptable soil pH range. Used as a **hard eligibility rule**. |
| `water_requirement` | `low` / `medium` / `high` — compared against the farmer's irrigation level as a **hard eligibility rule**. |
| `minimum_investment_rupees_per_acre` | Budget threshold. If the farmer's budget-per-acre is below this, the crop is rejected. |
| `minimum_n` / `minimum_p` / `minimum_k` | Soil nutrient thresholds. **Not** used in hard eligibility — reserved for the future `soil_fit` scoring step (Section 14 of the PRD). |
| `reference_yield_kg_per_acre` | Rough expected yield per acre, used later for profitability estimates. Always an estimate, never a guarantee. |
| `agronomy_reference` | Honesty label — states where this row's numbers came from and its review status. |

## Data sources (verified 2026-08-29)

**Soil pH ranges** below are checked against real, named agricultural sources (mostly Indian government/university agriculture bodies). **Water requirement class, budget thresholds, and N/P/K minimums remain team-estimated** — no public source publishes a "minimum soil N/P/K level required for basic crop eligibility" in the form this app needs (public sources describe fertilizer *application* rates, which is a different measurement — see note below).

| Crop | Verified pH range | Source | What's still estimated |
|---|---|---|---|
| Tomato | 6.0–7.0 (some sources cite up to 7.5) | TNAU Agritech Portal (agritech.tnau.ac.in); BigHaat farming guide | Water class, budget, N/P/K minimums |
| Chilli | 6.0–7.5 | Agritell.com cultivation guide; ICL India crop nutrition guide | Water class, budget, N/P/K minimums |
| Maize | 5.5–7.5 (general cereal tolerance; TNAU has a dedicated fertigation page) | TNAU Agritech Portal | Water class, budget, N/P/K minimums |
| Paddy | 5.5–7.0 (TNAU has a dedicated rice nutrient management page) | TNAU Agritech Portal (agritech.tnau.ac.in/expert_system/paddy) | Water class, budget, N/P/K minimums |
| Onion | 6.0–7.5 | **ICAR — Directorate of Onion and Garlic Research** (dogr.icar.gov.in), official climate & soil page | Water class, budget, N/P/K minimums |
| Bajra | 5.5–8.0 (wide tolerance is a defining trait of this crop) | General pearl millet agronomy guidance; consistent across multiple sources | Water class, budget, N/P/K minimums |

### Important distinction: soil-test minimums vs. fertilizer application rates

Public sources (TNAU, ICAR, etc.) mostly publish **fertilizer application rates** — how much N/P/K to *add* to a field per hectare. Your `minimum_n`, `minimum_p`, `minimum_k` fields represent something different: the **minimum existing soil-test level** a farm needs before a crop is considered eligible. These aren't directly interchangeable, and no clean public source publishes the latter in a form usable here. Treating a fertilizer dose as if it were a soil-test threshold would be a real inaccuracy — so these three fields remain honestly labeled as team estimates, not sourced figures, until someone finds (or an agronomist provides) an actual soil-test-based reference.

## Recommended reference sources for real-world validation

Before using this data beyond a class demo/hackathon prototype, cross-check each crop's thresholds against a named, citable source such as:

- **ICAR (Indian Council of Agricultural Research)** crop-specific package of practices — https://icar.org.in
- **State Agricultural University extension bulletins** (e.g., a State Agri University's crop guide for your region)
- **FAO Crop Calendar / AQUASTAT** — https://cropcalendar.apps.fao.org/ and https://www.fao.org/aquastat/en/databases/crop-calendar/
- Your local **Krishi Vigyan Kendra (KVK)** or district agriculture extension office

## How to update this file responsibly

1. Find the real source for a crop's pH/water/nutrient/budget range.
2. Update the row in `crop_profiles.v1.json`.
3. Update `agronomy_reference` in that same row to name the actual source and the date reviewed — for example:
   `"agronomy_reference": "ICAR package of practices for Chilli, reviewed 2026-09-01"`
4. Update the table above in this README to match.
5. Never claim a value is from a named source unless you actually checked it there.