from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session, joinedload
from backend.app.models.product import Category, Brand, Collection, Product, ProductVariant, ProductImage
from backend.app.repositories.base import BaseRepository

class CategoryRepository(BaseRepository[Category]):
    def __init__(self):
        super().__init__(Category)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Category]:
        return db.query(Category).filter(Category.slug == slug).first()

class BrandRepository(BaseRepository[Brand]):
    def __init__(self):
        super().__init__(Brand)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Brand]:
        return db.query(Brand).filter(Brand.slug == slug).first()

class CollectionRepository(BaseRepository[Collection]):
    def __init__(self):
        super().__init__(Collection)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Collection]:
        return db.query(Collection).filter(Collection.slug == slug).first()

class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)

    def get_by_slug(self, db: Session, slug: str) -> Optional[Product]:
        """Get product with eager loading of images and variants."""
        return db.query(Product).filter(
            Product.slug == slug,
            Product.deleted_at == None
        ).options(
            joinedload(Product.images),
            joinedload(Product.variants)
        ).first()

    def get_with_relations(self, db: Session, product_id: Any) -> Optional[Product]:
        """Fetch product eager-loading its child tables."""
        return db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at == None
        ).options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.brand),
            joinedload(Product.category)
        ).first()

    def query_catalog(
        self,
        db: Session,
        *,
        search: Optional[str] = None,
        category_id: Optional[Any] = None,
        brand_id: Optional[Any] = None,
        collection_id: Optional[Any] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        colors: Optional[List[str]] = None,
        sizes: Optional[List[str]] = None,
        on_sale: Optional[bool] = None,
        is_active: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Product], int]:
        """
        Query database catalog with criteria (filters, pagination offsets, search keywords).
        Returns a tuple of (Products, Total count).
        """
        query = db.query(Product).filter(Product.deleted_at == None)
        
        if is_active:
            query = query.filter(Product.is_active == True)
            
        import uuid
        from backend.app.models.product import Category, Brand, Collection

        if category_id:
            # Check if it's a comma-separated list of category IDs/slugs
            cids = [c.strip() for c in str(category_id).split(",") if c.strip()]
            
            # Find all categories matching either UUID or slug
            all_cat_ids = []
            for cid in cids:
                try:
                    # Check if it's a UUID
                    cat_uuid = uuid.UUID(cid)
                    all_cat_ids.append(cat_uuid)
                except ValueError:
                    # Check by slug
                    cat_obj = db.query(Category).filter(Category.slug == cid).first()
                    if cat_obj:
                        all_cat_ids.append(cat_obj.id)
            
            if all_cat_ids:
                # Find all subcategories where Category.id is in matching parents or matches directly
                subcategories = db.query(Category.id).filter(
                    or_(Category.id.in_(all_cat_ids), Category.parent_id.in_(all_cat_ids))
                ).all()
                sub_ids = [s[0] for s in subcategories]
                query = query.filter(Product.category_id.in_(sub_ids))
            else:
                # If no matching categories, return empty result query
                query = query.filter(Product.category_id == None)
            
        if brand_id:
            try:
                uuid.UUID(str(brand_id))
                query = query.filter(Product.brand_id == brand_id)
            except ValueError:
                query = query.join(Product.brand).filter(Brand.slug == brand_id)
            
        if collection_id:
            import uuid
            from backend.app.models.product import Campaign
            try:
                collection_uuid = uuid.UUID(str(collection_id))
                query = query.filter(
                    or_(
                        Product.collections.any(Collection.id == collection_uuid),
                        Product.campaigns.any(Campaign.id == collection_uuid)
                    )
                )
            except ValueError:
                query = query.filter(
                    or_(
                        Product.collections.any(Collection.slug == collection_id),
                        Product.campaigns.any(Campaign.slug == collection_id),
                        Product.collections.any(Collection.campaigns.any(Campaign.slug == collection_id))
                    )
                )
            
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
            
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        if on_sale is not None:
            if on_sale:
                query = query.filter(Product.discount_price != None)
            else:
                query = query.filter(Product.discount_price == None)

        # Variant filtering checks
        variant_filters = []
        if colors:
            variant_filters.append(ProductVariant.color.in_(colors))
        if sizes:
            variant_filters.append(ProductVariant.size.in_(sizes))
            
        if variant_filters:
            query = query.join(Product.variants).filter(and_(*variant_filters))

        # Text keyword search
        if search:
            search_terms = [t.strip() for t in search.split(" ") if t.strip()]
            for term in search_terms:
                search_pattern = f"%{term}%"
                query = query.filter(
                    or_(
                        Product.name.ilike(search_pattern),
                        Product.description.ilike(search_pattern),
                        Product.short_description.ilike(search_pattern)
                    )
                )

        # Query total count for pagination metadata
        total = query.distinct().count()

        # Eager load relationships for list view performance
        results = query.distinct().options(
            joinedload(Product.images),
            joinedload(Product.brand),
            joinedload(Product.category)
        ).offset(skip).limit(limit).all()

        return results, total

class ProductVariantRepository(BaseRepository[ProductVariant]):
    def __init__(self):
        super().__init__(ProductVariant)

    def get_by_sku(self, db: Session, sku: str) -> Optional[ProductVariant]:
        """Fetch product variant by unique SKU code."""
        return db.query(ProductVariant).filter(ProductVariant.sku == sku.strip().upper()).first()

    def get_variants_by_product(self, db: Session, product_id: Any) -> List[ProductVariant]:
        """Fetch all variants belonging to a specific product."""
        return db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()
