from pydantic import BaseModel, Field
from typing import List, Literal, Optional


Severity = Literal["low", "medium", "high"]


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20000)
    mode: Literal["requirements", "general"] = "requirements"


class Finding(BaseModel):
    id: str
    severity: Severity
    title: str
    detail: str
    suggestion: Optional[str] = None


class AnalyzeResponse(BaseModel):
    provider: str
    summary: str
    findings: List[Finding]
