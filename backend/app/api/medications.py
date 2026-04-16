from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.ml_model import search_drugs, get_model

router = APIRouter(prefix="/medicamentos", tags=["Medications"])


@router.get("")
def get_medications(
    search: str = Query("", description="Search query for drug name"),
    limit: int = Query(50, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    """Get list of medications, optionally filtered by search query"""
    drugs = search_drugs(query=search, limit=limit)
    return {"drugs": drugs, "count": len(drugs)}


@router.get("/all")
def get_all_medications(
    limit: int = Query(500, description="Maximum number of drugs to return"),
    db: Session = Depends(get_db)
):
    """Get all medications in the database"""
    drugs = search_drugs(query="", limit=limit)
    return {"drugs": drugs, "count": len(drugs)}