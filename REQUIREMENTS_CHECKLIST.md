# MedTrace AI — Requirements Checklist

Legend: [x] implemented in code this session · [ ] scaffolded / next step

## Authentication
- [x] Register — `POST /auth/register` (`backend/app/api/auth.py`)
- [x] Login — `POST /auth/login`, JWT — `backend/app/core/security.py`
- [x] Password hashing (bcrypt via passlib)
- [x] Protected routes — `get_current_patient` dependency
- [x] Patient profile — `GET /patients/me`, `patient_profiles` model

## Documents
- [x] Upload PDF/JPG/JPEG/PNG — `POST /documents/upload`
- [x] File validation (type, size) — `backend/app/services/file_validation.py`
- [x] Metadata fields (name, type, medical_date, upload_date, hospital, doctor)
- [x] Processing status state machine — `backend/app/models/document.py`
- [x] PDF text extraction — `ai/extraction/pdf_extract.py` (PyMuPDF)
- [x] OCR fallback for scans/images — `ai/extraction/ocr_extract.py` (Tesseract)

## AI Extraction
- [x] Structured Pydantic schemas — `ai/schemas/extraction.py`
- [x] Provider abstraction (OpenAI/Gemini, env-selected) — `ai/providers/`
- [x] Strict extraction prompt (no inference/invention) — `ai/prompts/extraction_prompt.py`
- [x] Validation + retry-on-invalid — `ai/extraction/extract_service.py`
- [x] Persistence to conditions/symptoms/lab_results/medications/treatments/timeline_events
      — `backend/app/services/persistence.py`

## Health History
- [x] Timeline service — `GET /timeline` (`backend/app/services/timeline.py`)
- [x] Conditions — `GET /conditions`, `GET /conditions/{id}`
- [x] Treatments/medications — `GET /treatments`, `GET /medications`
- [x] Health metrics (from lab_results, no invented values)

## Search / RAG
- [x] Chunking — `rag/ingestion/chunker.py`
- [x] Embeddings (sentence-transformers/all-MiniLM-L6-v2) — `rag/embeddings/embedder.py`
- [x] ChromaDB vector store — `rag/embeddings/vector_store.py`
- [x] Patient-filtered retrieval (enforced server-side, not frontend) — `rag/retrieval/retriever.py`
- [x] Semantic search endpoint — `POST /search`
- [x] Grounded assistant + citations — `POST /assistant/chat`, `rag/generation/generator.py`
- [x] No-answer fallback string enforced in system prompt

## Safety
- [x] Medical disclaimer surfaced via API (`GET /health` + assistant responses)
- [x] Hallucination-prevention system prompt — `ai/prompts/assistant_prompt.py`
- [x] No diagnosis / no dosage-change recommendations (prompt-enforced)
- [x] Patient isolation enforced at DB query layer AND vector filter layer
- [x] Dedicated isolation test — `backend/tests/test_patient_isolation.py`

## Product / Frontend
- [x] Next.js app wired to the above endpoints — login, register, dashboard,
      documents (upload+process), timeline, conditions, treatments, search,
      AI assistant. All calls hit the real FastAPI backend (no mock data).

## Documentation
- [x] README.md
- [x] docs/ARCHITECTURE.md
- [x] SECURITY.md
- [x] .env.example
- [x] Seed script + synthetic demo data
- [x] pitch-deck/PITCH_DECK.md (8 slides)
- [x] docs/DEMO_SCRIPT.md

## Deployment
- [ ] Live URL (requires your hosting + real API keys — not reachable from this sandbox)
- [x] docker-compose.yml for local/prod parity
