import re
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder


class DrugInteractionModel:
    """ML model for drug interaction severity classification"""

    def __init__(self):
        self.drug_vectorizer = None
        self.severity_encoder = None
        self.model = None
        self._df = None
        self._is_loaded = False

    def _classify_severity(self, text: str) -> str:
        """Heuristic-based severity classification from description"""
        if not isinstance(text, str):
            text = ""
        t = text.lower()

        severe = [
            r"contraindicat", r"life[- ]?threat", r"\bfatal\b", r"\bsevere\b",
            r"boxed warning", r"black box", r"avoid use", r"do not use", r"discontinue",
            r"hospitaliz", r"\banaphyl", r"hepat", r"renal failure", r"comma", r"\bdeath\b"
        ]
        moderate = [
            r"\bmoderate\b", r"monitor", r"caution", r"dose adjustment", r"avoid concomitant",
            r"may increase", r"may decrease", r"potential", r"interact", r"increase risk", r"increase", r"decrease",
        ]
        mild = [
            r"\bmild\b", r"\bminor\b", r"no significant", r"not clinically significant", r"transient", r"self-limited",
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

    def load_data(self, data_path: Path):
        """Load and preprocess the drug interactions dataset"""
        df = pd.read_csv(data_path)

        # Normalize drug names
        df["drug_1"] = df["Drug 1"].astype(str).str.strip().str.lower()
        df["drug_2"] = df["Drug 2"].astype(str).str.strip().str.lower()

        # Classify severity using heuristic
        df["severity"] = df["Interaction Description"].apply(self._classify_severity)

        self._df = df
        return df

    def train(self, data_path: Path):
        """Train the Logistic Regression model"""
        df = self.load_data(data_path)

        # Create feature vectors from drug pairs
        X = df[["drug_1", "drug_2"]].to_dict("records")
        y = df["severity"].values

        # Encode features
        self.drug_vectorizer = DictVectorizer(sparse=False)
        X_encoded = self.drug_vectorizer.fit_transform(X)

        # Encode labels
        self.severity_encoder = LabelEncoder()
        y_encoded = self.severity_encoder.fit_transform(y)

        # Train Logistic Regression
        # sklearn 1.8+ removed multi_class parameter, auto-detection is default
        self.model = LogisticRegression(
            max_iter=2000,
            solver="lbfgs",
            random_state=42
        )
        self.model.fit(X_encoded, y_encoded)

        self._is_loaded = True

        return {
            "accuracy": self.model.score(X_encoded, y_encoded),
            "classes": self.severity_encoder.classes_.tolist(),
        }

    def predict(self, drug1: str, drug2: str) -> dict:
        """Predict severity for a drug pair"""
        if not self._is_loaded:
            raise ValueError("Model not loaded. Call train() first.")

        drug1_norm = drug1.strip().lower()
        drug2_norm = drug2.strip().lower()

        # Create feature vector
        X = [{"drug_1": drug1_norm, "drug_2": drug2_norm}]
        X_encoded = self.drug_vectorizer.transform(X)

        # Predict
        y_pred = self.model.predict(X_encoded)[0]
        severity = self.severity_encoder.inverse_transform([y_pred])[0]

        # Get probability
        proba = self.model.predict_proba(X_encoded)[0]
        confidence = float(proba[y_pred])

        return {
            "drug1": drug1,
            "drug2": drug2,
            "severity": severity,
            "confidence": confidence,
        }

    def get_interaction_description(self, drug1: str, drug2: str, dataset_df=None) -> str:
        """Get the interaction description from the dataset"""
        drug1_norm = drug1.strip().lower()
        drug2_norm = drug2.strip().lower()

        # Look for the interaction in the dataset
        df = dataset_df or self._df
        if df is None:
            return "Interaction description not available."
            
        mask = (
            ((df["drug_1"] == drug1_norm) & (df["drug_2"] == drug2_norm)) |
            ((df["drug_1"] == drug2_norm) & (df["drug_2"] == drug1_norm))
        )

        if mask.any():
            idx = df[mask].index[0]
            return df.loc[idx, "Interaction Description"]

        return "Interaction description not available."


# Global model instance
model = None
df = None


def init_model():
    """Initialize the model on startup"""
    global model, df

    # Try multiple paths for data file
    possible_paths = [
        Path(__file__).parent.parent.parent / "data" / "db_drug_interactions.csv",
        Path("/app/data/db_drug_interactions.csv"),
        Path("/home/mrshaun/Documentos/faculdade/Pharm-MVP/data/db_drug_interactions.csv"),
        Path("./data/db_drug_interactions.csv"),
    ]

    data_path = None
    for path in possible_paths:
        if path.exists():
            data_path = path
            break

    if data_path is None:
        raise FileNotFoundError(f"Could not find db_drug_interactions.csv. Tried: {possible_paths}")

    print(f"Loading data from: {data_path}")

    model = DrugInteractionModel()
    df = model.load_data(data_path)
    model.train(data_path)


def get_model():
    """Get the model instance"""
    if model is None:
        init_model()
    return model


def search_drugs(query: str = "", limit: int = 50) -> list[str]:
    """Search for drugs in the dataset"""
    if df is None:
        get_model()

    all_drugs = set(df["drug_1"].unique()) | set(df["drug_2"].unique())

    if query:
        query_lower = query.lower()
        drugs = [d for d in all_drugs if query_lower in d.lower()]
    else:
        drugs = list(all_drugs)

    return sorted(drugs)[:limit]