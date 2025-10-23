"""
Configuration management using environment variables.
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Environment
    ENV: str = os.getenv("ENV", "development")

    # Server
    PORT: int = int(os.getenv("PORT", "8000"))

    # OpenAI
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    # Chroma Vector Store
    CHROMA_URL: str = os.getenv("CHROMA_URL", "http://localhost:8000")

    # RAG Configuration
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    TOP_K: int = int(os.getenv("TOP_K", "5"))
    CONVERSATION_HISTORY_LIMIT: int = int(os.getenv("CONVERSATION_HISTORY_LIMIT", "10"))

    @property
    def DATABASE_URL(self) -> str:
        """
        Database URL - dynamically reads from environment.
        This allows tests to override the value by setting os.environ["DATABASE_URL"].
        """
        return os.getenv("DATABASE_URL", "sqlite:///./data/app.db")

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.ENV == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.ENV == "production"


# Global settings instance
settings = Settings()