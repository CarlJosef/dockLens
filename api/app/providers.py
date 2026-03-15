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
    def analyze(self, text: str, mode: str) -> tuple[str, List[Finding]]:
        # Placeholder for future integration (OpenAI / Ollama / etc.)
        raise RuntimeError(
            "LLM provider selected (DOCLENS_PROVIDER=llm) but no LLM backend is configured yet."
        )


def get_analyzer() -> Analyzer:
    provider = os.getenv("DOCLENS_PROVIDER", "heuristic").strip().lower()
    if provider == "heuristic":
        return HeuristicAnalyzer()
    if provider == "llm":
        return LlmAnalyzer()
    raise ValueError(
        f"Unknown DOCLENS_PROVIDER: {provider!r} (expected 'heuristic' or 'llm')."
    )
