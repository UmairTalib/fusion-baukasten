from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB


class DocumentUpload(Base):
    """
    Files uploaded by users for AI analysis.
    The AI extracts goals, team info, constraints and integrates them into the project.
    Ref: Business_Logic documentation.docx, Section 8.2 (Context Enrichment Service).
    """
    __tablename__ = "document_uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Local path or S3 key
    file_type = Column(String, nullable=True)   # "pdf", "docx", "xlsx"
    file_size_bytes = Column(Integer, nullable=True)

    # AI-extracted data from the document
    extracted_data = Column(JSONB, nullable=True)
    # e.g. {"goals": [...], "team_members": [...], "constraints": [...], "formats_mentioned": [...]}
    extraction_status = Column(String, default="pending")
    # Values: "pending" | "processing" | "completed" | "failed"

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    extracted_at = Column(DateTime(timezone=True), nullable=True)

    project = relationship("Project")
    uploader = relationship("User")
