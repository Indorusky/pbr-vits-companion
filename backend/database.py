import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Support DATABASE_URL (Standard Cloud DB / Supabase), MYSQL_URL, or fallback to SQLite
raw_db_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL") or "sqlite:///./campus_companion.db"

# SQLAlchemy PostgreSQL dialect configuration: map postgres://, postgresql://, or postgresql+psycopg2://
# to postgresql+psycopg:// to consistently use the modern psycopg 3 driver (psycopg) compatible with Python 3.14.
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif raw_db_url.startswith("postgresql://"):
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg://", 1)
elif raw_db_url.startswith("postgresql+psycopg2://"):
    raw_db_url = raw_db_url.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)

SQLALCHEMY_DATABASE_URL = raw_db_url

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
