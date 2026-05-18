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

    results = []
    seen_inn = set()

    dict_drugs = translator.search_drugs(query=search, limit=limit)
    for d in dict_drugs:
        inn = d["inn"]
        if inn not in seen_inn:
            seen_inn.add(inn)
            results.append({
                "inn": inn,
                "dcb": d["dcb"],
                "class": d.get("class", ""),
                "display": f"{d['dcb']} ({inn})" if d["dcb"] != inn else inn,
            })

    if len(results) < limit:
        remaining = limit - len(results)
        model_drugs = search_drugs(query=search, limit=remaining * 2)
        for inn in model_drugs:
            if inn not in seen_inn:
                seen_inn.add(inn)
                dcb = translator.translate_drug_name(inn)
                drug_class = translator.get_drug_class(inn)
                results.append({
                    "inn": inn,
                    "dcb": dcb,
                    "class": drug_class or "",
                    "display": f"{dcb} ({inn})" if dcb != inn else inn,
                })

    return {"drugs": results, "count": len(results)}


@router.get("/all")
def get_all_medications(
    limit: int = Query(2000, description="Maximum number of drugs to return"),
    db: Session = Depends(get_db)
):
    """Get all medications in the database"""
    wait_for_model()
    translator = get_translator()

    results = []
    seen_inn = set()

    dict_drugs = translator.search_drugs(query="", limit=limit)
    for d in dict_drugs:
        inn = d["inn"]
        if inn not in seen_inn:
            seen_inn.add(inn)
            results.append({
                "inn": inn,
                "dcb": d["dcb"],
                "class": d.get("class", ""),
                "display": f"{d['dcb']} ({inn})" if d["dcb"] != inn else inn,
            })

    if len(results) < limit:
        remaining = limit - len(results)
        model_drugs = search_drugs(query="", limit=remaining * 2)
        for inn in model_drugs:
            if inn not in seen_inn:
                seen_inn.add(inn)
                dcb = translator.translate_drug_name(inn)
                drug_class = translator.get_drug_class(inn)
                results.append({
                    "inn": inn,
                    "dcb": dcb,
                    "class": drug_class or "",
                    "display": f"{dcb} ({inn})" if dcb != inn else inn,
                })

    return {"drugs": results, "count": len(results)}
