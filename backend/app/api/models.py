from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.ml_model import get_model, get_model_metrics, wait_for_model
from app.auth.auth import get_current_active_user, User

router = APIRouter(prefix="/models", tags=["Models"])


class ModelMetrics(BaseModel):
    model: str
    accuracy: float
    f1_weighted: float
    f1_macro: float
    precision_class: dict[str, float]
    recall_class: dict[str, float]


class ModelsCompareResponse(BaseModel):
    models: list[ModelMetrics]
    classes: list[str]
    confusion_matrix: list[dict]
    cross_val_accuracy: float


@router.get("/compare", response_model=ModelsCompareResponse)
def compare_models(
    current_user: User = Depends(get_current_active_user),
):
    """Compare all trained models' metrics"""
    wait_for_model()
    model = get_model()
    metrics = get_model_metrics()

    return ModelsCompareResponse(
        models=[
            ModelMetrics(
                model=name,
                accuracy=m["accuracy"],
                f1_weighted=m["f1_weighted"],
                f1_macro=m["f1_macro"],
                precision_class=m["precision_class"],
                recall_class=m["recall_class"],
            )
            for name, m in metrics.items()
        ],
        classes=metrics["baseline"]["classes"],
        confusion_matrix=model.get_confusion_matrix(),
        cross_val_accuracy=model.get_cross_val_accuracy(),
    )