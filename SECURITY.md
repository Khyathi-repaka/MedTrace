# Security & AI Safety — MedTrace AI

## Authentication
- Passwords are hashed with bcrypt (passlib) — never stored or logged in plaintext.
- Auth is JWT-based (`python-jose`), signed with `JWT_SECRET` (set a long random
  value in `.env` — never commit it), expiring after `JWT_EXPIRE_MINUTES`.
- Every patient-scoped endpoint depends on `get_current_patient`
  (`backend/app/api/deps.py`), which decodes the JWT, resolves the user, and
  loads their `PatientProfile`. There is no code path that accepts a
  `patient_id` from the request body or query string for authorization.

## Patient data isolation (critical requirement)
- All patient-owned tables (`documents`, `conditions`, `symptoms`,
  `lab_results`, `medications`, `treatments`, `timeline_events`,
  `document_chunks`, `chat_sessions`) carry a `patient_id` foreign key.
- Every relational query filters `WHERE patient_id == current_patient.id`, and
  every direct-lookup endpoint (`GET /documents/{id}`, etc.) additionally
  checks the row's `patient_id` against the authenticated patient before
  returning it — otherwise it 404s (not 403, to avoid leaking existence).
- **RAG isolation**: `rag/embeddings/vector_store.py::query_patient_chunks`
  applies a ChromaDB `where={"patient_id": ...}` filter *inside* the vector
  query itself — retrieval never happens globally-then-filtered. See
  `backend/tests/test_patient_isolation.py`, which asserts (a) Patient A
  cannot fetch Patient B's document by ID, and (b) every `/search` call
  passes a concrete `patient_id` into the retriever.

## File upload validation
- Extension allow-list (`.pdf`, `.jpg`, `.jpeg`, `.png`), non-empty check, and
  a configurable max size (`MAX_UPLOAD_MB`, default 20MB) —
  `backend/app/services/file_validation.py`.

## AI safety / hallucination prevention
- Extraction prompt (`ai/prompts/extraction_prompt.py`) explicitly forbids
  inference, guessing, invented dates/medications/lab values — missing
  fields must be `null`/empty, not fabricated.
- Extraction output is validated against the `MedicalExtraction` Pydantic
  schema; invalid JSON is retried once, then the document is marked `FAILED`
  rather than silently persisting bad data (`ai/extraction/extract_service.py`).
- Assistant prompt (`ai/prompts/assistant_prompt.py`) restricts answers to
  retrieved patient records, forbids diagnosis, medication prescription, or
  dosage-change advice, and mandates the literal fallback string *"I couldn't
  find that information in your uploaded medical records"* when nothing
  relevant is retrieved.
- Sources returned to the user are derived directly from the chunks that were
  actually retrieved — never fabricated.

## Medical disclaimer
Surfaced via `GET /health` and on every AI Assistant response
(`ChatResponse.disclaimer`), and shown in the frontend's assistant page and
footer.

## Secrets & environment
- All secrets (`JWT_SECRET`, `OPENAI_API_KEY`, `GEMINI_API_KEY`,
  `DATABASE_URL`) are read from environment variables via
  `pydantic-settings`; `.env` is git-ignored and only `.env.example`
  (placeholders only) is committed.
- CORS origins are explicit and configurable (`CORS_ORIGINS`), not `*`.

## Known limitations (see README "Known Limitations")
- Rate limiting, refresh-token rotation, and audit logging are not yet
  implemented — recommended before any real patient data is handled in
  production.
