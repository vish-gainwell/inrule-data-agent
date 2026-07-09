from __future__ import annotations

import os
import re
from pathlib import Path

import httpx
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
    ("ndcparameters", "HRX.dbo.NDCParameters.sql"),
    ("parameter_name", "HRX.dbo.NDCParameters.sql"),
    ("parameter_value", "HRX.dbo.NDCParameters.sql"),
    ("memberattribute", None),
    ("attributevalue", None),
    ("diagnosislist", "HRX.dbo.DiagnosisList.sql"),
    ("diagcode", "IPA.dbo.DiagCode.sql"),
    ("claimdetail", "plandata_rx_production.dbo.claimdetail.sql"),
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
""".strip()

_UNSAFE_SQL_RE = re.compile(
    r"\b(insert|update|delete|drop|alter|truncate|exec|execute|merge|create|grant|revoke)\b",
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
        sql = _call_openai(business_meaning, ddl_context)
        if not sql:
            return []

        sql = _clean_sql(sql)
        if not _is_safe_select_sql(sql):
            print("[generate_queries_for_step] rejected unsafe or non-SELECT SQL")
            return []

        return [sql]
    except Exception as exc:
        print(f"[generate_queries_for_step] error: {exc}")
        return []


def select_ddls(business_meaning: str) -> list[str]:
    """Return DDL file contents relevant to this business_meaning.

    Keyword matching is intentionally simple; this is the future RAG swap point.
    If no keywords match, all packaged DDL files are returned as fallback context.
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

    ddl_texts: list[str] = []
    if selected_files:
        for file_name in selected_files:
            content = _read_schema_file(file_name)
            if content:
                ddl_texts.append(content)
    else:
        ddl_texts.extend(_read_all_schema_files())

    if include_member_attribute_note:
        ddl_texts.append(_MEMBER_ATTRIBUTE_NOTE)

    return ddl_texts


def _call_openai(business_meaning: str, ddl_context: str) -> str | None:
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
    request_kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
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
