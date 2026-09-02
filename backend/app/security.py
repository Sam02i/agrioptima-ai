"""Small dependency-free password and signed-token implementation."""
import base64, hashlib, hmac, json, os, time
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.config import AUTH_REQUIRED, AUTH_SECRET, ACCESS_TOKEN_MINUTES
from app.db.models import AuthUser
from app.db.session import SessionLocal

def _b64(data:bytes)->str:return base64.urlsafe_b64encode(data).rstrip(b"=").decode()
def _unb64(value:str)->bytes:return base64.urlsafe_b64decode(value+"="*(-len(value)%4))
def hash_password(password:str)->str:
    salt=os.urandom(16);digest=hashlib.pbkdf2_hmac("sha256",password.encode(),salt,310_000);return f"pbkdf2_sha256$310000${_b64(salt)}${_b64(digest)}"
def verify_password(password:str,stored:str)->bool:
    try:_,rounds,salt,digest=stored.split("$");actual=hashlib.pbkdf2_hmac("sha256",password.encode(),_unb64(salt),int(rounds));return hmac.compare_digest(actual,_unb64(digest))
    except Exception:return False
def create_access_token(user:AuthUser)->str:
    header=_b64(json.dumps({"alg":"HS256","typ":"JWT"},separators=(",",":")).encode());payload=_b64(json.dumps({"sub":user.id,"role":user.role,"profile_id":user.profile_id,"exp":int(time.time())+ACCESS_TOKEN_MINUTES*60},separators=(",",":")).encode());signature=_b64(hmac.new(AUTH_SECRET.encode(),f"{header}.{payload}".encode(),hashlib.sha256).digest());return f"{header}.{payload}.{signature}"
def decode_token(token:str)->dict:
    try:
        header,payload,signature=token.split(".");expected=_b64(hmac.new(AUTH_SECRET.encode(),f"{header}.{payload}".encode(),hashlib.sha256).digest())
        if not hmac.compare_digest(signature,expected):raise ValueError
        data=json.loads(_unb64(payload));
        if data["exp"]<time.time():raise ValueError
        return data
    except Exception:raise HTTPException(401,"Invalid or expired access token")
def get_db():
    db=SessionLocal()
    try:yield db
    finally:db.close()
def current_user(authorization:str|None=Header(default=None),db:Session=Depends(get_db))->AuthUser|None:
    if not authorization:
        if AUTH_REQUIRED:raise HTTPException(401,"Sign in required")
        return None
    if not authorization.startswith("Bearer "):raise HTTPException(401,"Bearer token required")
    user=db.get(AuthUser,decode_token(authorization[7:])["sub"])
    if not user or not user.is_active:raise HTTPException(401,"Account unavailable")
    return user
def require_roles(*roles):
    def dependency(user:AuthUser|None=Depends(current_user)):
        if user and user.role not in roles:raise HTTPException(403,"This account cannot perform that action")
        return user
    return dependency
