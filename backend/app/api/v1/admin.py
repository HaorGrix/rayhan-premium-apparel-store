from fastapi import APIRouter, Depends, Query, status, Body, File, UploadFile, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from decimal import Decimal
import uuid
import time
from datetime import datetime, timezone

from backend.app.core.database import get_db
from backend.app.schemas.product import (
    ProductResponse, 
    ProductVariantResponse, 
    CampaignResponse, 
    ProductCustomerImageResponse
)
from backend.app.schemas.order import OrderResponse, ReviewResponse
from backend.app.repositories.product_repository import ProductRepository, ProductVariantRepository
from backend.app.repositories.order_repository import OrderRepository, ReviewRepository
from backend.app.repositories.audit_repository import AuditLogRepository
from backend.app.models import User, Category, Brand, Collection, Product, ProductVariant, ProductImage, Coupon, Review, Order, OrderItem, AuditLog, StoreSettings
from backend.app.models.product import Campaign, ProductCustomerImage
from backend.app.api.deps import RoleChecker, get_current_user
from backend.app.core.exceptions import ResourceNotFoundException, ValidationException

router = APIRouter(dependencies=[Depends(RoleChecker(["admin", "manager"]))])

product_repo = ProductRepository()
variant_repo = ProductVariantRepository()
order_repo = OrderRepository()
review_repo = ReviewRepository()
audit_repo = AuditLogRepository()

# Store settings in-memory mock since they don't warrant a table
STORE_SETTINGS = {
    "store_name": "Atelier Premium Fashion",
    "contact_email": "hello@atelierpremium.com",
    "currency": "USD",
    "tax_rate": 0.08,
    "free_shipping_threshold": 150.00,
    "payment_gateways": {"stripe": True, "paypal": False, "cod": True}
}

# --- MODULE 1: DASHBOARD & METRICS ---
@router.get("/dashboard/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Fetch aggregated administrative statistics."""
    sales = db.query(Order).filter(Order.status != "cancelled").all()
    total_revenue = float(sum(order.grand_total for order in sales))
    total_orders = len(sales)
    total_customers = db.query(User).filter(User.role == "customer").count()
    
    # Low stock alerts (variants with stock < 5)
    low_stock = db.query(ProductVariant).filter(ProductVariant.stock < 5).all()
    low_stock_alerts = [
        {
            "variant_id": str(v.id),
            "sku": v.sku,
            "product_name": v.product.name,
            "color": v.color,
            "size": v.size,
            "stock": v.stock
        }
        for v in low_stock
    ]
    
    pending_reviews_count = db.query(Review).filter(Review.status == "pending").count()
    pending_gallery_count = db.query(ProductCustomerImage).filter(ProductCustomerImage.status == "pending").count()
    
    return {
        "metrics": {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_customers": total_customers,
            "pending_reviews": pending_reviews_count,
            "pending_gallery_images": pending_gallery_count
        },
        "low_stock_alerts": low_stock_alerts[:15]
    }


# --- MODULE 2: PRODUCTS ---
@router.get("/products", response_model=List[ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    """Fetch all products (active and inactive, excluding deleted ones) with relationships."""
    return db.query(Product).filter(Product.deleted_at == None).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.collection),
        joinedload(Product.images),
        joinedload(Product.variants)
    ).all()

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    name: str = Body(...),
    slug: str = Body(...),
    description: str = Body(...),
    price: float = Body(...),
    brand_id: str = Body(...),
    category_id: str = Body(...),
    short_description: Optional[str] = Body(None),
    collection_ids: Optional[List[str]] = Body(None),
    specifications: Optional[Dict[str, Any]] = Body(None),
    seo_metadata: Optional[Dict[str, Any]] = Body(None),
    related_product_ids: Optional[List[str]] = Body(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    """Create a new product entry in the catalog."""
    if product_repo.get_by_slug(db, slug):
        raise ValidationException("Product slug already exists")
        
    product = Product(
        name=name,
        slug=slug,
        description=description,
        short_description=short_description,
        price=Decimal(str(price)),
        brand_id=uuid.UUID(brand_id),
        category_id=uuid.UUID(category_id),
        specifications=specifications,
        seo_metadata=seo_metadata,
        related_product_ids=related_product_ids or [],
        is_active=True
    )
    
    if collection_ids:
        collections_db = db.query(Collection).filter(Collection.id.in_([uuid.UUID(cid) for cid in collection_ids])).all()
        product.collections = collections_db
        
    product_repo.create(db, product)
    audit_repo.log(db, user_id=admin_user.id, action="create_product", context={"product_id": str(product.id), "slug": slug})
    return product
@router.patch("/products/{id}", response_model=ProductResponse)
def update_product(
    id: str,
    name: Optional[str] = Body(None),
    slug: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    short_description: Optional[str] = Body(None),
    price: Optional[float] = Body(None),
    discount_price: Optional[float] = Body(None),
    brand_id: Optional[str] = Body(None),
    category_id: Optional[str] = Body(None),
    collection_ids: Optional[List[str]] = Body(None),
    is_active: Optional[bool] = Body(None),
    specifications: Optional[Dict[str, Any]] = Body(None),
    seo_metadata: Optional[Dict[str, Any]] = Body(None),
    related_product_ids: Optional[List[str]] = Body(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    """Update general fields on a product."""
    product = db.query(Product).filter(Product.id == uuid.UUID(id)).first()
    if not product:
        raise ResourceNotFoundException("Product", id)
        
    if name is not None: product.name = name
    if slug is not None: product.slug = slug
    if description is not None: product.description = description
    if short_description is not None: product.short_description = short_description
    if price is not None: product.price = Decimal(str(price))
    if discount_price is not None: product.discount_price = Decimal(str(discount_price)) if discount_price >= 0 else None
    if brand_id is not None: product.brand_id = uuid.UUID(brand_id)
    if category_id is not None: product.category_id = uuid.UUID(category_id)
    
    if collection_ids is not None:
        collections_db = db.query(Collection).filter(Collection.id.in_([uuid.UUID(cid) for cid in collection_ids])).all()
        product.collections = collections_db
        
    if is_active is not None: product.is_active = is_active
    if specifications is not None: product.specifications = specifications
    if seo_metadata is not None: product.seo_metadata = seo_metadata
    if related_product_ids is not None: product.related_product_ids = related_product_ids
    
    db.commit()
    db.refresh(product)
    audit_repo.log(db, user_id=admin_user.id, action="update_product", context={"product_id": id})
    return product

@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: str, db: Session = Depends(get_db), admin_user: User = Depends(get_current_user)):
    """Soft delete product by setting deleted_at."""
    product = db.query(Product).filter(Product.id == uuid.UUID(id)).first()
    if not product:
        raise ResourceNotFoundException("Product", id)
    product.deleted_at = datetime.now(timezone.utc)
    db.commit()
    audit_repo.log(db, user_id=admin_user.id, action="delete_product", context={"product_id": id})
    return {}


# --- MODULE 3: CATEGORIES ---
@router.post("/categories")
def create_category(name: str = Body(...), slug: str = Body(...), description: Optional[str] = Body(None), parent_id: Optional[str] = Body(None), db: Session = Depends(get_db)):
    cat = Category(name=name, slug=slug, description=description, parent_id=uuid.UUID(parent_id) if parent_id else None)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.patch("/categories/{id}")
def update_category(id: str, name: Optional[str] = Body(None), slug: Optional[str] = Body(None), description: Optional[str] = Body(None), parent_id: Optional[str] = Body(None), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == uuid.UUID(id)).first()
    if not cat: raise ResourceNotFoundException("Category", id)
    if name is not None: cat.name = name
    if slug is not None: cat.slug = slug
    if description is not None: cat.description = description
    if parent_id is not None: cat.parent_id = uuid.UUID(parent_id) if parent_id else None
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{id}")
def delete_category(id: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == uuid.UUID(id)).first()
    if not cat: raise ResourceNotFoundException("Category", id)
    db.delete(cat)
    db.commit()
    return {"status": "success"}


# --- MODULE 4: BRANDS ---
@router.post("/brands")
def create_brand(name: str = Body(...), slug: str = Body(...), description: Optional[str] = Body(None), logo_url: Optional[str] = Body(None), db: Session = Depends(get_db)):
    brand = Brand(name=name, slug=slug, description=description, logo_url=logo_url)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand

@router.patch("/brands/{id}")
def update_brand(id: str, name: Optional[str] = Body(None), slug: Optional[str] = Body(None), description: Optional[str] = Body(None), logo_url: Optional[str] = Body(None), db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == uuid.UUID(id)).first()
    if not brand: raise ResourceNotFoundException("Brand", id)
    if name is not None: brand.name = name
    if slug is not None: brand.slug = slug
    if description is not None: brand.description = description
    if logo_url is not None: brand.logo_url = logo_url
    db.commit()
    db.refresh(brand)
    return brand

@router.delete("/brands/{id}")
def delete_brand(id: str, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == uuid.UUID(id)).first()
    if not brand: raise ResourceNotFoundException("Brand", id)
    db.delete(brand)
    db.commit()
    return {"status": "success"}


# --- MODULE 5: COLLECTIONS ---
@router.post("/collections")
def create_collection(name: str = Body(...), slug: str = Body(...), description: Optional[str] = Body(None), image_url: Optional[str] = Body(None), start_date: Optional[str] = Body(None), end_date: Optional[str] = Body(None), db: Session = Depends(get_db)):
    col = Collection(
        name=name,
        slug=slug,
        description=description,
        image_url=image_url,
        start_date=datetime.fromisoformat(start_date) if start_date else None,
        end_date=datetime.fromisoformat(end_date) if end_date else None
    )
    db.add(col)
    db.commit()
    db.refresh(col)
    return col

@router.patch("/collections/{id}")
def update_collection(id: str, name: Optional[str] = Body(None), slug: Optional[str] = Body(None), description: Optional[str] = Body(None), image_url: Optional[str] = Body(None), start_date: Optional[str] = Body(None), end_date: Optional[str] = Body(None), db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == uuid.UUID(id)).first()
    if not col: raise ResourceNotFoundException("Collection", id)
    if name is not None: col.name = name
    if slug is not None: col.slug = slug
    if description is not None: col.description = description
    if image_url is not None: col.image_url = image_url
    if start_date is not None: col.start_date = datetime.fromisoformat(start_date) if start_date else None
    if end_date is not None: col.end_date = datetime.fromisoformat(end_date) if end_date else None
    db.commit()
    db.refresh(col)
    return col

@router.delete("/collections/{id}")
def delete_collection(id: str, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == uuid.UUID(id)).first()
    if not col: raise ResourceNotFoundException("Collection", id)
    db.delete(col)
    db.commit()
    return {"status": "success"}


# --- MODULE 6: CAMPAIGNS ---
@router.get("/campaigns", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    """List all campaigns (active and inactive) ordered by priority."""
    return db.query(Campaign).order_by(Campaign.priority.desc()).all()

@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    name: str = Body(...),
    slug: str = Body(...),
    description: Optional[str] = Body(None),
    desktop_banner_url: str = Body(...),
    mobile_banner_url: str = Body(...),
    collection_id: Optional[str] = Body(None),
    cta_text: Optional[str] = Body(None),
    cta_link: Optional[str] = Body(None),
    priority: int = Body(0),
    is_active: bool = Body(True),
    badge: Optional[str] = Body(None),
    promotional_copy: Optional[str] = Body(None),
    start_date: Optional[str] = Body(None),
    end_date: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    campaign = Campaign(
        name=name,
        slug=slug,
        description=description,
        desktop_banner_url=desktop_banner_url,
        mobile_banner_url=mobile_banner_url,
        collection_id=uuid.UUID(collection_id) if collection_id else None,
        cta_text=cta_text,
        cta_link=cta_link,
        priority=priority,
        is_active=is_active,
        badge=badge,
        promotional_copy=promotional_copy,
        start_date=datetime.fromisoformat(start_date) if start_date else None,
        end_date=datetime.fromisoformat(end_date) if end_date else None
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.patch("/campaigns/{id}", response_model=CampaignResponse)
def update_campaign(
    id: str,
    name: Optional[str] = Body(None),
    slug: Optional[str] = Body(None),
    description: Optional[str] = Body(None),
    desktop_banner_url: Optional[str] = Body(None),
    mobile_banner_url: Optional[str] = Body(None),
    collection_id: Optional[str] = Body(None),
    cta_text: Optional[str] = Body(None),
    cta_link: Optional[str] = Body(None),
    priority: Optional[int] = Body(None),
    is_active: Optional[bool] = Body(None),
    badge: Optional[str] = Body(None),
    promotional_copy: Optional[str] = Body(None),
    start_date: Optional[str] = Body(None),
    end_date: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == uuid.UUID(id)).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", id)
        
    if name is not None: campaign.name = name
    if slug is not None: campaign.slug = slug
    if description is not None: campaign.description = description
    if desktop_banner_url is not None: campaign.desktop_banner_url = desktop_banner_url
    if mobile_banner_url is not None: campaign.mobile_banner_url = mobile_banner_url
    if collection_id is not None: campaign.collection_id = uuid.UUID(collection_id) if collection_id else None
    if cta_text is not None: campaign.cta_text = cta_text
    if cta_link is not None: campaign.cta_link = cta_link
    if priority is not None: campaign.priority = priority
    if is_active is not None: campaign.is_active = is_active
    if badge is not None: campaign.badge = badge
    if promotional_copy is not None: campaign.promotional_copy = promotional_copy
    if start_date is not None: campaign.start_date = datetime.fromisoformat(start_date) if start_date else None
    if end_date is not None: campaign.end_date = datetime.fromisoformat(end_date) if end_date else None
    
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/campaigns/{id}")
def delete_campaign(id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == uuid.UUID(id)).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", id)
    db.delete(campaign)
    db.commit()
    return {"status": "success"}

@router.get("/campaigns/{id}/products", response_model=List[ProductResponse])
def get_campaign_products(id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == uuid.UUID(id)).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", id)
    return campaign.products

@router.post("/campaigns/{id}/products", response_model=List[ProductResponse])
def add_products_to_campaign(
    id: str,
    product_ids: List[str] = Body(..., embed=True),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(Campaign.id == uuid.UUID(id)).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", id)
    
    products = db.query(Product).filter(Product.id.in_([uuid.UUID(pid) for pid in product_ids])).all()
    for product in products:
        if product not in campaign.products:
            campaign.products.append(product)
            
    db.commit()
    db.refresh(campaign)
    audit_repo.log(db, user_id=admin_user.id, action="add_campaign_products", context={"campaign_id": id, "product_ids": product_ids})
    return campaign.products

@router.delete("/campaigns/{id}/products/{product_id}", response_model=List[ProductResponse])
def remove_product_from_campaign(
    id: str,
    product_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(Campaign.id == uuid.UUID(id)).first()
    if not campaign:
        raise ResourceNotFoundException("Campaign", id)
        
    product = db.query(Product).filter(Product.id == uuid.UUID(product_id)).first()
    if not product:
        raise ResourceNotFoundException("Product", product_id)
        
    if product in campaign.products:
        campaign.products.remove(product)
        
    db.commit()
    db.refresh(campaign)
    audit_repo.log(db, user_id=admin_user.id, action="remove_campaign_product", context={"campaign_id": id, "product_id": product_id})
    return campaign.products



# --- MODULE 7: ORDERS ---
@router.get("/orders", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    """Fetch list of all orders."""
    return db.query(Order).order_by(Order.created_at.desc()).options(
        joinedload(Order.items).joinedload(OrderItem.variant).joinedload(ProductVariant.product)
    ).all()

@router.patch("/orders/{id}/status", response_model=OrderResponse)
def update_order_status(
    id: str,
    status: str = Query(..., description="paid, processing, packed, shipped, delivered, cancelled, returned, refunded"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    """Update order processing and delivery status."""
    order = order_repo.get(db, id)
    if not order:
        raise ResourceNotFoundException("Order", id)
        
    old_status = order.status
    order.status = status
    db.commit()
    db.refresh(order)
    
    # Audit log
    audit_repo.log(
        db, 
        user_id=admin_user.id, 
        action="update_order_status", 
        context={"order_id": id, "order_number": order.order_number, "old_status": old_status, "new_status": status}
    )
    
    for item in order.items:
        item.sku = item.variant.sku
        item.name = item.variant.product.name
    return order


# --- MODULE 8: CUSTOMERS ---
@router.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    """Get list of customers with order stats."""
    customers = db.query(User).filter(User.role == "customer").all()
    results = []
    for c in customers:
        o_count = db.query(Order).filter(Order.user_id == c.id).count()
        total_spend = db.query(Order).filter(Order.user_id == c.id, Order.status != "cancelled").all()
        spend = sum(o.grand_total for o in total_spend)
        results.append({
            "id": str(c.id),
            "email": c.email,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "is_verified": c.is_verified,
            "order_count": o_count,
            "total_spend": float(spend),
            "created_at": c.created_at.isoformat()
        })
    return results


# --- MODULE 9: REVIEWS ---
@router.get("/reviews", response_model=List[ReviewResponse])
def list_all_reviews(db: Session = Depends(get_db)):
    """Fetch all reviews."""
    return db.query(Review).order_by(Review.created_at.desc()).all()

@router.get("/reviews/pending", response_model=List[ReviewResponse])
def list_pending_reviews(db: Session = Depends(get_db)):
    """List customer reviews requiring moderation approval."""
    return review_repo.get_pending_moderation(db)

@router.post("/reviews/{id}/moderate", response_model=ReviewResponse)
def moderate_review(
    id: str,
    action: str = Query(..., description="approve or reject"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    """Approve or reject a submitted product review."""
    review = review_repo.get(db, id)
    if not review:
        raise ResourceNotFoundException("Review", id)
        
    if action == "approve":
        review.status = "approved"
    elif action == "reject":
        review.status = "rejected"
    else:
        raise ValidationException("Invalid moderation action. Choose 'approve' or 'reject'")
        
    db.commit()
    db.refresh(review)
    audit_repo.log(db, user_id=admin_user.id, action="moderate_review", context={"review_id": id, "action": action})
    return review


# --- MODULE 10: CUSTOMER LOOKBOOK GALLERY ---
@router.get("/gallery", response_model=List[ProductCustomerImageResponse])
def list_gallery_images(db: Session = Depends(get_db)):
    return db.query(ProductCustomerImage).order_by(ProductCustomerImage.created_at.desc()).all()

@router.post("/gallery/{id}/moderate", response_model=ProductCustomerImageResponse)
def moderate_gallery_image(
    id: str,
    action: str = Query(..., description="approve or reject"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    img = db.query(ProductCustomerImage).filter(ProductCustomerImage.id == uuid.UUID(id)).first()
    if not img:
        raise ResourceNotFoundException("ProductCustomerImage", id)
        
    if action == "approve":
        img.status = "approved"
    elif action == "reject":
        img.status = "rejected"
    else:
        raise ValidationException("Choose 'approve' or 'reject'")
        
    db.commit()
    db.refresh(img)
    audit_repo.log(db, user_id=admin_user.id, action="moderate_gallery_image", context={"gallery_id": id, "action": action})
    return img


# --- MODULE 11: COUPONS ---
@router.get("/coupons")
def list_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).order_by(Coupon.start_date.desc()).all()

@router.post("/coupons")
def create_coupon(
    code: str = Body(...),
    discount_type: str = Body(...),
    discount_value: float = Body(...),
    min_order_value: float = Body(0.0),
    max_uses: int = Body(100),
    start_date: str = Body(...),
    expiry_date: str = Body(...),
    db: Session = Depends(get_db)
):
    coupon = Coupon(
        code=code.upper().strip(),
        discount_type=discount_type,
        discount_value=Decimal(str(discount_value)),
        min_order_value=Decimal(str(min_order_value)),
        start_date=datetime.fromisoformat(start_date),
        expiry_date=datetime.fromisoformat(expiry_date),
        max_uses=max_uses,
        uses_count=0
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

@router.delete("/coupons/{id}")
def delete_coupon(id: str, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.id == uuid.UUID(id)).first()
    if not coupon:
        raise ResourceNotFoundException("Coupon", id)
    db.delete(coupon)
    db.commit()
    return {"status": "success"}


# --- MODULE 12: INVENTORY ---
@router.get("/inventory")
def list_inventory(db: Session = Depends(get_db)):
    """Fetch physical stock items lists."""
    variants = db.query(ProductVariant).options(joinedload(ProductVariant.product)).all()
    results = []
    for v in variants:
        # Ignore variants belonging to deleted products
        if v.product.deleted_at is not None:
            continue
        results.append({
            "id": str(v.id),
            "name": v.product.name,
            "sku": v.sku,
            "color": v.color,
            "size": v.size,
            "stock": v.stock
        })
    return results

@router.patch("/inventory/{id}", response_model=ProductVariantResponse)
def adjust_inventory_quick(
    id: str,
    stock: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    """Adjust physical stock level for a product variant (used by the quick adjustment prompt)."""
    variant = variant_repo.get(db, id)
    if not variant:
        raise ResourceNotFoundException("ProductVariant", id)
        
    old_stock = variant.stock
    variant.stock = stock
    db.commit()
    db.refresh(variant)
    
    audit_repo.log(
        db, 
        user_id=admin_user.id, 
        action="adjust_inventory", 
        context={"variant_id": id, "sku": variant.sku, "old_stock": old_stock, "new_stock": stock}
    )
    return variant

@router.patch("/products/{id}/inventory", response_model=ProductVariantResponse)
def adjust_inventory(
    id: str,
    stock: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    """Adjust physical stock level for a product variant."""
    return adjust_inventory_quick(id, stock, db, admin_user)


# --- MODULE 13: ANALYTICS ---
@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Return structured sales trend and category breakdown."""
    orders = db.query(Order).filter(Order.status != "cancelled").all()
    sales_by_date = {}
    sales_by_category = {}
    
    for o in orders:
        date_str = o.created_at.strftime("%Y-%m-%d")
        sales_by_date[date_str] = sales_by_date.get(date_str, 0.0) + float(o.grand_total)
        
        # Load items
        for item in o.items:
            cat_name = item.variant.product.category.name
            sales_by_category[cat_name] = sales_by_category.get(cat_name, 0.0) + float(item.unit_price * item.quantity)
            
    # Format dates as list sorted
    sorted_sales = [{"date": d, "revenue": rev} for d, rev in sorted(sales_by_date.items())]
    formatted_cats = [{"category": c, "sales": s} for c, s in sales_by_category.items()]
    
    return {
        "sales_trend": sorted_sales,
        "category_sales": formatted_cats
    }


# --- MODULE 14: MARKETING ---
@router.get("/marketing/subscribers")
def list_subscribers(db: Session = Depends(get_db)):
    """Mock list of newsletter subscribers."""
    customers = db.query(User).filter(User.role == "customer").limit(10).all()
    subscribers = []
    for idx, c in enumerate(customers):
        subscribers.append({
            "id": f"sub_{idx}",
            "email": c.email,
            "status": "subscribed",
            "subscribed_at": c.created_at.isoformat()
        })
    # Add a few mock emails
    subscribers.append({"id": "sub_m1", "email": "clara.vance@gmail.com", "status": "subscribed", "subscribed_at": datetime.now(timezone.utc).isoformat()})
    subscribers.append({"id": "sub_m2", "email": "marcus.todd@yahoo.com", "status": "subscribed", "subscribed_at": datetime.now(timezone.utc).isoformat()})
    return subscribers

@router.post("/marketing/newsletter")
def send_newsletter(subject: str = Body(...), content: str = Body(...)):
    """Mock sending a newsletter."""
    # Simulates background mailer
    return {"status": "success", "sent_count": 12, "subject": subject}


# --- MODULE 15: USER MANAGEMENT ---
@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": str(u.id),
        "email": u.email,
        "role": u.role,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "is_verified": u.is_verified,
        "created_at": u.created_at.isoformat()
    } for u in users]

@router.patch("/users/{id}/role")
def update_user_role(id: str, role: str = Query(..., description="admin, customer, manager, support, warehouse"), db: Session = Depends(get_db), admin_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == uuid.UUID(id)).first()
    if not user:
        raise ResourceNotFoundException("User", id)
    user.role = role
    db.commit()
    db.refresh(user)
    audit_repo.log(db, user_id=admin_user.id, action="update_user_role", context={"target_user_id": id, "new_role": role})
    return user


# --- MODULE 16: SETTINGS ---
@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings_obj = db.query(StoreSettings).first()
    if not settings_obj:
        settings_obj = StoreSettings()
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    
    return {
        "store_name": settings_obj.store_name,
        "contact_email": settings_obj.contact_email,
        "currency": settings_obj.currency,
        "tax_rate": settings_obj.tax_rate,
        "free_shipping_threshold": settings_obj.free_shipping_threshold,
        "payment_gateways": settings_obj.payment_gateways
    }

@router.patch("/settings")
def update_settings(
    db: Session = Depends(get_db),
    store_name: Optional[str] = Body(None),
    contact_email: Optional[str] = Body(None),
    currency: Optional[str] = Body(None),
    tax_rate: Optional[float] = Body(None),
    free_shipping_threshold: Optional[float] = Body(None),
    payment_gateways: Optional[Dict[str, bool]] = Body(None),
    admin_user: User = Depends(get_current_user)
):
    settings_obj = db.query(StoreSettings).first()
    if not settings_obj:
        settings_obj = StoreSettings()
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)

    if store_name is not None: settings_obj.store_name = store_name
    if contact_email is not None: settings_obj.contact_email = contact_email
    if currency is not None: settings_obj.currency = currency
    if tax_rate is not None: settings_obj.tax_rate = tax_rate
    if free_shipping_threshold is not None: settings_obj.free_shipping_threshold = free_shipping_threshold
    if payment_gateways is not None: settings_obj.payment_gateways = payment_gateways

    db.commit()
    db.refresh(settings_obj)
    
    audit_repo.log(db, user_id=admin_user.id, action="update_settings", context={"store_name": store_name})
    
    return {
        "store_name": settings_obj.store_name,
        "contact_email": settings_obj.contact_email,
        "currency": settings_obj.currency,
        "tax_rate": settings_obj.tax_rate,
        "free_shipping_threshold": settings_obj.free_shipping_threshold,
        "payment_gateways": settings_obj.payment_gateways
    }


# --- MODULE 18: MEDIA LIBRARY ---
@router.post("/media/upload")
def upload_media(
    request: Request,
    file: UploadFile = File(...),
    admin_user: User = Depends(get_current_user)
):
    """Save an uploaded file to static directory and return absolute URL."""
    import os
    import uuid
    import shutil
    
    # Create unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    upload_dir = os.path.join("backend", "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    base_url = str(request.base_url).rstrip("/")
    return {"url": f"{base_url}/static/uploads/{unique_filename}"}


# --- MODULE 17: AUDIT LOGS ---
@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog, User.email).outerjoin(User, AuditLog.user_id == User.id).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": str(log.AuditLog.id),
            "user_id": str(log.AuditLog.user_id) if log.AuditLog.user_id else None,
            "user_email": log.email or "System / Anonymous",
            "action": log.AuditLog.action,
            "context": log.AuditLog.context,
            "request_id": log.AuditLog.request_id,
            "ip_address": log.AuditLog.ip_address,
            "created_at": log.AuditLog.created_at.isoformat()
        }
        for log in logs
    ]


# --- MODULE 18: DIRECT MEDIA & VARIANT MANAGEMENT ---
@router.post("/products/{id}/images")
async def upload_product_image(
    id: str,
    file: UploadFile = File(...),
    variant_id: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    import uuid
    from backend.app.services.import_service import ImportService
    
    product = db.query(Product).filter(Product.id == uuid.UUID(id)).first()
    if not product:
        raise ResourceNotFoundException("Product", id)
        
    resolved_variant_id = None
    if variant_id:
        resolved_variant_id = uuid.UUID(variant_id)
    elif color:
        variant = db.query(ProductVariant).filter(
            ProductVariant.product_id == product.id,
            ProductVariant.color.ilike(color)
        ).first()
        if variant:
            resolved_variant_id = variant.id

    file_bytes = await file.read()
    large_url, thumb_url = ImportService.process_and_compress_image(file_bytes, file.filename)
    
    max_sort = db.query(ProductImage).filter(ProductImage.product_id == product.id).count()
    
    img_record = ProductImage(
        product_id=product.id,
        variant_id=resolved_variant_id,
        image_url=large_url,
        sort_order=max_sort
    )
    db.add(img_record)
    db.commit()
    db.refresh(img_record)
    
    audit_repo.log(
        db, 
        user_id=admin_user.id, 
        action="upload_product_image", 
        context={"product_id": id, "image_id": str(img_record.id), "image_url": large_url}
    )
    
    return {
        "id": str(img_record.id),
        "product_id": str(img_record.product_id),
        "variant_id": str(img_record.variant_id) if img_record.variant_id else None,
        "image_url": img_record.image_url,
        "sort_order": img_record.sort_order
    }


@router.delete("/products/{id}/images/{image_id}")
def delete_product_image(
    id: str,
    image_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    import uuid
    import os
    img_record = db.query(ProductImage).filter(
        ProductImage.id == uuid.UUID(image_id),
        ProductImage.product_id == uuid.UUID(id)
    ).first()
    if not img_record:
        raise ResourceNotFoundException("ProductImage", image_id)
        
    image_url = img_record.image_url
    db.delete(img_record)
    db.commit()
    
    try:
        if image_url.startswith("/static/"):
            file_path = os.path.join("backend", image_url.lstrip("/"))
            if os.path.exists(file_path):
                os.remove(file_path)
            thumb_path = file_path.replace(".", "_thumb.")
            if os.path.exists(thumb_path):
                os.remove(thumb_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
        
    audit_repo.log(
        db, 
        user_id=admin_user.id, 
        action="delete_product_image", 
        context={"product_id": id, "image_id": image_id, "image_url": image_url}
    )
    return {"message": "Image deleted successfully"}


@router.post("/products/{id}/variants")
def create_product_variant(
    id: str,
    sku: str = Body(...),
    color: str = Body(...),
    size: str = Body(...),
    stock: int = Body(50),
    price_override: Optional[float] = Body(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    import uuid
    from decimal import Decimal
    product = db.query(Product).filter(Product.id == uuid.UUID(id)).first()
    if not product:
        raise ResourceNotFoundException("Product", id)
        
    existing = db.query(ProductVariant).filter(ProductVariant.sku == sku.upper().strip()).first()
    if existing:
        raise ValidationException(f"Variant SKU '{sku}' already exists.")
        
    variant = ProductVariant(
        product_id=product.id,
        sku=sku.upper().strip(),
        color=color.strip(),
        size=size.strip().upper(),
        stock=stock,
        price_override=Decimal(str(price_override)) if price_override else None
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    
    audit_repo.log(
        db, 
        user_id=admin_user.id, 
        action="create_product_variant", 
        context={"product_id": id, "variant_id": str(variant.id), "sku": variant.sku}
    )
    
    return {
        "id": str(variant.id),
        "product_id": str(variant.product_id),
        "sku": variant.sku,
        "color": variant.color,
        "size": variant.size,
        "stock": variant.stock,
        "price_override": float(variant.price_override) if variant.price_override else None
    }


@router.delete("/products/{id}/variants/{variant_id}")
def delete_product_variant(
    id: str,
    variant_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    import uuid
    variant = db.query(ProductVariant).filter(
        ProductVariant.id == uuid.UUID(variant_id),
        ProductVariant.product_id == uuid.UUID(id)
    ).first()
    if not variant:
        raise ResourceNotFoundException("ProductVariant", variant_id)
        
    sku = variant.sku
    db.delete(variant)
    db.commit()
    
    audit_repo.log(
        db, 
        user_id=admin_user.id, 
        action="delete_product_variant", 
        context={"product_id": id, "variant_id": variant_id, "sku": sku}
    )
    return {"message": "Product variant deleted successfully"}


# --- MODULE 19: BULK PRODUCT IMPORT WIZARD ---
@router.get("/import/template")
def get_import_template():
    import io
    import csv
    from fastapi.responses import StreamingResponse
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "SKU", "Product Name", "Brand", "Category", "Collection", 
        "Price", "Sale Price", "Description", "Status", "Tags", 
        "Colors", "Sizes", "SEO Title", "SEO Description"
    ])
    writer.writerow([
        "ATL-0010", "Classic Silk Shacket", "Atelier", "Shirts", "Summer Collection",
        "180.00", "150.00", "Elevated linen utility shacket in pure raw silk.", "published", "silk,shacket,summer",
        "black,white", "S,M,L", "Classic Silk Shacket - Atelier", "Shop the handcrafted classic silk shacket."
    ])
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=product_import_template.csv"}
    )


@router.get("/import/history")
def get_import_history(db: Session = Depends(get_db), admin_user: User = Depends(get_current_user)):
    logs = db.query(ImportLog).order_by(ImportLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": str(log.id),
            "created_at": log.created_at.isoformat(),
            "admin_email": log.admin_email,
            "filename": log.filename,
            "products_count": log.products_count,
            "images_count": log.images_count,
            "success_count": log.success_count,
            "failed_count": log.failed_count,
            "status": log.status,
            "errors": log.errors
        }
        for log in logs
    ]


@router.post("/import/validate")
async def validate_import(
    file: UploadFile = File(...),
    images_zip: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    from backend.app.services.import_service import ImportService
    
    file_bytes = await file.read()
    products_data = ImportService.parse_file(file_bytes, file.filename)
    
    image_map = {}
    if images_zip:
        zip_bytes = await images_zip.read()
        image_map = ImportService.extract_images_from_zip(zip_bytes)
        
    validation_report = ImportService.validate_data(products_data, image_map, db)
    return validation_report


@router.post("/import/execute")
async def execute_import(
    file: UploadFile = File(...),
    images_zip: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_user)
):
    import io
    import uuid
    from fastapi.responses import JSONResponse
    from backend.app.services.import_service import ImportService
    
    file_bytes = await file.read()
    products_data = ImportService.parse_file(file_bytes, file.filename)
    
    image_map = {}
    if images_zip:
        zip_bytes = await images_zip.read()
        image_map = ImportService.extract_images_from_zip(zip_bytes)
        
    # Perform validation check
    report = ImportService.validate_data(products_data, image_map, db)
    
    # If there are critical errors, abort import
    if report["critical_errors"] > 0:
        return JSONResponse(
            status_code=400,
            content={"message": "Cannot execute import. Please resolve all critical errors first.", "details": report}
        )
        
    success_count = 0
    failed_count = 0
    errors_list = []
    
    for row_idx, row in enumerate(products_data, start=2):
        try:
            sku = str(row.get("sku") or "").strip().upper()
            name = str(row.get("product_name") or row.get("name") or "").strip()
            price = float(row.get("price") or 0)
            discount_price_val = row.get("sale_price") or row.get("discount_price")
            discount_price = float(discount_price_val) if discount_price_val else None
            brand_name = str(row.get("brand") or "").strip()
            category_name = str(row.get("category") or "").strip()
            collection_name = str(row.get("collection") or "").strip()
            description = str(row.get("description") or "").strip()
            status_val = str(row.get("status") or "published").strip().lower()
            tags_val = str(row.get("tags") or "").strip()
            
            # Colors and Sizes lists
            colors_str = str(row.get("colors") or "default").strip()
            sizes_str = str(row.get("sizes") or "M").strip()
            colors = [c.strip().lower() for c in colors_str.split(",") if c.strip()]
            sizes = [s.strip().upper() for s in sizes_str.split(",") if s.strip()]
            
            # Resolve or create brand
            brand_id = None
            if brand_name:
                brand = db.query(Brand).filter(Brand.name.ilike(brand_name)).first()
                if not brand:
                    brand = Brand(name=brand_name, slug=brand_name.lower().replace(" ", "-"))
                    db.add(brand)
                    db.commit()
                    db.refresh(brand)
                brand_id = brand.id
            else:
                brand = db.query(Brand).first()
                brand_id = brand.id if brand else None
                
            # Resolve or create category
            category_id = None
            if category_name:
                category = db.query(Category).filter(Category.name.ilike(category_name)).first()
                if not category:
                    category = Category(name=category_name, slug=category_name.lower().replace(" ", "-"))
                    db.add(category)
                    db.commit()
                    db.refresh(category)
                category_id = category.id
            else:
                category = db.query(Category).first()
                category_id = category.id if category else None
                
            # Resolve or create collection
            collection_id = None
            if collection_name:
                collection = db.query(Collection).filter(Collection.name.ilike(collection_name)).first()
                if not collection:
                    collection = Collection(name=collection_name, slug=collection_name.lower().replace(" ", "-"))
                    db.add(collection)
                    db.commit()
                    db.refresh(collection)
                collection_id = collection.id

            seo_title = row.get("seo_title") or name
            seo_desc = row.get("seo_description") or description[:150]
            seo_metadata = {"meta_title": seo_title, "meta_description": seo_desc}
            
            product = None
            existing_variant = db.query(ProductVariant).filter(ProductVariant.sku == sku).first()
            if existing_variant:
                product = db.query(Product).filter(Product.id == existing_variant.product_id).first()
                if product:
                    product.name = name
                    product.price = price
                    product.discount_price = discount_price
                    product.description = description
                    product.brand_id = brand_id
                    product.category_id = category_id
                    if collection and collection not in product.collections:
                        product.collections.append(collection)
                    product.is_active = (status_val in ("published", "active"))
                    product.seo_metadata = seo_metadata
            
            if not product:
                product = Product(
                    name=name,
                    slug=f"{name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:8]}",
                    price=price,
                    discount_price=discount_price,
                    description=description,
                    short_description=description[:100],
                    brand_id=brand_id,
                    category_id=category_id,
                    is_active=(status_val in ("published", "active")),
                    seo_metadata=seo_metadata,
                    specifications={"tags": tags_val.split(",") if tags_val else []}
                )
                if collection:
                    product.collections.append(collection)
                db.add(product)
                db.commit()
                db.refresh(product)
            
            for color in colors:
                for size in sizes:
                    variant_sku = f"{sku}-{color.upper()}-{size}" if len(colors) > 1 or len(sizes) > 1 else sku
                    variant = db.query(ProductVariant).filter(ProductVariant.sku == variant_sku).first()
                    if not variant:
                        variant = ProductVariant(
                            product_id=product.id,
                            sku=variant_sku,
                            color=color.capitalize(),
                            size=size,
                            stock=50,
                            price_override=None
                        )
                        db.add(variant)
                        db.commit()
                        db.refresh(variant)
            
            if sku in image_map:
                details = image_map[sku]
                if details["cover"]:
                    img_record = db.query(ProductImage).filter(
                        ProductImage.product_id == product.id, 
                        ProductImage.image_url == details["cover"]
                    ).first()
                    if not img_record:
                        img_record = ProductImage(
                            product_id=product.id,
                            image_url=details["cover"],
                            sort_order=0
                        )
                        db.add(img_record)
                
                for color_key, imgs in details["colors"].items():
                    # Look up variant matching the color for this product
                    variant = db.query(ProductVariant).filter(
                        ProductVariant.product_id == product.id,
                        ProductVariant.color.ilike(color_key)
                    ).first()
                    variant_id = variant.id if variant else None

                    for color_img in imgs:
                        img_record = db.query(ProductImage).filter(
                            ProductImage.product_id == product.id,
                            ProductImage.image_url == color_img
                        ).first()
                        if not img_record:
                            img_record = ProductImage(
                                product_id=product.id,
                                variant_id=variant_id,
                                image_url=color_img,
                                sort_order=1
                            )
                            db.add(img_record)
                        elif not img_record.variant_id and variant_id:
                            img_record.variant_id = variant_id

            db.commit()
            success_count += 1
        except Exception as e:
            failed_count += 1
            errors_list.append({
                "row": row_idx,
                "sku": row.get("sku", "N/A"),
                "message": str(e)
            })

    import_log = ImportLog(
        admin_email=admin_user.email,
        filename=file.filename,
        products_count=len(products_data),
        images_count=report["total_images"],
        success_count=success_count,
        failed_count=failed_count,
        status="success" if failed_count == 0 else "failed",
        errors=errors_list
    )
    db.add(import_log)
    db.commit()
    db.refresh(import_log)
    
    audit_repo.log(db, user_id=admin_user.id, action="bulk_import_products", context={"filename": file.filename, "success_count": success_count})
    
    return {
        "status": import_log.status,
        "success_count": success_count,
        "failed_count": failed_count,
        "import_log_id": str(import_log.id)
    }
