from __future__ import annotations

import os
import re
from functools import lru_cache
from pathlib import Path
from typing import cast

import httpx
import pyodbc
import sqlglot
from dotenv import load_dotenv
from openai import OpenAI
from sqlglot import exp
from sqlglot.errors import ParseError, TokenError
from sqlglot.expressions.core import Expression

from ..retrieval.qdrant_schema import retrieve_schema_ddls

load_dotenv(Path(__file__).resolve().parents[3] / ".env")

_SCHEMA_DIR = Path(__file__).resolve().parent.parent / "schema"
_IN_MEMORY_SCHEMA_DIR = Path(__file__).resolve().parent.parent / "in_memory_schema"

_LIVE_TABLE_KEYWORDS: list[tuple[str, tuple[str, str, str]]] = [
    ("claimpharm", ("plandata_rx_production", "dbo", "claimpharm")),
    ("claim pharmacy", ("plandata_rx_production", "dbo", "claimpharm")),
    ("enrollkeys", ("plandata_rx_production", "dbo", "enrollkeys")),
    ("headofhouse", ("plandata_rx_production", "dbo", "member")),
    ("member table", ("plandata_rx_production", "dbo", "member")),
    (" left join member", ("plandata_rx_production", "dbo", "member")),
    ("ndc_limits", ("HRX", "dbo", "NDC_Limits")),
    ("ndc limits", ("HRX", "dbo", "NDC_Limits")),
]

SYSTEM_PROMPT = """
You are a SQL generator for an InRule pharmacy claims processing system (SQL Server / T-SQL).

Given a business requirement and one or more table DDL schemas, generate a single SELECT
query that fulfils the requirement.

Rules:
1. Use ONLY tables and columns that exist in the provided DDL schemas.
2. Use fully qualified table names exactly as shown in the DDL
   (e.g. HRX.dbo.DrugOverrides, plandata_rx_production.dbo.claim).
3. Source hints must follow the IL execution convention:
   - Never add NOLOCK to InMemory logical DTO table references.
   - Add WITH (NOLOCK) after every physical SQL Server table reference.
4. For runtime values that come from the incoming claim, use ONLY these exact
    InRule variable placeholders — never substitute actual values or use ? parameters:

   Incoming NDC:      {{ClaimTransaction.Ndc}}
   Incoming GCN:      {{ClaimRequest.DrugRequested.GCNSeqNo.Code}}
   Incoming HIC3:     {{ClaimRequest.DrugRequested.HIC3.Code}}
   Date of Service:   {{DateOfService}}
   Member ID:         {{MemberId}}
   Provider ID:       {{ProviderId}}
   Lookback Date:     {{LookBackDate}}
   Quantity dispensed: {{QuantityDispensed}}
   Current adjudication date / current filing date: use GETDATE()

   Normalize synonyms to those exact placeholders:
   - {dos}, {incoming_dos}, date_of_service, original DOS, and
     HrxRequest.TransactionHdr.dtOfService_401_D1 all mean {{DateOfService}}.
   - {incoming_ndc}, {incoming_ndckey}, ndc, and ndckey all mean {{ClaimTransaction.Ndc}}.
   - {incoming_gcnseqno}, {incoming_gcn_seqno}, and incoming GCN all mean
     {{ClaimRequest.DrugRequested.GCNSeqNo.Code}}.
   - {incoming_hic3} means {{ClaimRequest.DrugRequested.HIC3.Code}}.
   - {member_id}, {participant_id}, {cardholder_id}, resolved member id, and
     carriermemid from the incoming claim all mean {{MemberId}} unless a query
     explicitly resolves a different member id set.
   - {provider_npi} and incoming provider id mean {{ProviderId}}.
   - HrxRequest.ClaimDetail.ClaimSeg.qtyDispensed_442_E7 and current claim
     quantity dispensed mean {{QuantityDispensed}}.

   Never emit HrxRequest.*, ClaimRequest.*, single-brace {value} tokens, or
   placeholders outside the list above.

5. Hardcode any literal values that are specified in the business requirement exactly as written
   (e.g. if business_meaning says Type = '3013_Opioid', use '3013_Opioid' verbatim;
   if it says status = 'PAID', use 'PAID').
   Do NOT invent or substitute values not present in the requirement.

6. Several columns in plandata_rx_production.dbo.claim are CHAR (fixed-width, space-padded).
   Always wrap them in RTRIM() for comparisons:
   - RTRIM(status) IN ('PAID', 'PAY', 'WAITPAY', 'DENY', 'WAITDENY', 'REV')
   - RTRIM(formtype) = 'UNIVERSALC'
   - RTRIM(resubclaimid) = ''   (empty resubmission — spaces, not null)
   - RTRIM(memid), RTRIM(provid) for member and provider ID comparisons

7. Hardcode any other literal values specified in the business requirement.
8. Determine the output shape from the CURRENT DATA QUERY BUSINESS MEANING before writing SQL:
   - If it asks for a count, existence check, or count comparison, return COUNT(*) or the requested aggregate.
   - If it asks to return values, identifiers, codes, columns, records, or details, project those exact mapped columns. Never replace them with COUNT(*).
   - If it asks for multiple attributes per record, project only those requested attributes, with clear aliases when needed by the stated output.
   - Do not add extra output columns merely because they are available in the selected table.
9. Return ONLY the raw SQL query. No explanation. No markdown. No code fences.
10. Preserve every explicit filter in the business requirement. If it says
    resubclaimid <> '' then use <> ''; do not convert it to = ''.
11. Treat request/common/precomputed values and InMemory logical DTO tables as
    frontier sources. First determine whether the current atomic task is already
    supported without physical retrieval or whether one InMemory table contains
    every column needed for the requested output and explicit predicates. If one
    InMemory table is sufficient, use it. Use physical SQL Server tables as fallback
    when the fact is unavailable in the frontier, or when the current task explicitly
    names a physical source as authoritative. Never map a concept to an unrelated
    InMemory property merely to avoid physical fallback.
12. Prefer one complete table. A query may JOIN multiple physical tables only when
    the CURRENT DATA QUERY BUSINESS MEANING explicitly requires those sources and
    the relationship is grounded by the provided schemas and reviewed IL join-key
    patterns. Every joined table and column must exist in the DDL context. Never mix
    InMemory and physical tables in one SELECT. Never use APPLY, UNION, INTERSECT,
    EXCEPT, or an ungrounded multi-table subquery. Never combine unrelated retrieval
    steps from the description or acceptance criteria.
13. Never use placeholder predicates or tautologies such as ON 1 = 0 or
    c.col = c.col. Preserve only filters explicitly stated in the business
    requirement. Never add a date, status, identifier, null check, or other
    predicate merely because a column exists in the DDL.
14. Every referenced and projected column must exist in the selected table's
    provided DDL. Never invent a column, alias an unrelated column as the
    requested value, or use a placeholder as a column name.
15. Match the requested output shape exactly. If the requirement asks to return
    values or identifiers, select those columns; do not replace them with COUNT(*).
16. Apply this information hierarchy strictly:
    a. The current data-query business meaning is authoritative for the exact
       table retrieval, filters, runtime inputs, date window, and output shape.
    b. Acceptance criteria explain the surrounding rule flow and may clarify the
       intended meaning of a term used in the current task. Use only the portions
       that directly clarify that current task; do not import other acceptance-
       criteria steps, branches, filters, literals, or tables.
    c. The rule description provides broad business purpose only. It must never
       override the current task or introduce retrieval logic by itself.
    Before returning SQL, verify every projected column and WHERE predicate is
    required by the current business meaning or is an unambiguous clarification
    of a term in that meaning from the acceptance criteria.
17. Never guess semantic mappings. In particular, do not infer that a status-like,
    authorization-like, edit-like, paid-date, form-type, or prior-authorization
    column proves paid/non-reversed/reversal/indicator semantics unless the DDL
    description or current task and acceptance criteria establish that mapping.
18. If a logical concept, requested output, filter, runtime input, identifier, or
    required join relationship cannot be mapped unambiguously to the provided DDL,
    return exactly NO_SUPPORTED_QUERY instead of approximating it, dropping it, or
    adding a proxy.
""".strip()

_UNSAFE_SQL_RE = re.compile(
    r"\b(insert|update|delete|drop|alter|truncate|exec|execute|merge|create|grant|revoke)\b",
    re.IGNORECASE,
)
_DDL_TABLE_RE = re.compile(
    r"\bCREATE\s+TABLE\s+((?:\[[^\]]+\]|[A-Za-z_][\w$#]*)"
    r"(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][\w$#]*)){2})",
    re.IGNORECASE,
)
_SQL_TABLE_RE = re.compile(
    r"\b(?:FROM|JOIN)\s+((?:\[[^\]]+\]|[A-Za-z_][\w$#]*)"
    r"(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_][\w$#]*)){0,2})",
    re.IGNORECASE,
)
_IMPOSSIBLE_PREDICATE_RE = re.compile(
    r"\b(?:ON|WHERE|AND|OR)\s+1\s*=\s*[01]\b",
    re.IGNORECASE,
)
_TAUTOLOGY_RE = re.compile(
    r"\b(?P<expr>(?:[A-Za-z_]\w*\.)?[A-Za-z_]\w*)\s*=\s*(?P=expr)\b",
    re.IGNORECASE,
)
_RAW_REQUEST_OBJECT_RE = re.compile(
    r"(?<!\{)\b(?:HrxRequest|ClaimRequest)\.",
    re.IGNORECASE,
)
_UNSUPPORTED_SET_OPERATION_RE = re.compile(
    r"\b(?:APPLY|UNION|INTERSECT|EXCEPT)\b",
    re.IGNORECASE,
)
_NOLOCK_HINT_RE = re.compile(r"\(\s*nolock\s*\)", re.IGNORECASE)
_REVIEWED_JOIN_KEYS = {
    frozenset({("enrollkeys", "memid"), ("member", "memid")}),
    frozenset({("enrollkeys", "enrollid"), ("enrollcoverage", "enrollid")}),
    frozenset({("entity", "entid"), ("provider", "entityid")}),
    frozenset({("entity", "entid"), ("member", "entityid")}),
    frozenset({("provider", "provid"), ("planprovinfo", "provid")}),
    frozenset({("provider", "provid"), ("provspecialty", "provid")}),
    frozenset({("affiliation", "provid"), ("provider", "provid")}),
    frozenset({("claim", "claimid"), ("claimpharm", "claimid")}),
    frozenset({("claim", "claimid"), ("claimpartial", "claimid")}),
    frozenset({("benefitcoverage", "benefitid"), ("benefit", "benefitid")}),
    frozenset({("benefitcoverage", "coveragecodeid"), ("enrollcoverage", "coveragecodeid")}),
    frozenset({("ndc_mstr", "gcn_seqno"), ("ndcprefdrug", "gcn_seqno")}),
    frozenset({("claim", "claimid"), ("claimdiag", "claimid")}),
    frozenset({("pa_gap", "referralid"), ("referral", "referralid")}),
    frozenset({("enrollkeys", "enrollid"), ("memberpcp", "enrollid")}),
    frozenset({("dea", "provid"), ("provider", "provid")}),
}


def _draft_result(sql: str, category: str, reason: str, draft_mode: bool) -> dict[str, str | list[str] | None] | None:
    if not draft_mode:
        return None
    return {
        "queries": [sql],
        "failure_category": category,
        "failure_reason": reason,
        "validation_status": "DRAFT_REQUIRES_REVIEW",
    }


def generate_query_result_for_step(
    business_meaning: str,
    description: str | None = None,
    acceptance_criteria: str | list[str] | None = None,
    draft_mode: bool = False,
) -> dict[str, str | list[str] | None]:
    """Generate SQL and retain the reason when no safe query can be returned.

    Draft mode returns a review-only SELECT candidate when business grounding
    validation fails. It still requires every table and column to exist in the
    selected DDL and never returns non-SELECT or multi-statement SQL.
    """

    try:
        ddl_texts = select_ddls(
            business_meaning,
            description=description,
            acceptance_criteria=acceptance_criteria,
        )
        if not ddl_texts:
            print("[generate_queries_for_step] no DDL context selected")
            return {
                "queries": [],
                "failure_category": "NO_SCHEMA_CONTEXT",
                "failure_reason": "No DDL schema context was selected for this query task.",
            }

        ddl_context = "\n\n---\n\n".join(ddl_texts)
        repair_feedback = None
        last_failure_category = "VALIDATION_REJECTED"
        last_failure_reason = "The generated SQL did not pass Data Agent validation."
        for attempt in range(2):
            sql = _call_openai(
                business_meaning,
                ddl_context,
                repair_feedback,
                description=description,
                acceptance_criteria=acceptance_criteria,
                draft_mode=draft_mode,
            )
            if not sql:
                return {
                    "queries": [],
                    "failure_category": "MODEL_RETURNED_NO_QUERY",
                    "failure_reason": "The model returned no SQL for the grounded query task.",
                }

            sql = _clean_sql(sql)
            if sql.upper() == "NO_SUPPORTED_QUERY":
                print("[generate_queries_for_step] no supported grounded SELECT query")
                return {
                    "queries": [],
                    "failure_category": "NO_SUPPORTED_GROUNDED_QUERY",
                    "failure_reason": "The task could not be mapped to a safe, grounded SELECT query.",
                }
            if not _is_safe_select_sql(sql):
                print("[generate_queries_for_step] rejected unsafe or non-SELECT SQL")
                return {
                    "queries": [],
                    "failure_category": "VALIDATION_REJECTED",
                    "failure_reason": "The generated output was not a safe single SELECT statement.",
                }

            invalid_tables = _find_invalid_table_refs(sql, ddl_context)
            if not invalid_tables:
                invalid_columns = _find_invalid_column_refs(sql, ddl_context)
                if invalid_columns:
                    last_failure_category = "COLUMN_NOT_IN_DDL"
                    last_failure_reason = (
                        "The generated SQL referenced columns outside the selected DDL context: "
                        + ", ".join(invalid_columns)
                    )
                    print("[generate_queries_for_step] rejected SQL with columns outside schema context: " + ", ".join(invalid_columns))
                    if attempt == 1:
                        return {"queries": [], "failure_category": last_failure_category, "failure_reason": last_failure_reason}
                    repair_feedback = _build_column_repair_feedback(invalid_columns)
                    continue

                invalid_artifacts = _find_invalid_sql_artifacts(sql, ddl_context, business_meaning)
                invalid_artifacts.extend(_find_output_shape_artifacts(sql, business_meaning))
                if not invalid_artifacts:
                    return {"queries": [sql], "failure_category": None, "failure_reason": None}

                last_failure_category = "VALIDATION_REJECTED"
                last_failure_reason = "The generated SQL was rejected: " + ", ".join(invalid_artifacts)
                print("[generate_queries_for_step] rejected SQL with invalid predicates: " + ", ".join(invalid_artifacts))
                draft = _draft_result(sql, last_failure_category, last_failure_reason, draft_mode)
                if draft:
                    return draft
                if attempt == 1:
                    return {"queries": [], "failure_category": last_failure_category, "failure_reason": last_failure_reason}
                repair_feedback = _build_artifact_repair_feedback(invalid_artifacts)
                continue

            last_failure_category = "TABLE_NOT_IN_DDL"
            last_failure_reason = (
                "The generated SQL referenced tables outside the selected DDL context: "
                + ", ".join(invalid_tables)
            )
            print("[generate_queries_for_step] rejected SQL with tables outside schema context: " + ", ".join(invalid_tables))
            if attempt == 1:
                return {"queries": [], "failure_category": last_failure_category, "failure_reason": last_failure_reason}
            repair_feedback = _build_table_repair_feedback(invalid_tables, ddl_context)

        return {"queries": [], "failure_category": last_failure_category, "failure_reason": last_failure_reason}
    except Exception as exc:
        print(f"[generate_queries_for_step] error: {exc}")
        return {
            "queries": [],
            "failure_category": "SERVICE_OR_MODEL_FAILURE",
            "failure_reason": str(exc),
        }


def generate_queries_for_step(
    business_meaning: str,
    description: str | None = None,
    acceptance_criteria: str | list[str] | None = None,
) -> list[str]:
    """Backward-compatible SQL-only interface for existing API consumers."""

    return cast(list[str], generate_query_result_for_step(
        business_meaning,
        description=description,
        acceptance_criteria=acceptance_criteria,
    )["queries"])


def select_ddls(
    business_meaning: str,
    description: str | None = None,
    acceptance_criteria: str | list[str] | None = None,
) -> list[str]:
    """Retrieve relevant schemas, falling back safely to the packaged catalog.

    Qdrant retrieval is opt-in through QDRANT_ENABLED. The incoming business meaning
    remains authoritative while ADO description and acceptance criteria are labeled
    supporting context for runtime retrieval. If retrieval is disabled or fails, the
    complete packaged catalog preserves the current behavior.
    """

    text = business_meaning.lower()
    try:
        ddl_texts = retrieve_schema_ddls(
            business_meaning,
            description=description,
            acceptance_criteria=acceptance_criteria,
        )
    except Exception as exc:
        print(f"[select_ddls] Qdrant retrieval failed; using packaged catalog: {exc}")
        ddl_texts = []
    if not ddl_texts:
        ddl_texts = _read_all_in_memory_schema_files()
        ddl_texts.extend(_read_all_schema_files())

    selected_live_tables: list[tuple[str, str, str]] = []
    for keyword, table_ref in _LIVE_TABLE_KEYWORDS:
        if keyword not in text:
            continue
        if table_ref not in selected_live_tables:
            selected_live_tables.append(table_ref)

    for database, schema, table in selected_live_tables:
        content = _read_live_schema_table(database, schema, table)
        if content:
            ddl_texts.append(content)

    return ddl_texts


@lru_cache(maxsize=64)
def _read_live_schema_table(database: str, schema: str, table: str) -> str | None:
    try:
        with pyodbc.connect(_metadata_connection_string(), timeout=10) as conn:
            cursor = conn.cursor()
            rows = cursor.execute(
                f"""
                SELECT
                    COLUMN_NAME,
                    DATA_TYPE,
                    CHARACTER_MAXIMUM_LENGTH,
                    NUMERIC_PRECISION,
                    NUMERIC_SCALE,
                    IS_NULLABLE,
                    ORDINAL_POSITION
                FROM [{database}].INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
                """,
                schema,
                table,
            ).fetchall()
    except Exception as exc:
        print(f"[select_ddls] live schema lookup failed for {database}.{schema}.{table}: {exc}")
        return None

    if not rows:
        print(f"[select_ddls] live schema table not found: {database}.{schema}.{table}")
        return None

    column_lines = []
    for column_name, data_type, char_max, precision, scale, is_nullable, _ in rows:
        column_type = _format_column_type(data_type, char_max, precision, scale)
        nullability = "NULL" if str(is_nullable).upper() == "YES" else "NOT NULL"
        column_lines.append(f"    [{column_name}] {column_type} {nullability}")

    columns = ",\n".join(column_lines)
    return (
        "/* Live SQL Server schema from INFORMATION_SCHEMA.COLUMNS. */\n"
        f"CREATE TABLE [{database}].[{schema}].[{table}]\n"
        "(\n"
        f"{columns}\n"
        ");"
    )


def _metadata_connection_string() -> str:
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


def _format_column_type(data_type, char_max, precision, scale) -> str:
    normalized = str(data_type)
    lowered = normalized.lower()
    if lowered in {"char", "varchar", "nchar", "nvarchar", "binary", "varbinary"}:
        length = "max" if char_max == -1 else str(char_max)
        return f"{normalized}({length})"
    if lowered in {"decimal", "numeric"} and precision is not None and scale is not None:
        return f"{normalized}({precision},{scale})"
    if lowered in {"datetime2", "datetimeoffset", "time"} and scale is not None:
        return f"{normalized}({scale})"
    return normalized


def _build_user_message(
    business_meaning: str,
    ddl_context: str,
    description: str | None = None,
    acceptance_criteria: str | list[str] | None = None,
) -> str:
    if isinstance(acceptance_criteria, list):
        acceptance_text = "\n".join(
            f"{index}. {criterion}"
            for index, criterion in enumerate(acceptance_criteria, 1)
        )
    else:
        acceptance_text = acceptance_criteria or "Not provided"

    return (
        "DDL SCHEMAS (InMemory frontier schemas are listed before physical "
        "fallback schemas):\n"
        f"{ddl_context}\n\n"
        "RULE DESCRIPTION (context only):\n"
        f"{description or 'Not provided'}\n\n"
        "ACCEPTANCE CRITERIA (context only):\n"
        f"{acceptance_text}\n\n"
        "CURRENT DATA QUERY BUSINESS MEANING (authoritative query task):\n"
        f"{business_meaning}"
    )


def _call_openai(
    business_meaning: str,
    ddl_context: str,
    repair_feedback: str | None = None,
    description: str | None = None,
    acceptance_criteria: str | list[str] | None = None,
    draft_mode: bool = False,
) -> str | None:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[generate_queries_for_step] OPENAI_API_KEY is not set; returning no query")
        return None

    model = os.environ.get("OPENAI_MODEL", "gpt-4o")
    base_url = os.environ.get("OPENAI_BASE_URL") or os.environ.get("OPENAI_API_BASE")
    verify_ssl = os.environ.get("OPENAI_VERIFY_SSL", "false").lower() in {"1", "true", "yes"}
    http_client = httpx.Client(verify=verify_ssl, timeout=20.0)
    client_kwargs = {"api_key": api_key, "http_client": http_client}
    if base_url:
        client_kwargs["base_url"] = base_url
    client = OpenAI(**client_kwargs)
    user_message = _build_user_message(
        business_meaning,
        ddl_context,
        description=description,
        acceptance_criteria=acceptance_criteria,
    )
    system_prompt = SYSTEM_PROMPT
    if draft_mode:
        strict_rule = (
            "18. If a logical concept, requested output, filter, runtime input, identifier, or\n"
            "    required join relationship cannot be mapped unambiguously to the provided DDL,\n"
            "    return exactly NO_SUPPORTED_QUERY instead of approximating it, dropping it, or\n"
            "    adding a proxy."
        )
        draft_rule = (
            "18. DRAFT MODE: Return the best review-only SELECT candidate when a mapping is\n"
            "    incomplete. Do not invent a non-SELECT operation or multiple statements.\n"
            "    The caller will mark any failed grounding validation as non-publishable."
        )
        system_prompt = SYSTEM_PROMPT.replace(strict_rule, draft_rule)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]
    if repair_feedback:
        messages.append({"role": "user", "content": repair_feedback})

    request_kwargs = {
        "model": model,
        "messages": messages,
    }
    if model.lower().startswith(("gpt-5", "o1", "o3", "o4")):
        request_kwargs["max_completion_tokens"] = 600
    else:
        request_kwargs["temperature"] = 0
        request_kwargs["max_tokens"] = 600

    response = client.chat.completions.create(**request_kwargs)
    sql = response.choices[0].message.content
    return sql.strip() if sql else None


def _clean_sql(text: str) -> str:
    sql = text.strip()
    if sql.startswith("```"):
        sql = re.sub(r"^```(?:sql)?\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"\s*```$", "", sql)
    return sql.strip().rstrip(";")


def _is_safe_select_sql(sql: str) -> bool:
    normalized = sql.lstrip()
    if not normalized.lower().startswith("select"):
        return False
    if _UNSAFE_SQL_RE.search(normalized):
        return False
    return True


def _find_invalid_table_refs(sql: str, ddl_context: str) -> list[str]:
    allowed_tables = _extract_ddl_table_names(ddl_context)
    statement = _parse_generated_select(sql)
    if statement is None:
        return ["unparseable or multiple-statement T-SQL"]

    invalid: list[str] = []
    for table in statement.find_all(exp.Table):
        canonical = _canonical_ast_table(table)
        rendered = table.sql(dialect="tsql")
        if (not canonical or canonical not in allowed_tables) and rendered not in invalid:
            invalid.append(rendered)
    return invalid


def _extract_ddl_table_names(ddl_context: str) -> set[str]:
    return {
        canonical
        for canonical in (
            _canonical_table_ref(match.group(1))
            for match in _DDL_TABLE_RE.finditer(ddl_context)
        )
        if canonical
    }


def _canonical_table_ref(table_ref: str) -> str | None:
    parts = [
        part.strip().strip("[]").lower()
        for part in re.split(r"\s*\.\s*", table_ref.strip())
        if part.strip()
    ]
    if len(parts) != 3:
        return None
    return ".".join(parts)


def _build_table_repair_feedback(invalid_tables: list[str], ddl_context: str) -> str:
    allowed = sorted(_extract_ddl_table_names(ddl_context))
    return (
        "The previous SQL referenced table(s) not present in the provided DDL context: "
        f"{', '.join(invalid_tables)}. Regenerate the SQL using ONLY these fully "
        f"qualified tables: {', '.join(allowed)}. Do not invent tables, aliases for "
        "tables, or joins outside the DDL context. Return only the corrected SELECT."
    )


def _find_invalid_column_refs(sql: str, ddl_context: str) -> list[str]:
    catalog = _extract_ddl_column_catalog(ddl_context)
    statement = _parse_generated_select(sql)
    if statement is None:
        return ["unparseable T-SQL"]

    aliases: dict[str, str] = {}
    referenced_tables: list[str] = []
    for table in statement.find_all(exp.Table):
        canonical = _canonical_ast_table(table)
        if not canonical:
            continue
        referenced_tables.append(canonical)
        aliases[table.name.lower()] = canonical
        aliases[table.alias_or_name.lower()] = canonical

    invalid: list[str] = []
    for column in statement.find_all(exp.Column):
        name = column.name.lower()
        if name == "*":
            continue
        if column.table:
            canonical = aliases.get(column.table.lower())
            allowed_columns = catalog.get(canonical or "")
            valid = allowed_columns is not None and name in allowed_columns
        else:
            matching_tables = {
                table for table in referenced_tables if name in catalog.get(table, set())
            }
            valid = len(matching_tables) == 1
        if not valid and column.sql() not in invalid:
            invalid.append(column.sql())
    return invalid


def _extract_ddl_column_catalog(ddl_context: str) -> dict[str, set[str]]:
    catalog: dict[str, set[str]] = {}
    table_matches = list(_DDL_TABLE_RE.finditer(ddl_context))
    for index, table_match in enumerate(table_matches):
        canonical = _canonical_table_ref(table_match.group(1))
        if not canonical:
            continue
        section_end = (
            table_matches[index + 1].start()
            if index + 1 < len(table_matches)
            else len(ddl_context)
        )
        section = ddl_context[table_match.end():section_end]
        columns = {
            match.group(1).lower()
            for match in re.finditer(
                r"(?:^|[,(])\s*\[([^]]+)\]\s+[A-Za-z_]", section, re.MULTILINE
            )
            if not match.group(1).lower().startswith(("pk_", "fk_"))
        }
        catalog[canonical] = columns
    return catalog


def _build_column_repair_feedback(invalid_columns: list[str]) -> str:
    return (
        "The previous SQL referenced columns not present in the selected table DDL: "
        f"{', '.join(invalid_columns)}. Regenerate using only exact columns from the "
        "provided table DDLs. Do not substitute an unrelated column or invent a predicate. If "
        "the requested output or filter cannot be mapped unambiguously, return exactly "
        "NO_SUPPORTED_QUERY."
    )


def _find_output_shape_artifacts(sql: str, business_meaning: str) -> list[str]:
    asks_for_values = re.search(
        r"\breturn(?:s|ing)?\b[^.\n]{0,160}\b(?:values?|identifiers?|codes?|"
        r"columns?|records?|details?|rate-code\s+values?|indicator-code\s+values?|"
        r"processor\s+control\s+number)\b",
        business_meaning,
        re.IGNORECASE,
    )
    explicitly_asks_for_count = re.search(
        r"\b(?:count|how many|number of records|returns?\s+count)\b",
        business_meaning,
        re.IGNORECASE,
    )
    if asks_for_values and not explicitly_asks_for_count and re.search(
        r"\bCOUNT\s*\(\s*(?:\*|1)\s*\)", sql, re.IGNORECASE
    ):
        return ["COUNT(*) output does not match requested values/identifiers/records"]
    return []


def _parse_generated_select(sql: str) -> Expression | None:
    sanitized = re.sub(r"\{\{[^}]+\}\}", "NULL", sql)
    sanitized = _NOLOCK_HINT_RE.sub("WITH (NOLOCK)", sanitized)
    sanitized = re.sub(r"\bWITH\s+WITH\s+\(", "WITH (", sanitized, flags=re.IGNORECASE)
    try:
        statements = [
            statement
            for statement in sqlglot.parse(sanitized, read="tsql")
            if statement is not None
        ]
    except (ParseError, TokenError, ValueError):
        return None
    return cast(Expression, statements[0]) if len(statements) == 1 else None


def _canonical_ast_table(table: exp.Table) -> str | None:
    parts = [str(part).strip("[]").lower() for part in (table.catalog, table.db, table.name) if part]
    if len(parts) != 3:
        return None
    return ".".join(parts)


def _table_has_nolock(table: exp.Table) -> bool:
    return any(
        isinstance(item, exp.Var) and item.name.upper() == "NOLOCK"
        for hint in table.args.get("hints") or ()
        for item in hint.expressions
    )


def _table_source(table: exp.Table, ddl_context: str) -> str:
    canonical = _canonical_ast_table(table)
    if canonical and canonical.startswith("inmemory."):
        return "INMEMORY"
    if canonical in _extract_ddl_table_names(ddl_context):
        return "PHYSICAL"
    return "UNKNOWN"


def _business_meaning_names_tables(
    business_meaning: str, tables: list[exp.Table]
) -> bool:
    normalized = business_meaning.lower().replace("_", " ")
    return all(
        re.search(
            rf"(?<![a-z0-9]){re.escape(table.name.lower().replace('_', ' '))}(?![a-z0-9])",
            normalized,
        )
        for table in tables
    )


def _find_ungrounded_joins(
    joins: list[exp.Join], tables: list[exp.Table]
) -> list[str]:
    aliases: dict[str, str] = {}
    for table in tables:
        base_name = table.name.lower()
        aliases[table.name.lower()] = base_name
        aliases[table.alias_or_name.lower()] = base_name

    artifacts: list[str] = []
    for join in joins:
        on_expression = join.args.get("on")
        target = join.this if isinstance(join.this, exp.Table) else None
        target_alias = target.alias_or_name.lower() if target is not None else None
        target_table = aliases.get(target_alias or "")
        if on_expression is None or not target_table:
            artifacts.append(f"JOIN to {join.this.sql()} has no resolvable ON relationship")
            continue
        if on_expression.find(exp.Or) is not None:
            artifacts.append(f"JOIN to {join.this.sql()} uses unsupported OR topology")
            continue

        connects_target = False
        has_unreviewed_cross_table_equality = False
        for equality in on_expression.find_all(exp.EQ):
            left = equality.left
            right = equality.right
            if not isinstance(left, exp.Column) or not isinstance(right, exp.Column):
                continue
            left_alias = left.table.lower() if left.table else None
            right_alias = right.table.lower() if right.table else None
            left_table = aliases.get(left_alias or "")
            right_table = aliases.get(right_alias or "")
            if not left_table or not right_table or left_alias == right_alias:
                continue
            relationship = frozenset(
                {
                    (left_table, left.name.lower()),
                    (right_table, right.name.lower()),
                }
            )
            if relationship not in _REVIEWED_JOIN_KEYS:
                has_unreviewed_cross_table_equality = True
                continue
            if target_alias in {left_alias, right_alias}:
                connects_target = True

        if has_unreviewed_cross_table_equality or not connects_target:
            artifacts.append(
                f"JOIN to {join.this.sql()} does not connect its target through only reviewed keys"
            )
    return artifacts


def _find_invalid_sql_artifacts(
    sql: str, ddl_context: str, business_meaning: str
) -> list[str]:
    artifacts: list[str] = []
    if _UNSUPPORTED_SET_OPERATION_RE.search(sql):
        artifacts.append("unsupported set or APPLY operation")
    if _IMPOSSIBLE_PREDICATE_RE.search(sql):
        artifacts.append("1 = 0/1 predicate")
    if _RAW_REQUEST_OBJECT_RE.search(sql):
        artifacts.append("raw request-object reference")
    for match in _TAUTOLOGY_RE.finditer(sql):
        expression = match.group(0)
        if expression not in artifacts:
            artifacts.append(expression)

    statement = _parse_generated_select(sql)
    if statement is None:
        artifacts.append("unparseable T-SQL")
        return artifacts
    tables = list(statement.find_all(exp.Table))
    if not tables:
        artifacts.append("SELECT has no table reference")
        return artifacts

    table_sources = [_table_source(table, ddl_context) for table in tables]
    for table, source in zip(tables, table_sources):
        hints = table.args.get("hints") or ()
        has_nolock = _table_has_nolock(table)
        if source == "UNKNOWN":
            artifacts.append(f"table {table.name} is not grounded by the DDL context")
        elif source == "INMEMORY" and hints:
            artifacts.append(f"InMemory table {table.name} must not use table hints")
        elif source == "PHYSICAL" and not has_nolock:
            artifacts.append(f"physical table {table.name} must use NOLOCK")

    if len(list(statement.find_all(exp.Select))) > 1:
        artifacts.append("table-reading subqueries are not supported in MVP1")

    unique_tables = {
        canonical for table in tables if (canonical := _canonical_ast_table(table))
    }
    if len(unique_tables) > 1:
        if any(source != "PHYSICAL" for source in table_sources):
            artifacts.append("multi-table SELECT requires physical tables")
        if len(set(table_sources)) > 1:
            artifacts.append("cannot mix InMemory and physical tables in one SELECT")
        if not _business_meaning_names_tables(business_meaning, tables):
            artifacts.append("atomic business meaning does not explicitly require every table")
        joins = list(statement.find_all(exp.Join))
        if not joins:
            artifacts.append("multi-table SELECT has no grounded JOIN")
        else:
            artifacts.extend(_find_ungrounded_joins(joins, tables))
    return artifacts


def _build_artifact_repair_feedback(invalid_artifacts: list[str]) -> str:
    return (
        "The previous SQL violated source, relationship, or SQL-quality rules: "
        f"{', '.join(invalid_artifacts)}. Regenerate one SELECT using only provided "
        "DDL tables and columns. InMemory tables must not use NOLOCK; physical tables "
        "must use NOLOCK. Prefer one complete table. Use a physical JOIN only when "
        "every table is explicitly required by the current atomic business meaning "
        "and the join key is a reviewed relationship. Never mix InMemory and physical "
        "tables, and do not use APPLY, UNION, INTERSECT, EXCEPT, or an ungrounded "
        "multi-table subquery. Also remove impossible predicates, tautologies, and "
        "raw HrxRequest/ClaimRequest paths. Use only approved double-brace placeholders, "
        "preserve the current task's filters and exact output shape, and return only "
        "the corrected SELECT. If grounding is insufficient, return NO_SUPPORTED_QUERY."
    )




def _read_all_schema_files() -> list[str]:
    if not _SCHEMA_DIR.exists():
        return []
    return [path.read_text(encoding="utf-8") for path in sorted(_SCHEMA_DIR.glob("*.sql"))]


def _read_all_in_memory_schema_files() -> list[str]:
    if not _IN_MEMORY_SCHEMA_DIR.exists():
        return []
    return [
        path.read_text(encoding="utf-8")
        for path in sorted(_IN_MEMORY_SCHEMA_DIR.glob("*.sql"))
    ]
