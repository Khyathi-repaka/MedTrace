# MedTrace AI — Pitch Deck

---
## Slide 1 — MedTrace AI
### Every record. One health story.

AI-powered medical record organization, search, and health-history
intelligence — turning scattered PDFs and scans into one structured,
searchable, chronological patient record.

---
## Slide 2 — The Problem

Medical records are scattered across:
- Hospitals
- Doctors
- Labs
- Prescriptions
- PDFs and scans

**Result: a fragmented health history.** Patients can't easily answer "what
was my highest HbA1c?" or "when did I start this medication?" — and neither
can a new doctor without redoing the work.

---
## Slide 3 — The Solution

Medical documents → AI extraction → structured health history → timeline →
conditions → treatments → search → AI assistant.

Every step is real: PyMuPDF/OCR text extraction, an LLM constrained to a
strict extraction schema (no invented dates, medications, or lab values),
and a RAG pipeline that grounds every assistant answer in the patient's own
uploaded records.

---
## Slide 4 — Patient Journey

Register → Upload → AI Processing → Structured History → Track → Search →
Ask AI

---
## Slide 5 — Working Product

*(Insert real screenshots here after running the app locally: Dashboard,
Document upload, Extracted information, Timeline, Conditions, Treatments,
AI Assistant. The frontend in `frontend/` is fully wired to the live API —
no mockups.)*

---
## Slide 6 — AI / RAG Architecture

```
Document → PDF/OCR → Text Extraction → LLM Structured Extraction
   → Chunking → Embeddings → Vector Database (ChromaDB)
   → Patient-Filtered Retriever → LLM → Grounded Answer + Sources
```

- Embeddings: `sentence-transformers/all-MiniLM-L6-v2` (local, no API cost)
- LLM provider is pluggable (OpenAI / Gemini) via a single env var — no
  vendor lock-in
- Every retrieval call carries a mandatory `patient_id` filter at the vector
  query layer

---
## Slide 7 — Security & AI Safety

- JWT authentication, bcrypt password hashing
- Patient authorization derived from the JWT — never from client-supplied
  IDs
- Patient-isolated RAG (ChromaDB `where={patient_id}` filter, tested)
- File type/size validation on every upload
- No secrets committed — all config via environment variables
- Synthetic-only demo data, clearly labelled
- Grounded answers only, with real source citations — the assistant is
  prompted to refuse ("I couldn't find that information in your uploaded
  medical records") rather than guess
- Medical disclaimer surfaced on every assistant response

---
## Slide 8 — Future Vision

Doctor sharing · hospital & lab integrations · FHIR/HL7 compatibility ·
medication reminders · health-trend analytics · multi-document comparison ·
PDF health summaries · voice assistant.
