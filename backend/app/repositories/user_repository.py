from typing import Optional, List
from sqlalchemy.orm import Session
from backend.app.models.user import User, UserAddress
from backend.app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Fetch user by unique email address."""
        return db.query(User).filter(User.email == email.strip().lower()).first()

class UserAddressRepository(BaseRepository[UserAddress]):
    def __init__(self):
        super().__init__(UserAddress)

    def get_user_addresses(self, db: Session, user_id: str) -> List[UserAddress]:
        """Retrieve all shipping/billing addresses for a specific user."""
        return db.query(UserAddress).filter(UserAddress.user_id == user_id).all()

    def get_default_address(self, db: Session, user_id: str, address_type: str) -> Optional[UserAddress]:
        """Fetch primary default address of billing/shipping type for a user."""
        return db.query(UserAddress).filter(
            UserAddress.user_id == user_id,
            UserAddress.type == address_type,
            UserAddress.is_default == True
        ).first()

    def clear_defaults(self, db: Session, user_id: str, address_type: str):
        """Set is_default = False for all addresses of a specific type owned by a user."""
        db.query(UserAddress).filter(
            UserAddress.user_id == user_id,
            UserAddress.type == address_type
        ).update({"is_default": False})
        db.commit()
