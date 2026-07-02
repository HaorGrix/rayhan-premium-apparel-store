import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, JSON
from backend.app.core.database import Base, GUID

class ImportLog(Base):
    __tablename__ = "import_logs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    admin_email = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    products_count = Column(Integer, default=0, nullable=False)
    images_count = Column(Integer, default=0, nullable=False)
    success_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    status = Column(String, default="success", nullable=False) # success, failed
    errors = Column(JSON, nullable=True) # Detailed list of row errors
