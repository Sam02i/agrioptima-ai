"""Read-only farmer and crop-listing marketplace imported from the farmer dataset."""
from pathlib import Path
import sqlite3

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/marketplace", tags=["Farmer Marketplace"])
DB_PATH = Path(__file__).resolve().parents[2] / "data" / "farmer_marketplace.db"


def _connection():
    if not DB_PATH.exists():
        raise HTTPException(503, "Farmer marketplace data is unavailable")
    connection = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    return connection


@router.get("/summary")
def summary():
    with _connection() as db:
        counts = {
            table: db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in ("farmers", "farms", "crop_listings")
        }
        available = db.execute(
            "SELECT COUNT(*), COALESCE(SUM(available_quantity_kg), 0), "
            "COUNT(DISTINCT crop_name) FROM crop_listings WHERE listing_status='AVAILABLE'"
        ).fetchone()
        crops = [dict(row) for row in db.execute(
            "SELECT crop_name, COUNT(*) AS listings, ROUND(SUM(available_quantity_kg), 1) AS available_kg, "
            "ROUND(AVG(price_per_kg), 2) AS average_price_per_kg "
            "FROM crop_listings WHERE listing_status='AVAILABLE' GROUP BY crop_name ORDER BY available_kg DESC"
        )]
    return {
        "farmer_count": counts["farmers"], "farm_count": counts["farms"],
        "listing_count": counts["crop_listings"], "available_listing_count": available[0],
        "available_quantity_kg": available[1], "crop_count": available[2], "crops": crops,
        "source": "Imported farmer marketplace dataset",
    }


@router.get("/farmers")
def farmers():
    query = """
        SELECT f.id AS farmer_id, f.name, f.state, f.district, f.village,
               f.preferred_language, f.profile_status,
               COUNT(DISTINCT fa.id) AS farm_count,
               COUNT(DISTINCT cl.id) AS listing_count,
               COALESCE(SUM(DISTINCT fa.area_acres), 0) AS total_area_acres
        FROM farmers f
        LEFT JOIN farms fa ON fa.farmer_id=f.id
        LEFT JOIN crop_listings cl ON cl.farmer_id=f.id
        GROUP BY f.id ORDER BY f.name
    """
    with _connection() as db:
        rows = [dict(row) for row in db.execute(query)]
        for row in rows:
            row["crops"] = [crop[0] for crop in db.execute(
                "SELECT DISTINCT crop_name FROM crop_listings WHERE farmer_id=? ORDER BY crop_name",
                (row["farmer_id"],),
            )]
    return {"farmers": rows, "count": len(rows)}


@router.get("/farmers/{farmer_id}")
def farmer_detail(farmer_id: str):
    with _connection() as db:
        farmer = db.execute(
            "SELECT id AS farmer_id, name, state, district, village, preferred_language, profile_status "
            "FROM farmers WHERE id=?", (farmer_id,),
        ).fetchone()
        if not farmer:
            raise HTTPException(404, "Farmer not found")
        farms = [dict(row) for row in db.execute(
            "SELECT id AS farm_id, farm_name, latitude, longitude, area_acres, irrigation_type, "
            "water_availability, ph, nitrogen, phosphorus, potassium, previous_crop, current_crop "
            "FROM farms WHERE farmer_id=?", (farmer_id,),
        )]
        needs = db.execute(
            "SELECT investment_budget, primary_goal, needs_crop_recommendation, needs_market_access, "
            "needs_logistics, needs_soil_advisory, preferred_market_distance_km, risk_preference "
            "FROM farmer_needs WHERE farmer_id=?", (farmer_id,),
        ).fetchone()
        listings = [dict(row) for row in db.execute(
            "SELECT id AS listing_id, crop_name, crop_variety, quantity_kg, available_quantity_kg, "
            "price_per_kg, harvest_date, declared_grade, packaging_type, listing_status, district, state "
            "FROM crop_listings WHERE farmer_id=? ORDER BY created_at DESC", (farmer_id,),
        )]
    return {"farmer": dict(farmer), "farms": farms, "needs": dict(needs) if needs else None, "listings": listings}


@router.get("/listings")
def listings(crop: str | None = Query(default=None), status: str = "AVAILABLE"):
    sql = """
        SELECT cl.id AS listing_id, cl.farmer_id, f.name AS farmer_name, cl.farm_id,
               cl.crop_name, cl.crop_variety, cl.quantity_kg, cl.available_quantity_kg,
               cl.price_per_kg, cl.minimum_order_quantity_kg, cl.harvest_date,
               cl.expected_harvest_date, cl.declared_grade, cl.packaging_type,
               cl.listing_status, cl.latitude, cl.longitude, cl.district, cl.state
        FROM crop_listings cl JOIN farmers f ON f.id=cl.farmer_id
        WHERE cl.listing_status=?
    """
    params: list[str] = [status]
    if crop:
        sql += " AND LOWER(cl.crop_name)=LOWER(?)"
        params.append(crop)
    sql += " ORDER BY cl.crop_name, cl.price_per_kg"
    with _connection() as db:
        rows = [dict(row) for row in db.execute(sql, params)]
    return {"listings": rows, "count": len(rows)}
