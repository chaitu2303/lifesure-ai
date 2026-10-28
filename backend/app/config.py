import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LifeSure AI — Intelligent Life Insurance Needs Finder"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database URL: SQLite by default, easily swappable with PostgreSQL (e.g. postgresql://user:pass@localhost:5432/lifesure)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lifesure.db")
    
    # Admin security
    ADMIN_SECRET_KEY: str = os.getenv("ADMIN_SECRET_KEY", "lifesure-admin-key-2026")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Financial baseline assumptions
    DEFAULT_INFLATION_RATE: float = 0.06  # 6.0% annual inflation
    DEFAULT_DISCOUNT_RATE: float = 0.08   # 8.0% expected safe return / discount rate
    DEFAULT_RESERVE_MONTHS: int = 6       # 6 months emergency living expenses
    DEFAULT_INCOME_REPLACEMENT_YEARS: int = 15 # 15 years baseline replacement
    FAMILY_EXPENSE_FACTOR: float = 0.75   # 75% of family expenses remain when breadwinner passes away

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
