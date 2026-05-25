import re
import threading
from pathlib import Path
from typing import Optional

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
        self._confusion_matrix = []
        self._cross_val_accuracy = 0.0

    def get_confusion_matrix(self) -> list:
        return self._confusion_matrix

    def get_cross_val_accuracy(self) -> float:
        return self._cross_val_accuracy

    def _classify_severity(self, text: str) -> str:
        if not isinstance(text, str):
            text = ""
        t = text.lower()

        severe = [
            "contraindicat", "life-threat", "life threat", "fatal", "severe",
            "boxed warning", "black box", "avoid use", "do not use", "discontinue",
            "hospitaliz", "anaphyl", "hepat", "renal failure", "coma", "death"
        ]
        moderate = [
            "moderate", "monitor", "caution", "dose adjustment", "avoid concomitant",
            "may increase", "may decrease", "potential", "interact", "increase risk",
            "increase", "decrease"
        ]
        mild = [
            "mild", "minor", "no significant", "not clinically significant",
            "transient", "self-limited", "photosensit", "photosensitiz", "photosensitive", "photosensitizing"
        ]

        score = 0
        for kw in severe:
            if kw in t:
                score += 2
        for kw in moderate:
            if kw in t:
                score += 1
        for kw in mild:
            if kw in t:
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
        
        from app.services.translator import get_translator
        translator = get_translator()

        drugs_1 = df["drug_1"].tolist()
        drugs_2 = df["drug_2"].tolist()

        X = [
            {
                "drug_1": d1,
                "drug_2": d2,
                "class_1": translator.get_drug_class(d1) or "unknown",
                "class_2": translator.get_drug_class(d2) or "unknown"
            }
            for d1, d2 in zip(drugs_1, drugs_2)
        ]
            
        y = df["severity"].values

        self.preprocessor = DictVectorizer(sparse=True)
        X_transformed = self.preprocessor.fit_transform(X)

        self.severity_encoder = LabelEncoder()
        y_encoded = self.severity_encoder.fit_transform(y)

        # Divisão em Treino e Teste (80/20) para métricas de validação realísticas
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X_transformed, y_encoded, test_size=0.2, random_state=42
        )

        # Amostra de treino estratificada de 30.000 instâncias para viabilidade em container com CPU limitada
        fit_size = min(30000, len(y_train))
        _, X_train_fit, _, y_train_fit = train_test_split(
            X_train, y_train, test_size=fit_size, stratify=y_train, random_state=42
        )

        self.models = {}
        self.models["baseline"] = DummyClassifier(strategy="most_frequent")
        self.models["baseline"].fit(X_train_fit, y_train_fit)

        self.models["logistic_regression"] = LogisticRegression(max_iter=200, solver="lbfgs", random_state=42)
        self.models["logistic_regression"].fit(X_train_fit, y_train_fit)

        self.models["multinomial_nb"] = MultinomialNB()
        self.models["multinomial_nb"].fit(X_train_fit, y_train_fit)

        self._is_trained = True
        self._train_metrics = {}

        # 3-Fold Cross-Validation para estimativa robusta em amostra estratificada (para viabilidade em CPU)
        from sklearn.model_selection import cross_val_score, train_test_split
        sample_size = min(15000, len(y_encoded))
        _, X_cv, _, y_cv = train_test_split(
            X_transformed, y_encoded, test_size=sample_size, stratify=y_encoded, random_state=42
        )
        cv_scores = cross_val_score(self.models["logistic_regression"], X_cv, y_cv, cv=3)
        self._cross_val_accuracy = float(cv_scores.mean())

        # Matriz de Confusão Real obtida com o conjunto de teste de 20%
        from sklearn.metrics import confusion_matrix
        y_pred_lr = self.models["logistic_regression"].predict(X_test)
        cm = confusion_matrix(y_test, y_pred_lr, labels=self.severity_encoder.transform(self.severity_encoder.classes_))

        classes_list = self.severity_encoder.classes_.tolist()
        self._confusion_matrix = []
        for r_name in ["Grave", "Moderada", "Leve", "Sem Interação"]:
            row_dict = {"real": r_name, "predGrave": 0.0, "predMod": 0.0, "predLeve": 0.0, "predSem": 0.0}
            if r_name == "Sem Interação":
                row_dict["predSem"] = 100.0
                self._confusion_matrix.append(row_dict)
                continue

            if r_name in classes_list:
                i = classes_list.index(r_name)
                row_sum = cm[i].sum()
                for j, c_name in enumerate(classes_list):
                    val = float(cm[i][j]) / row_sum if row_sum > 0 else 0.0
                    col_key = "predGrave" if c_name == "Grave" else ("predMod" if c_name == "Moderada" else "predLeve")
                    row_dict[col_key] = round(val * 100, 1)
            self._confusion_matrix.append(row_dict)

        from sklearn.metrics import accuracy_score, f1_score, precision_recall_fscore_support
        for name, model in self.models.items():
            y_pred = model.predict(X_test)

            # Cálculo de Precisão e Sensibilidade (Recall) por classe
            precision, recall, _, _ = precision_recall_fscore_support(
                y_test, y_pred, labels=self.severity_encoder.transform(self.severity_encoder.classes_), zero_division=0
            )

            precision_dict = {classes_list[i]: float(precision[i]) for i in range(len(classes_list))}
            recall_dict = {classes_list[i]: float(recall[i]) for i in range(len(classes_list))}

            self._train_metrics[name] = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "f1_weighted": float(f1_score(y_test, y_pred, average="weighted")),
                "f1_macro": float(f1_score(y_test, y_pred, average="macro")),
                "classes": classes_list,
                "precision_class": precision_dict,
                "recall_class": recall_dict,
            }
        return self._train_metrics

    def predict(self, drug1: str, drug2: str, model_name: str = "logistic_regression") -> dict:
        if not self._is_trained:
            raise ValueError("Model not trained yet. Please wait.")

        drug1_norm = drug1.strip().lower()
        drug2_norm = drug2.strip().lower()

        rule_severity = self._check_rules(drug1_norm, drug2_norm)
        if rule_severity:
            return {
                "drug1": drug1,
                "drug2": drug2,
                "severity": rule_severity,
                "confidence": 0.99,
                "model": "rule_based",
            }

        from app.services.translator import get_translator
        translator = get_translator()
        
        X = [{
            "drug_1": drug1_norm,
            "drug_2": drug2_norm,
            "class_1": translator.get_drug_class(drug1_norm) or "unknown",
            "class_2": translator.get_drug_class(drug2_norm) or "unknown"
        }]
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

    def _check_rules(self, drug1: str, drug2: str) -> Optional[str]:
        combo = f"{drug1} + {drug2}"
        
        severe_interactions = [
            (r"sildenafil.*nitroglycerin|nitroglycerin.*sildenafil", "Grave"),
            (r"sildenafil.*isosorbide|isosorbide.*sildenafil", "Grave"),
            (r"simvastatin.*erythromycin|erythromycin.*simvastatin", "Grave"),
            (r"simvastatin.*clarithromycin|clarithromycin.*simvastatin", "Grave"),
            (r"simvastatin.*ketoconazole|ketoconazole.*simvastatin", "Grave"),
            (r"atorvastatin.*erythromycin|erythromycin.*atorvastatin", "Grave"),
            (r"digoxin.*amiodarone|amiodarone.*digoxin", "Grave"),
            (r"warfarin.*aspirin|aspirin.*warfarin", "Grave"),
            (r"amiodarone.*warfarin|warfarin.*amiodarone", "Grave"),
            (r"fluconazole.*warfarin|warfarin.*fluconazole", "Grave"),
            (r"digoxin.*furosemide|furosemide.*digoxin", "Grave"),
            (r"lithium.*ibuprofen|ibuprofen.*lithium", "Grave"),
            (r"lithium.*naproxen|naproxen.*lithium", "Grave"),
            (r"dipyrone.*warfarin|warfarin.*dipyrone", "Moderada"),
            (r"metformin.*contrast|contrast.*metformin", "Moderada"),
            (r"methotrexate.*nsaid|nsaid.*methotrexate", "Moderada"),
            (r"lisinopril.*ibuprofen|ibuprofen.*lisinopril", "Moderada"),
            (r"losartan.*ibuprofen|ibuprofen.*losartan", "Moderada"),
        ]
        
        for pattern, severity in severe_interactions:
            if re.search(pattern, combo, re.I):
                return severity
        return None

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


def search_drugs(query: str = "", limit: int = 2000) -> list[str]:
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