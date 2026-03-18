# DocLens

![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=0B0B0B)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

[![CI](https://img.shields.io/github/actions/workflow/status/CarlJosef/dockLens/ci.yml?branch=feat/ai-ollama&label=CI&logo=githubactions&logoColor=white)](https://github.com/CarlJosef/dockLens/actions/workflows/ci.yml)
[![AI Smoke](https://img.shields.io/github/actions/workflow/status/CarlJosef/dockLens/ai-smoke.yml?branch=feat/ai-ollama&label=AI%20Smoke&logo=githubactions&logoColor=white)](https://github.com/CarlJosef/dockLens/actions/workflows/ai-smoke.yml)

---

## Screenshot

![DocLens UI](web/docs/screenshot-ui.png)

## Run

### Start (default)

```powershell
docker compose up --build
```

**Stop**

    - docker compose down --volumes
    - Note: docker compose down --down is not a valid flag. Use down (optionally with --volumes) as above.

**Optional: Local AI (Ollama)**

    - Optional: Local AI (Ollama)
    - docker compose -f docker-compose.yml -f docker-compose.llm.yml up --build

    - Notes: LLM can take longer on CPU (typically 1–3 minutes, depending on CPU capacity).If timeouts occur,
             increase OLLAMA_TIMEOUT_S.

---

## API

**Health**

```bash
curl http://localhost:8000/healthz
```

---

**Analyze**
curl -X POST http://localhost:8000/v1/analyze `-H "Content-Type: application/json"`
-d '{ "mode": "requirements", "text": "Example text" }'

---

## Frontend

Open the UI (Docker Compose):

- http://localhost:5174/

## CI

[![CI](https://img.shields.io/github/actions/workflow/status/CarlJosef/dockLens/ci.yml?branch=feat/ai-ollama&label=CI&logo=githubactions&logoColor=white)](https://github.com/CarlJosef/dockLens/actions/workflows/ci.yml)
[![AI Smoke](https://img.shields.io/github/actions/workflow/status/CarlJosef/dockLens/ai-smoke.yml?branch=feat/ai-ollama&label=AI%20Smoke&logo=githubactions&logoColor=white)](https://github.com/CarlJosef/dockLens/actions/workflows/ai-smoke.yml)

## License

MIT — see [LICENSE](LICENSE).
