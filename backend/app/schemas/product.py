import uuid
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime

class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class BrandResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True

class CollectionResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductImageResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    sort_order: int
    variant_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class ProductVariantResponse(BaseModel):
    id: uuid.UUID
    sku: str
    color: str
    size: str
    stock: int
    price_override: Optional[Decimal] = None

class UserMinimalResponse(BaseModel):
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class ProductMinimalResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    price: Decimal
    discount_price: Optional[Decimal] = None

    class Config:
        from_attributes = True

class ProductCustomerImageResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    image_url: str
    caption: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserMinimalResponse] = None
    product: Optional[ProductMinimalResponse] = None

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    short_description: Optional[str] = None
    price: Decimal
    discount_price: Optional[Decimal] = None
    is_active: bool
    specifications: Optional[Dict[str, Any]] = None
    seo_metadata: Optional[Dict[str, Any]] = None
    related_product_ids: Optional[List[str]] = None
    brand: Optional[BrandResponse] = None
    category: Optional[CategoryResponse] = None
    collection: Optional[CollectionResponse] = None
    collections: List[CollectionResponse] = []
    images: List[ProductImageResponse] = []
    variants: List[ProductVariantResponse] = []
    customer_images: List[ProductCustomerImageResponse] = []
    average_rating: Optional[float] = 0.0
    reviews_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    skip: int
    limit: int

class CampaignCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    desktop_banner_url: str
    mobile_banner_url: str
    collection_id: Optional[uuid.UUID] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    priority: Optional[int] = 0
    is_active: Optional[bool] = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    badge: Optional[str] = None
    promotional_copy: Optional[str] = None

class CampaignResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    desktop_banner_url: str
    mobile_banner_url: str
    collection_id: Optional[uuid.UUID] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    priority: int
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    badge: Optional[str] = None
    promotional_copy: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    collection: Optional[CollectionResponse] = None
    products: List[ProductResponse] = []

    class Config:
        from_attributes = True

class ProductCustomerImageCreate(BaseModel):
    product_id: uuid.UUID
    image_url: str
    caption: Optional[str] = None
