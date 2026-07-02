from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.schemas.order import OrderResponse, CheckoutRequest
from backend.app.repositories.order_repository import OrderRepository
from backend.app.services.order_service import order_service
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.core.exceptions import ResourceNotFoundException, ValidationException

router = APIRouter()

order_repo = OrderRepository()

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    checkout_in: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Submit checkout and place a new order. Resolves either authenticated customer or guest session.
    """
    user_id = None
    try:
        user_id = str(current_user.id)
    except Exception:
        # User not authenticated, this is guest checkout
        if not checkout_in.session_id:
            raise ValidationException("session_id is required for guest checkout")

    # Place order atomically
    order = order_service.place_order(
        db,
        user_id=user_id,
        session_id=checkout_in.session_id,
        coupon_code=checkout_in.coupon_code,
        shipping_address=checkout_in.shipping_address,
        billing_address=checkout_in.billing_address,
        payment_provider=checkout_in.payment_provider,
        payment_method=checkout_in.payment_method
    )
    
    # Eager load items details for response mapping
    for item in order.items:
        item.sku = item.variant.sku
        item.name = item.variant.product.name
        
    return order

@router.get("", response_model=List[OrderResponse])
def get_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve order history for the currently logged-in user."""
    orders = order_repo.get_customer_orders(db, current_user.id)
    for order in orders:
        for item in order.items:
            item.sku = item.variant.sku
            item.name = item.variant.product.name
    return orders

@router.get("/{id_or_number}", response_model=OrderResponse)
def get_order_details(
    id_or_number: str = Path(..., description="The ID or order number"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Fetch details for an order using UUID or human-readable ORD number.
    Guests can fetch their order without authentication if they provide the exact order number.
    """
    order = None
    if id_or_number.startswith("ORD-"):
        order = order_repo.get_by_order_number(db, id_or_number)
    else:
        try:
            order = order_repo.get(db, id_or_number)
        except Exception:
            pass
            
    if not order:
        raise ResourceNotFoundException("Order", id_or_number)
        
    # Security: If order belongs to a user, make sure only they can access it
    if order.user_id:
        if not current_user or str(current_user.id) != str(order.user_id):
            raise ValidationException("You do not have permission to view this order")

    # Populate variant labels
    for item in order.items:
        item.sku = item.variant.sku
        item.name = item.variant.product.name
        
    return order

@router.post("/{id}/cancel", response_model=OrderResponse)
def cancel_order(
    id: str = Path(..., description="Order UUID to cancel"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel order and restore stock levels. Restricted to the order owner."""
    order = order_repo.get(db, id)
    if not order:
        raise ResourceNotFoundException("Order", id)
        
    if str(order.user_id) != str(current_user.id):
        raise ValidationException("You do not have permission to cancel this order")
        
    updated_order = order_service.cancel_order(db, order.id)
    for item in updated_order.items:
        item.sku = item.variant.sku
        item.name = item.variant.product.name
    return updated_order
