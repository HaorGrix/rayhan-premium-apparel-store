from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from backend.app.services.auth_service import auth_service
from backend.app.api.deps import get_current_user
from backend.app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new customer account.
    """
    return auth_service.register_user(db, user_in.model_dump())

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password to receive JWT credentials.
    """
    return auth_service.authenticate_user(db, login_in.email, login_in.password)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve profile details of the currently logged-in user.
    """
    return current_user
