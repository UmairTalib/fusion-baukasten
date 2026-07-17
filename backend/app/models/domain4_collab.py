from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID

class TaskPriority(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"

class TaskStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    review = "review"
    completed = "completed"

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(String)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    status = Column(Enum(TaskStatus), default=TaskStatus.open)
    
    # Scheduling - as requested: original vs current date to track drift
    original_deadline = Column(DateTime(timezone=True))
    current_deadline = Column(DateTime(timezone=True))
    
    # Assignments
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    external_email = Column(String, nullable=True) # for external un-registered collaborators
    
    # Dependencies (Task A must finish before Task B)
    depends_on_task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
    owner = relationship("User")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    # This powers the "Inbox" and "Kommunikationszentrum"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    action_type = Column(String, nullable=False) # e.g., 'task_completed', 'milestone_reached'
    details = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
    actor = relationship("User")
