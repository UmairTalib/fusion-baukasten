from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any
from pydantic import BaseModel, EmailStr

from app.api import deps
from app.core import security
from app.models.domain1_stammdaten import User, GuestSession
from app.core.security import create_access_token

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=Token)
def register_user(
    user_in: UserCreate, db: Session = Depends(deps.get_db)
) -> Any:
    """Register a new user."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=user_in.email,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        hashed_password=security.get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/guest-session", response_model=Token)
def create_guest_session(
    db: Session = Depends(deps.get_db)
) -> Any:
    """Create a temporary guest session for the Core Flow without registering."""
    guest = GuestSession()
    db.add(guest)
    db.commit()
    db.refresh(guest)
    
    # Guest tokens have a special flag
    access_token_expires = timedelta(minutes=60 * 24) # 24 hours
    to_encode = {"exp": security.datetime.utcnow() + access_token_expires, "sub": str(guest.id), "is_guest": True}
    encoded_jwt = security.jwt.encode(to_encode, security.SECRET_KEY, algorithm=security.ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
    }
