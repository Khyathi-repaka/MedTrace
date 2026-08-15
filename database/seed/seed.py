"""
Seeds one demo patient (demo@medtrace.ai) with 5 synthetic documents run
through the REAL pipeline (LLM extraction -> Postgres -> RAG indexing) —
no hardcoded conditions/timeline values. Documents are plain-text stand-ins
for scanned PDFs, labelled SYNTHETIC DEMO DATA; swap in real PDFs under
sample-data/documents and this script processes them the same way.

Run from backend/ with: python -m database.seed.seed  (with PYTHONPATH set,
see README) or `docker compose run backend python -m database.seed.seed`.
"""
import glob
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "backend"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlmodel import Session, select

from app.db.session import engine, init_db
from app.core.security import hash_password
from app.models.entities import User, PatientProfile, Document, DocumentChunk
from app.services.persistence import persist_extraction
from ai.extraction.extract_service import run_medical_extraction
from rag.ingestion.ingest_service import ingest_document_text

DEMO_EMAIL = "demo@medtrace.ai"
DEMO_PASSWORD = "Demo@12345"
SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "sample-data", "documents")

DOC_TYPE_BY_KEYWORD = {
    "consultation": "consultation",
    "blood_test": "report",
    "prescription": "prescription",
}


def infer_doc_type(filename: str) -> str:
    for kw, doc_type in DOC_TYPE_BY_KEYWORD.items():
        if kw in filename:
            return doc_type
    return "report"


def main():
    init_db()
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == DEMO_EMAIL)).first()
        if user:
            print(f"Demo user {DEMO_EMAIL} already exists — skipping seed (delete DB to reseed).")
            return

        user = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD))
        session.add(user)
        session.flush()

        patient = PatientProfile(
            user_id=user.id, name="Khyathi Sharma (SYNTHETIC DEMO DATA)", age=29,
            gender="Female", blood_group="O+", allergies="Penicillin",
        )
        session.add(patient)
        session.flush()

        files = sorted(glob.glob(os.path.join(SAMPLE_DIR, "*.txt")))
        for path in files:
            filename = os.path.basename(path)
            with open(path, "r") as f:
                raw_text = f.read()

            doc = Document(
                patient_id=patient.id, name=filename, document_type=infer_doc_type(filename),
                file_path=path, processing_status="PROCESSING", raw_text=raw_text,
            )
            session.add(doc)
            session.flush()

            extraction = run_medical_extraction(raw_text)
            persist_extraction(session, extraction=extraction, patient_id=patient.id, document_id=doc.id)

            chunk_records = ingest_document_text(
                patient_id=str(patient.id), document_id=str(doc.id), document_name=doc.name,
                document_type=doc.document_type, medical_date=None, raw_text=raw_text,
            )
            for c in chunk_records:
                session.add(DocumentChunk(
                    patient_id=patient.id, document_id=doc.id, chunk_text=c["chunk_text"],
                    chunk_index=c["chunk_index"], chunk_metadata=c["metadata"],
                ))

            doc.processing_status = "PROCESSED"
            session.add(doc)
            session.commit()
            print(f"Seeded + processed: {filename} ({extraction.fact_count} facts)")

        print(f"\nDemo account ready — email: {DEMO_EMAIL}  password: {DEMO_PASSWORD}")


if __name__ == "__main__":
    main()
