import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "KAVACH AI API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "super_secret_dev_key_change_me_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for dev
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kavach_dev"
    
    # CORS
    FRONTEND_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"]
    
    # Storage
    UPLOAD_DIRECTORY: str = "uploads/"
    MAX_UPLOAD_SIZE_MB: int = 10
    STORAGE_PROVIDER: str = "local"
    
    # External Services
    REDIS_URL: Optional[str] = None
    AI_PROVIDER: str = "mock"
    AI_MODEL: str = "gemini-3.5-flash"
    LLM_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    STT_PROVIDER: str = "mock"
    OCR_PROVIDER: str = "mock"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

settings = Settings()
