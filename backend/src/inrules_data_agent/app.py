from __future__ import annotations

import os
import re
import time
from importlib.metadata import PackageNotFoundError, version
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any, Literal

import pyodbc
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .generator.generate import generate_query_result_for_step
from .retrieval.querytext_shadow import (
    find_reuse_match,
    load_reuse_corpus,
    propose_new_data_query,
    reuse_matching_enabled,
)

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Step(BaseModel):
    step_number: int
    business_meaning: str
    requires_data_query: bool = False
    query_result_shape: Literal["scalar", "count", "value_set"] | None = None

    model_config = {"extra": "allow"}


class GenerateQueriesRequest(BaseModel):
    edit_id: str
    description: str | None = None
    acceptance_criteria: str | list[str] | None = None
    steps: list[Step]
    generation_mode: str = "draft"


class BulkGenerateQueriesRequest(BaseModel):
    items: list[GenerateQueriesRequest]
    generation_mode: str | None = None


class ExecuteQueryRequest(BaseModel):
    sql: str
    params: dict[str, str] = Field(default_factory=dict)


_CRITERION_REF_RE = re.compile(r"(?:acceptance\s+criteria|AC)?\s*(\d+)", re.IGNORECASE)


def _package_version() -> str:
    try:
        return version("inrules-data-agent")
    except PackageNotFoundError:
        return "unpackaged"


def _data_agent_runtime() -> dict[str, str | None]:
    """Identify the implementation that handled a request without exposing secrets."""

    return {
        "package_version": _package_version(),
        "build_sha": os.environ.get("DATA_AGENT_BUILD_SHA"),
        "implementation_path": str(Path(__file__).resolve()),
        "model": os.environ.get("OPENAI_MODEL"),
    }


def _acceptance_criteria_for_step(
    step: Step,
    acceptance_criteria: str | list[str] | None,
) -> str | list[str] | None:
    """Return only acceptance criteria explicitly referenced by the current step."""

    if not isinstance(acceptance_criteria, list):
        return acceptance_criteria
    reference = (step.model_extra or {}).get("ado_criterion_ref")
    if not isinstance(reference, str) or not reference.strip():
        return None
    indexes = {
        int(match.group(1))
        for match in _CRITERION_REF_RE.finditer(reference)
        if 1 <= int(match.group(1)) <= len(acceptance_criteria)
    }
    selected = [criterion for index, criterion in enumerate(acceptance_criteria, 1) if index in indexes]
    return selected or None


def _query_task_with_constraints(objective: str, business_meaning: str) -> str:
    if objective.strip() == business_meaning.strip():
        return business_meaning.strip()
    return (
        f"ATOMIC DATA RETRIEVAL OBJECTIVE:\n{objective.strip()}\n\n"
        "CURRENT BUSINESS FACT CONSTRAINTS AND REQUESTED OUTPUT:\n"
        f"{business_meaning.strip()}"
    )


def _with_result_shape(objective: str, result_shape: str | None) -> str:
    """Ensure the deterministic shape is part of the atomic retrieval task."""
    text = objective.strip()
    if not result_shape:
        return text
    directive = f"Required result shape: {result_shape}."
    if re.search(
        r"\brequired\s+result\s+shape\s*:\s*(?:scalar|count|value_set)\s*\.?",
        text,
        re.IGNORECASE,
    ):
        return text
    return f"{text} {directive}"


def _query_task_for_step(step: Step) -> str:
    """Use an atomic objective without discarding business-fact constraints."""

    extras = step.model_extra or {}
    entity_resolution = extras.get("entity_resolution")
    if isinstance(entity_resolution, dict):
        entities = entity_resolution.get("entities")
        if isinstance(entities, list):
            for entity in entities:
                if isinstance(entity, dict):
                    instruction = entity.get("data_query_instruction")
                    if isinstance(instruction, str) and instruction.strip():
                        return _query_task_with_constraints(
                            _with_result_shape(
                                instruction, step.query_result_shape
                            ),
                            step.business_meaning,
                        )
    reason = extras.get("data_query_reason")
    if isinstance(reason, str) and reason.strip():
        return _query_task_with_constraints(
            _with_result_shape(reason, step.query_result_shape),
            step.business_meaning,
        )
    return _with_result_shape(step.business_meaning, step.query_result_shape)


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
                acceptance_criteria=_acceptance_criteria_for_step(
                    step, request.acceptance_criteria
                ),
                draft_mode=draft_mode,
            )

        assembled = result["queries"]
        matched = bool(assembled)
        if not matched:
            unmatched_steps.append(step.step_number)

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
            else "REQUIRED_QUERY_NOT_GENERATED"
        )
        proposed_new_data_queries = (
            [propose_new_data_query(sql).as_dict() for sql in assembled]
            if reuse_decision in {
                "PROPOSE_NEW_DATAQUERY",
                "REUSE_VALIDATION_UNAVAILABLE",
            }
            else []
        )
        selected_contract = reuse_matches[0] if reuse_matches else (
            proposed_new_data_queries[0] if proposed_new_data_queries else None
        )
        data_query = None
        if selected_contract:
            data_query = {
                "data_query_id": selected_contract.get("data_query_id"),
                "data_query_name": selected_contract.get("data_query_name"),
                "query_text": selected_contract["query_text"],
                "query_params": selected_contract["proposed_query_params"],
                "return_vals": selected_contract["proposed_return_vals"],
            }
        step_queries.append(
            {
                "step_number": step.step_number,
                "business_meaning": step.business_meaning,
                "query_result_shape": step.query_result_shape,
                "query_generated": matched,
                "reuse_decision": reuse_decision,
                "data_query": data_query,
                "failure_category": None if matched else result["failure_category"],
                "failure_reason": None if matched else result["failure_reason"],
                "validation_status": result.get("validation_status"),
                "review_warnings": result.get("review_warnings", []),
                "generation_attempts": result.get("generation_attempts", []),
                "queries": assembled,
                "matched": matched,
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
        "data_agent_runtime": _data_agent_runtime(),
    }


def build_bulk_generate_queries_response(
    request: BulkGenerateQueriesRequest,
) -> dict[str, Any]:
    """Generate every item in order while isolating unexpected item failures."""

    responses = []
    failed_items = 0
    for item in request.items:
        effective_item = item
        if request.generation_mode and "generation_mode" not in item.model_fields_set:
            effective_item = item.model_copy(
                update={"generation_mode": request.generation_mode}
            )
        try:
            responses.append(build_generate_queries_response(effective_item))
        except Exception as exc:
            failed_items += 1
            required_steps = [
                step.step_number for step in effective_item.steps
                if step.requires_data_query
            ]
            responses.append(
                {
                    "edit_id": effective_item.edit_id,
                    "description": effective_item.description,
                    "acceptance_criteria": effective_item.acceptance_criteria,
                    "queries": [],
                    "step_queries": [],
                    "unmatched_steps": required_steps,
                    "inconclusive_steps": [],
                    "data_agent_status": "unavailable",
                    "data_agent_mode": "in_process",
                    "generation_mode": effective_item.generation_mode,
                    "failure_category": "BULK_ITEM_FAILURE",
                    "failure_reason": str(exc),
                    "data_agent_runtime": _data_agent_runtime(),
                }
            )
    return {
        "items": responses,
        "total_items": len(responses),
        "successful_items": len(responses) - failed_items,
        "failed_items": failed_items,
        "data_agent_status": "partial" if failed_items else "available",
        "generation_mode": request.generation_mode,
        "data_agent_runtime": _data_agent_runtime(),
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
    app = FastAPI(title="InRule Data Agent", version=_package_version())
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, Any]:
        return {"status": "ok", "data_agent_runtime": _data_agent_runtime()}

    @app.post("/generate_queries")
    def generate_queries(request: GenerateQueriesRequest) -> dict[str, Any]:
        return build_generate_queries_response(request)

    @app.post("/generate_queries/bulk")
    def bulk_generate_queries(request: BulkGenerateQueriesRequest) -> dict[str, Any]:
        return build_bulk_generate_queries_response(request)

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
