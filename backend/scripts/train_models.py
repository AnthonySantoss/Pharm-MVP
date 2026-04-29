"""Script para treinar todos os modelos ML e salvar em arquivos .joblib.

Usage:
    python scripts/train_models.py

Este script:
1. Carrega o dataset de interações medicamentosas
2. Treina 3 modelos (Baseline, LogisticRegression, MultinomialNB)
3. Salva cada modelo e o preprocessor em arquivos .joblib
4. Gera relatório de métricas
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import re
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction import DictVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report


def classify_severity(text: str) -> str:
    if not isinstance(text, str):
        text = ""
    t = text.lower()

    severe = [
        r"contraindicat", r"life[- ]?threat", r"\bfatal\b", r"\bsevere\b",
        r"boxed warning", r"black box", r"avoid use", r"do not use", r"discontinue",
        r"hospitaliz", r"\banaphyl", r"hepat", r"renal failure", r"coma", r"\bdeath\b"
    ]
    moderate = [
        r"\bmoderate\b", r"monitor", r"caution", r"dose adjustment", r"avoid concomitant",
        r"may increase", r"may decrease", r"potential", r"interact", r"increase risk",
        r"increase", r"decrease",
    ]
    mild = [
        r"\bmild\b", r"\bminor\b", r"no significant", r"not clinically significant",
        r"transient", r"self-limited",
        r"photosensit", r"photosensitiz", r"photosensitive", r"photosensitizing",
    ]

    score = 0
    for kw in severe:
        if re.search(kw, t):
            score += 2
    for kw in moderate:
        if re.search(kw, t):
            score += 1
    for kw in mild:
        if re.search(kw, t):
            score -= 1

    if score >= 2:
        return "Grave"
    if score == 1:
        return "Moderada"
    return "Leve"


def load_data(data_path: Path) -> pd.DataFrame:
    df = pd.read_csv(data_path)
    df["drug_1"] = df["Drug 1"].astype(str).str.strip().str.lower()
    df["drug_2"] = df["Drug 2"].astype(str).str.strip().str.lower()
    df["severity"] = df["Interaction Description"].apply(classify_severity)
    return df


def find_data_path() -> Optional[Path]:
    candidates = [
        Path(__file__).parent.parent / "data" / "db_drug_interactions.csv",
        Path(__file__).parent.parent.parent / "data" / "db_drug_interactions.csv",
        Path("/app/data/db_drug_interactions.csv"),
        Path.home() / "Documentos/faculdade/Pharm-MVP/data/db_drug_interactions.csv",
    ]
    for path in candidates:
        if path.exists():
            return path
    return None


def main():
    print("=" * 60)
    print("TRAINING SCRIPT - PharmIA Drug Interaction Models")
    print("=" * 60)

    data_path = find_data_path()
    if data_path is None:
        print("ERROR: db_drug_interactions.csv not found!")
        sys.exit(1)

    print(f"\nLoading data from: {data_path}")
    df = load_data(data_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Severity distribution:\n{df['severity'].value_counts()}")

    X = df[["drug_1", "drug_2"]]
    y = df["severity"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    categorical_features = ["drug_1", "drug_2"]
    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", DictVectorizer(sparse=False)),
    ])
    preprocessor = ColumnTransformer(
        transformers=[("cat", categorical_transformer, categorical_features)],
        remainder="drop"
    )

    severity_encoder = LabelEncoder()
    y_train_enc = severity_encoder.fit_transform(y_train)
    y_test_enc = severity_encoder.transform(y_test)

    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    models = {}

    print("\n--- Training Baseline (Most Frequent) ---")
    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train_t, y_train_enc)
    models["baseline"] = baseline

    print("\n--- Training Logistic Regression ---")
    logreg = LogisticRegression(max_iter=2000, solver="lbfgs", random_state=42)
    logreg.fit(X_train_t, y_train_enc)
    models["logistic_regression"] = logreg

    print("\n--- Training Multinomial Naive Bayes ---")
    nb = MultinomialNB()
    nb.fit(X_train_t, y_train_enc)
    models["multinomial_nb"] = nb

    print("\n" + "=" * 60)
    print("METRICS COMPARISON (Test Set)")
    print("=" * 60)

    results = []
    for name, model in models.items():
        y_pred = model.predict(X_test_t)
        acc = accuracy_score(y_test_enc, y_pred)
        f1_w = f1_score(y_test_enc, y_pred, average="weighted")
        f1_m = f1_score(y_test_enc, y_pred, average="macro")
        results.append({
            "model": name,
            "accuracy": acc,
            "f1_weighted": f1_w,
            "f1_macro": f1_m,
        })
        print(f"\n{name}:")
        print(f"  Accuracy:     {acc:.6f}")
        print(f"  F1 Weighted: {f1_w:.6f}")
        print(f"  F1 Macro:    {f1_m:.6f}")
        print(f"\nClassification Report:\n{classification_report(y_test_enc, y_pred, target_names=severity_encoder.classes_)}")

    models_dir = Path(__file__).parent.parent / "models"
    models_dir.mkdir(exist_ok=True)

    joblib.dump({
        "preprocessor": preprocessor,
        "severity_encoder": severity_encoder,
        "models": models,
        "_df": df,
        "_is_trained": True,
        "_train_metrics": {r["model"]: r for r in results},
    }, models_dir / "preprocessor.joblib")

    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values("f1_weighted", ascending=False)
    results_df.to_csv(models_dir / "model_comparison.csv", index=False)

    print(f"\n\nModels saved to: {models_dir}")
    print("Files: preprocessor.joblib (all artifacts), model_comparison.csv")
    print(f"\nBest model (F1 Weighted): {results_df.iloc[0]['model']} ({results_df.iloc[0]['f1_weighted']:.6f})")

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()