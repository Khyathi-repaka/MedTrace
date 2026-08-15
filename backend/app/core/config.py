"""
Central configuration. Everything environment-dependent (DB, JWT secret,
AI provider, CORS) is read from env vars — nothing is hard-coded so the
same code runs in dev, CI, and production.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "MedTrace AI"
    ENV: str = "development"

    DATABASE_URL: str = "postgresql+psycopg2://medtrace:medtrace@localhost:5432/medtrace"

    JWT_SECRET: str = "change-me-in-.env"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24

    # AI provider: "openai" | "gemini" | "demo"
    AI_PROVIDER: str = "demo"
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    CORS_ORIGINS: str = "http://localhost:3000"

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_MB: int = 20

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def demo_mode(self) -> bool:
        """
        DEMO FALLBACK MODE (spec Phase 30): used only when no live AI
        provider key is configured. Real extraction/RAG code paths are
        untouched — this only swaps which provider implementation answers.
        """
        if self.AI_PROVIDER == "openai":
            return not bool(self.OPENAI_API_KEY)
        if self.AI_PROVIDER == "gemini":
            return not bool(self.GEMINI_API_KEY)
        return True


@lru_cache
def get_settings() -> Settings:
    return Settings()
