import sys
import uuid
from sqlalchemy import create_engine, TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

db_url = settings.DATABASE_URL
connect_args = {}

# Resilient fallback: If using PostgreSQL but local instance is offline, use SQLite.
if db_url.startswith("postgresql"):
    import psycopg2
    try:
        import urllib.parse as urlparse
        result = urlparse.urlparse(db_url)
        conn = psycopg2.connect(
            database=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port or 5432,
            connect_timeout=2
        )
        conn.close()
        print("--- Connected to PostgreSQL successfully ---")
    except Exception as e:
        print(f"--- PostgreSQL offline (Error: {e}). Falling back to local SQLite ---", file=sys.stderr)
        db_url = "sqlite:///./ecommerce.db"
        connect_args = {"check_same_thread": False}
elif db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create database engine
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    connect_args=connect_args
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model class
Base = declarative_base()

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise CHAR(32), storing as hex strings.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return value
        else:
            if isinstance(value, uuid.UUID):
                return value.hex
            else:
                return uuid.UUID(value).hex

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value

def get_db():
    """
    Database session dependency generator.
    Yields session and closes it on completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
