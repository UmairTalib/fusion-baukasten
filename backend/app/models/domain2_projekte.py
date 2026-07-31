from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Integer, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB


class TeamRole(str, enum.Enum):
    owner = "Owner"
    editor = "Editor"
    viewer = "Viewer"


class PlanningMode(str, enum.Enum):
    express = "express"    # Minimal questions, fast first draft
    detailed = "detailed"  # Deep-dive questions, more refined output


class ProjectStatus(str, enum.Enum):
    idea_draft = "idea_draft"
    active_execution = "active_execution"
    paused = "paused"
    completed = "completed"
    archived = "archived"


class Project(Base):
    """
    Core project entity. Each project belongs to one owner (User) and
    optionally an Organization. Supports both registered users and guest sessions.
    Ref: Business_Logic documentation.docx, Sections 6–7.
    """
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)

    # Ownership
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    # Guest session link — allows guest projects to be merged on account conversion
    guest_session_id = Column(String, nullable=True)

    # Status & Mode (Business Logic Section 7.2)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.idea_draft)
    planning_mode = Column(Enum(PlanningMode), default=PlanningMode.express)

    # Cross-cutting themes tracked at project level (Business Logic Section 5.2)
    sustainability_notes = Column(String, nullable=True)
    inclusivity_notes = Column(String, nullable=True)
    transparency_notes = Column(String, nullable=True)

    budget_used = Column(Numeric(10, 2), default=0.00)
    budget_total = Column(Numeric(10, 2), default=0.00)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="projects_owned")
    organization = relationship("Organization")
    snapshots = relationship("ProjectSnapshot", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    milestones = relationship("Milestone", back_populates="project")
    team_members = relationship("TeamMember", back_populates="project", cascade="all, delete-orphan")


class ProjectSnapshot(Base):
    """
    Versioned save state of a project at a point in time.
    Users can compare before/after states and share specific snapshots.
    Ref: Business_Logic documentation.docx, Section 11.1.
    """
    __tablename__ = "project_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    label = Column(String, nullable=False)       # e.g. "After Block D review"
    snapshot_data = Column(JSONB, nullable=False) # Full JSON dump of all answers at this point
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="snapshots")
    creator = relationship("User")


class SavedTargetAudience(Base):
    """
    Reusable target audience profiles that can be applied across multiple projects.
    Ref: Business_Logic documentation.docx, Section 6.1.
    """
    __tablename__ = "saved_target_audiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)           # e.g. "Youth in rural NRW"
    profile_data = Column(JSONB, nullable=False)    # Structured audience profile
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class ProjectTemplate(Base):
    """
    Reusable project templates that pre-fill questions and settings.
    Ref: Business_Logic documentation.docx, Section 6.1.
    """
    __tablename__ = "project_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)           # e.g. "Town Hall Meeting"
    description = Column(String)
    template_data = Column(JSONB, nullable=False)   # Pre-filled block answers
    is_public = Column(Boolean, default=False)       # Shared with all users?
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    team_role = Column(Enum(TeamRole), default=TeamRole.viewer)
    
    project = relationship("Project", back_populates="team_members")
    user = relationship("User")
