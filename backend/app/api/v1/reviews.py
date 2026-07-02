from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.schemas.order import ReviewResponse, ReviewCreate
from backend.app.repositories.order_repository import ReviewRepository, OrderRepository
from backend.app.models.order import Review
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.core.exceptions import ValidationException

router = APIRouter()

review_repo = ReviewRepository()
order_repo = OrderRepository()

@router.get("", response_model=List[ReviewResponse])
def get_product_reviews(
    product_id: str = Query(..., description="UUID of the product"),
    db: Session = Depends(get_db)
):
    """Retrieve list of all approved reviews for a specific product."""
    return review_repo.get_approved_by_product(db, product_id)

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a review for a product. Computes is_verified_purchase programmatically
    by checking the user's order history.
    """
    # Check if user already reviewed this product to prevent spam
    existing = db.query(Review).filter(
        Review.product_id == review_in.product_id,
        Review.user_id == current_user.id
    ).first()
    if existing:
        raise ValidationException("You have already reviewed this product")

    # Check if they purchased the product to set is_verified_purchase tag
    is_verified = False
    customer_orders = order_repo.get_customer_orders(db, current_user.id)
    for order in customer_orders:
        if order.status in ["delivered", "completed"]:
            for item in order.items:
                if str(item.variant.product_id) == str(review_in.product_id):
                    is_verified = True
                    break

    review = Review(
        product_id=review_in.product_id,
        user_id=current_user.id,
        rating=review_in.rating,
        title=review_in.title,
        content=review_in.content,
        is_verified_purchase=is_verified,
        status="pending"  # Requires administrative moderation before showing
    )
    return review_repo.create(db, review)
