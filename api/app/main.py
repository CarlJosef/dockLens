from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import AnalyzeRequest, AnalyzeResponse
from .analyze import analyze_requirements, analyze_general


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
    if req.mode == "requirements":
        summary, findings = analyze_requirements(req.text)
    else:
        summary, findings = analyze_general(req.text)

    return AnalyzeResponse(summary=summary, findings=findings)
