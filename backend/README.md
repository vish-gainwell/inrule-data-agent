# InRule Data Agent

Generates parameterized SQL queries (QueryText + QueryParams) for InRule pharmacy claim-edit rules.

Part of a two-agent pipeline: the **Criteria Analyzer** (another team) breaks ADO rule logic into steps and flags which steps need data queries. This agent handles those steps.

## How it works

```
Criteria Analyzer output (requires_data_query = true steps)
    ↓
POST /generate_query_params
    { "dataQueryName": "DiagnosisRequired", "businessMeaning": "...", "environment": "prod" }
    ↓
{ "sourceTemplate": "...", "columnI": "<QueryText>", "columnJ": "<QueryParams JSON>", "validation": {...} }
```

- `dataQueryName` — authoritative name from Column H of the ground truth spreadsheet
- `businessMeaning` — plain-English step description from Criteria Analyzer output

## Layout

```
src/inrules_data_agent/
├── app.py                  FastAPI app — /health + /generate_query_params
├── partb/generate.py       Core logic: dataQueryName → template → QueryText + QueryParams
├── registry/               Template provider + runtime variable registry
├── fixtures/templates/     Named SQL templates (JSON)
├── validate/               S2 placeholder/param validation
├── catalog/                Schema catalog from DDL files
└── llm/                    OpenAI client (reserved for future LLM path)

cc-bridge/
├── ARCHITECTURE.md         Architecture reference — read this first
├── groundtruth_spreadsheet_export.json
└── derived_schema_ddls/    Real table schemas
```

## Running locally

```bash
cd inrules-data-agent
uv run uvicorn inrules_data_agent.app:app --app-dir src --reload
```

Health check: `GET /health`

## Local DataQuery reuse catalog

Reuse matching reads a local, read-only SQLite catalog first. This lets normal
ADO/Data Agent runs validate exact reusable DataQuery templates without SQL
Server credentials or a live ClaimEngine connection.

```text
ADO request → local SQLite catalog → deterministic reuse match
```

The catalog contains approved QueryText templates and DataPackage assignment
metadata only; it does not contain claims, members, PHI, credentials, or live
claim data. If no valid local catalog is available, the agent preserves the
existing ClaimEngine lookup fallback. If both sources are unavailable, the API
returns `REUSE_VALIDATION_UNAVAILABLE` rather than claiming a new query is not
reusable.

A controlled user with ClaimEngine access creates the initial static catalog:

```bash
PYTHONPATH=src python scripts/export_dataquery_catalog.py
```

The default output is:

```text
src/inrules_data_agent/retrieval/data/dataquery_reuse_catalog.sqlite3
```

To use a catalog stored elsewhere, set:

```text
DATAQUERY_CATALOG_PATH=C:\path\dataquery_reuse_catalog.sqlite3
```

Catalog export is an explicit maintenance command. It never runs during API
startup or for an individual ADO request.

## Tests

```bash
uv run pytest tests/ -v
```
