# MedTrace AI — Project Plan

## Objective
Turn scattered medical documents into one structured, searchable, chronological
health history, with a patient-isolated RAG assistant that answers questions
grounded in the patient's own uploaded records.

## Priority order (matches evaluation weighting)
1. Working end-to-end backend flow (upload → extract → store → timeline)
2. AI/RAG implementation (chunk → embed → ChromaDB → retrieve → generate)
3. Document processing & extraction (PyMuPDF + OCR + LLM structured extraction)
4. Backend/API architecture (FastAPI, service layers, Pydantic validation)
5. Database design (Postgres via SQLModel, patient-isolated FKs)
6. Security & AI safety (JWT, patient isolation, hallucination prevention, disclaimer)
7. Frontend (Next.js, wired to real endpoints — built after backend proven)
8. Docs, pitch deck, demo script, deployment

## Milestones
- **M1** — A medical document can be uploaded and transformed into structured
  patient data (extraction → Postgres → timeline/conditions/treatments).
- **M2** — That information can be searched through semantic RAG
  (chunk → embed → ChromaDB → patient-filtered retrieval).
- **M3** — The AI assistant answers questions using the patient's records and
  cites sources, refusing when the answer isn't in the records.
- **M4** — The complete flow is accessible through a working frontend.
- **M5** — The application is documented and deployment-ready.

## Environment note (build environment constraints)
This build environment has network access limited to package registries
(pip/npm/GitHub) — it cannot reach live OpenAI/Gemini endpoints or a hosted
Postgres/Chroma instance, and there is no way to run a long-lived server
process for you to click through here. So the code is written to be fully
real (no hardcoded logic, no fake endpoints), config-driven via `.env`, and
runnable on your machine or a deploy target with real credentials. A
`DEMO FALLBACK MODE` is included per the spec (Phase 30) so the pipeline is
exercisable without live API keys, clearly labeled as such — the real
extraction/RAG code paths are what run when keys are present.

## Status
See `REQUIREMENTS_CHECKLIST.md` for the live checklist. Backend-first build
in progress per Development Order (Section 68 of the brief).
