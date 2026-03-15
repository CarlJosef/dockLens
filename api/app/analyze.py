import re
from typing import List
from .schemas import Finding


AMBIGUOUS_TERMS = [
    "maybe",
    "probably",
    "should",
    "could",
    "some",
    "often",
    "sometimes",
    "as soon as possible",
    "fast",
    "quick",
    "user-friendly",
    "robust",
    "efficient",
    "secure",
    "simple",
    "intuitive",
]


def analyze_requirements(text: str) -> tuple[str, List[Finding]]:
    t = text.strip()
    lines = [ln.strip() for ln in t.splitlines() if ln.strip()]
    findings: List[Finding] = []

    # Heuristic summary
    summary = f"Analyzed {len(lines)} non-empty lines. Found {0} issues."

    # 1) Ambiguity scan
    lower = t.lower()
    hits = [term for term in AMBIGUOUS_TERMS if term in lower]
    if hits:
        findings.append(
            Finding(
                id="ambiguity-terms",
                severity="medium",
                title="Potentially ambiguous terms",
                detail=f"Found terms that often reduce testability: {', '.join(sorted(set(hits)))}.",
                suggestion="Replace with measurable criteria (e.g., response time < 200ms, WCAG AA, etc.).",
            )
        )

    # 2) Missing acceptance criteria hint
    if (
        "acceptance" not in lower
        and "given" not in lower
        and "when" not in lower
        and "then" not in lower
    ):
        findings.append(
            Finding(
                id="missing-acceptance-criteria",
                severity="high",
                title="Missing acceptance criteria",
                detail="No explicit acceptance criteria detected (e.g., Given/When/Then or measurable conditions).",
                suggestion="Add acceptance criteria for each requirement so it becomes testable.",
            )
        )

    # 3) “Must” presence vs. hedging
    must_count = len(re.findall(r"\bmust\b", lower))
    should_count = len(re.findall(r"\bshould\b", lower))
    if should_count > must_count and should_count >= 2:
        findings.append(
            Finding(
                id="hedging-language",
                severity="medium",
                title="Hedging language may weaken requirements",
                detail=f"Detected 'should' {should_count}x vs 'must' {must_count}x.",
                suggestion="Decide which statements are mandatory vs. optional and use consistent wording.",
            )
        )

    # 4) Simple PII mention warning
    if re.search(r"\b(ssn|social security|personnummer|passport|credit card)\b", lower):
        findings.append(
            Finding(
                id="pii-mention",
                severity="high",
                title="Potential PII in text",
                detail="The text mentions identifiers that may be personal/sensitive data.",
                suggestion="Ensure data minimization, masking, and access controls; avoid placing real identifiers in docs.",
            )
        )

    # Update summary
    summary = f"Analyzed {len(lines)} non-empty lines. Found {len(findings)} findings."
    return summary, findings


def analyze_general(text: str) -> tuple[str, List[Finding]]:
    t = text.strip()
    words = re.findall(r"\w+", t)
    findings: List[Finding] = []

    summary = f"Analyzed ~{len(words)} words. Found {len(findings)} findings."
    return summary, findings
