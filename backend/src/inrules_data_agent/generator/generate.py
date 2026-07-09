from __future__ import annotations

import os
import re
from functools import lru_cache
from pathlib import Path

import httpx
import pyodbc
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).resolve().parents[3] / ".env")

_SCHEMA_DIR = Path(__file__).resolve().parent.parent / "schema"
_MEMBER_ATTRIBUTE_NOTE = (
    "Note: MemberAttribute table DDL is not yet available. "
    "Known columns: memid, theValue, EFFDATE, TERMDATE."
)

_DDL_KEYWORDS: list[tuple[str, str | None]] = [
    ("drugoverrides", "HRX.dbo.DrugOverrides.sql"),
    ("claimhistory", "plandata_rx_production.dbo.claim.sql"),
    ("claim", "plandata_rx_production.dbo.claim.sql"),
    ("claimdetail", "plandata_rx_production.dbo.claimdetail.sql"),
    ("ndc_mstr", "HRX.dbo.NDC_Mstr.sql"),
    ("ndc mstr", "HRX.dbo.NDC_Mstr.sql"),
    ("gcnseqno_mstr", "HRX.dbo.GCNSeqNo_Mstr.sql"),
    ("gcnseqno mstr", "HRX.dbo.GCNSeqNo_Mstr.sql"),
    ("ndcparameters", "HRX.dbo.NDCParameters.sql"),
    ("parameter_name", "HRX.dbo.NDCParameters.sql"),
    ("parameter_value", "HRX.dbo.NDCParameters.sql"),
    ("memberattribute", None),
    ("attributevalue", None),
    ("diagnosislist", "HRX.dbo.DiagnosisList.sql"),
    ("diagnosis code", "IPA.dbo.DiagCode.sql"),
    ("diag code", "IPA.dbo.DiagCode.sql"),
    ("diagcode", "IPA.dbo.DiagCode.sql"),
]

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
3. Add (nolock) after every table reference.
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
8. Default to count(*) unless the requirement specifies a different output column.
9. Return ONLY the raw SQL query. No explanation. No markdown. No code fences.
10. Preserve every explicit filter in the business requirement. If it says
    resubclaimid <> '' then use <> ''; do not convert it to = ''.
11. Never use placeholder joins or tautologies such as ON 1 = 0 or c.col = c.col.
    If a required join key is not present in the provided DDL, avoid inventing a
    join and still keep the required filters on the tables whose columns exist.
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


def generate_queries_for_step(business_meaning: str) -> list[str]:
    """Select relevant DDLs, call OpenAI, return one generated SQL string.

    Returns [] if no DDLs are available, OpenAI is not configured, the LLM call
    fails, or the generated SQL does not pass the SELECT-only safety guard.
    """

    try:
        ddl_texts = select_ddls(business_meaning)
        if not ddl_texts:
            print("[generate_queries_for_step] no DDL context selected")
            return []

        ddl_context = "\n\n---\n\n".join(ddl_texts)
        repair_feedback = None
        for attempt in range(2):
            sql = _call_openai(business_meaning, ddl_context, repair_feedback)
            if not sql:
                return []

            sql = _clean_sql(sql)
            if not _is_safe_select_sql(sql):
                print("[generate_queries_for_step] rejected unsafe or non-SELECT SQL")
                return []

            invalid_tables = _find_invalid_table_refs(sql, ddl_context)
            if not invalid_tables:
                invalid_artifacts = _find_invalid_sql_artifacts(sql)
                if not invalid_artifacts:
                    return [sql]

                print(
                    "[generate_queries_for_step] rejected SQL with invalid predicates: "
                    + ", ".join(invalid_artifacts)
                )
                if attempt == 1:
                    return []
                repair_feedback = _build_artifact_repair_feedback(invalid_artifacts)
                continue

            print(
                "[generate_queries_for_step] rejected SQL with tables outside schema context: "
                + ", ".join(invalid_tables)
            )
            if attempt == 1:
                return []
            repair_feedback = _build_table_repair_feedback(invalid_tables, ddl_context)

        return []
    except Exception as exc:
        print(f"[generate_queries_for_step] error: {exc}")
        return []


def select_ddls(business_meaning: str) -> list[str]:
    """Return DDL file contents relevant to this business_meaning.

    Keyword matching is intentionally simple; this is the future RAG swap point.
    If no keywords match, no DDL context is returned; only selected tables are in scope.
    """

    text = business_meaning.lower()
    selected_files: list[str] = []
    include_member_attribute_note = False

    for keyword, file_name in _DDL_KEYWORDS:
        if keyword not in text:
            continue
        if file_name is None:
            include_member_attribute_note = True
            continue
        if file_name not in selected_files:
            selected_files.append(file_name)

    selected_live_tables: list[tuple[str, str, str]] = []
    for keyword, table_ref in _LIVE_TABLE_KEYWORDS:
        if keyword not in text:
            continue
        if table_ref not in selected_live_tables:
            selected_live_tables.append(table_ref)

    ddl_texts: list[str] = []
    if selected_files:
        for file_name in selected_files:
            content = _read_schema_file(file_name)
            if content:
                ddl_texts.append(content)
    for database, schema, table in selected_live_tables:
        content = _read_live_schema_table(database, schema, table)
        if content:
            ddl_texts.append(content)

    if include_member_attribute_note:
        ddl_texts.append(_MEMBER_ATTRIBUTE_NOTE)

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


def _call_openai(
    business_meaning: str,
    ddl_context: str,
    repair_feedback: str | None = None,
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
    user_message = f"DDL SCHEMAS:\n{ddl_context}\n\nBUSINESS REQUIREMENT:\n{business_meaning}"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
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
    invalid: list[str] = []

    for match in _SQL_TABLE_RE.finditer(sql):
        raw_ref = match.group(1)
        canonical = _canonical_table_ref(raw_ref)
        if not canonical:
            if raw_ref not in invalid:
                invalid.append(raw_ref)
            continue
        if canonical not in allowed_tables and raw_ref not in invalid:
            invalid.append(raw_ref)

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


def _find_invalid_sql_artifacts(sql: str) -> list[str]:
    artifacts: list[str] = []
    if _IMPOSSIBLE_PREDICATE_RE.search(sql):
        artifacts.append("1 = 0/1 predicate")
    if _RAW_REQUEST_OBJECT_RE.search(sql):
        artifacts.append("raw request-object reference")
    for match in _TAUTOLOGY_RE.finditer(sql):
        expression = match.group(0)
        if expression not in artifacts:
            artifacts.append(expression)
    return artifacts


def _build_artifact_repair_feedback(invalid_artifacts: list[str]) -> str:
    return (
        "The previous SQL used invalid request-object references, placeholder predicates, or self-comparisons: "
        f"{', '.join(invalid_artifacts)}. Regenerate the query without impossible "
        "predicates, tautologies, ON 1 = 0, ON 1 = 1, WHERE 1 = 0, WHERE 1 = 1, column = same column "
        "conditions, or raw HrxRequest/ClaimRequest paths. Use only approved "
        "double-brace placeholders. Preserve the business requirement filters and "
        "return only the corrected SELECT."
    )


def _read_schema_file(file_name: str) -> str | None:
    path = _SCHEMA_DIR / file_name
    if not path.exists():
        print(f"[select_ddls] schema file not found: {file_name}")
        return None
    return path.read_text(encoding="utf-8")


def _read_all_schema_files() -> list[str]:
    if not _SCHEMA_DIR.exists():
        return []
    return [path.read_text(encoding="utf-8") for path in sorted(_SCHEMA_DIR.glob("*.sql"))]
