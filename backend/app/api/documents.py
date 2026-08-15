"""
Upload + processing pipeline. /documents/upload stores the file and metadata
(status=UPLOADED); /documents/{id}/process runs the real pipeline:
text extraction -> LLM structured extraction -> Postgres persistence ->
RAG chunk/embed/index. Every query is scoped to the authenticated patient.
"""
import logging
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select

from app.api.deps import get_current_patient
from app.core.config import get_settings
from app.db.session import get_session
from app.models.entities import Document, PatientProfile, DocumentChunk
from app.services.file_validation import validate_upload
from app.services.persistence import persist_extraction
from app.schemas.api_schemas import DocumentOut

from ai.extraction.text_extraction_service import extract_text_from_document
from ai.extraction.extract_service import run_medical_extraction, ExtractionFailedError
from ai.providers.gemini_provider import GeminiQuotaExceeded
from rag.ingestion.ingest_service import ingest_document_text

logger = logging.getLogger("medtrace.documents")
router = APIRouter(prefix="/documents", tags=["documents"])
settings = get_settings()


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("report"),
    medical_date: str | None = Form(None),
    hospital: str | None = Form(None),
    doctor: str | None = Form(None),
    patient: PatientProfile = Depends(get_current_patient),
    session: Session = Depends(get_session),
):
    content = await file.read()
    ext = validate_upload(file, content)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    stored_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_name)
    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        patient_id=patient.id,
        name=file.filename or stored_name,
        document_type=document_type,
        medical_date=datetime.fromisoformat(medical_date).date() if medical_date else None,
        hospital=hospital,
        doctor=doctor,
        file_path=file_path,
        processing_status="UPLOADED",
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


@router.get("", response_model=list[DocumentOut])
def list_documents(patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    return session.exec(select(Document).where(Document.patient_id == patient.id).order_by(Document.upload_date.desc())).all()


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: uuid.UUID, patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    doc = session.get(Document, document_id)
    if not doc or doc.patient_id != patient.id:
        raise HTTPException(404, "Document not found")
    return doc


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: uuid.UUID, patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    doc = session.get(Document, document_id)
    if not doc or doc.patient_id != patient.id:
        raise HTTPException(404, "Document not found")
    session.delete(doc)
    session.commit()


@router.post("/{document_id}/process")
def process_document(document_id: uuid.UUID, patient: PatientProfile = Depends(get_current_patient), session: Session = Depends(get_session)):
    doc = session.get(Document, document_id)
    if not doc or doc.patient_id != patient.id:
        raise HTTPException(404, "Document not found")

    doc.processing_status = "PROCESSING"
    session.add(doc)
    session.commit()

    try:
        # 1. Text extraction (PyMuPDF / OCR)
        raw_text = extract_text_from_document(doc.file_path)
        doc.raw_text = raw_text

        # 2. LLM structured extraction (validated against MedicalExtraction)
        extraction = run_medical_extraction(raw_text)

        # 3. Persist structured facts -> conditions/symptoms/labs/meds/treatments/timeline
        counts = persist_extraction(session, extraction=extraction, patient_id=patient.id, document_id=doc.id)

        # 4. RAG ingestion: chunk -> embed -> ChromaDB (+ mirror to Postgres document_chunks)
        chunk_records = ingest_document_text(
            patient_id=str(patient.id), document_id=str(doc.id), document_name=doc.name,
            document_type=doc.document_type,
            medical_date=doc.medical_date.isoformat() if doc.medical_date else None,
            raw_text=raw_text,
        )
        for c in chunk_records:
            session.add(DocumentChunk(
                patient_id=patient.id, document_id=doc.id, chunk_text=c["chunk_text"],
                chunk_index=c["chunk_index"], chunk_metadata=c["metadata"],
            ))

        doc.processing_status = "PROCESSED"
        session.add(doc)
        session.commit()

        return {
            "status": "PROCESSED",
            "facts_extracted": extraction.fact_count,
            "persisted": counts,
            "chunks_indexed": len(chunk_records),
        }
    except ExtractionFailedError as e:
        doc.processing_status = "FAILED"
        session.add(doc)
        session.commit()
        logger.error("Extraction failed for document %s: %s", document_id, e)
        raise HTTPException(422, f"AI extraction failed validation: {e}")
    except GeminiQuotaExceeded as e:
        doc.processing_status = "FAILED"
        session.add(doc)
        session.commit()
        logger.warning("Gemini quota exceeded for document %s: %s", document_id, e)
        raise HTTPException(429, str(e))
    except Exception as e:
        doc.processing_status = "FAILED"
        session.add(doc)
        session.commit()
        logger.exception("Processing failed for document %s", document_id)
        raise HTTPException(500, "Document processing failed")