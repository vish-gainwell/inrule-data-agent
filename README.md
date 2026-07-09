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
OPENAI_MODEL=gpt-4o                 # Model to use for SQL generation
OPENAI_VERIFY_SSL=false

ENVIRONMENT=dev

# SQL Server connection
DB_HOSTNAME=your-sql-server-host
DB_PORT=1433
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_TRUST_SERVER_CERTIFICATE=yes     # Required for self-signed certs
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

#### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/generate_queries` | Generate SQL from Criteria Analyzer JSON |
| `POST` | `/generate_queries/bulk` | Generate SQL for multiple Criteria Analyzer JSON payloads |
| `POST` | `/execute_query` | Execute a SELECT query against the live DB |

### 4. Run backend tests

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
3. The backend passes each rule step + DDL schema to the LLM
4. Generated SQL cards appear per step — each with an Execute button
5. Clicking Execute calls POST /execute_query and returns results
```

The **Response JSON** tab on each card shows the raw backend response for debugging.

---

## SQL Server connectivity notes

- The backend requires **ODBC Driver 18 for SQL Server**
- `TrustServerCertificate=yes` is required when the server uses a self-signed certificate
- `load_dotenv()` does **not** override existing OS environment variables — this is why `DB_`-prefixed keys are used instead of bare `USERNAME` / `PASSWORD`
