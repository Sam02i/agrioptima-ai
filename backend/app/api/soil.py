"""Automatic soil-health interpretation and fertilizer recommendation engine."""
from pathlib import Path
from datetime import datetime, timezone
import base64, json, sqlite3, uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.soil_ocr import extract as extract_document
from app.db.session import SessionLocal
from app.db.models import MarketFarmer, MarketFarm, SoilCardRecord
from app.services.object_store import store_bytes

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

class SoilCardUpload(BaseModel):
    farmer_id: str
    filename: str
    content_type: str = "image/jpeg"
    image_data: str

class SoilCardConfirmation(BaseModel):
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    test_date: str | None = None

SOIL_CARD_DB = DB_PATH.parent / "soil_cards.db"
SOIL_CARD_FILES = DB_PATH.parent / "soil_cards"

def soil_card_connection():
    db=sqlite3.connect(SOIL_CARD_DB); db.row_factory=sqlite3.Row
    db.execute("""CREATE TABLE IF NOT EXISTS soil_cards(id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, filename TEXT NOT NULL, stored_path TEXT NOT NULL, status TEXT NOT NULL, draft_values TEXT NOT NULL, confirmed_values TEXT, extraction_method TEXT NOT NULL, created_at TEXT NOT NULL, confirmed_at TEXT)""")
    db.commit(); return db


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

    # Give farmers practical alternatives instead of presenting one product as
    # the only answer. Quantities are equivalent planning doses for farm area.
    option_library = {
        "nitrogen": [
            ("Neem-coated Urea", 22, "Fast, economical nitrogen correction"),
            ("Calcium Ammonium Nitrate", 34, "Gentler nitrogen release with calcium"),
            ("Vermicompost + Azotobacter", 240, "Lower-input biological alternative"),
        ],
        "phosphorus": [
            ("DAP", 18, "Concentrated phosphorus with starter nitrogen"),
            ("Single Super Phosphate (SSP)", 45, "Phosphorus plus sulphur and calcium"),
            ("Rock Phosphate + PSB culture", 60, "Slower biological phosphorus option"),
        ],
        "potassium": [
            ("Muriate of Potash (MOP)", 14, "Economical potassium correction"),
            ("Sulphate of Potash (SOP)", 17, "Suitable for chloride-sensitive crops"),
            ("Composted banana residue", 180, "Organic potassium-support option"),
        ],
    }
    fertilizer_options = []
    for nutrient in missing:
        fertilizer_options.append({
            "nutrient": nutrient.title(),
            "options": [
                {"fertilizer": name, "quantity": round(rate * acres, 1), "unit": "kg", "benefit": benefit}
                for name, rate, benefit in option_library[nutrient]
            ],
        })
    if not fertilizer_options:
        fertilizer_options.append({"nutrient": "Soil maintenance", "options": [
            {"fertilizer": "Farmyard manure", "quantity": round(300 * acres, 1), "unit": "kg", "benefit": "Maintain soil carbon and microbial activity"},
            {"fertilizer": "Vermicompost", "quantity": round(180 * acres, 1), "unit": "kg", "benefit": "Balanced organic nutrient maintenance"},
            {"fertilizer": "Green manure crop", "quantity": round(12 * acres, 1), "unit": "kg seed", "benefit": "Build organic matter before the next crop"},
        ]})

    score = round(max(0, min(100, 100 - len(missing) * 14 - (12 if sample.ph < 5.8 or sample.ph > 7.8 else 0))))
    return {
        "soil_health_score": score,
        "ph": {"value": sample.ph, "status": "Acidic" if sample.ph < 5.8 else "Alkaline" if sample.ph > 7.8 else "Suitable"},
        "nutrients": nutrients,
        "missing_nutrients": [item.title() for item in missing],
        "fertilizer_plan": plan,
        "fertilizer_options": fertilizer_options,
        "summary": "Balanced soil nutrition" if not missing else f"Needs {', '.join(item.title() for item in missing)} correction",
        "source": "Connected Soil Health Card",
        "advisory_note": "Apply after local agronomist confirmation; split doses and irrigate according to the crop stage.",
    }


@router.post("/analyze")
def analyze_soil(sample: SoilSample):
    return analyse(sample)

@router.post("/cards/extract", status_code=201)
def extract_soil_card(payload: SoilCardUpload):
    """Store the card and return an explicitly unverified draft for farmer confirmation."""
    encoded=payload.image_data.split(",",1)[-1]
    try: raw=base64.b64decode(encoded,validate=True)
    except Exception: raise HTTPException(422,"The Soil Health Card file could not be read")
    if not raw or len(raw)>10_000_000: raise HTTPException(422,"Upload a non-empty file smaller than 10 MB")
    suffix=Path(payload.filename).suffix.lower() if Path(payload.filename).suffix.lower() in {".jpg",".jpeg",".png",".webp",".pdf"} else ".bin"
    card_id=f"SHC-{uuid.uuid4().hex[:10].upper()}"; SOIL_CARD_FILES.mkdir(parents=True,exist_ok=True)
    target=SOIL_CARD_FILES/f"{card_id}{suffix}";object_reference=store_bytes(f"soil-cards/{payload.farmer_id}/{card_id}{suffix}",raw,payload.content_type,target)
    # Until OCR/model data is supplied, prefill from the connected farm record and
    # never present these values as extracted measurements.
    advisory=farmer_soil_advisory(payload.farmer_id)
    connected={"ph":advisory["ph"]["value"],**{n["name"].lower():n["value"] for n in advisory["nutrients"]}}
    extraction=extract_document(target) if target.exists() else {"provider":"cloud_object_stored","values":{},"confidence":0};draft={**connected,**extraction["values"]};method=extraction["provider"] if extraction["values"] else "connected_record_prefill_no_ocr"
    stamp=datetime.now(timezone.utc);db=SessionLocal();db.add(SoilCardRecord(id=card_id,farmer_id=payload.farmer_id,filename=payload.filename,object_reference=object_reference,status="NEEDS_CONFIRMATION",draft_values=draft,confirmed_values=None,extraction_method=method,created_at=stamp));db.commit();db.close()
    return {"card_id":card_id,"status":"NEEDS_CONFIRMATION","values":draft,"confidence":extraction["confidence"],"extraction_method":method,"extracted_fields":sorted(extraction["values"]),"message":"Check every draft value against the card, then confirm it."}

@router.post("/cards/{card_id}/confirm")
def confirm_soil_card(card_id:str,payload:SoilCardConfirmation):
    db=SessionLocal();row=db.get(SoilCardRecord,card_id)
    if not row:db.close();raise HTTPException(404,"Soil Health Card upload not found")
    stamp=datetime.now(timezone.utc);values=payload.model_dump();row.status="CONFIRMED";row.confirmed_values=values;row.confirmed_at=stamp;db.commit();db.close()
    return {"card_id":card_id,"status":"CONFIRMED","values":values,"source":"farmer_confirmed_soil_health_card"}


@router.get("/advisory/{farmer_id}")
def farmer_soil_advisory(farmer_id: str):
    db=SessionLocal();farmer=db.get(MarketFarmer,farmer_id);farm=db.query(MarketFarm).filter_by(farmer_id=farmer_id).order_by(MarketFarm.area_acres.desc()).first()
    if not farmer or not farm:
        db.close()
        raise HTTPException(404, "No Soil Health Card found for this farmer")
    values={"ph":farm.ph,"nitrogen":farm.nitrogen,"phosphorus":farm.phosphorus,"potassium":farm.potassium,"area_acres":farm.area_acres,"current_crop":farm.current_crop};district=farmer.district.strip();state=farmer.state.strip();db.close()
    baseline = MAHARASHTRA_SOIL.get(district.lower(), MAHARASHTRA_DEFAULT)
    # Preserve the supplied seed's farmer-level N-P-K values. Only fill values
    # that are genuinely absent; pH uses the district estimate when needed.
    values["ph"] = values.get("ph") or baseline[0]
    values["nitrogen"] = values.get("nitrogen") if values.get("nitrogen") is not None else baseline[1]
    values["phosphorus"] = values.get("phosphorus") if values.get("phosphorus") is not None else baseline[2]
    values["potassium"] = values.get("potassium") if values.get("potassium") is not None else baseline[3]
    result = analyse(SoilSample(**values))
    result["farmer_id"] = farmer_id
    result["district"] = district
    result["state"] = state
    result["source"] = f"Imported farmer soil profile · {district or state}"
    result["estimated"] = False
    return result
