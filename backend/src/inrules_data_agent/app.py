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

from .generator.generate import generate_query_result_for_step
from .retrieval.querytext_shadow import (
    find_comparison_candidates,
    find_reuse_match,
    find_shadow_match,
    load_querytext_rows,
    load_reuse_corpus,
    reuse_matching_enabled,
    shadow_matching_enabled,
)

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Step(BaseModel):
    step_number: int
    business_meaning: str
    requires_data_query: bool = False

    model_config = {"extra": "allow"}


class GenerateQueriesRequest(BaseModel):
    edit_id: str
    description: str | None = None
    acceptance_criteria: str | list[str] | None = None
    steps: list[Step]
    generation_mode: str = "draft"


class BulkGenerateQueriesRequest(BaseModel):
    items: list[GenerateQueriesRequest]


class ExecuteQueryRequest(BaseModel):
    sql: str
    params: dict[str, str] = Field(default_factory=dict)


def _query_task_for_step(step: Step) -> str:
    """Use the analyzer's resolved query instruction when it provides one."""

    extras = step.model_extra or {}
    entity_resolution = extras.get("entity_resolution")
    if not isinstance(entity_resolution, dict):
        return step.business_meaning
    entities = entity_resolution.get("entities")
    if not isinstance(entities, list):
        return step.business_meaning
    for entity in entities:
        if isinstance(entity, dict):
            instruction = entity.get("data_query_instruction")
            if isinstance(instruction, str) and instruction.strip():
                return instruction.strip()
    return step.business_meaning


def build_generate_queries_response(request: GenerateQueriesRequest) -> dict[str, Any]:
    step_queries = []
    unmatched_steps = []
    inconclusive_steps = []
    draft_mode = request.generation_mode.lower() == "draft"
    reuse_corpus = None
    reuse_corpus_error = None
    if reuse_matching_enabled():
        try:
            reuse_corpus = load_reuse_corpus()
        except Exception as exc:
            reuse_corpus_error = str(exc)
            print(f"[dataquery_reuse] corpus lookup failed; reuse skipped: {exc}")
    for step in request.steps:
        if not step.requires_data_query:
            continue

        extras = step.model_extra or {}
        query_task = _query_task_for_step(step)
        if str(extras.get("data_query_decision", "")).lower() == "inconclusive":
            result = {
                "queries": [],
                "failure_category": "INCONCLUSIVE_INPUT",
                "failure_reason": "The analyzer marked this data-query decision as inconclusive.",
            }
            inconclusive_steps.append(step.step_number)
        else:
            result = generate_query_result_for_step(
                query_task,
                description=request.description,
                acceptance_criteria=request.acceptance_criteria,
                draft_mode=draft_mode,
            )

        assembled = result["queries"]
        matched = bool(assembled)
        if not matched:
            unmatched_steps.append(step.step_number)
        shadow_matches = []
        comparison_candidates = []
        try:
            if shadow_matching_enabled() and assembled:
                querytext_rows = load_querytext_rows()
                for sql in assembled:
                    match = find_shadow_match(sql, querytext_rows)
                    if match:
                        shadow_matches.append(match.as_dict())
                    comparison_candidates.extend(
                        candidate.as_dict()
                        for candidate in find_comparison_candidates(sql, querytext_rows)
                    )
        except Exception as exc:
            print(f"[querytext_shadow] lookup failed; generated SQL unchanged: {exc}")
            shadow_matches = []
            comparison_candidates = []
        reuse_matches = []
        if reuse_corpus is not None:
            for sql in assembled:
                reuse_match = find_reuse_match(sql, reuse_corpus)
                if reuse_match:
                    reuse_matches.append(reuse_match.as_dict())
        reuse_decision = (
            "REUSE_EXISTING_DATAQUERY" if reuse_matches
            else "REUSE_VALIDATION_UNAVAILABLE" if matched and reuse_corpus_error
            else "PROPOSE_NEW_DATAQUERY" if matched
            else "NO_QUERY_PROPOSED"
        )
        step_queries.append(
            {
                "step_number": step.step_number,
                "business_meaning": step.business_meaning,
                "query_task": query_task,
                "queries": assembled,
                "matched": matched,
                "query_generated": matched,
                "failure_category": result["failure_category"],
                "failure_reason": result["failure_reason"],
                "validation_status": result.get("validation_status", "VALIDATED" if matched else "NOT_GENERATED"),
                "review_notes": result.get("failure_reason") if matched else None,
                "publishable": matched,
                "reuse_decision": reuse_decision,
                "reuse_matches": reuse_matches,
                "reuse_corpus_error": reuse_corpus_error,
                "querytext_shadow_matches": shadow_matches,
                "querytext_comparison_candidates": comparison_candidates,
            }
        )
    return {
        "edit_id": request.edit_id,
        "description": request.description,
        "acceptance_criteria": request.acceptance_criteria,
        "queries": step_queries,
        "step_queries": step_queries,
        "unmatched_steps": unmatched_steps,
        "inconclusive_steps": inconclusive_steps,
        "data_agent_status": "available",
        "data_agent_mode": "in_process",
        "generation_mode": "draft" if draft_mode else "strict",
    }


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
