from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB


class CoreFlowProgress(Base):
    """
    Tracks the user's overall progress through the 7-block Core Flow.
    Supports non-linear navigation — users can go back and revise any block at any time.
    Ref: Business_Logic documentation.docx, Section 8.1.
    """
    __tablename__ = "core_flow_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, unique=True)

    # Completion flags per block (same 7 blocks in both Express and Detailed mode)
    block_1_completed = Column(Boolean, default=False)
    block_2_completed = Column(Boolean, default=False)
    block_3_completed = Column(Boolean, default=False)
    block_4_completed = Column(Boolean, default=False)
    block_5_completed = Column(Boolean, default=False)
    block_6_completed = Column(Boolean, default=False)
    block_7_completed = Column(Boolean, default=False)

    current_block = Column(Integer, default=1)  # 1 through 7
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project")
    answers = relationship("BlockAnswer", back_populates="flow_progress")


class BlockAnswer(Base):
    """
    Stores a user's answer for a specific question within a specific block.
    Supports non-linear iteration — if an upstream block changes, downstream
    answers are flagged with needs_review=True.
    Ref: Business_Logic documentation.docx, Section 8.1 (iteration between blocks).
    """
    __tablename__ = "block_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    flow_progress_id = Column(UUID(as_uuid=True), ForeignKey("core_flow_progress.id"), nullable=True)

    block_number = Column(Integer, nullable=False)   # 1 through 7
    variable_name = Column(String, nullable=False)   # e.g. "target_group", "budget_range"
    answer_data = Column(JSONB, nullable=True)        # Rich answer: text, selections, numbers

    # Non-linear support: when upstream answers change, this flags downstream answers
    needs_review = Column(Boolean, default=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)  # Last time user confirmed this

    # Research tracking: how often does the user revise their answer?
    iteration_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project")
    flow_progress = relationship("CoreFlowProgress", back_populates="answers")


class CopilotMessage(Base):
    """
    A single message in the Fusion Co-Pilot chat.
    The Co-Pilot exists on ALL dashboards (not just the core flow).
    The dashboard_context field determines which AI agent handles the message.
    Ref: Business_Logic documentation.docx, Section 4.
    """
    __tablename__ = "copilot_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    role = Column(String, nullable=False)   # "user" | "assistant"
    content = Column(Text, nullable=False)

    # Which dashboard/context triggered this message?
    # Values: "core_flow" | "manager_dashboard" | "team_dashboard" | "client_dashboard"
    dashboard_context = Column(String, nullable=True)

    # Which background agent handled this? (Business Logic Section 4.1)
    # Values: "planning_agent" | "resource_agent" | "risk_agent" | "task_agent" | "knowledge_agent"
    agent_type = Column(String, nullable=True)

    # Co-Pilot mode (Business Logic Section 4)
    # "quick" = fast immediate help | "thinking" = deeper analysis
    copilot_mode = Column(String, default="quick")

    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")


class Toolbox(Base):
    """
    The AI-generated compact output after the Core Flow is completed.
    Contains checklists, method recommendations, and next steps.
    Ref: Business_Logic documentation.docx, Section 10.1.
    """
    __tablename__ = "toolboxes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, unique=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    project_summary = Column(Text)                           # Short AI-written overview
    preparation_checklist = Column(JSONB)                    # List of prep tasks
    execution_checklist = Column(JSONB)                      # Day-of-event checklist
    followup_checklist = Column(JSONB)                       # Post-event actions
    method_recommendations = Column(JSONB)                   # Ranked format suggestions
    communication_tips = Column(Text)                        # How to reach target audience
    risk_warnings = Column(JSONB)                            # Identified risks
    next_steps = Column(JSONB)                               # Immediate actions for user

    project = relationship("Project")


class PracticalPlan(Base):
    """
    The AI-generated detailed operational plan.
    Includes agenda, task packages, timeline, and personal to-dos.
    Ref: Business_Logic documentation.docx, Section 10.2.
    """
    __tablename__ = "practical_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    agenda_structure = Column(JSONB)       # [{"time": "09:00", "duration_min": 30, "item": "..."}]
    task_packages = Column(JSONB)          # [{"task": "...", "owner": "...", "deadline": "..."}]
    resource_list = Column(JSONB)          # Budget breakdown, tools, service providers
    risk_fallback_plan = Column(JSONB)     # What to do if things go wrong
    milestone_timeline = Column(JSONB)     # Key dates and milestones
    personal_todos = Column(JSONB)         # "I need to do" list for the project owner
    stakeholder_todos = Column(JSONB)      # "Others need to deliver" list

    project = relationship("Project")
