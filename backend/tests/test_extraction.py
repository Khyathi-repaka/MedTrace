from ai.extraction.extract_service import run_medical_extraction

SAMPLE_TEXT = """
Diagnosis: Type 2 Diabetes
Symptoms: fatigue, thirst
HbA1c: 7.8%
Medication: Metformin
Doctor: Dr. Iyer
Hospital: City Care Hospital
"""


def test_demo_extraction_returns_valid_structure():
    result = run_medical_extraction(SAMPLE_TEXT)
    assert result.diagnoses[0].condition == "Type 2 Diabetes"
    assert any(m.name == "Metformin" for m in result.medications)
    assert result.hospital.name == "City Care Hospital"


def test_invalid_llm_output_raises():
    import ai.extraction.extract_service as extract_service
    from ai.providers.base import LLMProvider

    class BrokenProvider(LLMProvider):
        def complete_json(self, s, u): return "not json at all {{{"
        def complete_text(self, s, u): return ""

    orig = extract_service.get_llm_provider
    extract_service.get_llm_provider = lambda: BrokenProvider()
    try:
        from ai.extraction.extract_service import ExtractionFailedError
        raised = False
        try:
            run_medical_extraction("irrelevant", max_retries=0)
        except ExtractionFailedError:
            raised = True
        assert raised
    finally:
        extract_service.get_llm_provider = orig
