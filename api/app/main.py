import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .providers import get_analyzer

from .schemas import AnalyzeRequest, AnalyzeResponse

# from .analyze import analyze_requirements, analyze_general - not inuse since we have provider abstraction now.


app = FastAPI(title="DocLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/v1/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    analyzer = get_analyzer()
    summary, findings = analyzer.analyze(req.text, req.mode)
    provider = os.getenv("DOCLENS_PROVIDER", "heuristic").strip().lower()
    return AnalyzeResponse(provider=provider, summary=summary, findings=findings)
