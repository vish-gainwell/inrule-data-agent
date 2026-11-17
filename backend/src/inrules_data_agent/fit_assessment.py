"""Lightweight LLM fit assessment for input data queries."""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx
from openai import OpenAI
from openai.providers import bedrock

from .generator.generate import (
    _configured_environment,
    _find_invalid_table_refs,
    _find_invalid_column_refs,
    _find_invalid_sql_artifacts,
    _find_output_name_artifacts,
    _find_output_shape_artifacts,
    _find_required_business_concept_artifacts,
    _find_deterministic_selection_artifacts,
    select_ddls,
)

_FIT_SYSTEM_PROMPT = """\
You are a SQL fitness assessor for a pharmacy claims processing system.
Given a business meaning and an existing SQL query, determine whether the query
retrieves the data described by the business meaning.

Return JSON with exactly these keys:
- verdict: "FIT" if the query fully satisfies the business meaning as-is.
           "PARTIAL_FIT" if the query covers the right tables/logic but is missing
           parameters, filters, or output columns that the business meaning requires.
           "NOT_FIT" if the query retrieves fundamentally different data.
- reason: A one-sentence explanation of your verdict.
- missing_params: A list of the missing parameter descriptions (empty unless PARTIAL_FIT).\
"""

_AUGMENT_SYSTEM_PROMPT = """\
You are a SQL augmentation assistant for a pharmacy claims processing system (SQL Server / T-SQL).
Given an existing query, a list of missing parameters, and the relevant DDL schemas,
return the augmented query that adds the missing parameters while preserving the
original query structure and intent.
Use ONLY tables and columns that exist in the provided DDL schemas.

Return JSON with exactly these keys:
- query_text: The augmented SQL query, or null if augmentation is not possible.
- query_params: A dictionary of all parameter bindings in the augmented query
  (parameter name -> runtime value or source mapping), including both original and newly added ones.
- return_vals: A list of all output column names in the augmented query's SELECT clause.\
"""


def _build_llm_client(jurisdiction: str = "IL") -> tuple[OpenAI, str]:
    environment = _configured_environment()
    state = str(jurisdiction or "").strip().upper()
    timeout_seconds = float(os.environ.get("OPENAI_TIMEOUT_SECONDS", "180"))

    if environment == "LOCAL":
        if os.environ.get("KUBERNETES_SERVICE_HOST"):
            raise EnvironmentError(
                "ENVIRONMENT=LOCAL is not allowed inside Kubernetes"
            )
        if state != "IL":
            raise EnvironmentError(
                "ENVIRONMENT=LOCAL supports IL query generation only"
            )
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise EnvironmentError("OPENAI_API_KEY is not set")
        model = os.environ.get("OPENAI_MODEL", "gpt-5.6-luna")
        base_url = (
            os.environ.get("OPENAI_BASE_URL")
            or os.environ.get("OPENAI_API_BASE")
            or "https://us.api.openai.com/v1"
        )
        verify_ssl = os.environ.get("OPENAI_VERIFY_SSL", "false").lower() in {
            "1", "true", "yes",
        }
        http_client = httpx.Client(verify=verify_ssl, timeout=timeout_seconds)
        client_kwargs: dict[str, Any] = {"api_key": api_key, "http_client": http_client}
        if base_url:
            client_kwargs["base_url"] = base_url
        return OpenAI(**client_kwargs), model

    project = os.environ.get(f"BEDROCK_PROJECT_{state}")
    if state not in {"IL", "MO"} or not project:
        raise EnvironmentError(f"BEDROCK_PROJECT_{state} is not configured")
    model = os.environ.get("BEDROCK_MODEL", "openai.gpt-5.5")
    region = os.environ.get("BEDROCK_REGION", "us-east-1")
    client = OpenAI(
        provider=bedrock(region=region, api_key=None),
        project=project,
        timeout=timeout_seconds,
    )
    return client, model


def _call_llm(client: OpenAI, model: str, system_prompt: str, user_message: str) -> dict:
    request_kwargs: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "response_format": {"type": "json_object"},
    }
    if model.lower().startswith(("gpt-5", "openai.gpt-5", "o1", "o3", "o4")):
        request_kwargs["max_completion_tokens"] = 1000
    else:
        request_kwargs["temperature"] = 0
        request_kwargs["max_tokens"] = 1000

    response = client.chat.completions.create(**request_kwargs)
    content = response.choices[0].message.content
    return json.loads(content) if content else {}


def assess_fit(
    business_meaning: str,
    query_text: str,
    jurisdiction: str = "IL",
) -> dict | None:
    try:
        client, model = _build_llm_client(jurisdiction)
        user_message = (
            f"Business meaning: {business_meaning}\n\n"
            f"Existing SQL:\n{query_text}"
        )
        result = _call_llm(client, model, _FIT_SYSTEM_PROMPT, user_message)
        verdict = str(result.get("verdict", "")).upper()
        if verdict not in {"FIT", "PARTIAL_FIT", "NOT_FIT"}:
            verdict = "NOT_FIT"
        return {
            "verdict": verdict,
            "reason": str(result.get("reason", "")),
            "missing_params": list(result.get("missing_params", [])),
        }
    except Exception as exc:
        print(f"[fit_assessment] LLM call failed; falling through to generation: {exc}")
        return None


def augment_query(
    query_text: str,
    business_meaning: str,
    missing_params: list[str],
    ddl_context: str,
    jurisdiction: str = "IL",
) -> dict | None:
    try:
        client, model = _build_llm_client(jurisdiction)
        user_message = (
            f"Original SQL:\n{query_text}\n\n"
            f"Business meaning: {business_meaning}\n\n"
            f"Missing parameters:\n"
            + "\n".join(f"- {p}" for p in missing_params)
            + f"\n\nDDL schemas:\n{ddl_context}"
        )
        result = _call_llm(client, model, _AUGMENT_SYSTEM_PROMPT, user_message)
        augmented = result.get("query_text")
        if not augmented or not str(augmented).strip().upper().startswith("SELECT"):
            return None
        return {
            "query_text": str(augmented).strip(),
            "query_params": result.get("query_params", {}),
            "return_vals": result.get("return_vals", []),
        }
    except Exception as exc:
        print(f"[fit_assessment] augmentation failed: {exc}")
        return None


def evaluate_input_data_query(
    step: Any,
    business_meaning: str,
    jurisdiction: str = "IL",
) -> dict | None:
    extras = step.model_extra or {}
    input_dq = extras.get("input_data_query")
    if not input_dq:
        return None

    query_text = (
        input_dq.get("query_text", "") if isinstance(input_dq, dict) else str(input_dq)
    )
    if not query_text.strip():
        return None

    fit = assess_fit(business_meaning, query_text, jurisdiction)
    if fit is None:
        return None
    original_query = query_text

    if fit["verdict"] == "FIT":
        return _build_result(
            reuse_decision="REUSE_INPUT_DATAQUERY",
            query_text=query_text,
            fit_assessment=fit,
            original_query=original_query,
            input_dq=input_dq,
            business_meaning=business_meaning,
        )

    if fit["verdict"] == "PARTIAL_FIT":
        ddl_statements = select_ddls(business_meaning)
        ddl_context = "\n".join(ddl_statements) if ddl_statements else ""
        if ddl_context:
            augment_result = augment_query(
                query_text, business_meaning, fit["missing_params"], ddl_context, jurisdiction,
            )
            if augment_result:
                placeholders = set(
                    re.findall(r"\{\{:?([^{}]+)\}\}", augment_result["query_text"])
                )
                bound_params = {
                    k.lstrip(":").lower() for k in augment_result["query_params"]
                }
                unbound = {
                    p for p in placeholders
                    if p.lstrip(":").lower() not in bound_params
                    and p.lstrip(":").lower() != "output"
                }
                if unbound:
                    print(
                        f"[fit_assessment] augmented SQL has unbound placeholders: "
                        f"{', '.join(sorted(unbound))}"
                    )
                    return None
                augmented_dq = dict(input_dq) if isinstance(input_dq, dict) else {}
                augmented_dq["query_params"] = augment_result["query_params"]
                augmented_dq["return_vals"] = augment_result["return_vals"]
                return _build_result(
                    reuse_decision="REUSE_INPUT_DATAQUERY_AUGMENTED",
                    query_text=augment_result["query_text"],
                    fit_assessment=fit,
                    original_query=original_query,
                    input_dq=augmented_dq,
                    business_meaning=business_meaning,
                )

    return None


def _validate_fit_sql(
    sql: str, business_meaning: str, ddl_context: str,
) -> tuple[str | None, list[str]]:
    invalid_tables = _find_invalid_table_refs(sql, ddl_context)
    if invalid_tables:
        return "DRAFT_REQUIRES_REVIEW", [f"invalid table ref: {t}" for t in invalid_tables]

    invalid_columns = _find_invalid_column_refs(sql, ddl_context)
    if invalid_columns:
        return "DRAFT_REQUIRES_REVIEW", [f"invalid column ref: {c}" for c in invalid_columns]

    invalid_artifacts = _find_invalid_sql_artifacts(sql, ddl_context, business_meaning)
    invalid_artifacts.extend(
        _find_required_business_concept_artifacts(sql, business_meaning)
    )
    invalid_artifacts.extend(
        _find_deterministic_selection_artifacts(sql, business_meaning, ddl_context)
    )
    invalid_artifacts.extend(_find_output_shape_artifacts(sql, business_meaning))
    invalid_artifacts.extend(_find_output_name_artifacts(sql))
    if not invalid_artifacts:
        return "VALIDATED", []
    return "DRAFT_REQUIRES_REVIEW", invalid_artifacts


def _build_result(
    *,
    reuse_decision: str,
    query_text: str,
    fit_assessment: dict,
    original_query: str,
    input_dq: Any,
    business_meaning: str,
) -> dict | None:
    ddl_statements = select_ddls(business_meaning)
    ddl_context = "\n".join(ddl_statements) if ddl_statements else ""
    validation_status, review_warnings = _validate_fit_sql(
        query_text, business_meaning, ddl_context,
    )
    if validation_status != "VALIDATED":
        print(
            f"[fit_assessment] input SQL failed validation: "
            f"{', '.join(review_warnings)}"
        )
        return None

    data_query_id = input_dq.get("data_query_id") if isinstance(input_dq, dict) else None
    data_query_name = input_dq.get("data_query_name") if isinstance(input_dq, dict) else None
    query_params = input_dq.get("query_params", {}) if isinstance(input_dq, dict) else {}
    return_vals = input_dq.get("return_vals", []) if isinstance(input_dq, dict) else []
    return {
        "reuse_decision": reuse_decision,
        "data_query": {
            "data_query_id": data_query_id,
            "data_query_name": data_query_name,
            "query_text": query_text,
            "query_params": query_params,
            "return_vals": return_vals,
        },
        "fit_assessment": {
            "verdict": fit_assessment["verdict"],
            "reason": fit_assessment["reason"],
            "missing_params": fit_assessment["missing_params"],
            "original_query": original_query,
        },
        "validation_status": validation_status,
        "review_warnings": review_warnings,
        "queries": [query_text],
        "matched": True,
    }
