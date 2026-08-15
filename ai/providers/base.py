from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Common interface so the rest of the app never imports OpenAI/Gemini directly."""

    @abstractmethod
    def complete_json(self, system_prompt: str, user_prompt: str) -> str:
        """Return raw text expected to be a JSON object."""
        raise NotImplementedError

    @abstractmethod
    def complete_text(self, system_prompt: str, user_prompt: str) -> str:
        """Return free-text (used for the grounded assistant's final answer)."""
        raise NotImplementedError
