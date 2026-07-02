from fastapi import APIRouter, Depends, Query, Path, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from backend.app.core.database import get_db
from backend.app.schemas.product import (
    ProductResponse, 
    ProductListResponse, 
    CategoryResponse, 
    BrandResponse, 
    CollectionResponse,
    CampaignResponse,
    ProductCustomerImageResponse
)
from backend.app.repositories.product_repository import (
    ProductRepository, 
    CategoryRepository, 
    BrandRepository, 
    CollectionRepository
)
from backend.app.models.product import Campaign, ProductCustomerImage, Product
from backend.app.core.exceptions import ResourceNotFoundException

router = APIRouter()

product_repo = ProductRepository()
category_repo = CategoryRepository()
brand_repo = BrandRepository()
collection_repo = CollectionRepository()

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Fetch list of all catalog categories."""
    return category_repo.get_all(db)

@router.get("/brands", response_model=List[BrandResponse])
def get_brands(db: Session = Depends(get_db)):
    """Fetch list of all catalog brands."""
    return brand_repo.get_all(db)

@router.get("/collections", response_model=List[CollectionResponse])
def get_collections(db: Session = Depends(get_db)):
    """Fetch list of all campaign/collections."""
    return collection_repo.get_all(db)

@router.get("/campaigns/active", response_model=List[CampaignResponse])
def get_active_campaigns(db: Session = Depends(get_db)):
    """Fetch list of all active hero campaigns ordered by priority."""
    return db.query(Campaign).filter(Campaign.is_active == True).order_by(Campaign.priority.desc()).all()

@router.get("/campaigns/{slug}", response_model=CampaignResponse)
def get_campaign_by_slug(slug: str, db: Session = Depends(get_db)):
    """Fetch campaign details by slug."""
    campaign = db.query(Campaign).filter(Campaign.slug == slug, Campaign.is_active == True).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.get("/gallery/approved", response_model=List[ProductCustomerImageResponse])
def get_approved_gallery(db: Session = Depends(get_db)):
    """Fetch approved customer lookbook images."""
    return db.query(ProductCustomerImage).filter(ProductCustomerImage.status == "approved").order_by(ProductCustomerImage.created_at.desc()).all()

@router.get("/products", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search keyword in name/description"),
    category_id: Optional[str] = Query(None, description="Category filter"),
    brand_id: Optional[str] = Query(None, description="Brand filter"),
    collection_id: Optional[str] = Query(None, description="Collection filter"),
    min_price: Optional[float] = Query(None, description="Minimum price bound"),
    max_price: Optional[float] = Query(None, description="Maximum price bound"),
    colors: Optional[List[str]] = Query(None, description="Color variant filters"),
    sizes: Optional[List[str]] = Query(None, description="Size variant filters"),
    on_sale: Optional[bool] = Query(None, description="On sale filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100)
):
    """
    Search and filter products catalog with parameters.
    """
    products, total = product_repo.query_catalog(
        db,
        search=search,
        category_id=category_id,
        brand_id=brand_id,
        collection_id=collection_id,
        min_price=min_price,
        max_price=max_price,
        colors=colors,
        sizes=sizes,
        on_sale=on_sale,
        skip=skip,
        limit=limit
    )
    return {
        "products": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/products/{id_or_slug}", response_model=ProductResponse)
def get_product(
    id_or_slug: str = Path(..., description="The ID or slug of the product"),
    db: Session = Depends(get_db)
):
    """
    Retrieve product catalog details by its UUID or unique slug identifier.
    """
    product = None
    try:
        product = product_repo.get_with_relations(db, id_or_slug)
    except Exception:
        pass
        
    if not product:
        product = product_repo.get_by_slug(db, id_or_slug)
        
    if not product:
        raise ResourceNotFoundException("Product", id_or_slug)
        
    return product

@router.get("/products/{id_or_slug}/related", response_model=List[ProductResponse])
def get_related_products(id_or_slug: str = Path(...), db: Session = Depends(get_db)):
    """Fetch related products for a product."""
    product = None
    try:
        product = product_repo.get_with_relations(db, id_or_slug)
    except Exception:
        pass
    if not product:
        product = product_repo.get_by_slug(db, id_or_slug)
    if not product:
        raise ResourceNotFoundException("Product", id_or_slug)
        
    related_ids = product.related_product_ids or []
    if not related_ids:
        # Fallback to products from the same category
        return db.query(Product).filter(
            Product.category_id == product.category_id,
            Product.id != product.id,
            Product.deleted_at == None
        ).limit(4).all()
        
    uids = []
    for rid in related_ids:
        try:
            uids.append(uuid.UUID(rid))
        except ValueError:
            pass
            
    if not uids:
        return []
        
    return db.query(Product).filter(
        Product.id.in_(uids),
        Product.deleted_at == None
    ).options(
        joinedload(Product.images),
        joinedload(Product.brand),
        joinedload(Product.category)
    ).all()
