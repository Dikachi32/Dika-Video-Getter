"""Application configuration using pydantic-settings."""
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    # App
    APP_NAME: str = "DikachiVideo AI Studio"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = "sqlite:///./data/dikachivideo.db"
    PROJECTS_DIR: Path = BASE_DIR / "projects"
    OUTPUTS_DIR: Path = BASE_DIR / "outputs"
    MODELS_DIR: Path = BASE_DIR / "models"

    # API Keys (loaded from env or settings db)
    OPENAI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""

    # Defaults
    DEFAULT_VIDEO_DURATION: int = 15
    DEFAULT_RESOLUTION: str = "1080x1920"  # 9:16 vertical
    DEFAULT_SUBTITLE_STYLE: str = "modern-yellow"
    DEFAULT_VOICE: str = "alloy"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Global settings instance
settings = Settings()