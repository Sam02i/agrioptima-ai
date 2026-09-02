from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.api import trade
from app.db.session import Base
from app.db.models import MarketFarmer, MarketFarm, CropListing

def test_order_is_shared_and_listing_quantity_is_reduced():
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool);Base.metadata.create_all(engine);TestingSession=sessionmaker(bind=engine)
    db=TestingSession();db.add(MarketFarmer(id="FARM-1",name="Farmer",state="Maharashtra",district="Nashik",village="Village"));db.add(MarketFarm(id="FARMLOT-1",farmer_id="FARM-1",area_acres=2));db.flush();db.add(CropListing(id="LOT-1",farmer_id="FARM-1",farm_id="FARMLOT-1",crop_name="Tomato",quantity_kg=1000,available_quantity_kg=1000,price_per_kg=20,listing_status="AVAILABLE",district="Nashik",state="Maharashtra"));db.commit();db.close()
    def override_db():
        session=TestingSession()
        try:yield session
        finally:session.close()
    app.dependency_overrides[trade.get_db]=override_db
    try:
        client=TestClient(app);created=client.post("/trade/orders",json={"listing_id":"LOT-1","buyer_id":"BUYER-1","quantity_kg":250,"destination":"Pune"});assert created.status_code==201,created.text;order=created.json();assert order["farmer_id"]=="FARM-1";assert client.get("/trade/orders",params={"farmer_id":"FARM-1"}).json()["count"]==1;assert client.get("/trade/orders",params={"buyer_id":"BUYER-1"}).json()["count"]==1;assert client.get(f"/trade/shipments/{order['shipment']['id']}").status_code==200
        db=TestingSession();assert db.get(CropListing,"LOT-1").available_quantity_kg==750;db.close()
    finally:app.dependency_overrides.clear()
