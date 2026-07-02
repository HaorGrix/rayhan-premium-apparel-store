import os
from typing import Optional
from pydantic import EmailStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Premium Fashion eCommerce API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str
    
    # Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Storage (Cloudflare R2)
    R2_BUCKET_NAME: str = "fashion-apparel-assets"
    R2_ACCESS_KEY_ID: str = "mock_access_key"
    R2_SECRET_ACCESS_KEY: str = "mock_secret_key"
    R2_ENDPOINT_URL: str = "https://mock.r2.cloudflarestorage.com"
    
    # Mail
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: str = "mock_user"
    SMTP_PASSWORD: str = "mock_password"
    SMTP_FROM_EMAIL: str = "noreply@premiumfashion.com"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
