import os
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_smoke_analyze_uses_heuristic_by_default():
    # Ensure we don't accidentally enable LLM in test env
    os.environ.pop("DOCLENS_PROVIDER", None)
    os.environ.pop("LLM_BACKEND", None)

    payload = {
        "mode": "requirements",
        "text": "Systemet ska ha inloggning. Prestanda ska vara bra."
    }

    res = client.post("/v1/analyze", json=payload)
    assert res.status_code == 200, res.text

    data = res.json()
    assert data.get("provider") == "heuristic"
    assert isinstance(data.get("findings"), list)
