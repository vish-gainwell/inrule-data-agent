from __future__ import annotations

import os
import re
import time
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any

import pyodbc
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .generator.generate import generate_queries_for_step

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Step(BaseModel):
    step_number: int
    business_meaning: str
    requires_data_query: bool = False

    model_config = {"extra": "allow"}


class GenerateQueriesRequest(BaseModel):
    edit_id: str
    steps: list[Step]


class BulkGenerateQueriesRequest(BaseModel):
    items: list[GenerateQueriesRequest]


class ExecuteQueryRequest(BaseModel):
    sql: str
    params: dict[str, str] = Field(default_factory=dict)


def build_generate_queries_response(request: GenerateQueriesRequest) -> dict[str, Any]:
    queries = []
    for step in request.steps:
        if not step.requires_data_query:
            continue
        assembled = generate_queries_for_step(step.business_meaning)
        queries.append(
            {
                "step_number": step.step_number,
                "business_meaning": step.business_meaning,
                "queries": assembled,
                "matched": len(assembled) > 0,
            }
        )
    return {"edit_id": request.edit_id, "queries": queries}


def substitute_placeholders(sql: str, params: dict[str, str]) -> str:
    def replacer(match: re.Match[str]) -> str:
        key = match.group(1).strip()
        for param_key, value in params.items():
            if param_key.lower() != key.lower():
                continue
            replacement = str(value).replace("'", "''")
            before = sql[match.start() - 1] if match.start() > 0 else ""
            after = sql[match.end()] if match.end() < len(sql) else ""
            if before == "'" and after == "'":
                return replacement
            return f"'{replacement}'"
        return match.group(0)

    return re.sub(r"\{\{([^}]+)\}\}", replacer, sql)


def _json_safe(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def _db_connection_string() -> str:
    # Use DB_-prefixed keys to avoid shadowing Windows built-in env vars
    # (USERNAME, HOSTNAME, etc.) which load_dotenv() won't override by default.
    hostname = os.environ.get("DB_HOSTNAME") or os.environ.get("hostname")
    port = os.environ.get("DB_PORT") or os.environ.get("port") or "1433"
    username = os.environ.get("DB_USERNAME") or os.environ.get("db_username")
    password = os.environ.get("DB_PASSWORD") or os.environ.get("db_password")
    trust = os.environ.get("DB_TRUST_SERVER_CERTIFICATE", "yes")

    missing = [
        name
        for name, value in {
            "hostname": hostname,
            "username": username,
            "password": password,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing database environment variables: {', '.join(missing)}")

    return (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={hostname},{port};"
        "DATABASE=master;"
        f"UID={username};"
        f"PWD={password};"
        f"TrustServerCertificate={trust};"
    )


def create_app() -> FastAPI:
    app = FastAPI(title="InRule Data Agent", version="0.2.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/generate_queries")
    def generate_queries(request: GenerateQueriesRequest) -> dict[str, Any]:
        return build_generate_queries_response(request)

    @app.post("/generate_queries/bulk")
    def bulk_generate_queries(request: BulkGenerateQueriesRequest) -> dict[str, Any]:
        return {
            "items": [
                build_generate_queries_response(item)
                for item in request.items
            ]
        }

    @app.post("/execute_query")
    def execute_query(request: ExecuteQueryRequest) -> dict[str, Any]:
        sql = substitute_placeholders(request.sql, request.params)
        if not sql.lstrip().lower().startswith("select"):
            return JSONResponse(
                status_code=400, content={"error": "Only SELECT queries are allowed"}
            )
        if re.search(r"\b(?:\[?InMemory\]?\.)", sql, re.IGNORECASE):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "InMemory logical queries cannot be executed through SQL Server"
                },
            )

        start = time.perf_counter()
        try:
            with pyodbc.connect(_db_connection_string(), timeout=30) as conn:
                cursor = conn.cursor()
                cursor.execute(sql)
                columns = [col[0] for col in cursor.description or []]
                rows = [
                    [_json_safe(value) for value in row]
                    for row in cursor.fetchmany(500)
                ]
        except Exception as exc:
            return JSONResponse(status_code=500, content={"error": str(exc)})

        execution_ms = int((time.perf_counter() - start) * 1000)
        return {
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "execution_ms": execution_ms,
        }

    return app


app = create_app()
