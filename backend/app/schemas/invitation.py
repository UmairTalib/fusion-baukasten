from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class InvitationCreate(BaseModel):
    email: EmailStr
    role: str = "member"

class InvitationResponse(BaseModel):
    id: UUID
    email: EmailStr
    org_id: UUID
    inviter_id: UUID
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class InvitationVerifyResponse(BaseModel):
    email: EmailStr
    org_name: str
    role: str
