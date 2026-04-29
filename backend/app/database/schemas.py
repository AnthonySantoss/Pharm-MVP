from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# Pydantic models for database
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str  # "admin", "pharmacist", "patient"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryEntryCreate(BaseModel):
    user_id: str
    drug1: str
    drug1_dcb: Optional[str] = None
    drug2: str
    drug2_dcb: Optional[str] = None
    severity: str


class HistoryEntryResponse(HistoryEntryCreate):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None