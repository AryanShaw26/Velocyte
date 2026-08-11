from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str

    # ============================================================
    # JWT / AUTHENTICATION
    # ============================================================

    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ============================================================
    # GITHUB API
    # ============================================================

    GITHUB_TOKEN: str

    GITHUB_REPOSITORY: str

    # ============================================================
    # GITHUB OAUTH
    # ============================================================

    GITHUB_CLIENT_ID: str

    GITHUB_CLIENT_SECRET: str

    GITHUB_OAUTH_CALLBACK_URL: str
    FRONTEND_URL: str = "http://localhost:5173"

    # ============================================================
    # GEMINI
    # ============================================================

    GEMINI_API_KEY: str

    # ============================================================
    # ENVIRONMENT CONFIGURATION
    # ============================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()