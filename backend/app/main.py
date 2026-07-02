import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.core.exceptions import AppBaseException, app_exception_handler
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.products import router as products_router
from backend.app.api.v1.cart import router as cart_router
from backend.app.api.v1.orders import router as orders_router
from backend.app.api.v1.reviews import router as reviews_router
from backend.app.api.v1.admin import router as admin_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise-grade B2C Fashion eCommerce REST API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS configuration
origins = [
    "http://localhost:3000",      # Next.js local development
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_correlation_id_and_timer(request: Request, call_next):
    """
    Middleware injecting unique correlation ID (request_id) and processing timer.
    Provides diagnostic fields for observability.
    """
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Inject header to help trace request in client
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    
    return response

# Register custom exception handlers for structured responses
app.add_exception_handler(AppBaseException, app_exception_handler)

# Fallback handler for raw unexpected server exceptions
@app.exception_handler(Exception)
async def global_unexpected_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "N/A")
    # In production, we log details and return clean response. Here we do the same:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": 500,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred on the server.",
            "request_id": request_id,
            "timestamp": int(time.time())
        }
    )

# Include endpoint modules under versioned namespaces
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/api/v1", tags=["Catalog"])
app.include_router(cart_router, prefix="/api/v1/cart", tags=["Shopping Cart"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["Orders & Checkout"])
app.include_router(reviews_router, prefix="/api/v1/reviews", tags=["Product Reviews"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Administration"])

app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/health", tags=["Health"])
def health_check():
    """Retrieve service availability status."""
    return {"status": "healthy", "service": settings.APP_NAME, "version": "1.0.0"}
