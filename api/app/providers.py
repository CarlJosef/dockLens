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


def get_analyzer() -> Analyzer:
    provider = os.getenv("DOCLENS_PROVIDER", "heuristic").strip().lower()

    if provider == "heuristic":
        return HeuristicAnalyzer()

    if provider == "llm":
        backend = os.getenv("LLM_BACKEND", "").strip().lower()
        if backend not in ("ollama", "openai"):
            raise ValueError(
                f"Invalid LLM_BACKEND: {backend!r} (expected 'ollama' or 'openai')."
            )
        return LlmAnalyzer(backend)

    raise ValueError(
        f"Unknown DOCLENS_PROVIDER: {provider!r} (expected 'heuristic' or 'llm')."
    )

