"""Grounded answer generation: retrieved chunks -> LLM -> answer + real sources
(never fabricated — sources are derived directly from what was retrieved)."""
from ai.providers.factory import get_llm_provider
from ai.prompts.assistant_prompt import ASSISTANT_SYSTEM_PROMPT, build_assistant_user_prompt


def generate_grounded_answer(question: str, chunks: list[dict]) -> dict:
    provider = get_llm_provider()
    user_prompt = build_assistant_user_prompt(question, chunks)
    answer = provider.complete_text(ASSISTANT_SYSTEM_PROMPT, user_prompt)

    seen = set()
    sources = []
    for c in chunks:
        key = (c["document_name"], c.get("medical_date"))
        if key not in seen:
            seen.add(key)
            sources.append({"document_name": c["document_name"], "medical_date": c.get("medical_date"),
                             "document_id": c.get("document_id")})

    return {"answer": answer, "sources": sources if chunks else []}
