import os
from abc import ABC, abstractmethod
from typing import List

from .schemas import Finding


class Analyzer(ABC):
    @abstractmethod
    def analyze(self, text: str, mode: str) -> tuple[str, List[Finding]]:
        raise NotImplementedError


class HeuristicAnalyzer(Analyzer):
    def __init__(self):
        from .analyze import analyze_requirements, analyze_general

        self._analyze_requirements = analyze_requirements
        self._analyze_general = analyze_general

    def analyze(self, text: str, mode: str) -> tuple[str, List[Finding]]:
        if mode == "requirements":
            return self._analyze_requirements(text)
        return self._analyze_general(text)


class LlmAnalyzer(Analyzer):
    def __init__(self, backend: str):
        self.backend = backend

        if backend == "ollama":
            from .llm.ollama import OllamaAnalyzer
            self._impl = OllamaAnalyzer()
        elif backend == "openai":
            self._impl = None
        else:
            self._impl = None

    def analyze(self, text: str, mode: str) -> tuple[str, List[Finding]]:
        if self.backend == "openai":
            raise RuntimeError("OpenAI backend is not implemented yet.")
        if self._impl is None:
            raise RuntimeError(
                f"LLM provider selected but backend '{self.backend}' is not implemented yet."
            )
        return self._impl.analyze(text=text, mode=mode)



def get_analyzer_for_provider(provider: str | None) -> Analyzer:
    """Resolve analyzer from a provider string (request-level), with env fallback."""
    p = (provider or os.getenv("DOCLENS_PROVIDER", "heuristic")).strip().lower()

    if p == "heuristic":
        return HeuristicAnalyzer()

    # Accept both "llm" (env-style) and "llm:<backend>" (request-style)
    if p == "llm" or p.startswith("llm:"):
        backend = ""
        if p.startswith("llm:"):
            backend = p.split(":", 1)[1].strip().lower()
        if not backend:
            backend = os.getenv("LLM_BACKEND", "").strip().lower()

        if backend not in ("ollama", "openai"):
            raise ValueError(
                f"Invalid LLM backend: {backend!r} (expected 'ollama' or 'openai')."
            )
        return LlmAnalyzer(backend)

    raise ValueError(
        f"Unknown provider: {p!r} (expected 'heuristic' or 'llm[:backend]')."
    )

def get_analyzer() -> Analyzer:
    return get_analyzer_for_provider(None)

