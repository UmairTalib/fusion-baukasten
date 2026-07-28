from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fusion-Baukasten API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "changeme"
    JWT_SECRET_KEY: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    RESEND_API_KEY: str = ""

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "fusion_user"
    POSTGRES_PASSWORD: str = "fusion_password"
    POSTGRES_DB: str = "fusion_baukasten"
    POSTGRES_PORT: str = "5432"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
