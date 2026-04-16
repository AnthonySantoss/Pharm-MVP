from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import HistoryEntry, get_db
from app.services.ml_model import get_model
from app.auth.auth import get_current_active_user, User

router = APIRouter(prefix="/interactions", tags=["Interactions"])


class InteractionCheckRequest(BaseModel):
    drug1: str
    drug2: str


class InteractionCheckResponse(BaseModel):
    drug1: str
    drug2: str
    severity: str
    description: Optional[str] = None
    confidence: float


@router.post("/check", response_model=InteractionCheckResponse)
def check_interaction(
    request: InteractionCheckRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check interaction severity between two drugs"""
    model = get_model()

    try:
        result = model.predict(request.drug1, request.drug2)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting interaction: {str(e)}"
        )

    # Get description from dataset
    description = model.get_interaction_description(request.drug1, request.drug2)

    # Save to history
    history = HistoryEntry(
        user_id=current_user.id,
        drug1=request.drug1,
        drug2=request.drug2,
        severity=result["severity"],
    )
    db.add(history)
    db.commit()

    return InteractionCheckResponse(
        drug1=request.drug1,
        drug2=request.drug2,
        severity=result["severity"],
        description=description,
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
        .limit(50)
        .all()
    )

    return [
        {
            "id": str(h.id),
            "drug1": h.drug1,
            "drug2": h.drug2,
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
    all_history = db.query(HistoryEntry).all()

    total = len(all_history)
    grave = sum(1 for h in all_history if h.severity == "Grave")
    moderada = sum(1 for h in all_history if h.severity == "Moderada")
    leve = sum(1 for h in all_history if h.severity == "Leve")

    # Top drugs
    drug_counts = {}
    for h in all_history:
        drug_counts[h.drug1] = drug_counts.get(h.drug1, 0) + 1
        drug_counts[h.drug2] = drug_counts.get(h.drug2, 0) + 1

    top_drugs = sorted(drug_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "totalInteractions": total,
        "graveCount": grave,
        "moderadaCount": moderada,
        "leveCount": leve,
        "topDrugs": [{"drug": d, "count": c} for d, c in top_drugs],
    }