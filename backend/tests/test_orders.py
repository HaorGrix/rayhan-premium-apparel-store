from decimal import Decimal
from backend.app.models.order import Cart, CartItem

def test_place_order_success(client, db, test_user, auth_headers, test_catalog):
    """Test successful checkout transaction, verifying stock deduction and cart clearing."""
    variant = test_catalog["variant"]
    
    # 1. Create a cart with items
    cart = Cart(user_id=test_user.id)
    db.add(cart)
    db.flush()
    
    cart_item = CartItem(cart_id=cart.id, variant_id=variant.id, quantity=2)
    db.add(cart_item)
    db.commit()

    # 2. Place order with coupon code
    response = client.post(
        "/api/v1/orders",
        json={
            "coupon_code": "SAVE10",
            "shipping_address": {
                "address_line1": "123 Street",
                "city": "Dhaka",
                "country": "Bangladesh",
                "phone": "+8801700000000"
            },
            "billing_address": {
                "address_line1": "123 Street",
                "city": "Dhaka",
                "country": "Bangladesh",
                "phone": "+8801700000000"
            },
            "payment_provider": "stripe",
            "payment_method": "card"
        },
        headers=auth_headers
    )

    assert response.status_code == 201
    order_data = response.json()
    assert order_data["status"] == "pending"
    
    # Assert correct calculations: Subtotal = 60 * 2 = 120. Discount 10% = 12. 
    # Tax = 5% of (120-12=108) = 5.4. Shipping = 15. Grand total = 108 + 5.4 + 15 = 128.4
    assert float(order_data["total_amount"]) == 120.0
    assert float(order_data["discount_amount"]) == 12.0
    assert float(order_data["grand_total"]) == 128.4

    # 3. Assert variant stock is decremented from 10 to 8
    db.refresh(variant)
    assert variant.stock == 8

    # 4. Assert cart is cleared
    db.refresh(cart)
    assert len(cart.items) == 0

def test_place_order_insufficient_stock(client, db, test_user, auth_headers, test_catalog):
    """Test checkout fails and rolls back when quantity exceeds stock levels."""
    variant = test_catalog["variant"]
    
    cart = Cart(user_id=test_user.id)
    db.add(cart)
    db.flush()
    
    # Add quantity 12 which is greater than stock (10)
    cart_item = CartItem(cart_id=cart.id, variant_id=variant.id, quantity=12)
    db.add(cart_item)
    db.commit()

    response = client.post(
        "/api/v1/orders",
        json={
            "shipping_address": {"address_line1": "123 Street", "city": "Dhaka", "country": "BD", "phone": "1"},
            "billing_address": {"address_line1": "123 Street", "city": "Dhaka", "country": "BD", "phone": "1"},
            "payment_provider": "stripe",
            "payment_method": "card"
        },
        headers=auth_headers
    )

    assert response.status_code == 400
    assert response.json()["error_code"] == "INVENTORY_SHORTAGE"

    # Assert stock was NOT decremented (transaction rollback)
    db.refresh(variant)
    assert variant.stock == 10

def test_cancel_order_restores_stock(client, db, test_user, auth_headers, test_catalog):
    """Test order cancellation restores reserved variant stock levels."""
    variant = test_catalog["variant"]
    
    # Setup order with reserved stock
    cart = Cart(user_id=test_user.id)
    db.add(cart)
    db.flush()
    cart_item = CartItem(cart_id=cart.id, variant_id=variant.id, quantity=3)
    db.add(cart_item)
    db.commit()

    # Place order
    res = client.post(
        "/api/v1/orders",
        json={
            "shipping_address": {"address_line1": "123 St", "city": "Dhaka", "country": "BD", "phone": "1"},
            "billing_address": {"address_line1": "123 St", "city": "Dhaka", "country": "BD", "phone": "1"},
            "payment_provider": "stripe",
            "payment_method": "card"
        },
        headers=auth_headers
    )
    order_id = res.json()["id"]

    # Verify stock decremented to 7
    db.refresh(variant)
    assert variant.stock == 7

    # Cancel order
    cancel_res = client.post(f"/api/v1/orders/{order_id}/cancel", headers=auth_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Verify stock is restored back to 10
    db.refresh(variant)
    assert variant.stock == 10
