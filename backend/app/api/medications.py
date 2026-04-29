from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.ml_model import search_drugs, wait_for_model
from app.services.translator import get_translator

router = APIRouter(prefix="/medicamentos", tags=["Medications"])


@router.get("")
def get_medications(
    search: str = Query("", description="Search query for drug name"),
    limit: int = Query(50, description="Maximum number of results"),
    db: Session = Depends(get_db)
):
    """Get list of medications, optionally filtered by search query"""
    wait_for_model()
    translator = get_translator()
    drugs_inn = search_drugs(query=search, limit=limit)

    drugs = []
    for inn in drugs_inn:
        dcb = translator.translate_drug_name(inn)
        drug_class = translator.get_drug_class(inn)
        drugs.append({
            "inn": inn,
            "dcb": dcb,
            "class": drug_class or "",
            "display": f"{dcb} ({inn})" if dcb != inn else inn,
        })

    return {"drugs": drugs, "count": len(drugs)}


@router.get("/all")
def get_all_medications(
    limit: int = Query(500, description="Maximum number of drugs to return"),
    db: Session = Depends(get_db)
):
    """Get all medications in the database"""
    wait_for_model()
    translator = get_translator()
    drugs_inn = search_drugs(query="", limit=limit)

    drugs = []
    for inn in drugs_inn:
        dcb = translator.translate_drug_name(inn)
        drug_class = translator.get_drug_class(inn)
        drugs.append({
            "inn": inn,
            "dcb": dcb,
            "class": drug_class or "",
            "display": f"{dcb} ({inn})" if dcb != inn else inn,
        })

    return {"drugs": drugs, "count": len(drugs)}
