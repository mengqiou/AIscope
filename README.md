# AIscope

**AIscope** is a fact-centric AI ecosystem tracking system that monitors key AI companies, extracts structured events from news sources, and visualizes relationships in an interactive graph. Built with an event-centric, append-only architecture that preserves historical facts without mutable state.

## Features

- **Event Extraction**: Uses AWS Bedrock to extract structured events (funding, launches, partnerships, etc.) from RSS feeds and news sources
- **Graph Visualization**: Interactive force-directed graph showing relationships between AI companies, infrastructure providers, chip manufacturers, scholars, and individuals
- **Granular Entity Categories**:
  - AI Product Companies (OpenAI, Anthropic, xAI, etc.)
  - AI Infrastructure Companies (Databricks, Hugging Face, CoreWeave, etc.)
  - Chip Companies (NVIDIA, AMD, Intel)
  - AI Scholars (Yann LeCun, Geoffrey Hinton, Ilya Sutskever, Andrew Ng)
  - Individuals (Founders and executives)
- **Interactive UI**:
  - Click nodes to view entity details (description, founding date, founders)
  - Click edges to view relationship details (type, description)
  - Hover highlighting for edges
  - Weekly events sidebar showing recent news
- **Event-Centric Architecture**: Append-only event ledger with time-aware facts, no mutable state

## Architecture

### Design Principles

- **Event-centric**: Time lives on events, not entities
- **Append-only**: History cannot be corrupted
- **Fact-centric**: Only events are stored, no derived state
- **Graph-native**: Relationships are first-class, not inferred

### Tech Stack

**Backend:**
- Python 3.12+
- FastAPI
- SQLAlchemy (PostgreSQL/SQLite)
- AWS Bedrock (LLM)
- Pydantic

**Frontend:**
- TypeScript
- React
- Material-UI (MUI)
- react-force-graph-2d
- Vite

## Project Structure

```
AIscope/
├── backend/
│   ├── core/           # Configuration and settings
│   ├── db/             # Database setup and session management
│   ├── ingestion/      # RSS feed fetching
│   ├── llm/            # AWS Bedrock integration and event extraction
│   ├── models/         # SQLAlchemy models (Event, Entity, EventEntityRole, etc.)
│   ├── pipeline/       # Event extraction, change detection, briefing generation
│   ├── schemas/        # Pydantic schemas for API
│   ├── scripts/        # Utility scripts (bootstrap, test DB, pipeline runner)
│   └── main.py         # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── api.ts              # Backend API client
│   │   ├── App.tsx             # Main application component
│   │   ├── GraphView.tsx       # Force-directed graph visualization
│   │   ├── WeeklySidebar.tsx   # Recent events sidebar
│   │   ├── EntityModal.tsx     # Entity detail modal
│   │   ├── EventModal.tsx      # Event detail modal
│   │   ├── EdgeModal.tsx       # Relationship detail modal
│   │   └── graphData.ts        # Static graph data (nodes, links)
│   ├── package.json
│   └── vite.config.ts
├── data/
│   └── companies.yaml   # Company registry
└── .env                 # Environment variables (not in git)

```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20.19+ or 22.12+
- PostgreSQL (or SQLite for local dev)
- AWS account with Bedrock access (optional, for event extraction)

### Backend Setup

1. **Create virtual environment:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies:**

   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure environment:**

   Create a `.env` file in the project root:

   ```env
   AISCOPE_DATABASE_URL=postgresql://user:password@localhost:5432/aiscope
   AISCOPE_AWS_REGION=us-east-1
   AISCOPE_BEDROCK_MODEL_ID=your-model-id
   ```

   For local development with SQLite:
   ```env
   AISCOPE_DATABASE_URL=sqlite:///./aiscope.db
   ```

4. **Initialize database:**

   ```bash
   python -m backend.scripts.test_db_connection
   ```

   This will create all necessary tables.

5. **Bootstrap sample data (optional):**

   ```bash
   python -m backend.scripts.bootstrap_sample_events
   ```

6. **Run the API server:**

   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure API URL (optional):**

   Create `frontend/.env` if your backend runs on a different port:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Endpoints

- `GET /health` - Health check
- `GET /events` - List recent events
- `GET /companies` - List all companies
- `GET /companies/{company_id}/events` - Get events for a specific company
- `GET /briefings/latest` - Get the latest daily briefing

## Running the Pipeline

To fetch new documents and extract events:

```bash
python -m backend.scripts.run_pipeline_once
```

This will:
1. Fetch RSS feeds from configured sources
2. Extract events using AWS Bedrock
3. Store events and relationships in the database

## Database Schema

### Core Models

- **Event**: Immutable event records with `occurred_at` (real-world time) and `recorded_at` (when AIscope learned about it)
- **Entity**: Timeless identifiers (companies, people, etc.)
- **EventEntityRole**: Fact-centric relationships linking entities to events with roles
- **EventNoveltyLabel**: Append-only novelty classifications (not mutable state on events)
- **Document**: Source documents from RSS feeds
- **Mention**: Links documents to entities/events
- **Briefing**: Generated daily briefings

## Development

### Testing Database Connectivity

```bash
python -m backend.scripts.test_db_connection
```

### Code Style

- Backend: Follows PEP 8, uses type hints
- Frontend: TypeScript with strict mode, React functional components

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
