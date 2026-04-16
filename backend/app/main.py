from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path("/app/app/../../data/db_drug_interactions.csv").resolve()

@app.get("/api/interactions")
def get_interactions():
    df = pd.read_csv(DATA_PATH)
    return df.sample(10).to_dict(orient="records")
