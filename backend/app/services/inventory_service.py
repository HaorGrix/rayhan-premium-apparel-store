from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.product import ProductVariant
from backend.app.repositories.product_repository import ProductVariantRepository
from backend.app.core.exceptions import InventoryException, ResourceNotFoundException

class InventoryService:
    def __init__(self):
        self.variant_repo = ProductVariantRepository()

    def check_and_reserve_stock(self, db: Session, items_to_reserve: List[Dict[str, Any]]):
        """
        Check variant stock levels and reserve quantity using row locking (with_for_update).
        Throws InventoryException if a variant has insufficient stock.
        """
        for item in items_to_reserve:
            variant_id = item["variant_id"]
            qty = item["quantity"]
            
            # Query variant with select-for-update lock to block concurrent deductions
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == variant_id
            ).with_for_update().first()
            
            if not variant:
                raise ResourceNotFoundException("ProductVariant", variant_id)
                
            if variant.stock < qty:
                raise InventoryException(variant.sku, qty, variant.stock)
                
            # Deduct inventory count
            variant.stock -= qty

    def release_stock(self, db: Session, items_to_release: List[Dict[str, Any]]):
        """
        Release stock reservations back to available inventory.
        Usually executed on order cancellations or payment timeouts.
        """
        for item in items_to_release:
            variant_id = item["variant_id"]
            qty = item["quantity"]
            
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == variant_id
            ).with_for_update().first()
            
            if not variant:
                raise ResourceNotFoundException("ProductVariant", variant_id)
                
            # Restore inventory count
            variant.stock += qty
            
inventory_service = InventoryService()
