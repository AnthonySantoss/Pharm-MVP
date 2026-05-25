import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, medications, interactions, admin, models
from app.database.database import init_db
from app.services.ml_model import init_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("Initializing ML model...")
    init_model()
    print("ML model loaded successfully")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="PharmIA API",
    description="Drug Interaction Analysis API with ML-powered severity classification",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(medications.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(models.router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": "PharmIA API",
        "version": "1.0.0",
        "description": "Drug Interaction Analysis API"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}