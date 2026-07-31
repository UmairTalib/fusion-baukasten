"""
Seed script: creates 3 verified test accounts — one per role.
Passwords use the app's standard bcrypt hashing. No logic is changed.

Test Accounts:
  pm@test.de         / Test#1234  (project_manager)
  team@test.de       / Test#1234  (team_member)
  client@test.de     / Test#1234  (client)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import User, Organization, Membership
from app.models.domain2_projekte import Project, TeamMember, ProjectStatus, TeamRole
from app.models.domain4_collab import Task, TaskStatus, TaskPriority
from app.core.security import get_password_hash
from app.models.domain1_stammdaten import SystemRole
import uuid

db = SessionLocal()

TEST_PASSWORD = get_password_hash("Test#1234")

accounts = [
    {
        "email": "pm@test.de",
        "first_name": "Max",
        "last_name": "Mustermann",
        "system_role": SystemRole.project_manager,
    },
    {
        "email": "team@test.de",
        "first_name": "Laura",
        "last_name": "Schmidt",
        "system_role": SystemRole.team_member,
    },
    {
        "email": "client@test.de",
        "first_name": "Felix",
        "last_name": "Weber",
        "system_role": SystemRole.client,
    },
]

try:
    for acc in accounts:
        existing = db.query(User).filter(User.email == acc["email"]).first()
        if existing:
            print(f"⚠️  Already exists: {acc['email']} — skipping")
            continue

        user = User(
            id=uuid.uuid4(),
            email=acc["email"],
            first_name=acc["first_name"],
            last_name=acc["last_name"],
            hashed_password=TEST_PASSWORD,
            system_role=acc["system_role"],
            is_verified=True,  # pre-verified so no email step needed
        )
        db.add(user)
        print(f"✅ Created: {acc['email']} ({acc['system_role'].value})")

    db.commit()

    # Get users
    pm_user = db.query(User).filter(User.email == "pm@test.de").first()
    team_user = db.query(User).filter(User.email == "team@test.de").first()
    client_user = db.query(User).filter(User.email == "client@test.de").first()

    # Create Dummy Projects if none exist for pm_user
    if pm_user and not db.query(Project).filter(Project.owner_id == pm_user.id).first():
        p1 = Project(id=uuid.uuid4(), name="Website Relaunch", status=ProjectStatus.active_execution, owner_id=pm_user.id, budget_used=1500, budget_total=5000)
        p2 = Project(id=uuid.uuid4(), name="Marketing Q3", status=ProjectStatus.active_execution, owner_id=pm_user.id, budget_used=4000, budget_total=10000)
        p3 = Project(id=uuid.uuid4(), name="App Development", status=ProjectStatus.idea_draft, owner_id=pm_user.id, budget_used=0, budget_total=20000)
        
        db.add_all([p1, p2, p3])
        db.commit()

        # Add team member to projects
        if team_user:
            tm1 = TeamMember(id=uuid.uuid4(), project_id=p1.id, user_id=team_user.id, team_role=TeamRole.editor)
            tm2 = TeamMember(id=uuid.uuid4(), project_id=p2.id, user_id=team_user.id, team_role=TeamRole.viewer)
            db.add_all([tm1, tm2])

        # Add Tasks
        tasks = [
            Task(id=uuid.uuid4(), project_id=p1.id, owner_id=team_user.id if team_user else pm_user.id, title="Design Mockups", status=TaskStatus.in_progress),
            Task(id=uuid.uuid4(), project_id=p1.id, owner_id=pm_user.id, title="Client Approval", status=TaskStatus.open),
            Task(id=uuid.uuid4(), project_id=p1.id, owner_id=team_user.id if team_user else pm_user.id, title="Setup Repo", status=TaskStatus.completed),
            
            Task(id=uuid.uuid4(), project_id=p2.id, owner_id=team_user.id if team_user else pm_user.id, title="Ad Copy", status=TaskStatus.open),
            Task(id=uuid.uuid4(), project_id=p2.id, owner_id=pm_user.id, title="Budget Review", status=TaskStatus.completed),
        ]
        db.add_all(tasks)
        db.commit()
        print("✅ Created Dummy Projects and Tasks")

    print("\n🎉 Test accounts and dummy data seeded successfully!")
    print("\nLogin credentials:")
    print("  Email: pm@test.de       | Password: Test#1234  → Project Manager")
    print("  Email: team@test.de     | Password: Test#1234  → Team Member")
    print("  Email: client@test.de   | Password: Test#1234  → Client")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
finally:
    db.close()
