from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID

class SystemRole(str, enum.Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"

class OrgType(str, enum.Enum):
    municipality = "municipality"
    agency = "agency"
    ngo = "ngo"
    other = "other"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String, nullable=False)
    language_pref = Column(String, default="de")
    system_role = Column(Enum(SystemRole), default=SystemRole.viewer)
    opt_in_data = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    memberships = relationship("Membership", back_populates="user")
    guest_sessions = relationship("GuestSession", back_populates="converted_user")

class GuestSession(Base):
    __tablename__ = "guest_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    is_guest = Column(Boolean, default=True)
    dsgvo_accepted = Column(Boolean, default=False)
    converted_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relationships
    converted_user = relationship("User", back_populates="guest_sessions")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    org_type = Column(Enum(OrgType), default=OrgType.other)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    memberships = relationship("Membership", back_populates="organization")
    teams = relationship("Team", back_populates="organization")

class Membership(Base):
    __tablename__ = "memberships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    org_role = Column(Enum(SystemRole), default=SystemRole.viewer)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="memberships")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="teams")
    # team_members relationship would be defined via a many-to-many table
