from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID

class ProjectLifecycleStatus(str, enum.Enum):
    idea_draft = "idea_draft"
    active_execution = "active_execution"
    paused = "paused"
    archived_research = "archived_research"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String)
    
    # Links to Domain 1 (Stammdaten)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    
    # Project Settings & Status
    lifecycle_status = Column(Enum(ProjectLifecycleStatus), default=ProjectLifecycleStatus.idea_draft)
    is_template = Column(Boolean, default=False)
    
    # Research / Tracking Variables
    initial_mode = Column(String, default="detailed") # express vs detailed
    current_mode = Column(String, default="detailed")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    organization = relationship("Organization", foreign_keys=[org_id])
