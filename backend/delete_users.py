from app.db.session import SessionLocal
import sqlalchemy as sa

db = SessionLocal()
try:
    db.execute(sa.text("TRUNCATE TABLE organizations, users CASCADE;"))
    db.commit()
    print("All users, memberships, organizations, and dependent records deleted successfully.")
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
