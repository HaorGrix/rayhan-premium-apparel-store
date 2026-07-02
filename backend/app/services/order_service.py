import uuid
import time
from typing import Dict, Any, List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.models.order import Order, OrderItem, Payment, Shipment, Coupon, CartItem
from backend.app.repositories.order_repository import OrderRepository, CouponRepository, CartRepository
from backend.app.services.inventory_service import inventory_service
from backend.app.core.exceptions import ValidationException, ResourceNotFoundException

class OrderService:
    def __init__(self):
        self.order_repo = OrderRepository()
        self.coupon_repo = CouponRepository()
        self.cart_repo = CartRepository()

    def generate_order_number(self) -> str:
        """Generate a unique human-readable order identifier."""
        return f"ORD-{int(time.time())}-{uuid.uuid4().hex[:6].upper()}"

    def validate_coupon(self, db: Session, code: str, subtotal: Decimal) -> Coupon:
        """Validate coupon validity, dates, constraints, and usage counts."""
        coupon = self.coupon_repo.get_by_code(db, code)
        if not coupon:
            raise ValidationException("Invalid promo code")
            
        now = datetime.utcnow()
        if now < coupon.start_date or now > coupon.expiry_date:
            raise ValidationException("Promo code has expired")
            
        if coupon.uses_count >= coupon.max_uses:
            raise ValidationException("Promo code has reached its maximum usage limit")
            
        if subtotal < coupon.min_order_value:
            raise ValidationException(
                f"Minimum order subtotal of ${coupon.min_order_value:.2f} required for this coupon"
            )
            
        return coupon

    def calculate_totals(
        self, 
        subtotal: Decimal, 
        coupon: Optional[Coupon] = None
    ) -> Dict[str, Decimal]:
        """Calculate discount, taxes, shipping fees, and grand total."""
        discount_amount = Decimal("0.00")
        if coupon:
            if coupon.discount_type == "percentage":
                discount_amount = (subtotal * coupon.discount_value) / Decimal("100.00")
            elif coupon.discount_type == "fixed":
                discount_amount = coupon.discount_value
            
            # Ensure discount doesn't exceed subtotal
            discount_amount = min(discount_amount, subtotal)
            
        # Standard tax and shipping rates
        taxable_amount = subtotal - discount_amount
        tax_amount = (taxable_amount * Decimal("0.05"))  # 5% tax
        
        shipping_amount = Decimal("15.00")  # Standard shipping flat fee
        if taxable_amount > Decimal("150.00"):
            shipping_amount = Decimal("0.00")  # Free shipping over $150
            
        grand_total = subtotal - discount_amount + tax_amount + shipping_amount
        
        return {
            "subtotal": subtotal,
            "discount_amount": discount_amount,
            "tax_amount": tax_amount,
            "shipping_amount": shipping_amount,
            "grand_total": grand_total
        }

    def place_order(
        self, 
        db: Session, 
        *, 
        user_id: Optional[str] = None, 
        session_id: Optional[str] = None, 
        coupon_code: Optional[str] = None, 
        shipping_address: Dict[str, Any], 
        billing_address: Dict[str, Any],
        payment_provider: str,
        payment_method: str
    ) -> Order:
        """
        Create order through an atomic transactional pipeline.
        Steps: Stock check/reservation -> Calculate totals -> Create order record -> Clear cart.
        """
        # Fetch cart
        if user_id:
            cart = self.cart_repo.get_by_user_id(db, user_id)
        else:
            cart = self.cart_repo.get_by_session_id(db, session_id)
            
        if not cart or not cart.items:
            raise ValidationException("Cannot place order with an empty cart")

        # Reserve inventory (checks and decrements stock under select-for-update lock)
        items_to_reserve = [
            {"variant_id": item.variant_id, "quantity": item.quantity} 
            for item in cart.items
        ]
        inventory_service.check_and_reserve_stock(db, items_to_reserve)

        # Calculate totals
        subtotal = sum(
            (item.variant.price_override or item.variant.product.price) * item.quantity 
            for item in cart.items
        )
        
        coupon = None
        if coupon_code:
            coupon = self.validate_coupon(db, coupon_code, subtotal)
            
        calculations = self.calculate_totals(subtotal, coupon)

        # Create Order record
        order = Order(
            order_number=self.generate_order_number(),
            user_id=user_id,
            status="pending",
            total_amount=calculations["subtotal"],
            discount_amount=calculations["discount_amount"],
            tax_amount=calculations["tax_amount"],
            shipping_amount=calculations["shipping_amount"],
            grand_total=calculations["grand_total"],
            shipping_address=shipping_address,
            billing_address=billing_address
        )
        db.add(order)
        db.flush()  # Generate order ID

        # Create OrderItems and associate with variants
        for item in cart.items:
            price = item.variant.price_override or item.variant.product.price
            order_item = OrderItem(
                order_id=order.id,
                variant_id=item.variant_id,
                quantity=item.quantity,
                unit_price=price,
                discount_applied=Decimal("0.00")  # future expansion itemized discount
            )
            db.add(order_item)

        # Update coupon usage
        if coupon:
            coupon.uses_count += 1

        # Clear shopping cart items
        for item in cart.items:
            db.delete(item)

        # Create pending Payment record
        payment = Payment(
            order_id=order.id,
            provider=payment_provider,
            method=payment_method,
            amount=calculations["grand_total"],
            status="pending"
        )
        db.add(payment)

        # Create initial pending Shipment record
        shipment = Shipment(
            order_id=order.id,
            provider="pathao",  # default provider
            status="pending"
        )
        db.add(shipment)

        db.commit()
        db.refresh(order)
        return order

    def cancel_order(self, db: Session, order_id: Any) -> Order:
        """Cancel eligible pending/paid order and restore inventory stock."""
        order = self.order_repo.get(db, order_id)
        if not order:
            raise ResourceNotFoundException("Order", order_id)
            
        if order.status in ["shipped", "delivered", "completed", "cancelled", "returned"]:
            raise ValidationException(f"Cannot cancel order in status '{order.status}'")

        # Restore inventory
        items_to_restore = [
            {"variant_id": item.variant_id, "quantity": item.quantity} 
            for item in order.items
        ]
        inventory_service.release_stock(db, items_to_restore)

        # Update order status
        order.status = "cancelled"
        
        # Cancel payments
        for payment in order.payments:
            if payment.status in ["pending", "authorized"]:
                payment.status = "cancelled"
                
        db.commit()
        db.refresh(order)
        return order
        
order_service = OrderService()
# Note: imported datetime on top context
from datetime import datetime
