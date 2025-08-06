"""Configuration utilities for mongodb_datasets package."""

from pathlib import Path
from dotenv import load_dotenv

# Find the project root .env file by traversing up from this file
# Structure: packages/datasets/mongodb_datasets/config.py -> ../../../.env
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

def load_environment() -> None:
    """Load environment variables from the project .env file."""
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    else:
        # Fallback to loading from current directory
        load_dotenv()