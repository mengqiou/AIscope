from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="AISCOPE_",
        env_file=".env",
        extra="ignore",  # allow additional keys in .env / environment
    )

    # Database
    database_url: str = "sqlite:///./aiscope.db"

    # AWS / Bedrock
    aws_region: str | None = None
    bedrock_model_id: str | None = None

    # Ingestion
    user_agent: str = "AIscopeBot/0.1"


settings = Settings()

