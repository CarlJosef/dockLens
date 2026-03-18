import json
import os
from typing import List, Optional, Tuple

import httpx

from ..schemas import Finding


class OllamaAnalyzer:
    """
    Calls Ollama /api/chat and expects STRICT JSON output matching:
    { "summary": string, "findings": [ {id,severity,title,detail,suggestion?} ] }
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout_s: Optional[float] = None,
    ):
        self.base_url = (
            base_url
            or os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        ).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", "llama3.1")
        self.timeout_s = float(timeout_s or os.getenv("OLLAMA_TIMEOUT_S", "60"))

    def analyze(self, text: str, mode: str) -> Tuple[str, List[Finding]]:
        prompt = self._build_prompt(text=text, mode=mode)

        payload = {
            "model": self.model,
            "stream": False,
            "temperature": 0.2,
            "options": {"num_predict": 600},
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a requirements review engine.\n"
                        "Return ONLY valid JSON. No markdown. No extra keys.\n"
                        'Schema: {"summary": string, "findings": [{"id": string, "severity": "low|medium|high", '
                        '"title": string, "detail": string, "suggestion": string|null}]}'
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        }

        url = f"{self.base_url}/api/chat"
        timeout = httpx.Timeout(self.timeout_s, connect=10.0)

        try:
            with httpx.Client(timeout=timeout) as client:
                r = client.post(url, json=payload)
                r.raise_for_status()
                data = r.json()
        except httpx.RequestError as e:
            raise RuntimeError(
                f"Ollama request failed: {e.__class__.__name__}: {e}"
            ) from e
        except httpx.HTTPStatusError as e:
            raise RuntimeError(
                f"Ollama returned HTTP {e.response.status_code}: {e.response.text[:200]}"
            ) from e
        except ValueError as e:
            raise RuntimeError("Ollama returned non-JSON response") from e

        # Ollama chat response usually: {"message": {"content": "..."}}
        content = (data.get("message") or {}).get("content")
        if not isinstance(content, str) or not content.strip():
            raise RuntimeError("Ollama response missing message.content")

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as e:
            snippet = content[:300].replace("\n", "\\n")
            raise RuntimeError(
                f"LLM returned invalid JSON: {e.msg}. Snippet: {snippet}"
            ) from e

        summary = parsed.get("summary")
        findings_raw = parsed.get("findings")

        if not isinstance(summary, str):
            raise RuntimeError("LLM JSON missing/invalid 'summary'")
        if not isinstance(findings_raw, list):
            raise RuntimeError("LLM JSON missing/invalid 'findings' list")

        findings: List[Finding] = []
        for item in findings_raw:
            if not isinstance(item, dict):
                continue
            findings.append(Finding(**item))

        return summary, findings

    @staticmethod
    def _build_prompt(text: str, mode: str) -> str:
        return (
            f"Mode: {mode}\n"
            "Analyze the following text and produce findings.\n\n"
            f"{text}\n"
        )
