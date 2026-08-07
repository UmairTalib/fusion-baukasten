from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.domain1_stammdaten import User
from app.models.domain2_projekte import Project, ProjectStatus, TeamMember
from app.models.domain4_collab import Task, TaskStatus

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    stats = {}
    
    if current_user.system_role == "project_manager":
        # Projektmanager Stats
        
        # 1. Laufende Projekte (Active Execution)
        active_projects_count = db.query(func.count(Project.id)).filter(
            Project.owner_id == current_user.id,
            Project.status == ProjectStatus.active_execution
        ).scalar()
        
        # 2. Offene Aufgaben (Not Completed)
        open_tasks_count = db.query(func.count(Task.id)).join(Project).filter(
            Project.owner_id == current_user.id,
            Task.status != TaskStatus.completed
        ).scalar()
        
        # 3. Budgetverbrauch (Sum of budget_used / budget_total)
        # Using a simple calculation for the demo.
        budget_query = db.query(
            func.sum(Project.budget_used).label('used'),
            func.sum(Project.budget_total).label('total')
        ).filter(Project.owner_id == current_user.id).first()
        
        budget_used = float(budget_query.used) if budget_query.used else 0
        budget_total = float(budget_query.total) if budget_query.total else 1 # avoid div by zero
        budget_percentage = int((budget_used / budget_total) * 100) if budget_total > 1 else 0
        
        # 4. Teamleistung (Completed tasks / Total tasks in active projects)
        total_tasks = db.query(func.count(Task.id)).join(Project).filter(
            Project.owner_id == current_user.id,
            Project.status == ProjectStatus.active_execution
        ).scalar()
        completed_tasks = db.query(func.count(Task.id)).join(Project).filter(
            Project.owner_id == current_user.id,
            Project.status == ProjectStatus.active_execution,
            Task.status == TaskStatus.completed
        ).scalar()
        
        team_performance = int((completed_tasks / total_tasks) * 100) if total_tasks and total_tasks > 0 else 0
        
        stats = {
            "laufende_projekte": active_projects_count,
            "offene_aufgaben": open_tasks_count,
            "budgetverbrauch": f"{budget_percentage}%",
            "teamleistung": f"{team_performance}%"
        }
        
    elif current_user.system_role == "team_member":
        # Team Member Stats
        
        # 1. Meine Aufgaben
        my_open_tasks = db.query(func.count(Task.id)).filter(
            Task.owner_id == current_user.id,
            Task.status != TaskStatus.completed
        ).scalar()
        
        # 2. Zugewiesene Projekte
        my_projects = db.query(func.count(TeamMember.id)).filter(
            TeamMember.user_id == current_user.id
        ).scalar()
        
        # 3. Arbeitsstunden (Dummy for now)
        arbeitsstunden = "32h"
        
        # 4. Erledigt
        completed = db.query(func.count(Task.id)).filter(
            Task.owner_id == current_user.id,
            Task.status == TaskStatus.completed
        ).scalar()
        
        stats = {
            "meine_aufgaben": my_open_tasks,
            "zugewiesene_projekte": my_projects,
            "arbeitsstunden": arbeitsstunden,
            "erledigt": completed
        }
        
    else:
        # Guest / Client
        stats = {
            "projektstatus": "Aktiv",
            "neue_nachrichten": 2,
            "letztes_update": "Gestern",
            "fortschritt": "45%"
        }
        
    return stats


from app.models.domain4_collab import Milestone

@router.get("/projects")
def get_dashboard_projects(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Returns projects with their computed progress and next step."""
    if current_user.system_role == "project_manager":
        projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    elif current_user.system_role == "team_member":
        projects = db.query(Project).join(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    else:
        return []
    
    result = []
    for p in projects:
        # progress
        total = len(p.tasks)
        completed = sum(1 for t in p.tasks if t.status == TaskStatus.completed)
        progress = int((completed / total) * 100) if total > 0 else 0
        
        # next step
        open_tasks = [t for t in p.tasks if t.status != TaskStatus.completed]
        next_step = open_tasks[0].title if open_tasks else "Keine offenen Aufgaben"
        
        # At Risk flag
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        is_at_risk = any((t.current_deadline and t.current_deadline < now) for t in open_tasks)
        
        # map status to UI string
        status_str = "Aktiv"
        if p.status.value == "idea_draft": status_str = "Entwurf"
        elif p.status.value == "completed": status_str = "Abgeschlossen"
        
        role_str = "Owner"
        if current_user.system_role == "team_member":
            tm = next((tm for tm in p.team_members if tm.user_id == current_user.id), None)
            if tm:
                role_str = tm.team_role.value
                
        result.append({
            "id": str(p.id),
            "name": p.name,
            "status": status_str,
            "progress": progress,
            "next_step": next_step,
            "is_at_risk": is_at_risk,
            "role": role_str
        })
    return result

@router.get("/milestones")
def get_dashboard_milestones(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.system_role != "project_manager":
        return []
        
    milestones = db.query(Milestone).join(Project).filter(
        Project.owner_id == current_user.id,
        Milestone.is_completed == False
    ).order_by(Milestone.due_date).limit(5).all()
    
    return [
        {
            "id": str(m.id),
            "title": m.title,
            "due_date": m.due_date.isoformat() if m.due_date else None,
            "project_name": m.project.name
        } for m in milestones
    ]

from app.models.domain4_collab import ActivityLog

@router.get("/activity")
def get_dashboard_activity(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.system_role == "project_manager":
        logs = db.query(ActivityLog).join(Project).filter(
            Project.owner_id == current_user.id
        ).order_by(ActivityLog.created_at.desc()).limit(15).all()
    elif current_user.system_role == "team_member":
        logs = db.query(ActivityLog).join(Project).join(TeamMember, TeamMember.project_id == Project.id).filter(
            TeamMember.user_id == current_user.id
        ).order_by(ActivityLog.created_at.desc()).limit(15).all()
    else:
        return []
    
    result = []
    for log in logs:
        actor_name = "System"
        if log.actor:
            first = getattr(log.actor, "first_name", "") or ""
            last = getattr(log.actor, "last_name", "") or ""
            actor_name = f"{first} {last}".strip() or log.actor.email

        result.append({
            "id": str(log.id),
            "project_name": log.project.name if log.project else "Unbekannt",
            "action": log.action_type,
            "details": log.details,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "actor_name": actor_name
        })
    return result

from app.models.domain4_collab import TaskStatus, Task

@router.get("/upcoming-deadlines")
def get_upcoming_deadlines(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.system_role != "team_member":
        return []
        
    tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.status != TaskStatus.completed,
        Task.current_deadline != None
    ).order_by(Task.current_deadline).limit(4).all()
    
    return [
        {
            "id": str(t.id),
            "title": t.title,
            "due_date": t.current_deadline.isoformat(),
            "project_name": t.project.name if t.project else "Unbekannt"
        } for t in tasks
    ]


@router.get("/tasks")
def get_dashboard_tasks(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.system_role != "team_member":
        return []
        
    tasks = db.query(Task).filter(
        Task.owner_id == current_user.id
    ).order_by(Task.created_at.desc()).all()
    
    return [
        {
            "id": str(t.id),
            "title": t.title,
            "status": t.status.value,
            "priority": t.priority.value if hasattr(t, 'priority') else "normal",
            "due_date": t.current_deadline.isoformat() if t.current_deadline else None,
            "project_name": t.project.name if t.project else "Unbekannt",
            "assignee_avatar": t.owner.avatar_url if hasattr(t.owner, 'avatar_url') else None
        } for t in tasks
    ]
