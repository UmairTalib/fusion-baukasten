from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain1_stammdaten import User, Invitation, InvitationStatus, Organization, Membership
from app.schemas.invitation import InvitationCreate, InvitationResponse, InvitationVerifyResponse
from app.core.config import settings
import uuid
import resend
from datetime import datetime, timedelta, timezone

router = APIRouter()

# ensure resend api key is set
resend.api_key = settings.RESEND_API_KEY

@router.post("/", response_model=InvitationResponse)
def create_invitation(
    invite_in: InvitationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    from app.models.domain1_stammdaten import SystemRole
    if current_user.system_role != SystemRole.project_manager:
        raise HTTPException(status_code=403, detail="Nur Projektmanager können Einladungen versenden.")

    # Get the PM's organization
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=400, detail="Benutzer hat keine Organisation.")

    org = db.query(Organization).filter(Organization.id == membership.org_id).first()

    # Create the invitation (Fix C5: Timezone-aware datetime)
    token = str(uuid.uuid4())
    invitation = Invitation(
        email=invite_in.email.lower(),
        org_id=org.id,
        inviter_id=current_user.id,
        token=token,
        role=invite_in.role,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    # Send the email via Resend
    invite_url = f"http://localhost:3000/register?token={token}"
    html_content = f"""
    <h2>Einladung zu Fusion-Baukasten</h2>
    <p>Hallo!</p>
    <p>{current_user.first_name} {current_user.last_name} hat Sie eingeladen, dem Team "{org.name}" beizutreten.</p>
    <p><a href="{invite_url}" style="background-color:#4414c9;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Einladung annehmen</a></p>
    <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
    <p>{invite_url}</p>
    """
    
    try:
        if resend.api_key:
            resend.Emails.send({
                "from": "Fusion-Baukasten <onboarding@resend.dev>",
                "to": [invitation.email],
                "subject": f"Einladung zum Team {org.name}",
                "html": html_content
            })
    except Exception as e:
        import logging
        logging.error(f"Error sending email via Resend: {e}")

    return invitation

@router.get("/verify/{token}", response_model=InvitationVerifyResponse)
def verify_invitation(token: str, db: Session = Depends(deps.get_db)):
    invitation = db.query(Invitation).filter(
        Invitation.token == token,
        Invitation.status == InvitationStatus.pending
    ).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Einladung nicht gefunden oder bereits verwendet.")
        
    if invitation.expires_at and invitation.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Einladung ist abgelaufen.")
        
    org = db.query(Organization).filter(Organization.id == invitation.org_id).first()
    
    return {
        "email": invitation.email,
        "org_name": org.name if org else "",
        "role": invitation.role
    }

@router.get("/team")
def get_team(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        return []
    
    # Get all active members in the org efficiently (Fix H1: joinedload to prevent N+1 query)
    from sqlalchemy.orm import joinedload
    memberships = db.query(Membership).options(joinedload(Membership.user)).filter(
        Membership.org_id == membership.org_id, 
        Membership.is_active == True
    ).all()
    
    team = []
    for m in memberships:
        u = m.user
        if u:
            # Generate initials
            first = u.first_name[0] if u.first_name else ''
            last = u.last_name[0] if u.last_name else ''
            initials = f"{first}{last}".strip().upper()
            if not initials:
                initials = u.email[0].upper()
            
            team.append({
                "id": str(u.id),
                "name": f"{u.first_name} {u.last_name}".strip() if u.first_name or u.last_name else "Unbenannt",
                "email": u.email,
                "role": u.system_role.value if hasattr(u.system_role, 'value') else u.system_role,
                "initials": initials
            })
            
    # Add pending invitations
    pending_invites = db.query(Invitation).filter(
        Invitation.org_id == membership.org_id,
        Invitation.status == InvitationStatus.pending
    ).all()
    
    for inv in pending_invites:
        team.append({
            "id": str(inv.id),
            "name": "Ausstehend",
            "email": inv.email,
            "role": inv.role,
            "initials": "...",
            "is_pending": True
        })
        
    return team
