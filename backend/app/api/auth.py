from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr
import uuid

from app.api import deps
from app.core import security
from app.models.domain1_stammdaten import User, SystemRole, Organization, Membership
from app.models.domain2_projekte import Project
from app.core.security import create_access_token, SECRET_KEY, ALGORITHM
from app.core.rate_limit import limiter
import jose.jwt as jwt


router = APIRouter()


# ── Pydantic Schemas ───────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user: dict


class LoginJSONRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    organization: Optional[str] = None
    system_role: Optional[str] = "client"  # project_manager | team_member | client


class GuestConvertRequest(BaseModel):
    session_id: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    organization: Optional[str] = None
    system_role: Optional[str] = "client"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class SSOJSONRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    provider: str


class AssignRoleRequest(BaseModel):
    email: EmailStr
    system_role: str


import re

def validate_password(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Das Passwort muss mindestens 8 Zeichen lang sein.")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Das Passwort muss mindestens einen Kleinbuchstaben enthalten.")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Das Passwort muss mindestens einen Großbuchstaben enthalten.")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Das Passwort muss mindestens eine Zahl enthalten.")
    if not re.search(r"[^a-zA-Z0-9]", password):
        raise HTTPException(status_code=400, detail="Das Passwort muss mindestens ein Sonderzeichen enthalten.")

# ── Auth Endpoints ──────────────────────────────────────────────

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login_access_token(
    request: Request,
    response: Response,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Login endpoint — accepts both JSON body and OAuth2 form data.
    Returns access token, token type, user role, and basic profile info.
    Ref: Business_Logic documentation.docx, Section 3.
    """
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        data = await request.json()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
    else:
        form = await request.form()
        email = form.get("username", "").strip().lower()
        password = form.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="E-Mail und Passwort erforderlich")

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password or not security.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Ungültige E-Mail-Adresse oder Passwort")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.")

    user.last_login = datetime.utcnow()
    db.commit()

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(user.id), expires_delta=access_token_expires)

    user_role_str = user.system_role.value if hasattr(user.system_role, 'value') else str(user.system_role)

    response.set_cookie(
        key="access_token",
        value=token_str,
        httponly=True,
        samesite="lax",
        max_age=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": user_role_str,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user_role_str,
        },
    }

@router.post("/logout")
def logout(response: Response):
    """
    Clears the HttpOnly authentication cookie.
    """
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"message": "Successfully logged out"}


@router.post("/register", response_model=dict)
@limiter.limit("5/minute")
def register_user(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Register a new user with full role support (project_manager, team_member, client)
    and optional organization link.
    Ref: Business_Logic documentation.docx, Section 2-3.
    """
    validate_password(user_in.password)
    
    email = user_in.email.strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="E-Mail-Adresse ist bereits registriert")

    if len(user_in.password) > 72:
        raise HTTPException(status_code=400, detail="Passwort darf maximal 72 Zeichen lang sein.")

    # Map role string to SystemRole enum
    role_enum = SystemRole.client
    if user_in.system_role in SystemRole.__members__:
        role_enum = SystemRole[user_in.system_role]

    new_user = User(
        email=email,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        hashed_password=security.get_password_hash(user_in.password),
        system_role=role_enum,
        privacy_consent=True,
        is_guest=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Link organization if provided
    if user_in.organization:
        org = db.query(Organization).filter(Organization.name == user_in.organization).first()
        if not org:
            org = Organization(name=user_in.organization)
            db.add(org)
            db.commit()
            db.refresh(org)

        membership = Membership(user_id=new_user.id, org_id=org.id, org_role="editor")
        db.add(membership)
        db.commit()

    # Generate verification token
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(new_user.id), expires_delta=access_token_expires)
    
    # Send verification email
    from app.core.email import send_verification_email
    send_verification_email(new_user.email, token_str)

    return {
        "msg": "Bitte bestätigen Sie Ihre E-Mail-Adresse",
        "verification_required": True
    }


@router.post("/convert-guest", response_model=Token)
def convert_guest_to_account(
    req: GuestConvertRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Converts a guest session into a permanent registered account.
    All projects created under the guest session_id are automatically merged to the new user.
    Ref: Business_Logic documentation.docx, Section 2.3.
    """
    email = req.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="E-Mail-Adresse ist bereits registriert")

    if len(req.password) > 72:
        raise HTTPException(status_code=400, detail="Passwort darf maximal 72 Zeichen lang sein.")

    role_enum = SystemRole.client
    if req.system_role in SystemRole.__members__:
        role_enum = SystemRole[req.system_role]

    new_user = User(
        email=email,
        first_name=req.first_name,
        last_name=req.last_name,
        hashed_password=security.get_password_hash(req.password),
        system_role=role_enum,
        session_id=req.session_id,
        privacy_consent=True,
        is_guest=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Merge guest projects: re-assign all projects linked to session_id to the new user.id
    guest_projects = db.query(Project).filter(Project.guest_session_id == req.session_id).all()
    for p in guest_projects:
        p.owner_id = new_user.id
        p.guest_session_id = None
    db.commit()

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(new_user.id), expires_delta=access_token_expires)
    role_str = role_enum.value if hasattr(role_enum, 'value') else str(role_enum)

    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": role_str,
        "user": {
            "id": str(new_user.id),
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "role": role_str,
        },
    }


@router.post("/forgot-password")
def forgot_password(
    req: ForgotPasswordRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Password reset request endpoint. Generates reset token.
    Ref: Business_Logic documentation.docx.
    """
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user:
        from app.core.email import send_password_reset_email
        reset_token_expires = timedelta(hours=1)
        token = create_access_token(str(user.id), expires_delta=reset_token_expires)
        send_password_reset_email(email_to=user.email, token=token)
        
    # Always return success to prevent email enumeration
    return {"message": "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail gesendet."}


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
def reset_password(
    req: ResetPasswordRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Validates token and sets a new password.
    """
    validate_password(req.new_password)

    try:
        from jose import jwt, JWTError
        payload = jwt.decode(req.token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Ungültiger Token")
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiger Token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

    user.hashed_password = security.get_password_hash(req.new_password)
    db.commit()

    return {"message": "Passwort erfolgreich zurückgesetzt."}


@router.post("/sso", response_model=Token)
def sso_login(
    req: SSOJSONRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Handles Google and Microsoft SSO logins.
    If user doesn't exist, creates them but leaves system_role as None.
    If role is None, frontend will intercept and ask for role.
    """
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        # Create a new user without a password (SSO) and no initial role
        user = User(
            email=req.email,
            first_name=req.first_name,
            last_name=req.last_name,
            hashed_password=None, # No password for SSO users
            system_role=None, # Intentionally left blank for onboarding
            privacy_consent=True,
            is_guest=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(user.id), expires_delta=access_token_expires)

    # Return role as empty string if None, so frontend knows to show modal
    role_str = ""
    if user.system_role:
        role_str = user.system_role.value if hasattr(user.system_role, 'value') else str(user.system_role)

    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": role_str,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role_str,
        },
    }


@router.post("/assign-role", response_model=Token)
def assign_role(
    req: AssignRoleRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Allows a new SSO user to assign their role.
    """
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

    if user.system_role:
        raise HTTPException(status_code=400, detail="Benutzer hat bereits eine Rolle")

    role_enum = SystemRole.client
    if req.system_role in SystemRole.__members__:
        role_enum = SystemRole[req.system_role]
    else:
        raise HTTPException(status_code=400, detail="Ungültige Rolle")

    user.system_role = role_enum
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(user.id), expires_delta=access_token_expires)
    role_str = role_enum.value if hasattr(role_enum, 'value') else str(role_enum)

    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": role_str,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": role_str,
        },
    }

@router.post("/verify-email", response_model=dict)
def verify_email(
    token: str,
    db: Session = Depends(deps.get_db)
):
    try:
        from jose import jwt, JWTError
        from app.core import security
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Ungültiger Token")
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiger Token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

    if user.is_verified:
        return {"msg": "E-Mail ist bereits bestätigt."}

    user.is_verified = True
    db.commit()
    
    return {"msg": "E-Mail erfolgreich bestätigt"}

@router.get("/session")
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    """
    Get current user session info for dashboard.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "system_role": current_user.system_role.value if hasattr(current_user.system_role, "value") else current_user.system_role
    }
