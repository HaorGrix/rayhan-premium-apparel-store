import os
import sys

# Add backend directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.settings import StoreSettings

print("Creating store_settings table in database...")
Base.metadata.create_all(bind=engine)
print("store_settings table created successfully!")

# Seed default settings if none exists
db = SessionLocal()
try:
    existing = db.query(StoreSettings).first()
    if not existing:
        default_settings = StoreSettings()
        db.add(default_settings)
        db.commit()
        print("Default store settings seeded successfully!")
    else:
        print("Store settings already seeded.")
finally:
    db.close()
