import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    first_name: str
    last_name: str
    role: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
