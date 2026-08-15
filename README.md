# MedTrace AI

### Every record. One health story.

AI-powered medical record organization, search and health-history
intelligence — an MVP built for a technical internship assignment.

## Overview

Patients' medical information is scattered across hospitals, doctors, labs,
prescriptions, and scans. MedTrace AI turns those scattered documents into
one structured, searchable, chronological health history, with an AI
assistant that answers questions grounded in the patient's own records and
cites its sources.

## Problem → Solution

Scattered PDFs/images → upload → AI extraction (PyMuPDF/OCR + LLM, validated
against a strict schema) → structured Postgres records → timeline,
conditions, and treatment tracking → semantic search and a RAG-grounded
assistant, patient-isolated end to end.

## Patient journey

`Register → Login → Patient Profile → Upload Document → AI Processing →
Structured Medical Information → Medical Timeline → Disease Tracking →
Treatment/Medication Tracking → Semantic Search → AI Patient History
Assistant`

## Features
- JWT auth, patient profiles
- Document upload (PDF/JPG/PNG) with real PyMuPDF text extraction and
  Tesseract OCR fallback for scans
- Structured LLM extraction (diagnoses, symptoms, labs, medications, doctor,
  hospital, findings) validated against Pydantic schemas — no invented data
- Automatic timeline, conditions, and treatment/medication tracking
- RAG: chunking → local embeddings → ChromaDB → patient-isolated retrieval
- Semantic search and a grounded AI assistant with source citations and a
  hallucination-safe system prompt
- Pluggable AI provider (OpenAI / Gemini / demo fallback) via env var
- Patient data isolation enforced at both the relational and vector-query
  layers, with a dedicated automated test

## Architecture
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## AI extraction pipeline
Document → PyMuPDF/OCR text → strict extraction prompt → LLM (OpenAI/Gemini/
demo) → Pydantic-validated JSON → Postgres (conditions/symptoms/lab_results/
medications/treatments/timeline_events). See `ai/`.

## RAG pipeline
Document text → chunking (`rag/ingestion/chunker.py`) → embeddings
(`sentence-transformers/all-MiniLM-L6-v2`) → ChromaDB → patient-filtered
retrieval → LLM → grounded answer + real source citations. See `rag/`.

## Database design
PostgreSQL via SQLModel. See entities in `backend/app/models/entities.py`:
`users, patient_profiles, documents, conditions, symptoms, lab_results,
medications, treatments, timeline_events, document_chunks, chat_sessions,
chat_messages` — every patient-owned table carries a `patient_id` FK.

## Authentication & Security
JWT + bcrypt password hashing; see [`SECURITY.md`](SECURITY.md) for the full
security and AI-safety writeup, including patient isolation guarantees.

## Technology stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Pydantic, SQLModel, python-jose, passlib
- **Database**: PostgreSQL (Supabase/Neon-compatible)
- **AI**: OpenAI or Gemini (pluggable), sentence-transformers embeddings
- **RAG**: LangChain-style pipeline + ChromaDB
- **Document processing**: PyMuPDF, Tesseract OCR

## Project structure
```
medtrace-ai/
├── frontend/        Next.js app (login, dashboard, documents, timeline,
│                     conditions, treatments, search, assistant)
├── backend/          FastAPI app (api/models/schemas/services/core/db)
├── ai/               extraction, prompts, provider abstraction, schemas
├── rag/               ingestion, embeddings, retrieval, generation
├── database/seed/     synthetic demo data seeding script
├── sample-data/       5 synthetic sample documents
├── docs/               architecture, demo script
├── pitch-deck/         8-slide founder deck (markdown)
├── docker-compose.yml
└── .env.example
```

## Local setup

### 1. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in DATABASE_URL / secrets / AI keys
export PYTHONPATH=$(pwd):$(pwd)/..   # so `ai` and `rag` packages resolve
uvicorn app.main:app --reload
```
Swagger docs: http://localhost:8000/docs

### 2. Database
Point `DATABASE_URL` in `.env` at a Postgres instance (local, Supabase, or
Neon). Tables are created automatically on backend startup
(`SQLModel.metadata.create_all`). For a quick local Postgres:
```bash
docker run -d --name medtrace-db -e POSTGRES_USER=medtrace \
  -e POSTGRES_PASSWORD=medtrace -e POSTGRES_DB=medtrace -p 5432:5432 postgres:16-alpine
```

### 3. Seed demo data
```bash
# from repo root, with PYTHONPATH set as above and the backend venv active
python -m database.seed.seed
```
This processes the 5 synthetic sample documents in `sample-data/documents/`
through the **real** extraction + RAG pipeline (not hardcoded) and creates
the demo account below.

### 4. Frontend
```bash
cd frontend
npm install
cp ../.env.example .env.local   # or just set NEXT_PUBLIC_API_URL
npm run dev
```
App: http://localhost:3000

### 5. Or run everything with Docker Compose
```bash
cp .env.example .env   # fill in secrets/keys
docker compose up --build
```

## Environment variables
See [`.env.example`](.env.example) — DB connection, JWT secret, AI provider
selection + keys, embedding model, Chroma persistence dir, CORS, upload
limits, and the frontend API URL.

## Demo credentials
```
Email:    demo@medtrace.ai
Password: Demo@12345
```
Seeded by `database/seed/seed.py`. All demo data is clearly labelled
**SYNTHETIC DEMO DATA** and fictional.

## API documentation
FastAPI's interactive Swagger UI is available at `/docs` once the backend is
running (`http://localhost:8000/docs`), auto-generated from the Pydantic
request/response models in `backend/app/schemas/api_schemas.py`.

## Deployment
- **Frontend**: Vercel (or any Next.js host) — set `NEXT_PUBLIC_API_URL` to
  the deployed backend URL.
- **Backend**: Render/Railway/Fly.io (or any container host) — use
  `backend/Dockerfile` (build context = repo root, since it also needs the
  sibling `ai/` and `rag/` packages).
- **Database**: Supabase or Neon (managed Postgres) — set `DATABASE_URL`.
- **Vector store**: ChromaDB persists to disk (`CHROMA_PERSIST_DIR`) — mount
  a persistent volume in production, or swap in a hosted Chroma/Qdrant
  instance if your host is ephemeral.

> This project was built in a sandboxed environment with network access
> limited to package registries (no live Postgres/OpenAI/Gemini/hosting
> reachable from it), so the live URL below needs to be filled in after you
> deploy with real credentials on your own infrastructure.

**Live URL:** _(fill in after deployment)_

## Known limitations
- No rate limiting, refresh-token rotation, or audit logging yet.
- `AI_PROVIDER=demo` uses a small pattern-based heuristic extractor, not a
  real LLM — set `AI_PROVIDER=openai` or `gemini` with a real key for actual
  LLM-grounded extraction and assistant answers.
- Extraction confidence scoring (bonus feature) is not implemented.
- No FHIR/HL7 compatibility yet (see Future Improvements).

## Future improvements
Doctor sharing, hospital/lab integrations, FHIR/HL7 compatibility,
medication reminders, health-trend analytics, multi-document comparison,
PDF health summaries, voice assistant.

## Demo video
See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for the walkthrough script
to record a 5–10 minute demo.
