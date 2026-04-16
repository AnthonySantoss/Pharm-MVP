import os
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from passlib.context import CryptContext


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "admin", "pharmacist", "patient"
    created_at = Column(DateTime, default=datetime.utcnow)


class HistoryEntry(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    drug1 = Column(String, nullable=False)
    drug2 = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pharmia.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)


def init_db():
    """Initialize database with tables and default admin"""
    create_tables()

    # Create default admin user if not exists
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@pharmia.com").first()
        if not admin:
            admin = User(
                email="admin@pharmia.com",
                name="Admin",
                hashed_password=pwd_context.hash("admin123"),
                role="admin",
            )
            db.add(admin)
            db.commit()
            print("Default admin user created: admin@pharmia.com / admin123")
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)