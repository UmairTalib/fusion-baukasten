from app.db.base_class import Base

# Import all models here so Alembic can find them for migrations

# Domain 1: Users, Organizations, Teams
from app.models.domain1_stammdaten import User, Organization, Membership, Team

# Domain 2: Projects, Snapshots, Templates, Saved Audiences
from app.models.domain2_projekte import (
    Project, ProjectSnapshot, SavedTargetAudience, ProjectTemplate
)

# Domain 3: Core Flow Dialogue, Copilot Chat, Output Generation
from app.models.domain3_dialog import (
    CoreFlowProgress, BlockAnswer,
    CopilotMessage,
    Toolbox, PracticalPlan
)

# Domain 4: Collaboration — Tasks, Milestones, Communication Center, Notifications
from app.models.domain4_collab import (
    Task, TaskContributor, Milestone,
    Conversation, ConversationParticipant, Message,
    Notification, ActivityLog
)

# Domain 5: AI Services — Document Upload & Context Enrichment
from app.models.domain5_ai import DocumentUpload
