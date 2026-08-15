"""
DEMO FALLBACK MODE (spec Phase 30). Used only when no live provider key is
configured, so the pipeline stays exercisable without external API access.
It runs a small deterministic, clearly-labeled heuristic over the document
text instead of calling a hosted LLM — it does NOT replace the real
extraction/RAG code paths, which run unchanged once real keys are set.
"""
import json
import re
from ai.providers.base import LLMProvider


class DemoProvider(LLMProvider):
    def complete_json(self, system_prompt: str, user_prompt: str) -> str:
        text_match = re.search(r'DOCUMENT TEXT:\n"""\n(.*?)\n"""', user_prompt, re.S)
        text = text_match.group(1) if text_match else ""
        return json.dumps(_heuristic_extract(text))

    def complete_text(self, system_prompt: str, user_prompt: str) -> str:
        if "no relevant records retrieved" in user_prompt:
            return "I couldn't find that information in your uploaded medical records."
        return (
            "[DEMO FALLBACK MODE — no live LLM key configured] "
            "Based on the retrieved record excerpts above, please review the "
            "cited sources directly; connect a real OPENAI_API_KEY or "
            "GEMINI_API_KEY to get a generated grounded answer here."
        )


def _heuristic_extract(text: str) -> dict:
    """Very small pattern-based extractor so demo mode still produces
    something real (not hardcoded per-document) from arbitrary input text."""
    diagnoses, symptoms, lab_results, medications, findings = [], [], [], [], []

    for m in re.finditer(r'(?im)^\s*Diagnosis\s*[:\-]\s*(.+)$', text):
        diagnoses.append({"condition": m.group(1).strip(), "diagnosis_date": None, "severity": None})

    for m in re.finditer(r'(?im)^\s*Symptoms?\s*[:\-]\s*(.+)$', text):
        for s in m.group(1).split(","):
            s = s.strip()
            if s:
                symptoms.append({"symptom": s, "duration": None})

    for m in re.finditer(
        r'(?im)^\s*([A-Za-z0-9/ ]{2,30}?)\s*[:\-]\s*([\d.]+\s*%?\s*[a-zA-Z/]*)\s*(?:\(([^)]+)\))?\s*$',
        text,
    ):
        label = m.group(1).strip()
        if label.lower() in {"diagnosis", "symptoms", "medication", "medications", "doctor", "hospital"}:
            continue
        lab_results.append({
            "test_name": label, "result": m.group(2).strip(),
            "unit": None, "reference_range": m.group(3), "test_date": None,
        })

    for m in re.finditer(r'(?im)^\s*Medication\s*[:\-]\s*(.+)$', text):
        medications.append({"name": m.group(1).strip(), "dosage": None, "frequency": None,
                             "duration": None, "start_date": None, "end_date": None})

    doctor_m = re.search(r'(?im)^\s*Doctor\s*[:\-]\s*(.+)$', text)
    hospital_m = re.search(r'(?im)^\s*Hospital\s*[:\-]\s*(.+)$', text)

    return {
        "diagnoses": diagnoses, "symptoms": symptoms, "lab_results": lab_results,
        "medications": medications, "findings": findings,
        "doctor": {"name": doctor_m.group(1).strip(), "department": None} if doctor_m else None,
        "hospital": {"name": hospital_m.group(1).strip()} if hospital_m else None,
    }
