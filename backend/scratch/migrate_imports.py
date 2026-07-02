import os
import sys

# Add backend directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.app.core.database import Base, engine

print("Creating import_logs table in database...")
Base.metadata.create_all(bind=engine)
print("import_logs table created successfully!")
