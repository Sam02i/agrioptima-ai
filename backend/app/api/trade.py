"""Persistent order-to-payment workflow shared by farmer and buyer portals."""
from datetime import datetime, timezone
from pathlib import Path
import json, sqlite3, uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/trade", tags=["Trade workflow"])
ROOT = Path(__file__).resolve().parents[2] / "data"
DB_PATH = ROOT / "trade_workflow.db"
MARKET_DB = ROOT / "farmer_marketplace.db"

def now(): return datetime.now(timezone.utc).isoformat()
def connection():
    db=sqlite3.connect(DB_PATH); db.row_factory=sqlite3.Row; db.execute("PRAGMA foreign_keys=ON")
    db.executescript("""
    CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, listing_id TEXT NOT NULL, farmer_id TEXT NOT NULL, buyer_id TEXT NOT NULL, crop TEXT NOT NULL, quantity_kg REAL NOT NULL, price_per_kg REAL NOT NULL, total_amount REAL NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS shipments(id TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL REFERENCES orders(id), status TEXT NOT NULL, origin TEXT, destination TEXT, origin_lat REAL, origin_lng REAL, current_lat REAL, current_lng REAL, destination_lat REAL, destination_lng REAL, driver TEXT, vehicle TEXT, eta TEXT, progress INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS passports(id TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL REFERENCES orders(id), dispatch_verified INTEGER NOT NULL DEFAULT 0, receiving_verified INTEGER NOT NULL DEFAULT 0, freshness_score REAL, quality_grade TEXT, provenance TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS payments(id TEXT PRIMARY KEY, order_id TEXT UNIQUE NOT NULL REFERENCES orders(id), amount_due REAL NOT NULL, amount_paid REAL NOT NULL DEFAULT 0, status TEXT NOT NULL, due_date TEXT, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS inspections(id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), stage TEXT NOT NULL, freshness_score REAL, quality_grade TEXT, evidence_reference TEXT, verified_by TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit_events(id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, event_type TEXT NOT NULL, actor_id TEXT, payload TEXT NOT NULL, created_at TEXT NOT NULL);
    """)
    # Keep one coherent demonstration journey until real order data is connected.
    if db.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 0:
        stamp=now(); provenance=json.dumps({"source":"demo_order","note":"Replace with live transaction data"})
        db.execute("INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,?,?)",("ORD-2041","LOT00001","FARM00001","BUYER_0002","Orange (Kinnow)",4799,27.32,131109.68,"IN_TRANSIT",stamp,stamp))
        db.execute("INSERT INTO shipments VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",("SHP-2041","ORD-2041","IN_TRANSIT","Chandraganj, Bhopal","Mumbai warehouse",23.0869,77.8219,21.65,76.9,19.076,72.8777,"Ravi Patil","MP 04 FT 4821","Today, 2:10 PM",68,stamp))
        db.execute("INSERT INTO passports VALUES(?,?,?,?,?,?,?,?)",("PASS-2041","ORD-2041",1,0,88,"GRADE_A",provenance,stamp))
        db.execute("INSERT INTO payments VALUES(?,?,?,?,?,?,?)",("PAY-2041","ORD-2041",131109.68,0,"PENDING",None,stamp))
        db.execute("INSERT INTO audit_events(order_id,event_type,actor_id,payload,created_at) VALUES(?,?,?,?,?)",("ORD-2041","DEMO_ORDER_CREATED","SYSTEM",provenance,stamp))
    db.commit(); return db

class NewOrder(BaseModel):
    listing_id:str; buyer_id:str; quantity_kg:float=Field(gt=0); destination:str="Buyer warehouse"; destination_lat:float=19.076; destination_lng:float=72.8777

class StatusUpdate(BaseModel):
    status:str; actor_id:str="SYSTEM"; progress:int|None=Field(default=None,ge=0,le=100)

class InspectionCreate(BaseModel):
    stage:str=Field(pattern="^(DISPATCH|RECEIVING)$"); freshness_score:float=Field(ge=0,le=100); quality_grade:str; evidence_reference:str|None=None; verified_by:str

class PaymentUpdate(BaseModel):
    amount_paid:float=Field(ge=0); status:str; actor_id:str

def serialize(row): return dict(row) if row else None

@router.post("/orders", status_code=201)
def create_order(payload:NewOrder):
    if not MARKET_DB.exists(): raise HTTPException(503,"Marketplace unavailable")
    market=sqlite3.connect(MARKET_DB); market.row_factory=sqlite3.Row
    listing=market.execute("SELECT * FROM crop_listings WHERE id=? AND listing_status='AVAILABLE'",(payload.listing_id,)).fetchone()
    if not listing: market.close(); raise HTTPException(404,"Available listing not found")
    if payload.quantity_kg>float(listing["available_quantity_kg"]): market.close(); raise HTTPException(409,"Requested quantity exceeds available produce")
    stamp=now(); order_id=f"ORD-{uuid.uuid4().hex[:8].upper()}"; shipment_id=f"SHP-{order_id[4:]}"; passport_id=f"PASS-{order_id[4:]}"; payment_id=f"PAY-{order_id[4:]}"; total=round(payload.quantity_kg*float(listing["price_per_kg"]),2)
    db=connection()
    try:
        with db:
            db.execute("INSERT INTO orders VALUES(?,?,?,?,?,?,?,?,?,?,?)",(order_id,payload.listing_id,listing["farmer_id"],payload.buyer_id,listing["crop_name"],payload.quantity_kg,listing["price_per_kg"],total,"CONFIRMED",stamp,stamp))
            db.execute("INSERT INTO shipments VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",(shipment_id,order_id,"PENDING_PICKUP",listing["district"],payload.destination,listing["latitude"],listing["longitude"],listing["latitude"],listing["longitude"],payload.destination_lat,payload.destination_lng,"To be assigned","To be assigned","Pickup scheduling",10,stamp))
            db.execute("INSERT INTO passports VALUES(?,?,?,?,?,?,?,?)",(passport_id,order_id,0,0,None,"PENDING","Farmer listing; awaiting dispatch verification",stamp))
            db.execute("INSERT INTO payments VALUES(?,?,?,?,?,?,?)",(payment_id,order_id,total,0,"PENDING",None,stamp))
            db.execute("INSERT INTO audit_events(order_id,event_type,actor_id,payload,created_at) VALUES(?,?,?,?,?)",(order_id,"ORDER_CREATED",payload.buyer_id,json.dumps(payload.model_dump()),stamp))
        with market:
            remaining=float(listing["available_quantity_kg"])-payload.quantity_kg
            market.execute("UPDATE crop_listings SET available_quantity_kg=?, listing_status=?, updated_at=? WHERE id=?",(remaining,"SOLD" if remaining<=0 else "AVAILABLE",stamp,payload.listing_id))
    finally: db.close(); market.close()
    return get_order(order_id)

@router.get("/orders")
def list_orders(buyer_id:str|None=None,farmer_id:str|None=None):
    db=connection(); sql="SELECT * FROM orders WHERE 1=1"; params=[]
    if buyer_id: sql+=" AND buyer_id=?"; params.append(buyer_id)
    if farmer_id: sql+=" AND farmer_id=?"; params.append(farmer_id)
    rows=[get_order(row["id"],db) for row in db.execute(sql+" ORDER BY created_at DESC",params)]; db.close(); return {"orders":rows,"count":len(rows)}

@router.get("/orders/{order_id}")
def get_order(order_id:str,db=None):
    own=db is None; db=db or connection(); order=serialize(db.execute("SELECT * FROM orders WHERE id=?",(order_id,)).fetchone())
    if not order:
        if own: db.close()
        raise HTTPException(404,"Order not found")
    order["shipment"]=serialize(db.execute("SELECT * FROM shipments WHERE order_id=?",(order_id,)).fetchone()); order["passport"]=serialize(db.execute("SELECT * FROM passports WHERE order_id=?",(order_id,)).fetchone()); order["payment"]=serialize(db.execute("SELECT * FROM payments WHERE order_id=?",(order_id,)).fetchone()); order["inspections"]=[dict(r) for r in db.execute("SELECT * FROM inspections WHERE order_id=? ORDER BY created_at",(order_id,))]; order["events"]=[dict(r) for r in db.execute("SELECT * FROM audit_events WHERE order_id=? ORDER BY id",(order_id,))]
    if own: db.close()
    return order

@router.get("/shipments/{shipment_id}")
def get_shipment_order(shipment_id:str):
    db=connection(); row=db.execute("SELECT order_id FROM shipments WHERE id=?",(shipment_id,)).fetchone()
    if not row: db.close(); raise HTTPException(404,"Shipment not found")
    result=get_order(row["order_id"],db); db.close(); return result

@router.patch("/orders/{order_id}/status")
def update_status(order_id:str,payload:StatusUpdate):
    stamp=now(); db=connection()
    if not db.execute("SELECT 1 FROM orders WHERE id=?",(order_id,)).fetchone(): db.close(); raise HTTPException(404,"Order not found")
    with db:
        db.execute("UPDATE orders SET status=?,updated_at=? WHERE id=?",(payload.status,stamp,order_id))
        if payload.progress is not None: db.execute("UPDATE shipments SET status=?,progress=?,updated_at=? WHERE order_id=?",(payload.status,payload.progress,stamp,order_id))
        db.execute("INSERT INTO audit_events(order_id,event_type,actor_id,payload,created_at) VALUES(?,?,?,?,?)",(order_id,"STATUS_UPDATED",payload.actor_id,payload.model_dump_json(),stamp))
    result=get_order(order_id,db); db.close(); return result

@router.post("/orders/{order_id}/inspections", status_code=201)
def add_inspection(order_id:str,payload:InspectionCreate):
    stamp=now(); db=connection()
    if not db.execute("SELECT 1 FROM orders WHERE id=?",(order_id,)).fetchone(): db.close(); raise HTTPException(404,"Order not found")
    inspection_id=f"INS-{uuid.uuid4().hex[:8].upper()}"
    with db:
        db.execute("INSERT INTO inspections VALUES(?,?,?,?,?,?,?,?)",(inspection_id,order_id,payload.stage,payload.freshness_score,payload.quality_grade,payload.evidence_reference,payload.verified_by,stamp))
        column="dispatch_verified" if payload.stage=="DISPATCH" else "receiving_verified"
        db.execute(f"UPDATE passports SET {column}=1,freshness_score=?,quality_grade=?,updated_at=? WHERE order_id=?",(payload.freshness_score,payload.quality_grade,stamp,order_id))
        db.execute("INSERT INTO audit_events(order_id,event_type,actor_id,payload,created_at) VALUES(?,?,?,?,?)",(order_id,f"{payload.stage}_INSPECTION",payload.verified_by,payload.model_dump_json(),stamp))
    result={"inspection_id":inspection_id,"order":get_order(order_id,db)};db.close();return result

@router.patch("/orders/{order_id}/payment")
def update_payment(order_id:str,payload:PaymentUpdate):
    stamp=now();db=connection()
    if not db.execute("SELECT 1 FROM payments WHERE order_id=?",(order_id,)).fetchone():db.close();raise HTTPException(404,"Payment record not found")
    with db:
        db.execute("UPDATE payments SET amount_paid=?,status=?,updated_at=? WHERE order_id=?",(payload.amount_paid,payload.status,stamp,order_id))
        db.execute("INSERT INTO audit_events(order_id,event_type,actor_id,payload,created_at) VALUES(?,?,?,?,?)",(order_id,"PAYMENT_UPDATED",payload.actor_id,payload.model_dump_json(),stamp))
    result=get_order(order_id,db);db.close();return result

@router.get("/health")
def trade_health():
    db=connection(); counts={t:db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in ("orders","shipments","passports","payments","inspections","audit_events")}; db.close(); return {"status":"ok","database":str(DB_PATH.name),"counts":counts}
