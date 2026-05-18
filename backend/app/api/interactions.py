from typing import Optional
from itertools import combinations

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


class MultiDrugInteractionRequest(BaseModel):
    drugs: list[str]


class InteractionPairResult(BaseModel):
    drug1: str
    drug1_dcb: str
    drug2: str
    drug2_dcb: str
    severity: str
    description: Optional[str] = None
    description_en: Optional[str] = None
    confidence: float


class MultiDrugInteractionResponse(BaseModel):
    drugs: list[str]
    drugs_dcb: list[str]
    pairs_checked: int
    interactions: list[InteractionPairResult]
    summary: dict


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
    description_pt = translator.translate_description(description_en, drug1_inn, drug2_inn)
    if description_pt == "Descrição da interação não disponível.":
        description_pt = translator.generate_fallback_description(drug1_inn, drug2_inn, result["severity"])

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


@router.post("/check-multi", response_model=MultiDrugInteractionResponse)
def check_multi_drug_interaction(
    request: MultiDrugInteractionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check interactions between multiple drugs (all pairs)"""
    wait_for_model()
    model = get_model()
    translator = get_translator()

    drugs = [d.strip() for d in request.drugs if d.strip()]
    
    if len(drugs) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 drugs are required"
        )
    
    if len(drugs) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 drugs allowed"
        )

    drugs_dcb = []
    for drug in drugs:
        dcb = translator.translate_drug_name(drug)
        drugs_dcb.append(dcb if dcb else drug)

    pairs = list(combinations(range(len(drugs)), 2))
    interactions = []
    grave_count = 0
    moderada_count = 0
    leve_count = 0

    for i, j in pairs:
        drug1 = drugs[i]
        drug2 = drugs[j]
        drug1_dcb = drugs_dcb[i]
        drug2_dcb = drugs_dcb[j]

        result = model.predict(drug1, drug2)
        description_en = model.get_interaction_description(drug1, drug2)
        description_pt = translator.translate_description(description_en, drug1, drug2)
        if description_pt == "Descrição da interação não disponível.":
            description_pt = translator.generate_fallback_description(drug1, drug2, result["severity"])

        if result["severity"] == "Grave":
            grave_count += 1
        elif result["severity"] == "Moderada":
            moderada_count += 1
        else:
            leve_count += 1

        interactions.append(
            InteractionPairResult(
                drug1=drug1,
                drug1_dcb=drug1_dcb,
                drug2=drug2,
                drug2_dcb=drug2_dcb,
                severity=result["severity"],
                description=description_pt,
                description_en=description_en,
                confidence=result["confidence"],
            )
        )

        history = HistoryEntry(
            user_id=current_user.id,
            drug1=drug1,
            drug1_dcb=drug1_dcb,
            drug2=drug2,
            drug2_dcb=drug2_dcb,
            severity=result["severity"],
        )
        db.add(history)

    db.commit()

    return MultiDrugInteractionResponse(
        drugs=drugs,
        drugs_dcb=drugs_dcb,
        pairs_checked=len(pairs),
        interactions=interactions,
        summary={
            "grave": grave_count,
            "moderada": moderada_count,
            "leve": leve_count,
            "total": len(pairs),
        },
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
            "timestamp": h.timestamp.isoformat() + "Z",
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

    recent_history = (
        db.query(HistoryEntry)
        .filter(HistoryEntry.user_id == current_user.id)
        .order_by(HistoryEntry.timestamp.desc())
        .limit(5)
        .all()
    )

    recent_queries = [
        {
            "drug1": translator.translate_drug_name(h.drug1),
            "drug2": translator.translate_drug_name(h.drug2),
            "severity": h.severity,
            "timestamp": h.timestamp.isoformat() + "Z",
        }
        for h in recent_history
    ]

    return {
        "totalInteractions": total,
        "graveCount": grave,
        "moderadaCount": moderada,
        "leveCount": leve,
        "topDrugs": [{"drug": d, "count": c} for d, c in top_drugs],
        "recentQueries": recent_queries,
    }
