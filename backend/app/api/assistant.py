import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_current_patient
from app.db.session import get_session
from app.models.entities import PatientProfile, ChatSession, ChatMessage
from app.schemas.api_schemas import ChatRequest, ChatResponse
from ai.providers.gemini_provider import GeminiQuotaExceeded
from rag.retrieval.retriever import retrieve_patient_chunks
from rag.generation.generator import generate_grounded_answer

logger = logging.getLogger("medtrace.assistant")
router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    chat_session = None
    if payload.session_id:
        chat_session = session.get(ChatSession, payload.session_id)
    if not chat_session or chat_session.patient_id != patient.id:
        chat_session = ChatSession(patient_id=patient.id)
        session.add(chat_session)
        session.flush()

    session.add(ChatMessage(session_id=chat_session.id, role="user", content=payload.message))
    session.flush()

    # Patient-filtered retrieval -> grounded generation -> real sources
    chunks = retrieve_patient_chunks(payload.message, patient_id=str(patient.id), top_k=5)

    try:
        result = generate_grounded_answer(payload.message, chunks)
    except GeminiQuotaExceeded as e:
        session.commit()  # keep the user's message saved even though the reply failed
        logger.warning("Gemini quota exceeded in chat for patient %s: %s", patient.id, e)
        raise HTTPException(429, str(e))
    except Exception as e:
        session.commit()
        logger.exception("Assistant chat generation failed for patient %s", patient.id)
        raise HTTPException(500, "Assistant failed to generate a response. Please try again.")

    session.add(ChatMessage(session_id=chat_session.id, role="assistant", content=result["answer"]))
    session.commit()

    return ChatResponse(answer=result["answer"], sources=result["sources"], session_id=chat_session.id)