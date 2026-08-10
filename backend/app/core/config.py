from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str

    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GITHUB_TOKEN: str


    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()