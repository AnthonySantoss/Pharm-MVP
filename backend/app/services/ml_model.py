import re
import threading
from pathlib import Path

import joblib
import pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import LabelEncoder


class DrugInteractionModel:
    def __init__(self):
        self.preprocessor = None
        self.severity_encoder = None
        self.models = {}
        self._df = None
        self._is_trained = False
        self._train_metrics = {}

    def _classify_severity(self, text: str) -> str:
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

    def load_data(self, data_path: Path) -> pd.DataFrame:
        df = pd.read_csv(data_path)
        df["drug_1"] = df["Drug 1"].astype(str).str.strip().str.lower()
        df["drug_2"] = df["Drug 2"].astype(str).str.strip().str.lower()
        df["severity"] = df["Interaction Description"].apply(self._classify_severity)
        self._df = df
        return df

    def train(self, data_path: Path) -> dict:
        df = self.load_data(data_path)
        X = df[["drug_1", "drug_2"]].to_dict("records")
        y = df["severity"].values

        self.preprocessor = DictVectorizer(sparse=False)
        X_transformed = self.preprocessor.fit_transform(X)

        self.severity_encoder = LabelEncoder()
        y_encoded = self.severity_encoder.fit_transform(y)

        self.models = {}
        self.models["baseline"] = DummyClassifier(strategy="most_frequent")
        self.models["baseline"].fit(X_transformed, y_encoded)

        self.models["logistic_regression"] = LogisticRegression(max_iter=2000, solver="lbfgs", random_state=42)
        self.models["logistic_regression"].fit(X_transformed, y_encoded)

        self.models["multinomial_nb"] = MultinomialNB()
        self.models["multinomial_nb"].fit(X_transformed, y_encoded)

        self._is_trained = True
        self._train_metrics = {}
        for name, model in self.models.items():
            from sklearn.metrics import accuracy_score, f1_score
            y_pred = model.predict(X_transformed)
            self._train_metrics[name] = {
                "accuracy": float(accuracy_score(y_encoded, y_pred)),
                "f1_weighted": float(f1_score(y_encoded, y_pred, average="weighted")),
                "f1_macro": float(f1_score(y_encoded, y_pred, average="macro")),
                "classes": self.severity_encoder.classes_.tolist(),
            }
        return self._train_metrics

    def predict(self, drug1: str, drug2: str, model_name: str = "logistic_regression") -> dict:
        if not self._is_trained:
            raise ValueError("Model not trained yet. Please wait.")

        drug1_norm = drug1.strip().lower()
        drug2_norm = drug2.strip().lower()
        X = [{"drug_1": drug1_norm, "drug_2": drug2_norm}]
        X_transformed = self.preprocessor.transform(X)

        model = self.models.get(model_name)
        if model is None:
            raise ValueError(f"Model '{model_name}' not found. Available: {list(self.models.keys())}")

        y_pred = model.predict(X_transformed)[0]
        severity = self.severity_encoder.inverse_transform([y_pred])[0]
        proba = model.predict_proba(X_transformed)[0]
        confidence = float(proba[y_pred])

        return {
            "drug1": drug1,
            "drug2": drug2,
            "severity": severity,
            "confidence": confidence,
            "model": model_name,
        }

    def get_metrics(self) -> dict:
        return self._train_metrics

    def get_interaction_description(self, drug1: str, drug2: str) -> str:
        drug1_norm = drug1.strip().lower()
        drug2_norm = drug2.strip().lower()
        if self._df is None:
            return "Interaction description not available."
        mask = (
            ((self._df["drug_1"] == drug1_norm) & (self._df["drug_2"] == drug2_norm)) |
            ((self._df["drug_1"] == drug2_norm) & (self._df["drug_2"] == drug1_norm))
        )
        if mask.any():
            idx = self._df[mask].index[0]
            return self._df.loc[idx, "Interaction Description"]
        return "Interaction description not available."


def _find_data_path() -> Path:
    candidates = [
        Path(__file__).parent.parent.parent / "data" / "db_drug_interactions.csv",
        Path("/app/data/db_drug_interactions.csv"),
        Path("/home/mrshaun/Documentos/faculdade/Pharm-MVP/data/db_drug_interactions.csv"),
        Path("./data/db_drug_interactions.csv"),
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError(f"Could not find db_drug_interactions.csv. Tried: {candidates}")


model_instance = None
model_df = None
model_metrics = None
_model_ready = threading.Event()
_model_error = None


def _train_in_background():
    global model_instance, model_df, model_metrics, _model_error
    try:
        data_path = _find_data_path()
        print(f"Training models with data from: {data_path}")
        model_instance = DrugInteractionModel()
        model_df = model_instance.load_data(data_path)
        model_metrics = model_instance.train(data_path)
        print("Models trained successfully:")
        for name, m in model_metrics.items():
            print(f"  {name}: accuracy={m['accuracy']:.4f}, f1_weighted={m['f1_weighted']:.4f}, f1_macro={m['f1_macro']:.4f}")
        _model_ready.set()
    except Exception as e:
        _model_error = e
        print(f"ERROR training models: {e}")
        _model_ready.set()


def init_model():
    global model_instance
    if model_instance is None:
        t = threading.Thread(target=_train_in_background, daemon=True)
        t.start()


def wait_for_model():
    """Block until model is trained and ready."""
    _model_ready.wait()


def get_model() -> DrugInteractionModel:
    if model_instance is None:
        init_model()
    return model_instance


def get_model_metrics() -> dict:
    if model_metrics is None:
        get_model()
    return model_metrics


def search_drugs(query: str = "", limit: int = 50) -> list[str]:
    wait_for_model()
    if model_df is None:
        get_model()
    all_drugs = set(model_df["drug_1"].unique()) | set(model_df["drug_2"].unique())
    if query:
        query_lower = query.lower()
        drugs = [d for d in all_drugs if query_lower in d.lower()]
    else:
        drugs = list(all_drugs)
    return sorted(drugs)[:limit]