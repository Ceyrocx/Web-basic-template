from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Load from .env; ignore keys meant for other services (the root .env is shared)
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Overridden by the env var in Docker (host becomes "db")
    DATABASE_URL: str = "postgresql+psycopg://app:changeme@localhost:5432/app"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]


settings = Settings()
