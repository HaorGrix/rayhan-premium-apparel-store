import uuid
from sqlalchemy import Column, String, Float, JSON
from backend.app.core.database import Base, GUID

class StoreSettings(Base):
    __tablename__ = "store_settings"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    store_name = Column(String, nullable=False, default="Atelier Boutique")
    contact_email = Column(String, nullable=False, default="support@atelier.com")
    currency = Column(String, nullable=False, default="USD")
    tax_rate = Column(Float, nullable=False, default=0.08)
    free_shipping_threshold = Column(Float, nullable=False, default=150.0)
    payment_gateways = Column(JSON, nullable=False, default=lambda: {"stripe": True, "sslcommerz": False, "bkash": False})
