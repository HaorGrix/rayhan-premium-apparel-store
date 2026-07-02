import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Integer, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base, GUID

class Cart(Base):
    __tablename__ = "carts"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String, unique=True, index=True, nullable=True)  # for guest users
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    cart_id = Column(GUID, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(GUID, ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    variant = relationship("ProductVariant", back_populates="cart_items")

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_type = Column(String, nullable=False)  # percentage, fixed
    discount_value = Column(Numeric(10, 2), nullable=False)
    min_order_value = Column(Numeric(10, 2), default=0.00, nullable=False)
    start_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    max_uses = Column(Integer, default=100, nullable=False)
    uses_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class Order(Base):
    __tablename__ = "orders"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # nullable for guest checkout
    status = Column(String, nullable=False, default="pending")  # pending, paid, processing, packed, shipped, delivered, cancelled, returned, refunded
    
    total_amount = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    shipping_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    grand_total = Column(Numeric(10, 2), nullable=False)
    
    shipping_address = Column(JSON, nullable=False)  # Snapshot of shipping details
    billing_address = Column(JSON, nullable=False)   # Snapshot of billing details
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(GUID, ForeignKey("product_variants.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    discount_applied = Column(Numeric(10, 2), default=0.00, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant", back_populates="order_items")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(String, unique=True, index=True, nullable=True)
    provider = Column(String, nullable=False)  # stripe, sslcommerz, bkash, nagad
    method = Column(String, nullable=False)    # card, mobile_banking, cash
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, authorized, captured, failed, cancelled, refunded
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    order = relationship("Order", back_populates="payments")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    order_id = Column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String, nullable=False)  # pathao, paperfly, redx, steadfast
    tracking_number = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending, picked_up, in_transit, out_for_delivery, delivered, failed
    
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="shipments")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(GUID, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    title = Column(String, nullable=True)
    content = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
