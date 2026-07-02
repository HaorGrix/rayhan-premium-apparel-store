import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from backend.app.core.database import Base, GUID

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    context = Column(JSON, nullable=True)  # Contextual details about the action
    request_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
