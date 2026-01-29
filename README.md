## AIscope

Minimal MVP implementation of **AIscope** – a persistent AI agent that tracks a curated set of AI companies, extracts structured events from news/blog/RSS sources using AWS Bedrock, stores them in a simple graph-like store, detects meaningful changes, and serves a daily briefing via a web dashboard.

### High-level layout

- `backend/` – FastAPI app, ingestion pipeline, Bedrock integration, persistence models.
- `frontend/` – Web dashboard (React) consuming the backend API.
- `infra/` – Local development tooling (e.g. docker-compose for Postgres).
- `data/` – Static configuration such as company registry and source lists.

### Getting started (development)

1. **Backend**
   - Create and activate a Python 3.11+ virtualenv.
   - Install dependencies:

     ```bash
     pip install -r backend/requirements.txt
     ```

   - Run the API server (after DB is configured):

     ```bash
     uvicorn backend.main:app --reload
     ```

2. **Frontend**
   - See `frontend/README.md` (created as part of the MVP) for running the web dashboard.

3. **Configuration**
   - Database URL, AWS region, and Bedrock model ID are configured via environment variables and/or `.env` in `backend/`.

