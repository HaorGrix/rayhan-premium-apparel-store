from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog
from backend.app.repositories.base import BaseRepository

class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self):
        super().__init__(AuditLog)

    def log(
        self, 
        db: Session, 
        *, 
        user_id: str = None, 
        action: str, 
        context: dict = None, 
        request_id: str = None, 
        ip_address: str = None
    ) -> AuditLog:
        """Create and write an audit log entry in a separate transaction block if needed."""
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            context=context,
            request_id=request_id,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
