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
    organization: Optional[str] = ""
    system_role: Optional[str] = "client"  # project_manager | team_member | client
    invite_token: Optional[str] = None


class GuestConvertRequest(BaseModel):
    session_id: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    organization: str
    system_role: Optional[str] = "client"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class SSOJSONRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    provider: str
    id_token: str


from typing import Optional

class AssignRoleRequest(BaseModel):
    email: EmailStr
    system_role: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    organization: str
    id_token: str


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
        raise HTTPException(status_code=401, detail="Ungültige E-Mail-Adresse oder Passwort")

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
        raise HTTPException(status_code=409, detail="E-Mail-Adresse ist bereits registriert")

    if len(user_in.password) > 72:
        raise HTTPException(status_code=400, detail="Passwort darf maximal 72 Zeichen lang sein.")

    # Prevent Privilege Escalation (C2):
    # Verify the invitation *before* creating the user, so we can use its secure role.
    invitation = None
    role_enum = SystemRole.client
    
    if user_in.invite_token:
        from app.models.domain1_stammdaten import Invitation, InvitationStatus
        invitation = db.query(Invitation).filter(
            Invitation.token == user_in.invite_token,
            Invitation.status == InvitationStatus.pending
        ).first()
        
        if not invitation:
            raise HTTPException(status_code=400, detail="Ungültiger oder abgelaufener Einladungs-Token")
            
        # FORCE the role to whatever the Project Manager authorized in the database
        if invitation.role in SystemRole.__members__:
            role_enum = SystemRole[invitation.role]
        else:
            role_enum = SystemRole.team_member
    else:
        # Standard registration: accept requested role (though normally we'd restrict pm creation)
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

    # Process Invitation token if provided
    verification_required = True
    if invitation:
        from app.models.domain1_stammdaten import InvitationStatus, Membership
        
        # Auto-verify email
        new_user.is_verified = True
        verification_required = False
        
        # Link user to organization with the proper enum equivalent string or fallback
        # In a fully refactored system this org_role string would be removed, but we stick to SystemRole
        membership = Membership(user_id=new_user.id, org_id=invitation.org_id, org_role=role_enum.value)
        db.add(membership)
        
        # Update invitation
        invitation.status = InvitationStatus.accepted
        db.commit()
    else:
        # Normal registration flow: Link organization if provided
        if user_in.organization:
            org = db.query(Organization).filter(Organization.name == user_in.organization).first()
            if not org:
                org = Organization(name=user_in.organization)
                db.add(org)
                db.commit()
                db.refresh(org)

            from app.models.domain1_stammdaten import Membership
            membership = Membership(user_id=new_user.id, org_id=org.id, org_role="editor")
            db.add(membership)
            db.commit()

    if verification_required:
        # Generate verification token (C3 Fix: specific token_type)
        access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
        token_str = create_access_token(
            subject=str(new_user.id), 
            expires_delta=access_token_expires, 
            token_type="verify"
        )
        
        # Send verification email
        from app.core.email import send_verification_email
        send_verification_email(new_user.email, token_str)

    return {
        "msg": "Bitte bestätigen Sie Ihre E-Mail-Adresse" if verification_required else "Registrierung erfolgreich. Sie können sich nun anmelden.",
        "verification_required": verification_required
    }


@router.post("/convert-guest", response_model=Token)
@limiter.limit("3/minute")
def convert_guest_to_account(
    request: Request,
    req: GuestConvertRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Converts a guest session into a permanent registered account.
    """
    import uuid
    try:
        # C4 partial fix: ensure session_id is a valid UUID, not a trivially guessable string
        uuid_obj = uuid.UUID(req.session_id, version=4)
    except ValueError:
        raise HTTPException(status_code=400, detail="Ungültige Guest-Session")

    email = req.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="E-Mail-Adresse ist bereits registriert")

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
    """
    email = req.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user:
        from app.core.email import send_password_reset_email
        reset_token_expires = timedelta(hours=1)
        token = create_access_token(
            subject=str(user.id), 
            expires_delta=reset_token_expires,
            token_type="reset"
        )
        send_password_reset_email(email_to=user.email, token=token)
        
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
        token_type: str = payload.get("type")
        if user_id is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Ungültiger Token")
    except Exception:
        raise HTTPException(status_code=400, detail="Ungültiger Token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden")

    user.hashed_password = security.get_password_hash(req.new_password)
    db.commit()

    return {"message": "Passwort erfolgreich zurückgesetzt."}


import httpx
from jose import jwt

MS_JWKS_URL = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
_ms_keys = None

def get_ms_keys():
    global _ms_keys
    if not _ms_keys:
        try:
            resp = httpx.get(MS_JWKS_URL)
            resp.raise_for_status()
            _ms_keys = resp.json()
        except Exception:
            raise HTTPException(status_code=500, detail="Could not fetch Microsoft JWKS.")
    return _ms_keys

def verify_microsoft_token(id_token: str, expected_email: str):
    if not id_token:
        raise HTTPException(status_code=401, detail="Missing ID Token. Access Denied.")
        
    keys = get_ms_keys()
    try:
        unverified_header = jwt.get_unverified_header(id_token)
        rsa_key = {}
        for key in keys.get("keys", []):
            if key["kid"] == unverified_header.get("kid"):
                rsa_key = key
                break
        
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token signing key.")
            
        payload = jwt.decode(
            id_token,
            rsa_key,
            algorithms=["RS256"],
            options={"verify_aud": False, "verify_iss": False} 
        )
        
        token_email = (
            payload.get("email") 
            or payload.get("preferred_username") 
            or payload.get("upn") 
            or payload.get("unique_name")
        )
        if not token_email or token_email.lower() != expected_email.lower():
            print(f"Token email mismatch: token has '{token_email}', expected '{expected_email}'")
            raise HTTPException(status_code=401, detail="Token email mismatch. Possible spoofing detected.")
            
        print(f"DEBUG MICROSOFT JWT PAYLOAD: {payload}")
        return payload
    except Exception as e:
        print(f"Token validation error: {str(e)}")
        raise HTTPException(status_code=401, detail="Token validation failed.")

@router.post("/sso")
def sso_login(
    req: SSOJSONRequest,
    response: Response,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Handles Microsoft SSO logins securely using ID Token validation.
    """
    # 1. Cryptographically verify the token came from Microsoft
    payload = verify_microsoft_token(req.id_token, req.email)

    # Prefer Microsoft Display Name ('name') over 'given_name', as users often update Display Name in Microsoft settings
    full_name = payload.get("name") or f"{req.first_name} {req.last_name}".strip()
    if full_name and " " in full_name:
        split_name = full_name.split(" ")
        first_name = split_name[0]
        last_name = " ".join(split_name[1:])
    else:
        first_name = payload.get("given_name") or req.first_name
        last_name = payload.get("family_name") or req.last_name

    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        # User does not exist, return flag to frontend so they can pick a role first
        return {
            "is_new_user": True,
            "access_token": "",
            "token_type": "bearer",
            "role": ""
        }

    # User exists, log them in normally and sync any updated name from Microsoft token
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(user.id), expires_delta=access_token_expires)

    role_str = ""
    if user.system_role:
        role_str = user.system_role.value if hasattr(user.system_role, 'value') else str(user.system_role)

    # Set the HttpOnly cookie for Next.js middleware!
    response.set_cookie(
        key="access_token",
        value=token_str,
        httponly=True,
        max_age=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )

    return {
        "is_new_user": False,
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
    response: Response,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Allows a new SSO user to assign their role, verified via ID Token.
    """
    # 1. Cryptographically verify the token came from Microsoft
    payload = verify_microsoft_token(req.id_token, req.email)

    # Prefer Microsoft Display Name ('name') over 'given_name', as users often update Display Name in Microsoft settings
    full_name = payload.get("name") or f"{req.first_name} {req.last_name}".strip()
    if full_name and " " in full_name:
        split_name = full_name.split(" ")
        first_name = split_name[0]
        last_name = " ".join(split_name[1:])
    else:
        first_name = req.first_name or payload.get("given_name") or ""
        last_name = req.last_name or payload.get("family_name") or ""

    user = db.query(User).filter(User.email == req.email).first()

    role_enum = SystemRole.client
    if req.system_role in SystemRole.__members__:
        role_enum = SystemRole[req.system_role]
    else:
        raise HTTPException(status_code=400, detail="Ungültige Rolle")

    if not user:
        # User doesn't exist yet! Create them now with their chosen role.
        user = User(
            email=req.email,
            first_name=first_name,
            last_name=last_name,
            hashed_password=None,
            system_role=role_enum,
            privacy_consent=True,
            is_guest=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if user.system_role:
            raise HTTPException(status_code=400, detail="Benutzer hat bereits eine Rolle")
        user.system_role = role_enum
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        db.commit()
        db.refresh(user)

    if req.organization:
        org = db.query(Organization).filter(Organization.name == req.organization).first()
        if not org:
            org = Organization(name=req.organization)
            db.add(org)
            db.commit()
            db.refresh(org)

        existing_membership = db.query(Membership).filter(Membership.user_id == user.id, Membership.org_id == org.id).first()
        if not existing_membership:
            membership = Membership(user_id=user.id, org_id=org.id, org_role="editor")
            db.add(membership)
            db.commit()


    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_str = create_access_token(str(user.id), expires_delta=access_token_expires)
    role_str = role_enum.value if hasattr(role_enum, 'value') else str(role_enum)

    # Set the HttpOnly cookie for Next.js middleware!
    response.set_cookie(
        key="access_token",
        value=token_str,
        httponly=True,
        max_age=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=security.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )

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
        token_type: str = payload.get("type")
        if user_id is None or token_type != "verify":
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
