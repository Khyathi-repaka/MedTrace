from app.core.config import get_settings
from ai.providers.base import LLMProvider


def get_llm_provider() -> LLMProvider:
    """Single switch point for AI provider — nothing else in the codebase
    should import a specific provider. Controlled entirely by env vars."""
    settings = get_settings()

    if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        from ai.providers.openai_provider import OpenAIProvider
        return OpenAIProvider(settings.OPENAI_API_KEY, settings.OPENAI_MODEL)

    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        from ai.providers.gemini_provider import GeminiProvider
        return GeminiProvider(settings.GEMINI_API_KEY, settings.GEMINI_MODEL)

    from ai.providers.demo_provider import DemoProvider
    return DemoProvider()
