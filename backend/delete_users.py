from app.db.session import SessionLocal
from app.models.domain1_stammdaten import User
from app.models.domain1_stammdaten import Organization
from app.models.domain1_stammdaten import Membership
import sqlalchemy as sa

db = SessionLocal()

# We need to delete memberships first to avoid foreign key constraint violations
db.execute(sa.delete(Membership))
db.execute(sa.delete(User))
db.execute(sa.delete(Organization))

db.commit()
print("All users, memberships, and organizations deleted successfully.")
db.close()
