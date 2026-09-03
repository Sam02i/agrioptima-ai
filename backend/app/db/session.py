from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import DATABASE_URL

_engine_options = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    # FastAPI may use the same local SQLite database from different threads.
    _engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **_engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass
