from app.db.session import SessionLocal
from app.models.domain1_stammdaten import User, Organization, Membership, SystemRole
from app.models.domain2_projekte import Project, ProjectStatus, TeamMember, TeamRole
from app.models.domain4_collab import Task, TaskStatus, TaskPriority, Milestone, ActivityLog
import sqlalchemy as sa
from datetime import datetime, timedelta, timezone
import uuid
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        # User & Org
        org = db.query(Organization).first()
        if not org:
            org = Organization(id=uuid.uuid4(), name="Test Org")
            db.add(org)
        
        pm_user = db.query(User).filter_by(email="pm@test.de").first()
        hashed_pw = get_password_hash("Test123!")
        
        if not pm_user:
            pm_user = User(
                id=uuid.uuid4(),
                email="pm@test.de",
                first_name="Project",
                last_name="Manager",
                system_role=SystemRole.project_manager,
                hashed_password=hashed_pw,
                is_verified=True
            )
            db.add(pm_user)
            db.add(Membership(user_id=pm_user.id, org_id=org.id, org_role="owner"))
        else:
            pm_user.hashed_password = hashed_pw
            pm_user.is_verified = True
            
        tm_user = db.query(User).filter_by(email="sarah@test.de").first()
        if not tm_user:
            tm_user = User(
                id=uuid.uuid4(),
                email="sarah@test.de",
                first_name="Sarah",
                last_name="Müller",
                system_role=SystemRole.team_member,
                hashed_password=hashed_pw,
                is_verified=True
            )
            db.add(tm_user)
            db.add(Membership(user_id=tm_user.id, org_id=org.id, org_role="member"))
        else:
            tm_user.hashed_password = hashed_pw
            tm_user.is_verified = True
        
        db.commit()

        # Clear existing for fresh start
        db.execute(sa.delete(ActivityLog))
        db.execute(sa.delete(Milestone))
        db.execute(sa.delete(Task))
        db.execute(sa.delete(TeamMember))
        db.execute(sa.delete(Project))
        db.commit()

        now = datetime.now(timezone.utc)

        # 1. Project 1: On Track
        p1 = Project(
            id=uuid.uuid4(),
            owner_id=pm_user.id,
            org_id=org.id,
            name="Stadtplanung Workshop 2026",
            status=ProjectStatus.active_execution
        )
        
        # 2. Project 2: At Risk (Overdue task)
        p2 = Project(
            id=uuid.uuid4(),
            owner_id=pm_user.id,
            org_id=org.id,
            name="Klimakonzept Siegen",
            status=ProjectStatus.active_execution
        )

        db.add_all([p1, p2])
        db.commit()
        
        # Add Team Member to projects
        tm1 = TeamMember(id=uuid.uuid4(), project_id=p1.id, user_id=tm_user.id, team_role=TeamRole.editor)
        tm2 = TeamMember(id=uuid.uuid4(), project_id=p2.id, user_id=tm_user.id, team_role=TeamRole.viewer)
        db.add_all([tm1, tm2])

        # Tasks for P1 (On Track: due in future)
        t1 = Task(id=uuid.uuid4(), project_id=p1.id, owner_id=tm_user.id, title="Agenda erstellen", status=TaskStatus.open, priority=TaskPriority.high, current_deadline=now + timedelta(days=5))
        t2 = Task(id=uuid.uuid4(), project_id=p1.id, owner_id=tm_user.id, title="Location buchen", status=TaskStatus.completed, priority=TaskPriority.low, current_deadline=now - timedelta(days=2))

        # Tasks for P2 (At Risk: due in past, not completed)
        t3 = Task(id=uuid.uuid4(), project_id=p2.id, owner_id=tm_user.id, title="Budgetfreigabe", status=TaskStatus.open, priority=TaskPriority.high, current_deadline=now - timedelta(days=1))
        
        db.add_all([t1, t2, t3])

        # Milestones
        m1 = Milestone(id=uuid.uuid4(), project_id=p1.id, title="Kickoff", due_date=now + timedelta(days=10))
        db.add(m1)

        # Activity Logs
        a1 = ActivityLog(project_id=p1.id, actor_id=pm_user.id, action_type="project_created", details="Projekt wurde angelegt")
        a2 = ActivityLog(project_id=p1.id, actor_id=tm_user.id, action_type="task_completed", details="Location buchen abgeschlossen", created_at=now - timedelta(hours=2))
        a3 = ActivityLog(project_id=p2.id, actor_id=tm_user.id, action_type="message_sent", details="Nachricht im Chat gesendet", created_at=now - timedelta(minutes=15))

        db.add_all([a1, a2, a3])
        db.commit()
        
        print("Seeded successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
