# MedTrace AI — Architecture

## System overview

```
Frontend (Next.js/React/TS)
        │  HTTPS / JSON (+ multipart for uploads)
        ▼
FastAPI backend (JWT-authenticated)
        │
        ▼
PostgreSQL (patients, documents, conditions, symptoms, lab_results,
            medications, treatments, timeline_events, document_chunks,
            chat_sessions, chat_messages)
```

## Document → structured data pipeline

```
Upload (PDF/JPG/PNG)
   │  file_validation.py (type, size, non-empty)
   ▼
Document row (status=UPLOADED) + file saved to UPLOAD_DIR
   │  POST /documents/{id}/process
   ▼
text_extraction_service.py
   ├─ PDF: PyMuPDF (pdf_extract.py) — detects low-text (scanned) pages
   │        └─ falls back to Tesseract OCR (ocr_extract.py) if needed
   └─ JPG/PNG: Tesseract OCR directly
   ▼
raw_text stored on Document row (traceability)
   ▼
extract_service.py
   ├─ ai/prompts/extraction_prompt.py — strict "no inference" system prompt
   ├─ ai/providers/factory.py — OpenAI | Gemini | demo (env-selected)
   └─ validated against ai/schemas/extraction.py::MedicalExtraction
      (retry once on invalid JSON, else mark document FAILED)
   ▼
persistence.py — writes:
   diagnoses      → conditions (+ timeline_events)
   symptoms       → symptoms
   lab_results    → lab_results (+ timeline_events)
   medications    → medications, treatments (+ timeline_events)
   ▼
ingest_service.py (RAG indexing, runs in the same request)
   ├─ chunker.py — 800 char chunks, 150 char overlap
   ├─ embedder.py — sentence-transformers/all-MiniLM-L6-v2 (local, free)
   └─ vector_store.py — ChromaDB upsert, metadata={patient_id, document_id,
                          document_name, document_type, medical_date}
   ▼
document_chunks mirrored into Postgres for traceability
```

## RAG query pipeline (semantic search & assistant)

```
User query (POST /search or /assistant/chat)
   │
   ▼
retriever.py::retrieve_patient_chunks(query, patient_id)
   ├─ embedder.py — embed the query text
   └─ vector_store.py::query_patient_chunks
        └─ ChromaDB .query(..., where={"patient_id": <authenticated patient>})
           ← isolation enforced INSIDE the vector query, not after
   ▼
[/search]  → ranked chunks returned directly with document/date metadata
[/assistant/chat] → generator.py::generate_grounded_answer
      ├─ ai/prompts/assistant_prompt.py — grounded-only, no diagnosis/
      │    prescription, mandatory "couldn't find" fallback string
      └─ provider.complete_text(...) → answer + sources list built from
           the chunks that were actually retrieved (never fabricated)
```

## Patient isolation (cross-cutting)

Every entity that stores patient data carries a `patient_id` FK. Every query
in `backend/app/api/*` is scoped through `get_current_patient` (derived from
the JWT — never from client input). The vector store additionally enforces
isolation at the ChromaDB query layer. See `SECURITY.md` and
`backend/tests/test_patient_isolation.py`.

## Provider abstraction

`ai/providers/base.py` defines `LLMProvider` (`complete_json`,
`complete_text`). `openai_provider.py` and `gemini_provider.py` implement it
against the respective SDKs; `demo_provider.py` implements it with a small
deterministic heuristic extractor so the full pipeline is exercisable without
a live API key (`AI_PROVIDER=demo`, the default). `factory.py` is the single
switch point — nothing else in the codebase imports a specific provider.
