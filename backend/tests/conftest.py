import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from decimal import Decimal
from datetime import datetime, timezone, timedelta

from backend.app.core.database import Base, get_db
from backend.app.main import app

# Import all models to register them on Base.metadata
from backend.app.models.user import User, UserAddress
from backend.app.models.product import Category, Brand, Product, ProductVariant, ProductImage
from backend.app.models.order import Coupon, Cart, CartItem, Order, OrderItem, Payment, Shipment, Review
from backend.app.models.audit import AuditLog

# Test database URL (using independent SQLite in-memory database with StaticPool)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create in-memory tables and yield session, dropping them after the test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """Override get_db dependency and return TestClient."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db):
    """Fixture supplying a test customer user."""
    from backend.app.core.security import hash_password
    user = User(
        email="test_customer@example.com",
        password_hash=hash_password("password123"),
        first_name="Test",
        last_name="Customer",
        role="customer",
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def auth_headers(client, test_user):
    """Fixture supplying authentication headers for test client."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test_customer@example.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_catalog(db):
    """Fixture supplying seeded category, brand, product, and variant."""
    brand = Brand(name="COS", slug="cos", description="COS Minimalist")
    category = Category(name="Men's Clothing", slug="mens-clothing", description="Refined shirts")
    db.add_all([brand, category])
    db.flush()
    
    product = Product(
        name="Linen Shirt",
        slug="linen-shirt",
        description="Premium linen shirt for summer",
        price=Decimal("60.00"),
        brand_id=brand.id,
        category_id=category.id,
        is_active=True
    )
    db.add(product)
    db.flush()
    
    variant = ProductVariant(
        product_id=product.id,
        sku="SHI-LNN-WHT-M",
        color="White",
        size="M",
        stock=10
    )
    db.add(variant)
    
    welcome_coupon = Coupon(
        code="SAVE10",
        discount_type="percentage",
        discount_value=Decimal("10.00"),
        min_order_value=Decimal("50.00"),
        start_date=datetime.now(timezone.utc) - timedelta(days=1),
        expiry_date=datetime.now(timezone.utc) + timedelta(days=10),
        max_uses=100,
        uses_count=0
    )
    db.add(welcome_coupon)
    
    db.commit()
    db.refresh(variant)
    db.refresh(welcome_coupon)
    
    return {
        "brand": brand,
        "category": category,
        "product": product,
        "variant": variant,
        "coupon": welcome_coupon
    }
