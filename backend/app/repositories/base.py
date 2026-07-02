from typing import Generic, TypeVar, Type, List, Optional, Any
from sqlalchemy.orm import Session
from backend.app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Fetch a model by its primary key ID."""
        return db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Fetch list of models with pagination offsets."""
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: Any) -> ModelType:
        """Create and save a new record."""
        db.add(obj_in)
        db.commit()
        db.refresh(obj_in)
        return obj_in

    def update(self, db: Session, db_obj: ModelType, obj_in: dict) -> ModelType:
        """Update fields of an existing model instance."""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, id: Any) -> Optional[ModelType]:
        """Remove a record by its ID."""
        obj = db.query(self.model).filter(self.model.id == id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj
