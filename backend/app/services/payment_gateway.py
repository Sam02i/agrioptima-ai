"""Provider boundary for real payments. No credentials means no fake payment."""
import hashlib, hmac, os, requests
from fastapi import HTTPException

KEY_ID=os.getenv("RAZORPAY_KEY_ID","");KEY_SECRET=os.getenv("RAZORPAY_KEY_SECRET","")

def configured()->bool:return bool(KEY_ID and KEY_SECRET)
def create_order(amount_rupees:float,receipt:str)->dict:
    if not configured():raise HTTPException(503,"Payment gateway is not configured")
    response=requests.post("https://api.razorpay.com/v1/orders",auth=(KEY_ID,KEY_SECRET),json={"amount":round(amount_rupees*100),"currency":"INR","receipt":receipt},timeout=15)
    if not response.ok:raise HTTPException(502,"Payment provider rejected the order request")
    data=response.json();return {"provider":"razorpay","key_id":KEY_ID,"provider_order_id":data["id"],"amount_paise":data["amount"],"currency":data["currency"]}
def verify_checkout(provider_order_id:str,provider_payment_id:str,signature:str)->bool:
    expected=hmac.new(KEY_SECRET.encode(),f"{provider_order_id}|{provider_payment_id}".encode(),hashlib.sha256).hexdigest();return hmac.compare_digest(expected,signature)
