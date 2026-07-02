from typing import List, Optional, Any
from sqlalchemy.orm import Session, joinedload
from backend.app.models.order import Cart, CartItem, Coupon, Order, OrderItem, Payment, Shipment, Review
from backend.app.repositories.base import BaseRepository

class CartRepository(BaseRepository[Cart]):
    def __init__(self):
        super().__init__(Cart)

    def get_by_user_id(self, db: Session, user_id: Any) -> Optional[Cart]:
        """Fetch active cart by user ID, eager-loading items."""
        return db.query(Cart).filter(Cart.user_id == user_id).options(
            joinedload(Cart.items).joinedload(CartItem.variant)
        ).first()

    def get_by_session_id(self, db: Session, session_id: str) -> Optional[Cart]:
        """Fetch guest cart by unique session ID, eager-loading items."""
        return db.query(Cart).filter(Cart.session_id == session_id).options(
            joinedload(Cart.items).joinedload(CartItem.variant)
        ).first()

class CartItemRepository(BaseRepository[CartItem]):
    def __init__(self):
        super().__init__(CartItem)

    def get_item(self, db: Session, cart_id: Any, variant_id: Any) -> Optional[CartItem]:
        """Check if variant already exists in user's cart."""
        return db.query(CartItem).filter(
            CartItem.cart_id == cart_id,
            CartItem.variant_id == variant_id
        ).first()

class CouponRepository(BaseRepository[Coupon]):
    def __init__(self):
        super().__init__(Coupon)

    def get_by_code(self, db: Session, code: str) -> Optional[Coupon]:
        """Fetch coupon by unique promo code."""
        return db.query(Coupon).filter(Coupon.code == code.strip().upper()).first()

class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__(Order)

    def get_by_order_number(self, db: Session, order_number: str) -> Optional[Order]:
        """Fetch order by unique human-readable order number."""
        return db.query(Order).filter(Order.order_number == order_number).options(
            joinedload(Order.items).joinedload(OrderItem.variant).joinedload(CartItem.variant.product),
            joinedload(Order.payments),
            joinedload(Order.shipments)
        ).first()

    def get_customer_orders(self, db: Session, user_id: Any) -> List[Order]:
        """Fetch all orders placed by a customer, ordered by newest first."""
        return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

class PaymentRepository(BaseRepository[Payment]):
    def __init__(self):
        super().__init__(Payment)

    def get_by_transaction_id(self, db: Session, transaction_id: str) -> Optional[Payment]:
        """Fetch payment by unique gateway transaction id."""
        return db.query(Payment).filter(Payment.transaction_id == transaction_id).first()

class ShipmentRepository(BaseRepository[Shipment]):
    def __init__(self):
        super().__init__(Shipment)

    def get_by_tracking_number(self, db: Session, tracking_number: str) -> Optional[Shipment]:
        return db.query(Shipment).filter(Shipment.tracking_number == tracking_number).first()

class ReviewRepository(BaseRepository[Review]):
    def __init__(self):
        super().__init__(Review)

    def get_approved_by_product(self, db: Session, product_id: Any) -> List[Review]:
        """Fetch all approved reviews for a product."""
        return db.query(Review).filter(
            Review.product_id == product_id,
            Review.status == "approved"
        ).order_by(Review.created_at.desc()).all()

    def get_pending_moderation(self, db: Session) -> List[Review]:
        """Fetch reviews that require moderation."""
        return db.query(Review).filter(Review.status == "pending").all()
