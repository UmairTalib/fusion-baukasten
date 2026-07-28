from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB


class TaskStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    review = "review"
    completed = "completed"


class TaskPriority(str, enum.Enum):
    high = "high"
    low = "low"


class ConversationStatus(str, enum.Enum):
    open = "open"               # Needs a reply
    in_progress = "in_progress"
    completed = "completed"


class ConversationType(str, enum.Enum):
    direct = "direct"           # 1:1 between two users
    group = "group"             # Multiple users
    project = "project"         # Tied to a specific project


# ─────────────────────────────────────────────
# TASK MANAGEMENT (Business Logic Section 5.3)
# ─────────────────────────────────────────────

class Task(Base):
    """
    Project task with owner, contributors, priority, deadline, and dependencies.
    One task can block another (Task A must finish before Task B starts).
    Ref: Business_Logic documentation.docx, Section 5.3.
    """
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.low)
    status = Column(Enum(TaskStatus), default=TaskStatus.open)

    # Scheduling — track original vs current to measure drift
    original_deadline = Column(DateTime(timezone=True), nullable=True)
    current_deadline = Column(DateTime(timezone=True), nullable=True)

    # Ownership (one owner, multiple contributors via TaskContributor)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    external_email = Column(String, nullable=True)  # For non-registered collaborators

    # Dependencies: Task A cannot start until depends_on_task_id is completed
    depends_on_task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    owner = relationship("User", back_populates="tasks_owned", foreign_keys=[owner_id])
    contributors = relationship("TaskContributor", back_populates="task")
    depends_on = relationship("Task", remote_side="Task.id")


class TaskContributor(Base):
    """
    Many-to-many: multiple users can contribute to one task.
    Ref: Business_Logic documentation.docx, Section 5.3.
    """
    __tablename__ = "task_contributors"

    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="contributors")
    user = relationship("User")


class Milestone(Base):
    """
    Project timeline milestones for the project manager view.
    Ref: Business_Logic documentation.docx, Section 5.1.
    """
    __tablename__ = "milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="milestones")


# ─────────────────────────────────────────────
# COMMUNICATION CENTER (Business Logic Section 3.1)
# ─────────────────────────────────────────────

class Conversation(Base):
    """
    A conversation thread in the Communication Center.
    Can be a 1:1 direct message, a group chat, or tied to a project.
    Access is role-filtered:
      - project_manager: sees all conversations
      - team_member: sees only project-scoped conversations they are in
      - client: sees only conversations on their own project
    Ref: Business_Logic documentation.docx, Section 3.1.
    """
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    conversation_type = Column(Enum(ConversationType), default=ConversationType.direct)
    status = Column(Enum(ConversationStatus), default=ConversationStatus.open)
    title = Column(String, nullable=True)   # Optional — for group chats
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    participants = relationship("ConversationParticipant", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation", order_by="Message.sent_at")


class ConversationParticipant(Base):
    """Who is part of a conversation."""
    __tablename__ = "conversation_participants"

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_read_at = Column(DateTime(timezone=True), nullable=True)

    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User")


class Message(Base):
    """
    A single message inside a Conversation.
    Supports text content and optional file attachments.
    Ref: Business_Logic documentation.docx, Section 3.1.
    """
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    file_attachment_path = Column(String, nullable=True)  # Path to uploaded file
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="messages_sent")


# ─────────────────────────────────────────────
# NOTIFICATIONS (Business Logic Section 5.4)
# ─────────────────────────────────────────────

class Notification(Base):
    """
    In-app notification feed. Users are notified of task assignments,
    deadline changes, and new messages.
    Ref: Business_Logic documentation.docx, Section 5.4.
    """
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    notification_type = Column(String, nullable=False)
    # Values: "task_assigned" | "deadline_changed" | "message_received" | "project_updated"
    payload = Column(JSONB, nullable=False)   # Flexible data per notification type
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class ActivityLog(Base):
    """
    Immutable audit trail — records every significant action taken on a project.
    """
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action_type = Column(String, nullable=False)   # e.g. "task_completed", "block_answered"
    details = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
    actor = relationship("User")
