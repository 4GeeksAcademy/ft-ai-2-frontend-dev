"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings.

    Loaded from environment variables with sensible defaults where applicable.
    """

    database_path: str = "data/db.json"
    jwt_secret: str  # required — no default
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 30
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "", "case_sensitive": False}


settings = Settings()