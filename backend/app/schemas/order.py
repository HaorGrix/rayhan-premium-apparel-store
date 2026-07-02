import uuid
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime

class CartItemAdd(BaseModel):
    variant_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")

class CartItemResponse(BaseModel):
    id: uuid.UUID
    variant_id: uuid.UUID
    quantity: int
    price: Optional[Decimal] = None
    sku: Optional[str] = None
    name: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    material: Optional[str] = None

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    session_id: Optional[str] = None
    items: List[CartItemResponse] = []

    class Config:
        from_attributes = True

class CheckoutRequest(BaseModel):
    session_id: Optional[str] = None  # required for guest checkout
    coupon_code: Optional[str] = None
    shipping_address: Dict[str, Any]
    billing_address: Dict[str, Any]
    payment_provider: str  # stripe, sslcommerz, bkash, nagad
    payment_method: str    # card, mobile_banking, cash

class OrderItemResponse(BaseModel):
    id: uuid.UUID
    variant_id: uuid.UUID
    sku: Optional[str] = None
    name: Optional[str] = None
    quantity: int
    unit_price: Decimal
    discount_applied: Decimal

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: uuid.UUID
    provider: str
    method: str
    amount: Decimal
    status: str
    transaction_id: Optional[str] = None

    class Config:
        from_attributes = True

class ShipmentResponse(BaseModel):
    id: uuid.UUID
    provider: str
    tracking_number: Optional[str] = None
    status: str
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    status: str
    total_amount: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    grand_total: Decimal
    shipping_address: Dict[str, Any]
    billing_address: Dict[str, Any]
    created_at: datetime
    items: List[OrderItemResponse] = []
    payments: List[PaymentResponse] = []
    shipments: List[ShipmentResponse] = []

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(..., ge=1, le=5, description="Rating must be between 1 and 5")
    title: Optional[str] = None
    content: Optional[str] = None

class ReviewResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: uuid.UUID
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    status: str
    is_verified_purchase: bool
    created_at: datetime

    class Config:
        from_attributes = True
