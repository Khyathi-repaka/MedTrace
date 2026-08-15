import logging

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, GoogleAPICallError

from ai.providers.base import LLMProvider

logger = logging.getLogger("medtrace.gemini")


class GeminiQuotaExceeded(RuntimeError):
    """Raised when the Gemini free-tier request quota has been used up."""


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)

    def complete_json(self, system_prompt: str, user_prompt: str) -> str:
        try:
            resp = self.model.generate_content(
                [system_prompt, user_prompt],
                generation_config={"temperature": 0, "response_mime_type": "application/json"},
            )
            return resp.text or "{}"
        except ResourceExhausted as exc:
            logger.warning("Gemini quota exceeded during complete_json: %s", exc)
            raise GeminiQuotaExceeded(
                "Gemini API daily free-tier quota exceeded. Wait for the quota "
                "to reset, upgrade your plan, or set AI_PROVIDER=demo in .env "
                "to keep testing without live calls."
            ) from exc
        except GoogleAPICallError as exc:
            logger.error("Gemini API call failed during complete_json: %s", exc)
            raise RuntimeError(f"Gemini API request failed: {exc}") from exc

    def complete_text(self, system_prompt: str, user_prompt: str) -> str:
        try:
            resp = self.model.generate_content(
                [system_prompt, user_prompt],
                generation_config={"temperature": 0.2},
            )
            return resp.text or ""
        except ResourceExhausted as exc:
            logger.warning("Gemini quota exceeded during complete_text: %s", exc)
            raise GeminiQuotaExceeded(
                "Gemini API daily free-tier quota exceeded. Wait for the quota "
                "to reset, upgrade your plan, or set AI_PROVIDER=demo in .env "
                "to keep testing without live calls."
            ) from exc
        except GoogleAPICallError as exc:
            logger.error("Gemini API call failed during complete_text: %s", exc)
            raise RuntimeError(f"Gemini API request failed: {exc}") from exc