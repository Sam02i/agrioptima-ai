"""Idempotent import of the single local demo journey into production tables."""
from pathlib import Path
import json, sqlite3
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from app.db.models import MarketFarmer, MarketFarm, FarmerNeed, CropListing, TradeOrder, TradeShipment, TradePassport, TradePayment, TradeAuditEvent

DATA=Path(__file__).resolve().parents[2]/"data"

def _rows(path:Path,table:str):
    if not path.exists(): return []
    db=sqlite3.connect(path);db.row_factory=sqlite3.Row
    try:return [dict(row) for row in db.execute(f"SELECT * FROM {table}")]
    except sqlite3.Error:return []
    finally:db.close()

def seed_platform(db:Session)->dict:
    """Import only when the corresponding PostgreSQL table is empty."""
    imported={"farmers":0,"farms":0,"needs":0,"listings":0,"orders":0}
    market=DATA/"farmer_marketplace.db"
    if db.query(MarketFarmer).count()==0:
        for r in _rows(market,"farmers"):
            db.add(MarketFarmer(id=r["id"],name=r["name"],state=r.get("state") or "",district=r.get("district") or "",village=r.get("village") or "",preferred_language=r.get("preferred_language") or "en",profile_status=r.get("profile_status") or "COMPLETE"));imported["farmers"]+=1
        db.flush()
        for r in _rows(market,"farms"):
            db.add(MarketFarm(id=r["id"],farmer_id=r["farmer_id"],farm_name=r.get("farm_name") or "My farm",latitude=r.get("latitude"),longitude=r.get("longitude"),area_acres=r.get("area_acres") or 0.1,irrigation_type=r.get("irrigation_type") or "limited",water_availability=r.get("water_availability") or "medium",ph=r.get("ph"),nitrogen=r.get("nitrogen"),phosphorus=r.get("phosphorus"),potassium=r.get("potassium"),previous_crop=r.get("previous_crop"),current_crop=r.get("current_crop")));imported["farms"]+=1
        for r in _rows(market,"farmer_needs"):
            db.add(FarmerNeed(farmer_id=r["farmer_id"],investment_budget=r.get("investment_budget"),primary_goal=r.get("primary_goal"),needs_crop_recommendation=bool(r.get("needs_crop_recommendation",1)),needs_market_access=bool(r.get("needs_market_access",1)),needs_logistics=bool(r.get("needs_logistics",1)),needs_soil_advisory=bool(r.get("needs_soil_advisory",1)),preferred_market_distance_km=r.get("preferred_market_distance_km"),risk_preference=r.get("risk_preference")));imported["needs"]+=1
        for r in _rows(market,"crop_listings"):
            db.add(CropListing(id=r["id"],farmer_id=r["farmer_id"],farm_id=r["farm_id"],crop_name=r["crop_name"],crop_variety=r.get("crop_variety") or "Local",quantity_kg=r.get("quantity_kg") or 0,available_quantity_kg=r.get("available_quantity_kg") or 0,price_per_kg=r.get("price_per_kg") or 0,minimum_order_quantity_kg=r.get("minimum_order_quantity_kg") or 100,harvest_date=r.get("harvest_date"),expected_harvest_date=r.get("expected_harvest_date"),declared_grade=r.get("declared_grade") or "GRADE_A",packaging_type=r.get("packaging_type") or "CRATE",listing_status=r.get("listing_status") or "AVAILABLE",latitude=r.get("latitude"),longitude=r.get("longitude"),district=r.get("district") or "",state=r.get("state") or "",image_data=r.get("image_data")));imported["listings"]+=1
    db.commit()
    if db.query(TradeOrder).count()==0 and db.query(CropListing).count():
        listing=db.query(CropListing).first();stamp=datetime.now(timezone.utc);order=TradeOrder(id="ORD-2041",listing_id=listing.id,farmer_id=listing.farmer_id,buyer_id="BUYER_0002",crop=listing.crop_name,quantity_kg=min(4799,listing.available_quantity_kg),price_per_kg=listing.price_per_kg,total_amount=round(min(4799,listing.available_quantity_kg)*listing.price_per_kg,2),status="IN_TRANSIT",created_at=stamp,updated_at=stamp);db.add(order);db.flush()
        db.add(TradeShipment(id="SHP-2041",order_id=order.id,status="IN_TRANSIT",origin=f"{listing.district}, {listing.state}",destination="Mumbai warehouse",origin_lat=listing.latitude,origin_lng=listing.longitude,current_lat=21.65,current_lng=76.9,destination_lat=19.076,destination_lng=72.8777,driver="Ravi Patil",vehicle="MP 04 FT 4821",eta="Today, 2:10 PM",progress=68));db.add(TradePassport(id="PASS-2041",order_id=order.id,dispatch_verified=True,receiving_verified=False,freshness_score=88,quality_grade="GRADE_A",provenance={"source":"demo_order","note":"Replace with live transaction data"}));db.add(TradePayment(id="PAY-2041",order_id=order.id,amount_due=order.total_amount,amount_paid=0,status="PENDING"));db.add(TradeAuditEvent(order_id=order.id,event_type="DEMO_ORDER_CREATED",actor_id="SYSTEM",payload={"source":"demo_order"}));imported["orders"]=1;db.commit()
    return imported
