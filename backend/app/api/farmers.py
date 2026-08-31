from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Farmer, Farm
import uuid

router = APIRouter(prefix="/api/v1/farmers", tags=["farmers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def list_farmers(db: Session = Depends(get_db)):
    """Return all farmers with their farm count."""
    farmers = db.query(Farmer).all()
    return [
        {
            "farmer_id": f.public_id,
            "name": f.name,
            "village": f.village,
            "district": f.district,
            "state": f.state,
            "farm_count": len(f.farms),
            "created_at": f.created_at.isoformat() if f.created_at else None,
        }
        for f in farmers
    ]


@router.get("/{farmer_id}")
def get_farmer(farmer_id: str, db: Session = Depends(get_db)):
    """Return a single farmer with their farms."""
    farmer = db.query(Farmer).filter(Farmer.public_id == farmer_id).first()
    if not farmer:
        return {"error": "Farmer not found"}

    farms = [
        {
            "farm_id": farm.public_id,
            "area_acres": float(farm.area_acres),
            "season": farm.season,
            "irrigation": farm.irrigation,
            "soil_ph": float(farm.soil_ph),
            "latitude": float(farm.latitude) if farm.latitude else None,
            "longitude": float(farm.longitude) if farm.longitude else None,
        }
        for farm in farmer.farms
    ]

    return {
        "farmer_id": farmer.public_id,
        "name": farmer.name,
        "village": farmer.village,
        "district": farmer.district,
        "state": farmer.state,
        "farms": farms,
        "created_at": farmer.created_at.isoformat() if farmer.created_at else None,
    }


@router.post("")
def create_farmer(payload: dict, db: Session = Depends(get_db)):
    """Create a new farmer record and return stable IDs."""
    public_id = f"FARMER_{uuid.uuid4().hex[:8].upper()}"
    farmer = Farmer(
        public_id=public_id,
        name=payload.get("name", ""),
        village=payload.get("village", ""),
        district=payload.get("district", ""),
        state=payload.get("state"),
    )
    db.add(farmer)
    db.flush()

    farm_public_id = f"FARM_{uuid.uuid4().hex[:8].upper()}"
    farm = Farm(
        public_id=farm_public_id,
        farmer_id=farmer.id,
        area_acres=payload.get("area_acres", 0),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        season=payload.get("season", ""),
        irrigation=payload.get("irrigation", ""),
        soil_ph=payload.get("soil_ph", 0),
        nitrogen=payload.get("nitrogen", 0),
        phosphorus=payload.get("phosphorus", 0),
        potassium=payload.get("potassium", 0),
        soil_source=payload.get("soil_source", "manual_entry"),
        soil_test_date=payload.get("soil_test_date"),
        previous_crop=payload.get("previous_crop", ""),
        investment_budget_paise=payload.get("investment_budget_rupees", 0) * 100,
        sowing_period=payload.get("sowing_period", ""),
    )
    db.add(farm)
    db.commit()

    return {
        "farmer_id": public_id,
        "farm_id": farm_public_id,
    }
