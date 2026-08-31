"""
Persist recommendation results to Postgres.

Creates Farmer → Farm → CropRecommendation records atomically.
Keeps the recommendation service itself DB-free.
"""

import uuid
from sqlalchemy.orm import Session
from app.db.models import Farmer, Farm, CropRecommendation


def persist_recommendation(db: Session, profile: dict, result: dict) -> str:
    """
    Save a farmer profile and its recommendations to the database.
    Returns the farmer public_id for reference.
    """
    # 1. Create Farmer
    farmer_public_id = f"FARMER_{uuid.uuid4().hex[:8].upper()}"
    farmer = Farmer(
        public_id=farmer_public_id,
        name=profile.get("name", ""),
        village=profile.get("village", ""),
        district=profile.get("district", ""),
        state=profile.get("state"),
    )
    db.add(farmer)
    db.flush()

    # 2. Create Farm
    farm_public_id = f"FARM_{uuid.uuid4().hex[:8].upper()}"
    farm = Farm(
        public_id=farm_public_id,
        farmer_id=farmer.id,
        area_acres=profile.get("area_acres", 0),
        latitude=profile.get("latitude"),
        longitude=profile.get("longitude"),
        season=profile.get("season", ""),
        irrigation=profile.get("irrigation", ""),
        soil_ph=profile.get("soil_ph", 0),
        nitrogen=profile.get("nitrogen", 0),
        phosphorus=profile.get("phosphorus", 0),
        potassium=profile.get("potassium", 0),
        soil_source=profile.get("soil_source", "manual_entry"),
        previous_crop=profile.get("previous_crop", ""),
        investment_budget_paise=profile.get("investment_budget_rupees", 0) * 100,
        sowing_period=profile.get("sowing_period", ""),
    )
    db.add(farm)
    db.flush()

    # 3. Create CropRecommendation for each ranked crop
    recommendation_ids = []
    for rec in result.get("recommendations", []):
        rec_public_id = f"REC_{uuid.uuid4().hex[:8].upper()}"
        crop_rec = CropRecommendation(
            public_id=rec_public_id,
            farmer_id=farmer.id,
            farm_id=farm.id,
            crop=rec["crop"],
            opportunity_score=rec["opportunity_score"],
            confidence=rec["confidence"],
            score_breakdown=rec.get("score_breakdown", {}),
            reason_codes=rec.get("reason_codes", []),
            explanations=rec.get("explanations", []),
            source_snapshot=rec.get("sources", []),
        )
        db.add(crop_rec)
        recommendation_ids.append(rec_public_id)

    db.commit()

    return farmer_public_id
