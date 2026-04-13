from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Rewaj Corporate Limited API"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-to-a-secure-random-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./rewaj.db"

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        # For SQLite, ensure we use aiosqlite if not specified
        elif url.startswith("sqlite://"):
            url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return url

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://rewajcorporate.com",
        "https://www.rewajcorporate.com",
    ]

    # Email (SendGrid)
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@rewajcorporate.com"
    ADMIN_EMAIL: str = "info@rewajcorporate.com"

    # Admin
    ADMIN_EMAIL_DEFAULT: str = "info@rewajcorporate.com"
    ADMIN_PASSWORD_DEFAULT: str = "ChangeMe123!"
    ADMIN_SEED_SECRET: str = "default-insecure-secret"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
