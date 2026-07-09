# ai-solutions-aianalyst-ui

SQL Data Agent demo UI for `../inrules-data-agent`.

The active demo surface is `/data-agent`. Other PI Analyst tabs are hidden for
this workstream because their backend endpoints are out of scope.

## Local start

Start the backend from `../inrules-data-agent`:

```bash
python -m uvicorn inrules_data_agent.app:app --app-dir src --reload
```

Start the UI from `client/`:

```bash
npm install
npm run local
```

The local UI config points at `http://localhost:8000`, matching the backend
command above.

## Environment config

All build-time configuration lives in `client/config/app-config.yml`. Vite loads
this YAML directly.

Examples from `client/`:

```bash
npm run local          # localhost (mode: localhost)
npm run build:local    # local production bundle
```





