from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB

class CoreFlowProgress(Base):
    __tablename__ = "core_flow_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, unique=True)
    
    # Track completion status of the 7 blocks (A-G)
    block_a_completed = Column(Boolean, default=False)
    block_b_completed = Column(Boolean, default=False)
    block_c_completed = Column(Boolean, default=False)
    block_d_completed = Column(Boolean, default=False)
    block_e_completed = Column(Boolean, default=False)
    block_f_completed = Column(Boolean, default=False)
    block_g_completed = Column(Boolean, default=False)
    
    current_block = Column(String, default="A")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project")

class BlockAnswer(Base):
    __tablename__ = "block_answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    block_id = Column(String, nullable=False) # e.g., 'A', 'B', 'C'
    variable_name = Column(String, nullable=False) # e.g., 'zielgruppe', 'ressourcen'
    
    # Store dynamic answers natively using JSONB to allow rich structure (arrays, objects)
    answer_data = Column(JSONB, nullable=True)
    
    # As requested by Adrian: track iterations to see how often users change their mind
    iteration_count = Column(Integer, default=0)
    is_detailed_mode = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project")
