import sqlite3
from fastapi.testclient import TestClient

from app.main import app
from app.api import trade


def test_order_is_shared_and_listing_quantity_is_reduced(tmp_path, monkeypatch):
    market=tmp_path/"market.db"; workflow=tmp_path/"trade.db"
    db=sqlite3.connect(market)
    db.execute("""CREATE TABLE crop_listings(id TEXT PRIMARY KEY,farmer_id TEXT,crop_name TEXT,available_quantity_kg REAL,price_per_kg REAL,listing_status TEXT,district TEXT,latitude REAL,longitude REAL,updated_at TEXT)""")
    db.execute("INSERT INTO crop_listings VALUES(?,?,?,?,?,?,?,?,?,?)",("LOT-1","FARM-1","Tomato",1000,20,"AVAILABLE","Nashik",20,74,"now"));db.commit();db.close()
    monkeypatch.setattr(trade,"DB_PATH",workflow);monkeypatch.setattr(trade,"MARKET_DB",market)
    client=TestClient(app)
    created=client.post("/trade/orders",json={"listing_id":"LOT-1","buyer_id":"BUYER-1","quantity_kg":250,"destination":"Pune"})
    assert created.status_code==201
    order=created.json();assert order["farmer_id"]=="FARM-1";assert order["buyer_id"]=="BUYER-1"
    assert client.get("/trade/orders",params={"farmer_id":"FARM-1"}).json()["count"]==1
    assert client.get("/trade/orders",params={"buyer_id":"BUYER-1"}).json()["count"]==1
    assert client.get(f"/trade/shipments/{order['shipment']['id']}").status_code==200
    db=sqlite3.connect(market);remaining=db.execute("SELECT available_quantity_kg FROM crop_listings WHERE id='LOT-1'").fetchone()[0];db.close()
    assert remaining==750
