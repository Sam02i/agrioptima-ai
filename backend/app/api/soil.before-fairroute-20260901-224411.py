"""Automatic soil-health interpretation and fertilizer recommendation engine."""
from pathlib import Path
import sqlite3

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/soil", tags=["Soil Intelligence"])
DB_PATH = Path(__file__).resolve().parents[2] / "data" / "farmer_marketplace.db"

MAHARASHTRA_SOIL = {
    "nashik": (6.8, 72, 48, 55), "pune": (6.5, 68, 42, 50),
    "nagpur": (7.3, 58, 32, 42), "aurangabad": (7.2, 55, 35, 45),
    "ahmednagar": (6.9, 65, 40, 48), "solapur": (7.5, 45, 30, 40),
    "sangli": (6.8, 60, 38, 52), "satara": (6.2, 70, 45, 55),
    "kolhapur": (5.8, 78, 50, 60), "ratnagiri": (5.5, 55, 30, 40),
    "thane": (6.0, 60, 35, 45), "amravati": (7.1, 52, 30, 38),
    "akola": (7.2, 48, 28, 35), "latur": (7.5, 43, 26, 32),
}
MAHARASHTRA_DEFAULT = (6.8, 58, 35, 45)


class SoilSample(BaseModel):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    area_acres: float = 1
    current_crop: str | None = None


def analyse(sample: SoilSample) -> dict:
    targets = {"nitrogen": 70, "phosphorus": 45, "potassium": 55}
    readings = {"nitrogen": sample.nitrogen, "phosphorus": sample.phosphorus, "potassium": sample.potassium}
    nutrients = []
    missing = []
    for name, value in readings.items():
        target = targets[name]
        ratio = value / target if target else 1
        status = "Low" if ratio < .8 else "Moderate" if ratio < 1 else "Sufficient"
        gap = max(0, round(target - value, 1))
        nutrients.append({"name": name.title(), "value": value, "target": target, "status": status, "gap": gap})
        if status != "Sufficient":
            missing.append(name)

    plan = []
    acres = max(sample.area_acres, .1)
    if "nitrogen" in missing:
        plan.append({"fertilizer": "Neem-coated Urea", "quantity": round(22 * acres, 1), "unit": "kg", "purpose": "Correct nitrogen deficiency", "timing": "Split into 2 doses: sowing and 25–30 days"})
    if "phosphorus" in missing:
        plan.append({"fertilizer": "DAP", "quantity": round(18 * acres, 1), "unit": "kg", "purpose": "Improve phosphorus and root establishment", "timing": "Basal dose before sowing"})
    if "potassium" in missing:
        plan.append({"fertilizer": "Muriate of Potash (MOP)", "quantity": round(14 * acres, 1), "unit": "kg", "purpose": "Improve potassium, fruit quality, and stress tolerance", "timing": "Half basal, half near flowering"})
    if sample.ph < 5.8:
        plan.append({"fertilizer": "Agricultural lime", "quantity": round(80 * acres, 1), "unit": "kg", "purpose": "Raise acidic soil pH", "timing": "Apply 3–4 weeks before sowing"})
    elif sample.ph > 7.8:
        plan.append({"fertilizer": "Gypsum + organic compost", "quantity": round(75 * acres, 1), "unit": "kg", "purpose": "Improve alkaline soil structure and nutrient availability", "timing": "Incorporate before irrigation"})
    if not plan:
        plan.append({"fertilizer": "Well-decomposed farmyard manure", "quantity": round(300 * acres, 1), "unit": "kg", "purpose": "Maintain balanced fertility and soil carbon", "timing": "Incorporate before sowing"})

    score = round(max(0, min(100, 100 - len(missing) * 14 - (12 if sample.ph < 5.8 or sample.ph > 7.8 else 0))))
    return {
        "soil_health_score": score,
        "ph": {"value": sample.ph, "status": "Acidic" if sample.ph < 5.8 else "Alkaline" if sample.ph > 7.8 else "Suitable"},
        "nutrients": nutrients,
        "missing_nutrients": [item.title() for item in missing],
        "fertilizer_plan": plan,
        "summary": "Balanced soil nutrition" if not missing else f"Needs {', '.join(item.title() for item in missing)} correction",
        "source": "Connected Soil Health Card",
        "advisory_note": "Apply after local agronomist confirmation; split doses and irrigate according to the crop stage.",
    }


@router.post("/analyze")
def analyze_soil(sample: SoilSample):
    return analyse(sample)


@router.get("/advisory/{farmer_id}")
def farmer_soil_advisory(farmer_id: str):
    if not DB_PATH.exists():
        raise HTTPException(503, "Farmer soil records are unavailable")
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    row = db.execute("""SELECT fa.ph, fa.nitrogen, fa.phosphorus, fa.potassium,
        fa.area_acres, fa.current_crop, f.district, f.state
        FROM farms fa JOIN farmers f ON f.id=fa.farmer_id
        WHERE fa.farmer_id=? ORDER BY fa.area_acres DESC LIMIT 1""", (farmer_id,)).fetchone()
    db.close()
    if not row:
        raise HTTPException(404, "No Soil Health Card found for this farmer")
    values = dict(row)
    district = str(values.pop("district") or "").strip()
    state = str(values.pop("state") or "").strip()
    baseline = MAHARASHTRA_SOIL.get(district.lower(), MAHARASHTRA_DEFAULT)
    values.update(ph=baseline[0], nitrogen=baseline[1], phosphorus=baseline[2], potassium=baseline[3])
    result = analyse(SoilSample(**values))
    result["farmer_id"] = farmer_id
    result["district"] = district
    result["state"] = state
    result["source"] = f"Regional soil baseline · {district or state or 'Maharashtra'}"
    result["estimated"] = True
    return result
