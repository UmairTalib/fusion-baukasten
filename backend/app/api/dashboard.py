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
        
        # 4. Teamleistung (Completed tasks / Total tasks)
        total_tasks = db.query(func.count(Task.id)).join(Project).filter(
            Project.owner_id == current_user.id
        ).scalar()
        completed_tasks = db.query(func.count(Task.id)).join(Project).filter(
            Project.owner_id == current_user.id,
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
