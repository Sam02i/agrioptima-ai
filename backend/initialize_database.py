"""Run explicitly for a new database; demo import requires --demo."""
import argparse
from app.db.session import Base, engine, SessionLocal
from app.db import models  # noqa: F401

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--demo", action="store_true")
    args = parser.parse_args()
    Base.metadata.create_all(engine)
    if args.demo:
        from app.services.platform_seed import seed_platform
        with SessionLocal() as db:
            seed_platform(db)
    print("Database initialization complete.")
