from typing import Any, Dict, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import time

class AppBaseException(Exception):
    """Base exception for application errors."""
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Any] = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details
        super().__init__(message)

class APIException(AppBaseException):
    """General exception thrown in API layers."""
    pass

class AuthenticationException(APIException):
    """Exception for authorization/authentication failures."""
    def __init__(self, message: str = "Authentication failed", details: Optional[Any] = None):
        super().__init__(401, "AUTHENTICATION_FAILED", message, details)

class AuthorizationException(APIException):
    """Exception for role or resource permission failures."""
    def __init__(self, message: str = "Permission denied", details: Optional[Any] = None):
        super().__init__(403, "AUTHORIZATION_FAILED", message, details)

class ResourceNotFoundException(APIException):
    """Exception when a requested model is missing."""
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            404, 
            "RESOURCE_NOT_FOUND", 
            f"{resource} identified by '{identifier}' not found.",
            None
        )

class ValidationException(APIException):
    """Exception for inputs that fail validation check."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(422, "VALIDATION_FAILED", message, details)

class InventoryException(APIException):
    """Exception when stock is insufficient during checkout/cart add."""
    def __init__(self, sku: str, requested: int, available: int):
        super().__init__(
            400,
            "INVENTORY_SHORTAGE",
            f"Insufficient stock for SKU '{sku}'. Requested {requested}, only {available} available.",
            {"sku": sku, "requested": requested, "available": available}
        )

class PaymentException(APIException):
    """Exception when payment processing fails."""
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(400, "PAYMENT_FAILED", message, details)


async def app_exception_handler(request: Request, exc: AppBaseException) -> JSONResponse:
    """FastAPI handler to format AppBaseException into JSONResponse."""
    request_id = getattr(request.state, "request_id", "N/A")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": exc.status_code,
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details,
            "request_id": request_id,
            "timestamp": int(time.time())
        }
    )
