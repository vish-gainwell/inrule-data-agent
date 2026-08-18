# InRule Data Agent

A pharmacy claim-edit data agent that accepts Criteria Analyzer JSON, generates SQL per rule step using an LLM + real DDL schema files, and lets developers execute those queries against a live SQL Server database.

---

## Repository layout

```
inrule-data-agent/
├── backend/                          ← Python / FastAPI backend
│   ├── src/inrules_data_agent/
│   │   ├── app.py                    FastAPI app  (/generate_queries, /generate_queries/bulk, /execute_query, /health)
│   │   ├── generator/generate.py     LLM-driven SQL generation
│   │   └── schema/                   25 DDL schema files (SQL Server)
│   ├── tests/                        Backend tests (pytest)
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── .env.example
└── frontend/                         ← React / Vite frontend
    └── client/
        ├── src/
        │   ├── pages/Analyst.jsx
        │   ├── components/Chat/ChatBubble.jsx
        │   ├── api/sqlClient.js
        │   └── config/apiConfig.js
        ├── config/app-config.yml     ← Vite environment config
        └── package.json
```

---

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Python | 3.12 | Backend |
| [uv](https://docs.astral.sh/uv/) | latest | Python package manager |
| Node.js | 18+ | Frontend |
| npm | 9+ | Frontend |
| ODBC Driver 18 for SQL Server | — | DB connectivity (Windows/Linux) |
| Docker Desktop | current | Optional local Qdrant hybrid schema retrieval |

---

## Backend setup

### 1. Copy and fill environment variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
OPENAI_API_KEY=sk-...               # Required — OpenAI API key
OPENAI_MODEL=gpt-5.6-luna           # Model to use for SQL generation
OPENAI_TIMEOUT_SECONDS=180           # Model request timeout for complex queries
OPENAI_VERIFY_SSL=false

ENVIRONMENT=dev

# SQL Server connection
DB_HOSTNAME=your-sql-server-host
DB_PORT=1433
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_TRUST_SERVER_CERTIFICATE=yes     # Required for self-signed certs

# Optional local Qdrant schema retrieval
QDRANT_ENABLED=false
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=inrule_schema
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
SCHEMA_RETRIEVAL_DENSE_LIMIT=20
SCHEMA_RETRIEVAL_SPARSE_LIMIT=20
SCHEMA_RETRIEVAL_FINAL_LIMIT=8

# Optional ClaimEngine QueryText shadow comparison
DATAQUERY_SHADOW_ENABLED=false
```

> **Windows note:** The backend uses `DB_`-prefixed keys to avoid the Windows environment variable `USERNAME` shadowing the database username from `.env`.

### 2. Install dependencies

```bash
# Using uv (recommended)
uv sync

# Or plain pip
pip install -r requirements.txt
```

### 3. Start the server

```bash
uv run uvicorn inrules_data_agent.app:app --app-dir src --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 4. Optional: enable local Qdrant hybrid retrieval

Qdrant is **not mandatory**. The backend defaults to `QDRANT_ENABLED=false`
and works without Docker, Qdrant access, a schema collection, or embedding calls.
In that mode, query generation uses the complete packaged InMemory and physical
DDL catalog exactly as the non-RAG fallback.

Use Qdrant only when local hybrid retrieval is available to you. Start it from
the repository root:

```bash
docker compose -f docker-compose.qdrant.yml up -d
```

Index the packaged InMemory and physical DDL metadata using OpenAI embeddings:

```bash
cd backend
uv run python -m inrules_data_agent.retrieval.index_schema --recreate
```

Then set `QDRANT_ENABLED=true` and restart the backend. Only schema metadata is
stored in Qdrant. Incoming business meanings, descriptions, and acceptance
criteria are embedded temporarily at request time and are not persisted.

Developers without Qdrant should leave or set:

```env
QDRANT_ENABLED=false
```

No other Qdrant variables are required when it is disabled.

Hybrid retrieval combines OpenAI dense embeddings with deterministic sparse
lexical vectors for exact table, column, and parameter names. The fallback is
automatic: if Qdrant is disabled, unreachable, not indexed, misconfigured, or
an embedding/retrieval request fails, the generator logs the issue and safely
uses the complete packaged DDL catalog. Query generation remains available.

### 5. MVP1 SQL generation behavior

MVP1 returns validated, actual `SELECT` SQL for each atomic data-required rule
step. It does not generate `QueryParams`/`ReturnVals`, write ClaimEngine
configuration tables, or replace generated SQL with stored `DataQuery.QueryText`.

Source and relationship rules:

- Prefer request/common/precomputed values and one complete InMemory frontier
  source when they contain the required fact.
- InMemory DTO tables do not use `NOLOCK`.
- Physical SQL Server tables use `WITH (NOLOCK)`.
- Prefer one complete table, but allow multiple physical tables when the current
  atomic business meaning explicitly requires them and every join key matches a
  reviewed IL relationship.
- Reject mixed InMemory/physical SQL, ungrounded joins, unsupported set operations,
  multiple statements, and tables or columns absent from the supplied DDL.

Description and acceptance criteria remain supporting context. The current atomic
`business_meaning` is authoritative for output shape, predicates, literals, and
required sources.

### 6. Optional: enable QueryText shadow comparison

Set `DATAQUERY_SHADOW_ENABLED=true` to compare each validated generated query
against the current `ClaimEngine.dbo.DataQuery.QueryText` records. MVP1 reads the
database on every generated step and intentionally does not cache the catalog.

Shadow mode never replaces generated SQL. It adds `querytext_shadow_matches`
metadata only when a stored single-table QueryText has strict normalized
equivalence: the same canonical table, business literals, operators, Boolean
predicate structure, and compatible projection. Runtime placeholder dialects
may differ. Multi-table, fragment, and unparseable records are excluded.

If ClaimEngine is unavailable or matching fails, the error is logged and the
validated generated SQL is returned unchanged.

#### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/generate_queries` | Generate SQL from Criteria Analyzer JSON |
| `POST` | `/generate_queries/bulk` | Generate SQL for multiple Criteria Analyzer JSON payloads |
| `POST` | `/execute_query` | Execute a SELECT query against the live DB |

`GET /health`, single-generation responses, and bulk responses include
`data_agent_runtime` metadata with the loaded package version, implementation path,
build SHA (when `DATA_AGENT_BUILD_SHA` is set), and model name. Report integrations
should retain this metadata so the executed standalone, installed, or bundled source
can be identified.

Bulk requests use `{"items": [...]}` and may set a top-level `generation_mode` default.
An item's explicit `generation_mode` takes precedence. Items are processed in input
order, and an unexpected failure is returned as a `BULK_ITEM_FAILURE` for that item
without discarding successful sibling responses. The bulk envelope reports
`total_items`, `successful_items`, `failed_items`, and an `available` or `partial`
status.

### 7. Run backend tests

```bash
uv run pytest tests/ -v
```

---

## Frontend setup

### 1. Install dependencies

```bash
cd frontend/client
npm install
```

### 2. Configure the environment

The frontend uses `frontend/client/config/app-config.yml` — **no `.env` file needed** for local development. The `localhost` environment already points to `http://localhost:8000` for the backend.

### 3. Start the dev server

```bash
npm run local
```

The UI will be available at `http://localhost:5173`.

Navigate to **`/data-agent`** to use the Data Agent.

### 4. Build for production

```bash
npm run build:local
```

Output goes to `frontend/client/dist/`.

---

## How it works

```
1. Paste Criteria Analyzer JSON into the chat input on /data-agent
2. The UI calls POST /generate_queries with the JSON
3. The backend retrieves relevant DDL schemas with local Qdrant when enabled; otherwise it automatically uses the complete packaged catalog
4. Generated SQL cards appear per step — each with an Execute button
5. Clicking Execute calls POST /execute_query and returns results
```

The **Response JSON** tab on each card shows the raw backend response for debugging.

---

## SQL Server connectivity notes

- The backend requires **ODBC Driver 18 for SQL Server**
- `TrustServerCertificate=yes` is required when the server uses a self-signed certificate
- `load_dotenv()` does **not** override existing OS environment variables — this is why `DB_`-prefixed keys are used instead of bare `USERNAME` / `PASSWORD`
