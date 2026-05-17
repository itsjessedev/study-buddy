"""Database configuration and session management."""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables."""

    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    refresh_token_days: int = 30
    api_prefix: str = "/study"
    cors_origins: str = "http://localhost:5173,https://study.junipr.io"
    cf_access_enabled: bool = False
    cf_access_team_domain: str | None = None
    cf_access_audience: str | None = None
    cf_access_allowed_emails: str = "jeldridge2583@gmail.com,jesse@junipr.io"
    cf_access_account_username: str = "jesse"
    cf_access_account_first_name: str = "Jesse"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    """Get cached settings instance."""
    return Settings()


# Database setup
settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
