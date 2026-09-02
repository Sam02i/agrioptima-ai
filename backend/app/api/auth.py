from datetime import datetime, timedelta, timezone
import hashlib, secrets, uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import AuthUser, RefreshSession
from app.security import hash_password, verify_password, create_access_token, current_user

router=APIRouter(prefix="/auth",tags=["Authentication"])
def get_db():
    db=SessionLocal()
    try:yield db
    finally:db.close()
class Register(BaseModel):email:EmailStr;password:str=Field(min_length=10,max_length=128);role:str=Field(pattern="^(FARMER|BUYER)$");profile_id:str|None=None
class Login(BaseModel):email:EmailStr;password:str
class Refresh(BaseModel):refresh_token:str
def issue(user:AuthUser,db:Session):
    raw=secrets.token_urlsafe(48);db.add(RefreshSession(id=f"SES-{uuid.uuid4().hex[:12].upper()}",user_id=user.id,token_hash=hashlib.sha256(raw.encode()).hexdigest(),expires_at=datetime.now(timezone.utc)+timedelta(days=14)));db.commit();return {"access_token":create_access_token(user),"refresh_token":raw,"token_type":"bearer","user":{"id":user.id,"email":user.email,"role":user.role,"profile_id":user.profile_id}}
@router.post("/register",status_code=201)
def register(payload:Register,db:Session=Depends(get_db)):
    email=payload.email.lower()
    if db.query(AuthUser).filter_by(email=email).first():raise HTTPException(409,"Email already registered")
    user=AuthUser(id=f"USR-{uuid.uuid4().hex[:12].upper()}",email=email,password_hash=hash_password(payload.password),role=payload.role,profile_id=payload.profile_id,is_active=True);db.add(user);db.commit();return issue(user,db)
@router.post("/login")
def login(payload:Login,db:Session=Depends(get_db)):
    user=db.query(AuthUser).filter_by(email=payload.email.lower()).first()
    if not user or not verify_password(payload.password,user.password_hash):raise HTTPException(401,"Incorrect email or password")
    return issue(user,db)
@router.post("/refresh")
def refresh(payload:Refresh,db:Session=Depends(get_db)):
    token_hash=hashlib.sha256(payload.refresh_token.encode()).hexdigest();session=db.query(RefreshSession).filter_by(token_hash=token_hash,revoked=False).first()
    if not session or session.expires_at<datetime.now(timezone.utc):raise HTTPException(401,"Refresh session expired")
    session.revoked=True;user=db.get(AuthUser,session.user_id);db.commit();return issue(user,db)
@router.get("/me")
def me(user:AuthUser=Depends(current_user)):
    if not user:raise HTTPException(401,"Sign in required")
    return {"id":user.id,"email":user.email,"role":user.role,"profile_id":user.profile_id}
