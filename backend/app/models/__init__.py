from app.db.base_class import Base

# Import all models here so Alembic can find them
from app.models.domain1_stammdaten import User, GuestSession, Organization, Membership, Team
from app.models.domain2_projekte import Project
from app.models.domain3_dialog import CoreFlowProgress, BlockAnswer
from app.models.domain4_collab import Task, ActivityLog
from app.models.domain5_ai import DocumentUpload, AIInterpretation, BotLog
