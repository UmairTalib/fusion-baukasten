import sys
import os
import uuid
from datetime import datetime, timedelta

# Add backend dir to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.domain1_stammdaten import User
from app.models.domain2_projekte import Project, ProjectStatus
from app.models.domain4_collab import Task, TaskStatus, Milestone

db = SessionLocal()

pm = db.query(User).filter(User.email == "pm@test.de").first()
if not pm:
    print("PM user not found.")
    sys.exit(1)

# Clean up old data for PM
for m in db.query(Milestone).join(Project).filter(Project.owner_id == pm.id).all():
    db.delete(m)
for t in db.query(Task).join(Project).filter(Project.owner_id == pm.id).all():
    db.delete(t)
for p in db.query(Project).filter(Project.owner_id == pm.id).all():
    db.delete(p)
db.commit()

print("Seeding new project for PM Dashboard...")
project1 = Project(
    id=uuid.uuid4(),
    name="Nachhaltigkeits-Workshop",
    owner_id=pm.id,
    status=ProjectStatus.active_execution
)
db.add(project1)

project2 = Project(
    id=uuid.uuid4(),
    name="Produktlaunch",
    owner_id=pm.id,
    status=ProjectStatus.active_execution
)
db.add(project2)
db.commit()

# Add tasks for Project 1 (75% complete -> 3 done, 1 open)
tasks1 = [
    Task(project_id=project1.id, title="Agenda setzen", status=TaskStatus.completed, owner_id=pm.id),
    Task(project_id=project1.id, title="Raum buchen", status=TaskStatus.completed, owner_id=pm.id),
    Task(project_id=project1.id, title="Teilnehmer einladen", status=TaskStatus.completed, owner_id=pm.id),
    Task(project_id=project1.id, title="Materialien prüfen", status=TaskStatus.open, owner_id=pm.id)
]
db.add_all(tasks1)

# Add tasks for Project 2 (40% complete -> 2 done, 3 open)
tasks2 = [
    Task(project_id=project2.id, title="Konzept erstellen", status=TaskStatus.completed, owner_id=pm.id),
    Task(project_id=project2.id, title="Budget freigeben", status=TaskStatus.completed, owner_id=pm.id),
    Task(project_id=project2.id, title="Marketing-Plan abstimmen", status=TaskStatus.open, owner_id=pm.id),
    Task(project_id=project2.id, title="Materialien drucken", status=TaskStatus.open, owner_id=pm.id),
    Task(project_id=project2.id, title="Pressemitteilung schreiben", status=TaskStatus.open, owner_id=pm.id)
]
db.add_all(tasks2)
db.commit()

# Add Milestones
m1 = Milestone(project_id=project1.id, title="Kickoff", due_date=datetime.now() + timedelta(days=2))
m2 = Milestone(project_id=project2.id, title="Agenda-Finalisierung", due_date=datetime.now() + timedelta(days=5))
m3 = Milestone(project_id=project2.id, title="Stakeholder-Meeting", due_date=datetime.now() + timedelta(days=7))
db.add_all([m1, m2, m3])
db.commit()

print("Seed complete.")
