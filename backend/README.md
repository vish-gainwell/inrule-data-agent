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

## Tests

```bash
uv run pytest tests/ -v
```

42 tests, all passing.
