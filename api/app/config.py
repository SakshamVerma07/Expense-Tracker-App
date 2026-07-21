import os
from dotenv import load_dotenv

load_dotenv()
required_vars = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SECRET_KEY"
]


for var in required_vars:
    if not os.getenv(var):
        raise RuntimeError(
            f"Missing environment variable: {var}"
        )

class Config:

    SECRET_KEY = os.getenv(
        "SECRET_KEY"
    )

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300
    }

    SUPABASE_URL = os.getenv(
        "SUPABASE_URL"
    )

    SUPABASE_ANON_KEY = os.getenv(
        "SUPABASE_ANON_KEY"
    )