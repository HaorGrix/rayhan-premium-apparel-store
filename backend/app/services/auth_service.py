from datetime import timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.repositories.user_repository import UserRepository
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.core.exceptions import AuthenticationException, ValidationException

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    def register_user(self, db: Session, user_data: Dict[str, Any]) -> User:
        """Register a new customer account, performing email checks and password hashing."""
        email = user_data.get("email", "").strip().lower()
        if self.user_repo.get_by_email(db, email):
            raise ValidationException("Email address already registered")
        
        # Hash password and create user model
        hashed = hash_password(user_data["password"])
        new_user = User(
            email=email,
            password_hash=hashed,
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            role=user_data.get("role", "customer"),
            is_verified=False
        )
        return self.user_repo.create(db, new_user)

    def authenticate_user(self, db: Session, email: str, password: str) -> Dict[str, Any]:
        """Authenticate email/password credentials and return user JWT details."""
        user = self.user_repo.get_by_email(db, email)
        if not user:
            raise AuthenticationException("Invalid email or password")
            
        if not verify_password(password, user.password_hash):
            raise AuthenticationException("Invalid email or password")

        # Generate JWT session claims
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
        token = create_access_token(token_data)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role
            }
        }

    def verify_user_role(self, user: User, allowed_roles: list) -> bool:
        """Helper function to assert role privilege bounds."""
        if user.role not in allowed_roles:
            return False
        return True
auth_service = AuthService()
