import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base, GUID

class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="customer")  # customer, admin, manager, support, warehouse
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # billing, shipping
    address_line1 = Column(String, nullable=False)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="addresses")
