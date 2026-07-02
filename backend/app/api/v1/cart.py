from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.core.database import get_db
from backend.app.schemas.order import CartResponse, CartItemAdd, CartItemUpdate
from backend.app.repositories.order_repository import CartRepository, CartItemRepository
from backend.app.repositories.product_repository import ProductVariantRepository
from backend.app.models.order import Cart, CartItem
from backend.app.api.deps import get_current_user, get_current_user_optional
from backend.app.models.user import User
from backend.app.core.exceptions import ValidationException, ResourceNotFoundException

router = APIRouter()

cart_repo = CartRepository()
cart_item_repo = CartItemRepository()
variant_repo = ProductVariantRepository()

def enrich_cart_items(cart: Cart) -> Cart:
    """Helper to populate extra presentation details on cart items."""
    for item in cart.items:
        item.price = item.variant.price_override or item.variant.product.price
        item.sku = item.variant.sku
        item.name = item.variant.product.name
        item.color = item.variant.color
        item.size = item.variant.size
        item.stock = item.variant.stock
        
        # Resolve specific variant image if configured, otherwise fallback to first product image
        variant_image = next((img.image_url for img in item.variant.product.images if img.variant_id == item.variant.id), None)
        if not variant_image and item.variant.product.images:
            variant_image = item.variant.product.images[0].image_url
        item.image_url = variant_image or "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300"
        
        # Determine material dynamically based on name and description
        name_lower = item.variant.product.name.lower()
        desc_lower = item.variant.product.description.lower()
        if "cotton" in name_lower or "cotton" in desc_lower:
            item.material = "Organic Cotton"
        elif "wool" in name_lower or "wool" in desc_lower:
            item.material = "Wool Blend"
        elif "linen" in name_lower or "linen" in desc_lower:
            item.material = "Pure Linen"
        elif "silk" in name_lower or "silk" in desc_lower:
            item.material = "Mulberry Silk"
        elif "cashmere" in name_lower or "cashmere" in desc_lower:
            item.material = "100% Cashmere"
        else:
            item.material = "Premium Blend"
    return cart

def get_or_create_cart(
    db: Session, 
    user: Optional[User] = None, 
    session_id: Optional[str] = None
) -> Cart:
    """Helper to fetch or create a user/session cart."""
    if user:
        cart = cart_repo.get_by_user_id(db, user.id)
        if not cart:
            cart = Cart(user_id=user.id)
            cart_repo.create(db, cart)
        return cart
    elif session_id:
        cart = cart_repo.get_by_session_id(db, session_id)
        if not cart:
            cart = Cart(session_id=session_id)
            cart_repo.create(db, cart)
        return cart
    else:
        raise ValidationException("Either user authentication or session ID is required to access the cart")

@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    session_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve shopping cart details. Resolves guest session or authenticated customer."""
    # Try current user, fallback to guest session
    user = None
    try:
        user = current_user
    except Exception:
        pass
        
    cart = get_or_create_cart(db, user, session_id)
    return enrich_cart_items(cart)

@router.post("/items", response_model=CartResponse)
def add_to_cart(
    item_in: CartItemAdd,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Add a product variant and quantity to the cart, performing inventory check."""
    user = None
    try:
        user = current_user
    except Exception:
        pass
        
    cart = get_or_create_cart(db, user, session_id)
    
    # Check variant validity and stock
    variant = variant_repo.get(db, item_in.variant_id)
    if not variant:
        raise ResourceNotFoundException("ProductVariant", item_in.variant_id)
        
    if variant.stock < item_in.quantity:
        raise ValidationException(
            f"Cannot add quantity {item_in.quantity} to cart. Only {variant.stock} available in stock."
        )

    # Add or update quantity
    existing_item = cart_item_repo.get_item(db, cart.id, variant.id)
    if existing_item:
        new_qty = existing_item.quantity + item_in.quantity
        if variant.stock < new_qty:
            raise ValidationException(
                f"Cannot update quantity to {new_qty}. Only {variant.stock} available in stock."
            )
        existing_item.quantity = new_qty
        db.commit()
    else:
        cart_item = CartItem(cart_id=cart.id, variant_id=variant.id, quantity=item_in.quantity)
        cart_item_repo.create(db, cart_item)

    db.refresh(cart)
    return enrich_cart_items(cart)

@router.patch("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: str,
    item_in: CartItemUpdate,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Update item quantity in cart, validating available inventory."""
    user = None
    try:
        user = current_user
    except Exception:
        pass
        
    cart = get_or_create_cart(db, user, session_id)
    cart_item = cart_item_repo.get(db, item_id)
    
    if not cart_item or cart_item.cart_id != cart.id:
        raise ResourceNotFoundException("CartItem", item_id)
        
    if cart_item.variant.stock < item_in.quantity:
        raise ValidationException(
            f"Cannot update quantity to {item_in.quantity}. Only {cart_item.variant.stock} in stock."
        )
        
    cart_item.quantity = item_in.quantity
    db.commit()
    
    db.refresh(cart)
    return enrich_cart_items(cart)

@router.delete("/items/{item_id}", response_model=CartResponse)
def delete_cart_item(
    item_id: str,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Delete an item from the cart."""
    user = None
    try:
        user = current_user
    except Exception:
        pass
        
    cart = get_or_create_cart(db, user, session_id)
    cart_item = cart_item_repo.get(db, item_id)
    
    if not cart_item or cart_item.cart_id != cart.id:
        raise ResourceNotFoundException("CartItem", item_id)
        
    db.delete(cart_item)
    db.commit()
    
    db.refresh(cart)
    return enrich_cart_items(cart)

@router.post("/merge", response_model=CartResponse)
def merge_guest_cart(
    guest_session_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Merge guest cart items into authenticated user cart upon login.
    """
    guest_cart = cart_repo.get_by_session_id(db, guest_session_id)
    user_cart = get_or_create_cart(db, current_user, None)
    
    if guest_cart and guest_cart.items:
        for guest_item in guest_cart.items:
            existing = cart_item_repo.get_item(db, user_cart.id, guest_item.variant_id)
            if existing:
                # Merge quantities, capped at variant stock limit
                merged_qty = existing.quantity + guest_item.quantity
                existing.quantity = min(merged_qty, guest_item.variant.stock)
            else:
                new_item = CartItem(
                    cart_id=user_cart.id,
                    variant_id=guest_item.variant_id,
                    quantity=guest_item.quantity
                )
                db.add(new_item)
            db.delete(guest_item)
        db.delete(guest_cart)
        db.commit()
        
    db.refresh(user_cart)
    return enrich_cart_items(user_cart)
