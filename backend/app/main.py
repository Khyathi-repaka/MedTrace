import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.session import init_db
from app.api import auth, patients, documents, health_history, search, assistant

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="MedTrace AI API",
    description="Every record. One health story. — AI-powered medical record "
                 "organization, search and health-history intelligence.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(documents.router)
app.include_router(health_history.router)
app.include_router(search.router)
app.include_router(assistant.router)


@app.get("/", tags=["meta"])
def root():
    return {
        "message": "MedTrace AI API is running.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["meta"])
def health():
    return {
        "status": "ok",
        "app": "MedTrace AI",
        "ai_provider": settings.AI_PROVIDER,
        "demo_mode": settings.demo_mode,
        "disclaimer": (
            "MedTrace AI helps organize and understand medical records. "
            "It does not provide medical diagnosis or replace professional "
            "medical advice. Always consult a qualified healthcare professional "
            "for medical decisions."
        ),
    }