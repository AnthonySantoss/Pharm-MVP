from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import User, get_db
from app.auth.auth import get_current_active_user, require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


class UserUpdateRequest(BaseModel):
    role: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str

    class Config:
        from_attributes = True


@router.get("/users", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    users = db.query(User).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_role(
    user_id: int,
    request: UserUpdateRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Update user role (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if request.role not in ["admin", "pharmacist", "patient"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    user.role = request.role
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Get admin statistics"""
    total_users = db.query(User).count()
    pharmacists = db.query(User).filter(User.role == "pharmacist").count()
    patients = db.query(User).filter(User.role == "patient").count()
    admins = db.query(User).filter(User.role == "admin").count()

    return {
        "totalUsers": total_users,
        "pharmacists": pharmacists,
        "patients": patients,
        "admins": admins,
    }