from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.domain4_collab import TaskStatus, TaskPriority

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.low
    current_deadline: Optional[datetime] = None
    owner_id: Optional[UUID] = None

class TaskCreate(TaskBase):
    project_id: UUID

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class TaskResponse(TaskBase):
    id: UUID
    project_id: UUID
    status: TaskStatus
    created_at: datetime
    assignee_name: Optional[str] = None
    assignee_avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
