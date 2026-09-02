"""PostgreSQL-backed farmer marketplace with live mandi references."""
from datetime import datetime, timezone
from statistics import median
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.adapters.data_gov_mandi import fetch_mandi_records
from app.db.session import SessionLocal
from app.db.models import MarketFarmer, MarketFarm, FarmerNeed, CropListing
from app.security import require_roles

router=APIRouter(prefix="/marketplace",tags=["Farmer Marketplace"])

def get_db():
    db=SessionLocal()
    try: yield db
    finally: db.close()

class NewListing(BaseModel):
    farmer_id:str;crop_name:str=Field(min_length=2,max_length=80);crop_variety:str="Local";quantity_kg:float=Field(gt=0);price_per_kg:float=Field(gt=0);minimum_order_quantity_kg:float=Field(default=100,gt=0);declared_grade:str="GRADE_A";packaging_type:str="CRATE";image_data:str|None=None

def farmer_dict(f:MarketFarmer,db:Session):
    farms=db.query(MarketFarm).filter_by(farmer_id=f.id).all();listings=db.query(CropListing).filter_by(farmer_id=f.id).all()
    return {"farmer_id":f.id,"name":f.name,"state":f.state,"district":f.district,"village":f.village,"preferred_language":f.preferred_language,"profile_status":f.profile_status,"farm_count":len(farms),"listing_count":len(listings),"total_area_acres":sum(x.area_acres for x in farms),"crops":sorted({x.crop_name for x in listings})}

def listing_dict(x:CropListing,db:Session):
    farmer=db.get(MarketFarmer,x.farmer_id)
    return {"listing_id":x.id,"farmer_id":x.farmer_id,"farmer_name":farmer.name if farmer else "Verified farmer","farm_id":x.farm_id,"crop_name":x.crop_name,"crop_variety":x.crop_variety,"quantity_kg":x.quantity_kg,"available_quantity_kg":x.available_quantity_kg,"price_per_kg":x.price_per_kg,"minimum_order_quantity_kg":x.minimum_order_quantity_kg,"harvest_date":x.harvest_date,"expected_harvest_date":x.expected_harvest_date,"declared_grade":x.declared_grade,"packaging_type":x.packaging_type,"listing_status":x.listing_status,"latitude":x.latitude,"longitude":x.longitude,"district":x.district,"state":x.state,"image_data":x.image_data}

@router.get("/summary")
def summary(db:Session=Depends(get_db)):
    available=db.query(CropListing).filter_by(listing_status="AVAILABLE")
    rows=available.all();crops={}
    for x in rows:
        bucket=crops.setdefault(x.crop_name,{"crop_name":x.crop_name,"listings":0,"available_kg":0,"prices":[]});bucket["listings"]+=1;bucket["available_kg"]+=x.available_quantity_kg;bucket["prices"].append(x.price_per_kg)
    crop_rows=[{"crop_name":v["crop_name"],"listings":v["listings"],"available_kg":round(v["available_kg"],1),"average_price_per_kg":round(sum(v["prices"])/len(v["prices"]),2)} for v in crops.values()]
    return {"farmer_count":db.query(MarketFarmer).count(),"farm_count":db.query(MarketFarm).count(),"listing_count":db.query(CropListing).count(),"available_listing_count":len(rows),"available_quantity_kg":sum(x.available_quantity_kg for x in rows),"crop_count":len(crops),"crops":crop_rows,"source":"PostgreSQL farmer marketplace"}

@router.get("/farmers")
def farmers(db:Session=Depends(get_db)):
    rows=[farmer_dict(f,db) for f in db.query(MarketFarmer).order_by(MarketFarmer.name).all()];return {"farmers":rows,"count":len(rows)}

@router.get("/farmers/{farmer_id}")
def farmer_detail(farmer_id:str,db:Session=Depends(get_db)):
    f=db.get(MarketFarmer,farmer_id)
    if not f:raise HTTPException(404,"Farmer not found")
    farms=db.query(MarketFarm).filter_by(farmer_id=farmer_id).all();need=db.get(FarmerNeed,farmer_id);listings=db.query(CropListing).filter_by(farmer_id=farmer_id).order_by(CropListing.created_at.desc()).all()
    return {"farmer":farmer_dict(f,db),"farms":[{c.name:getattr(x,c.name) for c in MarketFarm.__table__.columns} for x in farms],"needs":{c.name:getattr(need,c.name) for c in FarmerNeed.__table__.columns} if need else None,"listings":[listing_dict(x,db) for x in listings]}

@router.get("/listings")
def listings(crop:str|None=Query(default=None),status:str="AVAILABLE",db:Session=Depends(get_db)):
    query=db.query(CropListing).filter(CropListing.listing_status==status)
    if crop:query=query.filter(func.lower(CropListing.crop_name)==crop.lower())
    rows=[listing_dict(x,db) for x in query.order_by(CropListing.crop_name,CropListing.price_per_kg).all()];return {"listings":rows,"count":len(rows)}

@router.post("/listings",status_code=201)
def create_listing(payload:NewListing,db:Session=Depends(get_db),user=Depends(require_roles("FARMER"))):
    farmer=db.get(MarketFarmer,payload.farmer_id);farm=db.query(MarketFarm).filter_by(farmer_id=payload.farmer_id).order_by(MarketFarm.area_acres.desc()).first()
    if not farmer or not farm:raise HTTPException(404,"Farmer or farm record not found")
    item=CropListing(id=f"LOT-{uuid.uuid4().hex[:10].upper()}",farmer_id=farmer.id,farm_id=farm.id,crop_name=payload.crop_name,crop_variety=payload.crop_variety,quantity_kg=payload.quantity_kg,available_quantity_kg=payload.quantity_kg,price_per_kg=payload.price_per_kg,minimum_order_quantity_kg=payload.minimum_order_quantity_kg,declared_grade=payload.declared_grade,packaging_type=payload.packaging_type,listing_status="AVAILABLE",latitude=farm.latitude,longitude=farm.longitude,district=farmer.district,state=farmer.state,image_data=payload.image_data,created_at=datetime.now(timezone.utc),updated_at=datetime.now(timezone.utc));db.add(item);db.commit();return {"listing_id":item.id,"status":item.listing_status}

@router.delete("/listings/{listing_id}")
def remove_listing(listing_id:str,farmer_id:str=Query(...),db:Session=Depends(get_db),user=Depends(require_roles("FARMER"))):
    item=db.query(CropListing).filter_by(id=listing_id,farmer_id=farmer_id).first()
    if not item:raise HTTPException(404,"Listing was not found for this farmer")
    db.delete(item);db.commit();return {"listing_id":listing_id,"removed":True}

@router.get("/mandi-prices")
async def mandi_prices(crop:str=Query(...,min_length=2),district:str|None=Query(default=None)):
    result=await fetch_mandi_records(crop);prices=[]
    for row in (result or {}).get("records",[])[:20]:
        try:modal=float(row.get("modal_price") or 0)
        except (TypeError,ValueError):continue
        if modal>0:prices.append({"market":row.get("market") or row.get("market_name") or "Mandi","district":row.get("district") or "","modal_price":modal,"price_per_kg":round(modal/100,2),"arrival_date":row.get("arrival_date") or row.get("price_date")})
    if district:
        local=[x for x in prices if district.lower() in x["district"].lower()]
        if local:prices=local
    per_kg=[x["price_per_kg"] for x in prices];market_set=[x for x in per_kg if x>=2] or per_kg;recommended=round(median(market_set),2) if market_set else None;previous=market_set[1] if len(market_set)>1 else None;change=round((market_set[0]-previous)/previous*100,1) if previous else None
    return {"crop":crop,"district_filter":district,"prices":prices,"average_price_per_kg":round(sum(market_set)/len(market_set),2) if market_set else None,"recommended_price_per_kg":recommended,"recommended_listing_low":round(recommended*.97,2) if recommended else None,"recommended_listing_high":round(recommended*1.08,2) if recommended else None,"minimum_price_per_kg":min(market_set) if market_set else None,"maximum_price_per_kg":max(market_set) if market_set else None,"trend":{"direction":"up" if change and change>0 else "down" if change and change<0 else "steady","change_percent":change},"data_status":"live" if prices else "unavailable","source":"AGMARKNET via data.gov.in","fetched_at":(result or {}).get("fetched_at")}
