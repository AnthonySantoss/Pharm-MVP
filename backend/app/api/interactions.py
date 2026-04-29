from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import HistoryEntry, get_db
from app.services.ml_model import get_model, wait_for_model
from app.services.translator import get_translator
from app.auth.auth import get_current_active_user, User

router = APIRouter(prefix="/interactions", tags=["Interactions"])


class InteractionCheckRequest(BaseModel):
    drug1: str
    drug2: str


class InteractionCheckResponse(BaseModel):
    drug1: str
    drug1_dcb: str
    drug2: str
    drug2_dcb: str
    severity: str
    description: Optional[str] = None
    description_en: Optional[str] = None
    confidence: float


@router.post("/check", response_model=InteractionCheckResponse)
def check_interaction(
    request: InteractionCheckRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check interaction severity between two drugs"""
    wait_for_model()
    model = get_model()
    translator = get_translator()

    drug1_inn = request.drug1.strip()
    drug2_inn = request.drug2.strip()

    drug1_dcb = translator.translate_drug_name(drug1_inn)
    drug2_dcb = translator.translate_drug_name(drug2_inn)

    try:
        result = model.predict(drug1_inn, drug2_inn)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting interaction: {str(e)}"
        )

    description_en = model.get_interaction_description(drug1_inn, drug2_inn)
    description_pt = translator.translate_description(description_en)

    history = HistoryEntry(
        user_id=current_user.id,
        drug1=drug1_inn,
        drug1_dcb=drug1_dcb,
        drug2=drug2_inn,
        drug2_dcb=drug2_dcb,
        severity=result["severity"],
    )
    db.add(history)
    db.commit()

    return InteractionCheckResponse(
        drug1=drug1_inn,
        drug1_dcb=drug1_dcb,
        drug2=drug2_inn,
        drug2_dcb=drug2_dcb,
        severity=result["severity"],
        description=description_pt,
        description_en=description_en,
        confidence=result["confidence"],
    )


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get interaction check history for current user"""
    history = (
        db.query(HistoryEntry)
        .filter(HistoryEntry.user_id == current_user.id)
        .order_by(HistoryEntry.timestamp.desc())
        .all()
    )

    return [
        {
            "id": str(h.id),
            "drug1": h.drug1,
            "drug1_dcb": h.drug1_dcb or h.drug1,
            "drug2": h.drug2,
            "drug2_dcb": h.drug2_dcb or h.drug2,
            "severity": h.severity,
            "timestamp": h.timestamp.isoformat(),
        }
        for h in history
    ]


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics for all interactions"""
    translator = get_translator()
    all_history = db.query(HistoryEntry).all()

    total = len(all_history)
    grave = sum(1 for h in all_history if h.severity == "Grave")
    moderada = sum(1 for h in all_history if h.severity == "Moderada")
    leve = sum(1 for h in all_history if h.severity == "Leve")

    drug_counts = {}
    for h in all_history:
        dcb1 = translator.translate_drug_name(h.drug1)
        dcb2 = translator.translate_drug_name(h.drug2)
        drug_counts[dcb1] = drug_counts.get(dcb1, 0) + 1
        drug_counts[dcb2] = drug_counts.get(dcb2, 0) + 1

    top_drugs = sorted(drug_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "totalInteractions": total,
        "graveCount": grave,
        "moderadaCount": moderada,
        "leveCount": leve,
        "topDrugs": [{"drug": d, "count": c} for d, c in top_drugs],
    }
