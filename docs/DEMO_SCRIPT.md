# MedTrace AI — Demo Script (5–10 minutes)

## Setup before recording
1. `docker compose up --build` (or run backend + frontend locally per README).
2. `python -m database.seed.seed` to load the demo account and 5 synthetic
   documents through the real pipeline.
3. Log in as `demo@medtrace.ai` / `Demo@12345`.

## Walkthrough

1. **Login** — show the login screen, sign in with the demo account.
2. **Dashboard** — point out active conditions, current medications, document
   count, and latest record date, all pulled live from Postgres (not
   hardcoded).
3. **Upload a document** — upload one more synthetic report (or one of the
   sample files in `sample-data/documents/`), and narrate the real processing
   stages as they happen: uploading → reading document → extracting
   information → updating health history → indexing for search → complete.
4. **Extracted information** — open the processed document, show the
   diagnosis/labs/medications/doctor/hospital pulled straight from the LLM
   extraction, validated against the Pydantic schema.
5. **Medical timeline** — show the chronological view built entirely from
   `timeline_events`, spanning the seeded dates (Jan 2024 → Aug 2026).
6. **Conditions** — show Type 2 Diabetes and Hypertension cards with latest
   vs. previous lab values and document counts.
7. **Treatments** — show medications with dosage, frequency, start date, and
   status.
8. **Search** — run "What was my highest HbA1c?" and show the semantic
   search results with source document and date — this is a real ChromaDB
   vector query, not keyword matching.
9. **AI Assistant** — ask "When did I start Metformin?" and "What medications
   have I taken?"; show the grounded answer and cited sources. Then ask an
   out-of-scope question (e.g. "Should I stop my medication?") to demonstrate
   the assistant declining to give medical advice.
10. **Source citations** — call out that every assistant answer traces back
    to a specific uploaded document and date, never fabricated.
11. **Safety** — point to the medical disclaimer and explain patient
    isolation: log in as a second account and show it has zero visibility
    into the demo patient's records (referencing
    `backend/tests/test_patient_isolation.py`).
12. **Architecture explanation** — briefly walk through
    `docs/ARCHITECTURE.md`'s two pipelines (extraction, RAG) and the
    provider-abstraction design that lets `AI_PROVIDER` switch between
    OpenAI, Gemini, and the offline demo fallback with no code changes.

## Founder Q&A prompts to pre-empt (see brief §64)
Can I upload a report? Does AI actually process it? Where is it stored? Can
I track conditions/medications? Can I search old reports? Can another
patient access my records? What happens if the answer isn't in my records?
Does this replace a doctor? — the walkthrough above answers all of these
live.
