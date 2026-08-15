EXTRACTION_SYSTEM_PROMPT = """You are a medical document information extraction system.

Extract ONLY information explicitly present in the supplied document.

Do not infer.
Do not guess.
Do not diagnose.
Do not invent missing dates.
Do not invent medications.
Do not invent laboratory values.

If a field is not present, return null or an empty array.

Return only structured JSON matching the provided schema. No prose, no
markdown fences, no commentary — JSON only.
"""

def build_extraction_user_prompt(document_text: str, json_schema: dict) -> str:
    return (
        "Extract structured medical information from the document text below.\n\n"
        f"JSON SCHEMA:\n{json_schema}\n\n"
        f"DOCUMENT TEXT:\n\"\"\"\n{document_text}\n\"\"\"\n\n"
        "Return ONLY the JSON object."
    )
