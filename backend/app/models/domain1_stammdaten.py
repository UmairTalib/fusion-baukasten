from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID

class SystemRole(str, enum.Enum):
    """
    Platform-level role — controls which dashboard a user sees after login.
    Defined in Business_Logic documentation.docx, Section 3.
    """
    project_manager = "project_manager"  # Sees all projects, full team, full comms
    team_member = "team_member"          # Sees only own tasks and assigned projects
    client = "client"                    # External user — sees only their own project

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
    hashed_password = Column(String, nullable=True)  # nullable for guests
    language_pref = Column(String, default="de")

    # Role-based dashboard routing (Business Logic Section 3)
    system_role = Column(Enum(SystemRole), nullable=True)

    # Guest & Privacy (Business Logic Section 2, Phase 0)
    is_guest = Column(Boolean, default=False)
    session_id = Column(String, unique=True, nullable=True)   # Guest session identifier
    is_verified = Column(Boolean, default=False)               # Email verification status
    privacy_consent = Column(Boolean, default=False)           # DSGVO consent

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    memberships = relationship("Membership", back_populates="user")
    projects_owned = relationship("Project", back_populates="owner")
    messages_sent = relationship("Message", back_populates="sender")
    notifications = relationship("Notification", back_populates="user")
    tasks_owned = relationship("Task", back_populates="owner", foreign_keys="Task.owner_id")


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
    """User's role within a specific Organization."""
    __tablename__ = "memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    org_role = Column(String, default="viewer")   # owner / editor / viewer
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
