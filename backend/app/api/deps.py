from typing import Generator, List
from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.exceptions import AuthenticationException, AuthorizationException
from backend.app.models.user import User
from backend.app.repositories.user_repository import UserRepository

# OAuth2 scheme config (JWT from Header)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False  # Allow us to throw custom exceptions rather than standard 401
)

user_repo = UserRepository()

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """Dependency to validate JWT token and return the current user."""
    if not token:
        raise AuthenticationException("Not authenticated")
        
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationException("Invalid authentication credentials")
    except jwt.PyJWTError:
        raise AuthenticationException("Could not validate authentication credentials")
        
    user = user_repo.get(db, user_id)
    if not user:
        raise AuthenticationException("User not found")
        
    return user
    
def get_current_user_optional(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> Optional[User]:
    """Dependency to validate JWT token and return the current user if present, otherwise None."""
    if not token:
        return None
        
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            return None
    except jwt.PyJWTError:
        return None
        
    return user_repo.get(db, user_id)

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """Dependency asserting current user role matches allowed roles."""
        if current_user.role not in self.allowed_roles:
            raise AuthorizationException(
                f"Role '{current_user.role}' does not have sufficient permissions."
            )
        return current_user
