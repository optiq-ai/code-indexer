import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "db")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "code_index")
POSTGRES_USER = os.getenv("POSTGRES_USER", "optiq")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "changeme")

# Database connection string
DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# LLM configuration
LLM_MODE = os.getenv("LLM_MODE", "OPENAI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Celery configuration
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")

# Application settings
MAX_PAYLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_TOKENS_PER_CHUNK = 1000
DEFAULT_CHUNK_OVERLAP = 50

# OpenAI models
EMBEDDING_MODEL = "text-embedding-ada-002"
COMPLETION_MODEL = "gpt-3.5-turbo"

# Supported languages
SUPPORTED_LANGUAGES = [
    "python", "javascript", "typescript", "java", "c", "cpp", "csharp", 
    "go", "rust", "php", "ruby", "swift", "kotlin", "scala", "sql", 
    "html", "css", "bash", "powershell", "yaml", "json", "xml"
]
