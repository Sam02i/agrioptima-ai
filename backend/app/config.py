import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend/ directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

DATABASE_URL = os.environ["DATABASE_URL"]

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")
DATA_GOV_MANDI_RESOURCE_ID = os.getenv("DATA_GOV_MANDI_RESOURCE_ID", "")

WEATHER_CACHE_MINUTES = int(os.getenv("WEATHER_CACHE_MINUTES", "360"))
MANDI_CACHE_MINUTES = int(os.getenv("MANDI_CACHE_MINUTES", "720"))

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "false").lower() == "true"
AUTH_SECRET = os.getenv("AUTH_SECRET", "development-only-change-me")
ACCESS_TOKEN_MINUTES = int(os.getenv("ACCESS_TOKEN_MINUTES", "30"))
