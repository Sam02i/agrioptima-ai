"""PostgreSQL order-to-payment workflow shared by farmer and buyer portals."""
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import CropListing, TradeOrder, TradeShipment, TradePassport, TradePayment, TradeInspection, TradeAuditEvent
from app.security import require_roles
from app.services.payment_gateway import create_order as create_gateway_order, verify_checkout

router=APIRouter(prefix="/trade",tags=["Trade workflow"])
def now():return datetime.now(timezone.utc)
def get_db():
    db=SessionLocal()
    try:yield db
    finally:db.close()

class NewOrder(BaseModel):
    listing_id:str;buyer_id:str;quantity_kg:float=Field(gt=0);destination:str="Buyer warehouse";destination_lat:float=19.076;destination_lng:float=72.8777
class StatusUpdate(BaseModel):status:str;actor_id:str="SYSTEM";progress:int|None=Field(default=None,ge=0,le=100)
class InspectionCreate(BaseModel):stage:str=Field(pattern="^(DISPATCH|RECEIVING)$");freshness_score:float=Field(ge=0,le=100);quality_grade:str;evidence_reference:str|None=None;verified_by:str
class PaymentUpdate(BaseModel):amount_paid:float=Field(ge=0);status:str;actor_id:str
class LocationUpdate(BaseModel):latitude:float=Field(ge=-90,le=90);longitude:float=Field(ge=-180,le=180);actor_id:str="DRIVER";eta:str|None=None;progress:int|None=Field(default=None,ge=0,le=100)
class PaymentConfirmation(BaseModel):provider_order_id:str;provider_payment_id:str;signature:str;actor_id:str

def columns(item):return {c.name:getattr(item,c.name) for c in item.__table__.columns} if item else None
def order_dict(order:TradeOrder,db:Session):
    shipment=db.query(TradeShipment).filter_by(order_id=order.id).first();passport=db.query(TradePassport).filter_by(order_id=order.id).first();payment=db.query(TradePayment).filter_by(order_id=order.id).first();inspections=db.query(TradeInspection).filter_by(order_id=order.id).order_by(TradeInspection.created_at).all();events=db.query(TradeAuditEvent).filter_by(order_id=order.id).order_by(TradeAuditEvent.id).all()
    return {**columns(order),"shipment":columns(shipment),"passport":columns(passport),"payment":columns(payment),"inspections":[columns(x) for x in inspections],"events":[columns(x) for x in events]}

@router.post("/orders",status_code=201)
def create_order(payload:NewOrder,db:Session=Depends(get_db),user=Depends(require_roles("BUYER"))):
    if user and user.profile_id and user.profile_id!=payload.buyer_id:raise HTTPException(403,"You can only create orders for your buyer profile")
    listing=db.query(CropListing).filter_by(id=payload.listing_id,listing_status="AVAILABLE").with_for_update().first()
    if not listing:raise HTTPException(404,"Available listing not found")
    if payload.quantity_kg>listing.available_quantity_kg:raise HTTPException(409,"Requested quantity exceeds available produce")
    token=uuid.uuid4().hex[:8].upper();stamp=now();total=round(payload.quantity_kg*listing.price_per_kg,2)
    order=TradeOrder(id=f"ORD-{token}",listing_id=listing.id,farmer_id=listing.farmer_id,buyer_id=payload.buyer_id,crop=listing.crop_name,quantity_kg=payload.quantity_kg,price_per_kg=listing.price_per_kg,total_amount=total,status="CONFIRMED",created_at=stamp,updated_at=stamp);db.add(order);db.flush()
    db.add(TradeShipment(id=f"SHP-{token}",order_id=order.id,status="PENDING_PICKUP",origin=f"{listing.district}, {listing.state}",destination=payload.destination,origin_lat=listing.latitude,origin_lng=listing.longitude,current_lat=listing.latitude,current_lng=listing.longitude,destination_lat=payload.destination_lat,destination_lng=payload.destination_lng,driver="To be assigned",vehicle="To be assigned",eta="Pickup scheduling",progress=10));db.add(TradePassport(id=f"PASS-{token}",order_id=order.id,dispatch_verified=False,receiving_verified=False,quality_grade="PENDING",provenance={"source":"farmer_listing","status":"awaiting_dispatch_verification"}));db.add(TradePayment(id=f"PAY-{token}",order_id=order.id,amount_due=total,amount_paid=0,status="PENDING"));db.add(TradeAuditEvent(order_id=order.id,event_type="ORDER_CREATED",actor_id=payload.buyer_id,payload=payload.model_dump()))
    listing.available_quantity_kg-=payload.quantity_kg;listing.listing_status="SOLD" if listing.available_quantity_kg<=0 else "AVAILABLE";listing.updated_at=stamp;db.commit();return order_dict(order,db)

@router.get("/orders")
def list_orders(buyer_id:str|None=None,farmer_id:str|None=None,db:Session=Depends(get_db)):
    query=db.query(TradeOrder)
    if buyer_id:query=query.filter_by(buyer_id=buyer_id)
    if farmer_id:query=query.filter_by(farmer_id=farmer_id)
    rows=[order_dict(x,db) for x in query.order_by(TradeOrder.created_at.desc()).all()];return {"orders":rows,"count":len(rows)}

@router.get("/orders/{order_id}")
def get_order(order_id:str,db:Session=Depends(get_db)):
    order=db.get(TradeOrder,order_id)
    if not order:raise HTTPException(404,"Order not found")
    return order_dict(order,db)

@router.get("/shipments/{shipment_id}")
def get_shipment_order(shipment_id:str,db:Session=Depends(get_db)):
    shipment=db.get(TradeShipment,shipment_id)
    if not shipment:raise HTTPException(404,"Shipment not found")
    return order_dict(db.get(TradeOrder,shipment.order_id),db)

@router.patch("/orders/{order_id}/status")
def update_status(order_id:str,payload:StatusUpdate,db:Session=Depends(get_db),user=Depends(require_roles("FARMER","BUYER"))):
    order=db.get(TradeOrder,order_id)
    if not order:raise HTTPException(404,"Order not found")
    if user and user.profile_id and user.profile_id not in {order.farmer_id,order.buyer_id}:raise HTTPException(403,"This order does not belong to your profile")
    order.status=payload.status;order.updated_at=now();shipment=db.query(TradeShipment).filter_by(order_id=order.id).first()
    if shipment and payload.progress is not None:shipment.status=payload.status;shipment.progress=payload.progress
    db.add(TradeAuditEvent(order_id=order.id,event_type="STATUS_UPDATED",actor_id=payload.actor_id,payload=payload.model_dump()));db.commit();return order_dict(order,db)

@router.post("/shipments/{shipment_id}/locations")
def update_location(shipment_id:str,payload:LocationUpdate,db:Session=Depends(get_db),user=Depends(require_roles("FARMER"))):
    shipment=db.get(TradeShipment,shipment_id)
    if not shipment:raise HTTPException(404,"Shipment not found")
    order=db.get(TradeOrder,shipment.order_id)
    if user and user.profile_id and user.profile_id!=order.farmer_id:raise HTTPException(403,"This shipment does not belong to your profile")
    shipment.current_lat=payload.latitude;shipment.current_lng=payload.longitude;shipment.status="IN_TRANSIT";shipment.updated_at=now()
    if payload.eta:shipment.eta=payload.eta
    if payload.progress is not None:shipment.progress=payload.progress
    db.add(TradeAuditEvent(order_id=shipment.order_id,event_type="LOCATION_UPDATED",actor_id=payload.actor_id,payload=payload.model_dump()));db.commit();return {"shipment":columns(shipment),"source":"authenticated_location_update"}

@router.post("/orders/{order_id}/inspections",status_code=201)
def add_inspection(order_id:str,payload:InspectionCreate,db:Session=Depends(get_db),user=Depends(require_roles("FARMER","BUYER"))):
    order=db.get(TradeOrder,order_id)
    if not order:raise HTTPException(404,"Order not found")
    if user and user.profile_id and user.profile_id not in {order.farmer_id,order.buyer_id}:raise HTTPException(403,"This order does not belong to your profile")
    item=TradeInspection(id=f"INS-{uuid.uuid4().hex[:8].upper()}",order_id=order.id,**payload.model_dump());db.add(item);passport=db.query(TradePassport).filter_by(order_id=order.id).first()
    if passport:
        if payload.stage=="DISPATCH":passport.dispatch_verified=True
        else:passport.receiving_verified=True
        passport.freshness_score=payload.freshness_score;passport.quality_grade=payload.quality_grade
    db.add(TradeAuditEvent(order_id=order.id,event_type=f"{payload.stage}_INSPECTION",actor_id=payload.verified_by,payload=payload.model_dump()));db.commit();return {"inspection_id":item.id,"order":order_dict(order,db)}

@router.patch("/orders/{order_id}/payment")
def update_payment(order_id:str,payload:PaymentUpdate,db:Session=Depends(get_db),user=Depends(require_roles("BUYER"))):
    payment=db.query(TradePayment).filter_by(order_id=order_id).first();order=db.get(TradeOrder,order_id)
    if not payment or not order:raise HTTPException(404,"Payment record not found")
    if user and user.profile_id and user.profile_id!=order.buyer_id:raise HTTPException(403,"This payment does not belong to your buyer profile")
    payment.amount_paid=payload.amount_paid;payment.status=payload.status;db.add(TradeAuditEvent(order_id=order_id,event_type="PAYMENT_UPDATED",actor_id=payload.actor_id,payload=payload.model_dump()));db.commit();return order_dict(order,db)

@router.post("/orders/{order_id}/payment-intent")
def payment_intent(order_id:str,db:Session=Depends(get_db),user=Depends(require_roles("BUYER"))):
    payment=db.query(TradePayment).filter_by(order_id=order_id).first()
    if not payment:raise HTTPException(404,"Payment record not found")
    intent=create_gateway_order(payment.amount_due-payment.amount_paid,order_id);payment.provider="razorpay";payment.provider_reference=intent["provider_order_id"];db.commit();return intent

@router.post("/orders/{order_id}/payment-confirmation")
def payment_confirmation(order_id:str,payload:PaymentConfirmation,db:Session=Depends(get_db),user=Depends(require_roles("BUYER"))):
    payment=db.query(TradePayment).filter_by(order_id=order_id).first();order=db.get(TradeOrder,order_id)
    if not payment or not order:raise HTTPException(404,"Payment record not found")
    if payment.provider_reference!=payload.provider_order_id or not verify_checkout(payload.provider_order_id,payload.provider_payment_id,payload.signature):raise HTTPException(400,"Payment signature verification failed")
    payment.amount_paid=payment.amount_due;payment.status="PAID";payment.provider_reference=payload.provider_payment_id;db.add(TradeAuditEvent(order_id=order_id,event_type="PAYMENT_CONFIRMED",actor_id=payload.actor_id,payload={"provider":"razorpay","payment_id":payload.provider_payment_id}));db.commit();return order_dict(order,db)

@router.get("/health")
def trade_health(db:Session=Depends(get_db)):
    return {"status":"ok","database":"postgresql","counts":{"orders":db.query(TradeOrder).count(),"shipments":db.query(TradeShipment).count(),"passports":db.query(TradePassport).count(),"payments":db.query(TradePayment).count(),"inspections":db.query(TradeInspection).count(),"audit_events":db.query(TradeAuditEvent).count()}}
