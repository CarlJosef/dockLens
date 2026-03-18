import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .providers import get_analyzer_for_provider
from fastapi import HTTPException
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
    analyzer = get_analyzer_for_provider(getattr(req, "provider", None))

    try:
        summary, findings = analyzer.analyze(req.text, req.mode)
    except RuntimeError as e:
        msg = str(e)
        status = 504 if "ReadTimeout" in msg or "timed out" in msg.lower() else 502
        raise HTTPException(status_code=status, detail=msg)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    provider = os.getenv("DOCLENS_PROVIDER", "heuristic").strip().lower()
    if provider == "llm":
        backend = os.getenv("LLM_BACKEND", "").strip().lower()
        provider = f"llm:{backend}" if backend else "llm"

    return AnalyzeResponse(provider=provider, summary=summary, findings=findings)
