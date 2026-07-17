from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB

class DocumentUpload(Base):
    __tablename__ = "document_uploads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    
    # Store the AI's extracted insights from the document
    ai_analysis_result = Column(JSONB, nullable=True)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
    user = relationship("User")

class AIInterpretation(Base):
    __tablename__ = "ai_interpretations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    # "Was hat der Nutzer gesagt?" vs "Was hat die KI daraus gemacht?"
    ai_interpretation_summary = Column(String, nullable=False)
    generated_by_agent = Column(String, nullable=False) # e.g. 'planning_agent', 'audience_agent'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")

class BotLog(Base):
    __tablename__ = "bot_logs"
    # To log the chat history and measure AI helpfulness
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    
    user_message = Column(String, nullable=True)
    ai_identified_gap = Column(String, nullable=True)
    ai_suggestion = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project")
