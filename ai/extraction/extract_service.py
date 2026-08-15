"""
Runs the strict structured-extraction prompt against the configured LLM
provider, validates the response against MedicalExtraction, and retries
once on invalid JSON. Never returns unvalidated data to the caller.
"""
import json
import logging

from pydantic import ValidationError

from ai.providers.factory import get_llm_provider
from ai.prompts.extraction_prompt import EXTRACTION_SYSTEM_PROMPT, build_extraction_user_prompt
from ai.schemas.extraction import MedicalExtraction

logger = logging.getLogger("medtrace.extraction")


class ExtractionFailedError(Exception):
    pass


def _strip_code_fences(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


def run_medical_extraction(document_text: str, max_retries: int = 1) -> MedicalExtraction:
    provider = get_llm_provider()
    schema = MedicalExtraction.model_json_schema()
    user_prompt = build_extraction_user_prompt(document_text, schema)

    last_error: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            raw = provider.complete_json(EXTRACTION_SYSTEM_PROMPT, user_prompt)
            cleaned = _strip_code_fences(raw)
            data = json.loads(cleaned)
            return MedicalExtraction.model_validate(data)
        except (json.JSONDecodeError, ValidationError) as e:
            last_error = e
            logger.warning("Extraction attempt %d failed validation: %s", attempt + 1, e)
            continue

    raise ExtractionFailedError(f"LLM output failed schema validation: {last_error}")
