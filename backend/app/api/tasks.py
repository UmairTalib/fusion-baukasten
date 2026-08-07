from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.api import deps
from app.models.domain1_stammdaten import User
from app.models.domain4_collab import Task, ActivityLog
from app.schemas.task import TaskCreate, TaskResponse, TaskStatusUpdate

router = APIRouter()

@router.get("/projects/{project_id}", response_model=List[TaskResponse])
def get_tasks_for_project(
    project_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Get all tasks for a specific project."""
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    
    # Format response to include assignee name
    result = []
    for t in tasks:
        assignee_name = None
        assignee_avatar = None
        if t.owner:
            assignee_name = f"{t.owner.first_name} {t.owner.last_name}".strip()
            # In a real app we might fetch an avatar URL here
        
        result.append(TaskResponse(
            id=t.id,
            project_id=t.project_id,
            title=t.title,
            description=t.description,
            priority=t.priority,
            status=t.status,
            current_deadline=t.current_deadline,
            owner_id=t.owner_id,
            created_at=t.created_at,
            assignee_name=assignee_name,
            assignee_avatar=assignee_avatar
        ))
    return result


@router.post("/", response_model=TaskResponse)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Create a new task. Only PMs should do this."""
    if current_user.system_role != "project_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Projektmanager k\u00f6nnen Aufgaben erstellen."
        )

    task = Task(
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority,
        current_deadline=task_in.current_deadline,
        owner_id=task_in.owner_id
    )
    db.add(task)
    
    # Log activity
    log = ActivityLog(
        project_id=task_in.project_id,
        actor_id=current_user.id,
        action_type="task_created",
        details=f"Aufgabe erstellt: {task.title}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(task)
    
    assignee_name = None
    if task.owner:
        assignee_name = f"{task.owner.first_name} {task.owner.last_name}".strip()

    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        current_deadline=task.current_deadline,
        owner_id=task.owner_id,
        created_at=task.created_at,
        assignee_name=assignee_name
    )


@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: UUID,
    status_update: TaskStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update task status (drag and drop). Anyone in team can do this."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden.")

    task.status = status_update.status
    
    log = ActivityLog(
        project_id=task.project_id,
        actor_id=current_user.id,
        action_type="task_updated",
        details=f"Status ge\u00e4ndert: {task.title} -> {status_update.status.value}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(task)
    
    assignee_name = None
    if task.owner:
        assignee_name = f"{task.owner.first_name} {task.owner.last_name}".strip()

    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        current_deadline=task.current_deadline,
        owner_id=task.owner_id,
        created_at=task.created_at,
        assignee_name=assignee_name
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Delete a task. Only PMs can do this."""
    if current_user.system_role != "project_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Projektmanager k\u00f6nnen Aufgaben l\u00f6schen."
        )

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Aufgabe nicht gefunden.")

    log = ActivityLog(
        project_id=task.project_id,
        actor_id=current_user.id,
        action_type="task_deleted",
        details=f"Aufgabe gel\u00f6scht: {task.title}"
    )
    db.add(log)

    db.delete(task)
    db.commit()
    return None
