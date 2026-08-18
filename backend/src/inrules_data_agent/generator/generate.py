from __future__ import annotations

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, cast

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
    ("memberlockin", ("plandata_rx_production", "dbo", "MemberLockIn")),
    ("member lock-in", ("plandata_rx_production", "dbo", "MemberLockIn")),
    ("pharmacy lock-in", ("plandata_rx_production", "dbo", "MemberLockIn")),
    ("pa_gap", ("HRX", "dbo", "PA_Gap")),
    ("pa gap", ("HRX", "dbo", "PA_Gap")),
    ("planprovinfo", ("plandata_rx_production", "dbo", "planprovinfo")),
    ("plan provider", ("plandata_rx_production", "dbo", "planprovinfo")),
    ("provider table", ("plandata_rx_production", "dbo", "provider")),
    ("prescriber npi", ("plandata_rx_production", "dbo", "provider")),
    ("compound quantity", ("HRX", "dbo", "COMPOUND")),
    ("compound drug_qty", ("HRX", "dbo", "COMPOUND")),
    ("historical compound", ("HRX", "dbo", "COMPOUND")),
    ("covid_config", ("HRX", "dbo", "Covid_Config")),
    ("covid config", ("HRX", "dbo", "Covid_Config")),
    ("re_group", ("HRX", "dbo", "re_group")),
    ("rule group", ("HRX", "dbo", "re_group")),
    ("route_desc", ("HRX", "dbo", "Route_Desc")),
    ("route description", ("HRX", "dbo", "Route_Desc")),
    ("submission clarification", ("plandata_rx_production", "dbo", "edi_pharm_universal")),
    ("scc=", ("plandata_rx_production", "dbo", "edi_pharm_universal")),
    ("scc =", ("plandata_rx_production", "dbo", "edi_pharm_universal")),
    ("enrollkeys", ("plandata_rx_production", "dbo", "enrollkeys")),
    ("headofhouse", ("plandata_rx_production", "dbo", "member")),
    ("member table", ("plandata_rx_production", "dbo", "member")),
    (" left join member", ("plandata_rx_production", "dbo", "member")),
    ("ndc_limits", ("HRX", "dbo", "NDC_Limits")),
    ("ndc limits", ("HRX", "dbo", "NDC_Limits")),
    ("ndcmedicarecov", ("HRX", "dbo", "NDCMedicareCov")),
    ("ndc medicare cov", ("HRX", "dbo", "NDCMedicareCov")),
    ("part b drug coverage", ("HRX", "dbo", "NDCMedicareCov")),
]

SYSTEM_PROMPT = """
You are a SQL generator for an InRule pharmacy claims processing system (SQL Server / T-SQL).

Given one atomic data-query business fact and one or more table DDL schemas, generate a
single SELECT query that extracts only that fact.

Rules:
0. Generate SQL only for the CURRENT DATA QUERY BUSINESS MEANING. One business fact
   maps to one query with concise outputs. The complete rule flow may require multiple
   queries separated by rule logic; never attempt to satisfy the whole description or
   all acceptance criteria in this query. Retrieve source facts for downstream rule
   logic rather than calculating a final bypass, denial, posting, or threshold decision.
   Never name an output Bypass, Deny, Post, Applies, Eligible, or Decision when the
   current fact can instead return the underlying history, quantity, days supply,
   date, threshold, code, identifier, or existence value.
1. Use ONLY tables and columns that exist in the provided DDL schemas.
2. Use fully qualified table names exactly as shown in the DDL
   (e.g. HRX.dbo.DrugOverrides, plandata_rx_production.dbo.claim).
3. Source hints must follow the IL execution convention:
   - Never add NOLOCK to InMemory logical DTO table references.
   - Add WITH (NOLOCK) after every physical SQL Server table reference.
4. Runtime inputs are an open-ended DataQuery contract, not a fixed whitelist.
   For every runtime business value explicitly required by the CURRENT DATA QUERY
   BUSINESS MEANING, emit a concise PascalCase {{RuntimeInput}} placeholder. Never
   substitute an example value or use ? parameters. Canonical examples include:

   Incoming NDC:      {{ClaimTransaction.Ndc}}
   Incoming GCN:      {{ClaimRequest.DrugRequested.GCNSeqNo.Code}}
   Incoming HIC3:     {{ClaimRequest.DrugRequested.HIC3.Code}}
   Date of Service:   {{DateOfService}}
   Member ID:         {{MemberId}}
   Provider ID:       {{ProviderId}}
   Rx Number:         {{RxNumber}}
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
   - {rx_number}, {rxnumber}, prescription number, service reference number,
     and incoming claim Rx Number mean {{RxNumber}}.
   - HrxRequest.ClaimDetail.ClaimSeg.qtyDispensed_442_E7 and current claim
     quantity dispensed mean {{QuantityDispensed}}.

   Never emit HrxRequest.*, ClaimRequest.*, or single-brace {value} tokens.
   For any other explicitly required runtime input, derive a concise business name,
   for example {{PlanId}}, {{AuthorizationId}}, or {{AssociatedPrescriptionRefNumber}}.
   The proposed DataQuery QueryParams is the contract telling downstream developers
   which values must be bound. A missing concrete DTO path is review information,
   never a reason to reject an otherwise table-and-column-grounded query. Do not
   invent inputs that are not required by the current atomic business fact.

5. Preserve every literal value specified in the business requirement exactly as written
   in the semantic candidate SQL (e.g. Type = '3013_Opioid' or status = 'PAID').
   Do NOT invent or substitute values. The downstream DataQuery contract builder will
   convert reusable assignment literals into named QueryParams; do not replace them with
   unrelated runtime entity paths.

6. Several columns in plandata_rx_production.dbo.claim are CHAR (fixed-width, space-padded).
   Always wrap them in RTRIM() for comparisons:
   - RTRIM(status) IN ('PAID', 'PAY', 'WAITPAY', 'DENY', 'WAITDENY', 'REV')
   - RTRIM(formtype) = 'UNIVERSALC'
   - RTRIM(resubclaimid) = ''   (empty resubmission — spaces, not null)
   - RTRIM(memid), RTRIM(provid) for member and provider ID comparisons

7. Preserve any other literal values specified in the business requirement so the
   contract builder can bind them as edit-specific DataPackage query parameters.
8. Determine the output shape from the CURRENT DATA QUERY BUSINESS MEANING before writing SQL:
   - If it asks for a count, existence check, or count comparison, return COUNT(*) or the requested aggregate.
   - If it asks to return values, identifiers, codes, columns, records, or details, project those exact mapped columns. Never replace them with COUNT(*).
   - If it asks for multiple attributes per record, project only those requested attributes, with clear aliases when needed by the stated output.
   - Output aliases must name the extracted business fact, use PascalCase, contain no more than 40 characters, and never read like a full sentence.
     A COUNT(*) alias must describe the rows being counted and end in Count; never give it
     opposite-polarity names such as Missing..., No..., NotFound..., Absent..., or Without....
     Prefer names such as Scc05HistoryCount, Scc05HistoryQuantity,
     Scc05HistoryDaysSupply, Scc05HistoryDateOfService, or ReversalDays.
   - Do not add extra output columns merely because they are available in the selected table.
9. Return ONLY one JSON object with exactly this shape:
   {"query_text": "SELECT ..."}
   Use {"query_text": null} when no grounded query can be produced. Do not return
   explanation text, markdown, code fences, additional fields, or SQL outside JSON.
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
12. Prefer one complete table. A query may JOIN multiple tables, including an
    InMemory logical DTO table with a physical SQL Server table, when the CURRENT
    DATA QUERY BUSINESS MEANING explicitly requires those sources and the relationship
    is grounded by provided schemas and reviewed InRule SME join-key patterns. Every
    joined table and column must exist in the DDL context. Relationship comments in the
    supplied DDL identify reviewed join keys and may be used exactly as documented. Apply
    NOLOCK only to each physical table and never to an InMemory table. Never use APPLY, UNION, INTERSECT,
    EXCEPT, or an ungrounded multi-table subquery. Never combine unrelated retrieval
    steps from the description or acceptance criteria. When runtime inputs already
    provide the lookup keys, filter the target table directly with placeholders; do not
    join a claim or InMemory table merely to recover those same values.
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
18. Use clean claim-domain ownership consistently:
    - claim owns paid-like status, formtype, resubclaimid, member, provider, and claim dates.
    - claimpharm owns NDCKey and pharmacy claim detail, but not claim.status/formtype.
    - edi_pharm_universal owns SubmissionClarification, metricqty, dayssupply, rxnumber,
      claimid, and claimline for SCC pharmacy history.
    - NDC_Mstr maps NDCKey to GCN_SeqNo. Never put GCN_SeqNo on enrollkeys or COMPOUND.
    - COMPOUND owns drug_qty, ndc, tcn, and CompoundType. Follow its DDL relationship
      comments: use a prefiltered runtime TCN collection and join ndc to NDC_Mstr.NDCKey
      when GCN filtering is required. DaysTillRefill and incoming GCN are runtime inputs,
      never enrollkeys columns.
      Reusable DrugOverrides shape: query HRX.dbo.DrugOverrides directly; use the exact
      required Type literal plus {{ClaimTransaction.Ndc}},
      {{ClaimRequest.DrugRequested.GCNSeqNo.Code}}, {{ClaimRequest.DrugRequested.HIC3.Code}},
      and {{DateOfService}} as lookup values. Never join InMemory.DRUG merely to recover
      those current-drug values. The contract/reuse layer will convert the Type literal and
      runtime placeholders into the generic DrugOverrideType, Ndc, GcnSeqNo, Hic3, and
      DateOfService parameter assignments.
      Reusable SCC history shape: select edi_pharm_universal.metricqty and dayssupply;
    join claim on claimid for status/formtype/resubclaimid/date/member/provider filters;
    join claimpharm on claimid and claimline, then NDC_Mstr on claimpharm.ndckey for GCN;
    filter edi_pharm_universal.SubmissionClarification and rxnumber as required.
    Reusable compound quantity shape: select SUM(TRY_CONVERT(decimal(29,9),
    COMPOUND.drug_qty)); join NDC_Mstr on COMPOUND.ndc = NDC_Mstr.NDCKey; filter
    COMPOUND.tcn with [[HistoricalTcns]] and NDC_Mstr.GCN_SeqNo with the incoming GCN
    runtime placeholder. HistoricalTcns represents the upstream paid, UNIVERSALC,
    non-reversed, member/date-window claim set; do not join enrollkeys in this query.
19. Honor the routed query task. When part of the requested contract is an approved
    runtime input, project or filter with its descriptive placeholder and retrieve the
    remaining grounded source facts from the provided DDL. Do not return null merely
    because downstream InRule could also perform the comparison or calculation. Return
    {"query_text": null} only when no safe query contract can be formed without inventing
    a table, column, relationship, or business value.
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
_INMEMORY_NOLOCK_RE = re.compile(
    r"(?P<table>\b(?:FROM|JOIN)\s+"
    r"(?:\[?InMemory\]?\s*\.\s*)?\[?dbo\]?\s*\.\s*"
    r"(?:\[[^]]+\]|[A-Za-z_]\w*)"
    r"(?:\s+(?:AS\s+)?(?!WITH\b)[A-Za-z_]\w*)?)"
    r"\s+(?:WITH\s*)?\(\s*NOLOCK\s*\)",
    re.IGNORECASE,
)
_RESERVED_TABLE_ALIASES = frozenset({"do", "group", "key", "order", "user", "value"})
_HINT_BEFORE_ALIAS_RE = re.compile(
    r"(?P<table>\b(?:FROM|JOIN)\s+"
    r"(?:\[[^]]+\]|[A-Za-z_]\w*)"
    r"(?:\s*\.\s*(?:\[[^]]+\]|[A-Za-z_]\w*)){0,2})"
    r"\s+WITH\s*\(\s*NOLOCK\s*\)"
    r"\s+(?:AS\s+)?"
    r"(?P<alias>(?!(?:WHERE|JOIN|INNER|LEFT|RIGHT|FULL|CROSS|ON|GROUP|ORDER|HAVING|"
    r"UNION|INTERSECT|EXCEPT|OPTION|OFFSET|FETCH)\b)"
    r"(?:\[[^]]+\]|[A-Za-z_]\w*))(?=\s|$)",
    re.IGNORECASE,
)
_TABLE_ALIAS_RE = re.compile(
    r"(?P<prefix>\b(?:FROM|JOIN)\s+"
    r"(?:\[[^]]+\]|[A-Za-z_]\w*)"
    r"(?:\s*\.\s*(?:\[[^]]+\]|[A-Za-z_]\w*)){0,2}"
    r"(?:\s+WITH\s*\(\s*NOLOCK\s*\))?"
    r"\s+(?:AS\s+)?)"
    r"(?P<alias>[A-Za-z_]\w*)\b",
    re.IGNORECASE,
)
_PHYSICAL_TABLE_WITH_ALIAS_RE = re.compile(
    r"(?P<table_ref>\b(?:FROM|JOIN)\s+"
    r"(?P<table>(?:\[[^]]+\]|[A-Za-z_]\w*)"
    r"(?:\s*\.\s*(?:\[[^]]+\]|[A-Za-z_]\w*)){2}))"
    r"(?P<alias>\s+(?:AS\s+)?"
    r"(?!(?:WITH|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|CROSS|ON|GROUP|ORDER|HAVING|"
    r"UNION|INTERSECT|EXCEPT|OPTION|OFFSET|FETCH)\b)"
    r"(?:\[[^]]+\]|[A-Za-z_]\w*))?"
    r"(?P<hint>\s+(?:WITH\s*)?\(\s*NOLOCK\s*\))?",
    re.IGNORECASE,
)

_REVIEWED_JOIN_KEYS = {
    frozenset({("enrollkeys", "memid"), ("member", "memid")}),
    frozenset({("enrollkeys", "enrollid"), ("enrollcoverage", "enrollid")}),
    frozenset({("entity", "entid"), ("provider", "entityid")}),
    frozenset({("entity", "entid"), ("member", "entityid")}),
    frozenset({("provider", "provid"), ("planprovinfo", "provid")}),
    frozenset({("provider", "provid"), ("provspecialty", "provid")}),
    frozenset({("affiliation", "provid"), ("provider", "provid")}),
    frozenset({("claim", "claimid"), ("claimpharm", "claimid")}),
    frozenset({("claim", "claimid"), ("claimdetail", "claimid")}),
    frozenset({("claimdetail", "claimid"), ("claimpharm", "claimid")}),
    frozenset({("claimdetail", "claimline"), ("claimpharm", "claimline")}),
    frozenset({("claim", "claimid"), ("claimpartial", "claimid")}),
    frozenset({("claimpartial", "claimid"), ("claimpharm", "claimid")}),
    frozenset({("claimpharm", "ndckey"), ("ndc_mstr", "ndckey")}),
    frozenset({("compound", "ndc"), ("ndc_mstr", "ndckey")}),
    frozenset({("claim", "claimid"), ("edi_pharm_universal", "claimid")}),
    frozenset({("claimpharm", "claimid"), ("edi_pharm_universal", "claimid")}),
    frozenset({("claimpharm", "claimline"), ("edi_pharm_universal", "claimline")}),
    frozenset({("claim", "claimid"), ("claimpartial", "claimid")}),
    frozenset({("benefitcoverage", "benefitid"), ("benefit", "benefitid")}),
    frozenset({("benefitcoverage", "coveragecodeid"), ("enrollcoverage", "coveragecodeid")}),
    frozenset({("ndc_mstr", "gcn_seqno"), ("ndcprefdrug", "gcn_seqno")}),
    frozenset({("member_history", "gcnseqno"), ("drugoverrides", "gcn_seqno")}),
    frozenset({("claim", "claimid"), ("claimdiag", "claimid")}),
    frozenset({("pa_gap", "referralid"), ("referral", "referralid")}),
    frozenset({("authservice", "referralid"), ("referral", "referralid")}),
    frozenset({("enrollkeys", "enrollid"), ("memberpcp", "enrollid")}),
    frozenset({("dea", "provid"), ("provider", "provid")}),
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

    generation_attempts: list[dict[str, Any]] = []

    def result(
        queries: list[str],
        failure_category: str | None,
        failure_reason: str | None,
        *,
        validation_status: str | None = None,
        review_warnings: list[str] | None = None,
    ) -> dict[str, Any]:
        return {
            "queries": queries,
            "failure_category": failure_category,
            "failure_reason": failure_reason,
            "validation_status": validation_status,
            "review_warnings": review_warnings or [],
            "generation_attempts": generation_attempts,
        }

    def record_attempt(
        attempt: int,
        source: str,
        outcome: str,
        category: str | None = None,
        reason: str | None = None,
        candidate_query_text: str | None = None,
    ) -> None:
        generation_attempts.append(
            {
                "attempt": attempt + 1,
                "source": source,
                "outcome": outcome,
                "failure_category": category,
                "failure_reason": reason,
                "candidate_query_text": candidate_query_text,
            }
        )

    try:
        ddl_texts = select_ddls(
            business_meaning,
            description=description,
            acceptance_criteria=acceptance_criteria,
        )
        if not ddl_texts:
            print("[generate_queries_for_step] no DDL context selected")
            return result(
                [],
                "NO_SCHEMA_CONTEXT",
                "No DDL schema context was selected for this query task.",
            )

        ddl_context = "\n\n---\n\n".join(ddl_texts)
        deterministic_candidate = _grounded_business_pattern_candidate(
            business_meaning, ddl_context
        )
        repair_feedback = None
        last_failure_category = "VALIDATION_REJECTED"
        last_failure_reason = "The generated SQL did not pass Data Agent validation."
        max_attempts = 6 if draft_mode else 4
        seen_candidates: set[str] = set()
        for attempt in range(max_attempts):
            source = "deterministic_pattern" if attempt == 0 and deterministic_candidate else "model"
            if source == "deterministic_pattern":
                sql = deterministic_candidate
            else:
                sql = _call_openai(
                    business_meaning,
                    ddl_context,
                    repair_feedback,
                    description=description,
                    acceptance_criteria=acceptance_criteria,
                    draft_mode=draft_mode,
                )
            if not sql:
                record_attempt(
                    attempt,
                    source,
                    "rejected",
                    "EMPTY_MODEL_COMPLETION",
                    "The model returned empty content for this generation attempt.",
                )
                if attempt < max_attempts - 1:
                    repair_feedback = (
                        "The previous completion was empty. Return exactly one JSON object with "
                        "query_text containing one grounded SELECT, or null only when the provided "
                        "DDL cannot support any requested source fact."
                    )
                    continue
                return result(
                    [],
                    "EMPTY_MODEL_COMPLETION",
                    "The model returned empty content on every generation attempt.",
                )
            if sql == "INVALID_STRUCTURED_RESPONSE":
                record_attempt(
                    attempt,
                    source,
                    "rejected",
                    "INVALID_MODEL_RESPONSE",
                    "The model did not return the required query_text JSON object.",
                )
                if attempt < max_attempts - 1:
                    repair_feedback = _build_structured_response_repair_feedback()
                    continue
                return result(
                    [],
                    "INVALID_MODEL_RESPONSE",
                    "The model did not return the required query_text JSON object.",
                )

            sql = _clean_sql(sql)
            sql = _normalize_quoted_runtime_placeholders(sql)
            sql = _normalize_inmemory_table_hints(sql)
            sql = _normalize_physical_hint_alias_order(sql)
            sql = _normalize_reserved_table_aliases(sql)
            sql = _normalize_missing_physical_table_hints(sql)
            sql = _normalize_count_output_aliases(sql)
            if sql.upper() == "NO_SUPPORTED_QUERY":
                reason = "The model explicitly reported that no grounded query could be produced."
                record_attempt(
                    attempt, source, "rejected", "NO_SUPPORTED_GROUNDED_QUERY", reason
                )
                print("[generate_queries_for_step] no supported grounded SELECT query")
                if draft_mode and attempt < max_attempts - 1:
                    repair_feedback = (
                        "The upstream agent requires a DataQuery, so do not return null. Build the "
                        "best safe SELECT from the authoritative business meaning. Include the "
                        "maximum available grounded DDL facts, even for a partial mapping, and "
                        "supplement them with descriptive runtime placeholders. Return a tableless "
                        "SELECT only when no DDL table maps to any part of the business meaning. "
                        "Use description and acceptance criteria only as context; "
                        "do not use irAuthor contracts or invent database objects."
                    )
                    continue
                return result(
                    [],
                    "NO_SUPPORTED_GROUNDED_QUERY",
                    "The task could not be mapped to a safe, grounded SELECT query after all generation attempts.",
                )

            candidate_fingerprint = re.sub(r"\s+", " ", sql).strip().casefold()
            if candidate_fingerprint in seen_candidates:
                reason = (
                    "The model repeated a previously rejected SQL candidate without applying "
                    "the requested repair."
                )
                record_attempt(
                    attempt,
                    source,
                    "rejected",
                    "REPEATED_MODEL_CANDIDATE",
                    reason,
                    sql,
                )
                return result([], last_failure_category, last_failure_reason)
            seen_candidates.add(candidate_fingerprint)

            if not _is_safe_select_sql(sql):
                reason = "The generated output was not a safe single SELECT statement."
                record_attempt(
                    attempt, source, "rejected", "VALIDATION_REJECTED", reason, sql
                )
                print("[generate_queries_for_step] rejected unsafe or non-SELECT SQL")
                if not _UNSAFE_SQL_RE.search(sql) and attempt < max_attempts - 1:
                    repair_feedback = _build_parse_repair_feedback()
                    continue
                return result([], "VALIDATION_REJECTED", reason)

            invalid_tables = _find_invalid_table_refs(sql, ddl_context)
            if invalid_tables == ["unparseable or multiple-statement T-SQL"]:
                last_failure_category = "UNPARSEABLE_OR_MULTIPLE_STATEMENTS"
                last_failure_reason = (
                    "The model did not return exactly one parseable T-SQL SELECT statement."
                )
                record_attempt(
                    attempt,
                    source,
                    "rejected",
                    last_failure_category,
                    last_failure_reason,
                    sql,
                )
                if attempt == max_attempts - 1:
                    return result([], last_failure_category, last_failure_reason)
                repair_feedback = _build_parse_repair_feedback()
                continue
            if not invalid_tables:
                invalid_columns = _find_invalid_column_refs(sql, ddl_context)
                if invalid_columns and not _RAW_REQUEST_OBJECT_RE.search(sql):
                    repaired_sql = _repair_invalid_column_references(
                        sql, ddl_context, invalid_columns
                    )
                    if repaired_sql != sql:
                        sql = repaired_sql
                        invalid_columns = _find_invalid_column_refs(sql, ddl_context)
                if invalid_columns:
                    last_failure_category = "COLUMN_NOT_IN_DDL"
                    last_failure_reason = (
                        "The generated SQL referenced columns outside the selected DDL context: "
                        + ", ".join(invalid_columns)
                    )
                    print("[generate_queries_for_step] rejected SQL with columns outside schema context: " + ", ".join(invalid_columns))
                    record_attempt(
                        attempt,
                        source,
                        "rejected",
                        last_failure_category,
                        last_failure_reason,
                        sql,
                    )
                    if attempt == max_attempts - 1:
                        return result([], last_failure_category, last_failure_reason)
                    repair_feedback = _build_column_repair_feedback(
                        invalid_columns, sql, ddl_context
                    )
                    continue

                invalid_artifacts = _find_invalid_sql_artifacts(sql, ddl_context, business_meaning)
                invalid_artifacts.extend(
                    _find_required_business_concept_artifacts(sql, business_meaning)
                )
                invalid_artifacts.extend(_find_output_shape_artifacts(sql, business_meaning))
                output_name_artifacts = _find_output_name_artifacts(sql)
                invalid_artifacts.extend(output_name_artifacts)
                if not invalid_artifacts:
                    record_attempt(attempt, source, "accepted", candidate_query_text=sql)
                    return result(
                        [sql], None, None, validation_status="VALIDATED"
                    )

                if draft_mode:
                    warning_reason = (
                        "The safe DDL-grounded query requires review: "
                        + ", ".join(invalid_artifacts)
                    )
                    record_attempt(
                        attempt,
                        source,
                        "accepted_with_warnings",
                        None,
                        warning_reason,
                        sql,
                    )
                    return result(
                        [sql],
                        None,
                        None,
                        validation_status="DRAFT_REQUIRES_REVIEW",
                        review_warnings=invalid_artifacts,
                    )

                last_failure_category = "VALIDATION_REJECTED"
                last_failure_reason = "The generated SQL was rejected: " + ", ".join(invalid_artifacts)
                record_attempt(
                    attempt,
                    source,
                    "rejected",
                    last_failure_category,
                    last_failure_reason,
                    sql,
                )
                print("[generate_queries_for_step] rejected SQL with invalid predicates: " + ", ".join(invalid_artifacts))
                if attempt == max_attempts - 1:
                    return result([], last_failure_category, last_failure_reason)
                repair_feedback = _build_artifact_repair_feedback(invalid_artifacts)
                continue

            last_failure_category = "TABLE_NOT_IN_DDL"
            last_failure_reason = (
                "The generated SQL referenced tables outside the selected DDL context: "
                + ", ".join(invalid_tables)
            )
            record_attempt(
                attempt,
                source,
                "rejected",
                last_failure_category,
                last_failure_reason,
                sql,
            )
            print("[generate_queries_for_step] rejected SQL with tables outside schema context: " + ", ".join(invalid_tables))
            if attempt == max_attempts - 1:
                return result([], last_failure_category, last_failure_reason)
            repair_feedback = _build_table_repair_feedback(invalid_tables, ddl_context)

        return result([], last_failure_category, last_failure_reason)
    except Exception as exc:
        print(f"[generate_queries_for_step] error: {exc}")
        return result([], "SERVICE_OR_MODEL_FAILURE", str(exc))


def _grounded_business_pattern_candidate(
    business_meaning: str, ddl_context: str
) -> str | None:
    """Build reviewed recurring claim-domain facts without model variability."""
    meaning = business_meaning.lower()
    tables = _extract_ddl_table_names(ddl_context)
    scc_tables = {
        "plandata_rx_production.dbo.edi_pharm_universal",
        "plandata_rx_production.dbo.claim",
        "plandata_rx_production.dbo.claimpharm",
        "hrx.dbo.ndc_mstr",
    }
    if (
        "scc=05" in meaning
        and "same-gcn" in meaning
        and "therapy change" in meaning
        and scc_tables <= tables
    ):
        return """SELECT
    e.metricqty AS HistoryQuantity,
    e.dayssupply AS HistoryDaysSupply,
    c.startdate AS HistoryDateOfService,
    n.GCN_SeqNo AS HistoryGcnSeqNo
FROM plandata_rx_production.dbo.edi_pharm_universal e WITH (NOLOCK)
JOIN plandata_rx_production.dbo.claim c WITH (NOLOCK)
    ON c.claimid = e.claimid
JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK)
    ON cp.claimid = e.claimid
   AND cp.claimline = e.claimline
JOIN HRX.dbo.NDC_Mstr n WITH (NOLOCK)
    ON n.NDCKey = cp.ndckey
WHERE RTRIM(e.SubmissionClarification) = '05'
  AND n.GCN_SeqNo = {{GCNSeqNo}}
  AND RTRIM(e.rxnumber) = {{RxNumber}}
  AND c.memid = {{MemberId}}
  AND c.provid = {{ProviderId}}
  AND c.startdate >= DATEADD(MONTH, -12, {{DateOfService}})
  AND c.startdate <= {{DateOfService}}
  AND RTRIM(c.status) IN ('PAID', 'PAY', 'WAITPAY')
  AND RTRIM(c.formtype) = 'UNIVERSALC'
  AND RTRIM(c.resubclaimid) = ''"""

    pa_tables = {
        "plandata_rx_production.dbo.authservice",
        "plandata_rx_production.dbo.referral",
        "hrx.dbo.pa_gap",
    }
    if (
        "compound ingredients" in meaning
        and "total units" in meaning
        and "used units" in meaning
        and "pa_gap" in meaning
        and pa_tables <= tables
    ):
        return """SELECT
    a.totalunits AS PaTotalUnits,
    a.usedunits AS PaUsedUnits,
    pg.type AS PaGapType
FROM plandata_rx_production.dbo.authservice a WITH (NOLOCK)
JOIN plandata_rx_production.dbo.referral r WITH (NOLOCK)
    ON r.referralid = a.referralid
JOIN HRX.dbo.PA_Gap pg WITH (NOLOCK)
    ON pg.referralid = r.referralid
WHERE r.memid = {{MemberId}}
  AND a.dosdate = {{DateOfService}}
  AND RTRIM(a.status) = 'APPROVED'
  AND RTRIM(pg.type) <> 'External'
  AND (RTRIM(a.codeid) = {{Ndc}} OR SUBSTRING(RTRIM(a.ndcprodname), 2, 6) = {{GCNSeqNo}})
  AND r.effdate <= {{DateOfService}}"""

    if (
        "7239_pkgbilling_bypass" in meaning
        and "drug override" in meaning
        and "hrx.dbo.drugoverrides" in tables
    ):
        return """SELECT
    d.OverrideID AS PackageBillingOverrideID,
    d.EffDate AS PackageBillingEffDate,
    d.TermDate AS PackageBillingTermDate,
    d.NDCKey AS PackageBillingNdcKey,
    d.GCN_SeqNo AS PackageBillingGcnSeqNo,
    d.HIC3 AS PackageBillingHic3
FROM HRX.dbo.DrugOverrides d WITH (NOLOCK)
WHERE d.Type = '7239_PkgBilling_Bypass'
  AND {{DateOfService}} BETWEEN d.EffDate AND d.TermDate
  AND (d.NDCKey = {{Ndc}} OR d.GCN_SeqNo = {{GCNSeqNo}} OR d.HIC3 = {{Hic3}})"""

    partial_tables = {
        "plandata_rx_production.dbo.claimpartial",
        "plandata_rx_production.dbo.claim",
        "plandata_rx_production.dbo.claimpharm",
    }
    if (
        "initial partial-fill history" in meaning
        and "associated prescription/service reference number is blank" in meaning
        and partial_tables <= tables
    ):
        return """SELECT COUNT(*) AS InitialPartialHistoryCount
FROM plandata_rx_production.dbo.ClaimPartial cp WITH (NOLOCK)
JOIN plandata_rx_production.dbo.claim c WITH (NOLOCK)
    ON c.claimid = cp.claimid
JOIN plandata_rx_production.dbo.claimpharm p WITH (NOLOCK)
    ON p.claimid = cp.claimid
   AND p.rxnumber = {{RxNumber}}
WHERE c.memid = {{MemberId}}
  AND c.provid = {{ProviderId}}
  AND RTRIM(c.status) IN ('PAID', 'PAY', 'WAITPAY')
  AND RTRIM(c.resubclaimid) = ''
  AND RTRIM(cp.AssociatedPrescriptionRefNumber) = ''"""

    provider_tables = {
        "plandata_rx_production.dbo.provider",
        "plandata_rx_production.dbo.planprovinfo",
    }
    if (
        "prescriber npi" in meaning
        and "active plan provider enrollment" in meaning
        and provider_tables <= tables
    ):
        return """SELECT TOP (1)
    p.provid AS InternalProviderId
FROM plandata_rx_production.dbo.provider p WITH (NOLOCK)
JOIN plandata_rx_production.dbo.planprovinfo pp WITH (NOLOCK)
    ON pp.provid = p.provid
WHERE RTRIM(p.npi) = {{PrescriberNpi}}
  AND {{DateOfService}} BETWEEN pp.effdate AND pp.termdate"""

    compound_tables = {"hrx.dbo.compound", "hrx.dbo.ndc_mstr"}
    if (
        "historical compound quantity" in meaning
        and "gcn_seqno" in meaning
        and compound_tables <= tables
    ):
        return """SELECT
    n.GCN_SeqNo AS HistoryGcnSeqNo,
    SUM(TRY_CONVERT(decimal(29,9), c.drug_qty)) AS HistoricalCompoundQuantity
FROM HRX.dbo.COMPOUND c WITH (NOLOCK)
JOIN HRX.dbo.NDC_Mstr n WITH (NOLOCK)
    ON n.NDCKey = c.ndc
WHERE c.tcn IN ([[HistoricalTcns]])
  AND n.GCN_SeqNo = {{GCNSeqNo}}
GROUP BY n.GCN_SeqNo"""
    return None


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
        "RULE DESCRIPTION (overall objective only; do not import query logic):\n"
        f"{description or 'Not provided'}\n\n"
        "DIRECTLY REFERENCED ACCEPTANCE CRITERIA (supporting context only):\n"
        f"{acceptance_text}\n\n"
        "CURRENT DATA QUERY BUSINESS MEANING (authoritative atomic query task):\n"
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

    model = os.environ.get("OPENAI_MODEL", "gpt-5.6-luna")
    base_url = os.environ.get("OPENAI_BASE_URL") or os.environ.get("OPENAI_API_BASE")
    verify_ssl = os.environ.get("OPENAI_VERIFY_SSL", "false").lower() in {"1", "true", "yes"}
    timeout_seconds = float(os.environ.get("OPENAI_TIMEOUT_SECONDS", "180"))
    http_client = httpx.Client(verify=verify_ssl, timeout=timeout_seconds)
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
        system_prompt += (
            "\n\n20. DRAFT MODE: The upstream agent has authoritatively routed this task for a\n"
            "    DataQuery. Always return the best safe review-only SELECT candidate. Include\n"
            "    the maximum available DDL-backed source facts even when they satisfy only part\n"
            "    of the business meaning, and supplement them with descriptive runtime\n"
            "    placeholders. Use a tableless SELECT only when no DDL table maps to any part\n"
            "    of the authoritative business meaning.\n"
            "    Use the description and acceptance criteria only as supporting context. Never\n"
            "    use irAuthor DataSet names, record items, fallback SQL, assumptions, or\n"
            "    configuration to determine the query. In draft mode, do not return null."
        )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message},
    ]
    if repair_feedback:
        messages.append({"role": "user", "content": repair_feedback})

    request_kwargs = {
        "model": model,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }
    if model.lower().startswith(("gpt-5", "o1", "o3", "o4")):
        request_kwargs["max_completion_tokens"] = 4000
    else:
        request_kwargs["temperature"] = 0
        request_kwargs["max_tokens"] = 600

    response = client.chat.completions.create(**request_kwargs)
    content = response.choices[0].message.content
    return _parse_model_query_response(content)


def _parse_model_query_response(content: str | None) -> str | None:
    if not content:
        return None
    try:
        payload = json.loads(content)
    except (json.JSONDecodeError, TypeError):
        return "INVALID_STRUCTURED_RESPONSE"
    if not isinstance(payload, dict) or set(payload) != {"query_text"}:
        return "INVALID_STRUCTURED_RESPONSE"
    query_text = payload["query_text"]
    if query_text is None:
        return "NO_SUPPORTED_QUERY"
    if not isinstance(query_text, str) or not query_text.strip():
        return "INVALID_STRUCTURED_RESPONSE"
    return query_text.strip()


def _normalize_inmemory_table_hints(sql: str) -> str:
    return _INMEMORY_NOLOCK_RE.sub(lambda match: match.group("table"), sql)


def _normalize_physical_hint_alias_order(sql: str) -> str:
    """Move a physical-table alias before its SQL Server NOLOCK hint."""
    return _HINT_BEFORE_ALIAS_RE.sub(
        lambda match: f"{match.group('table')} AS {match.group('alias')} WITH (NOLOCK)",
        sql,
    )


def _normalize_missing_physical_table_hints(sql: str) -> str:
    """Add the required SQL Server NOLOCK hint to qualified physical tables."""
    def add_hint(match: re.Match[str]) -> str:
        canonical = _canonical_table_ref(match.group("table"))
        if not canonical or canonical.startswith("inmemory.") or match.group("hint"):
            return match.group(0)
        return f"{match.group('table_ref')}{match.group('alias') or ''} WITH (NOLOCK)"

    parts = re.split(r"('(?:''|[^'])*')", sql)
    for index in range(0, len(parts), 2):
        parts[index] = _PHYSICAL_TABLE_WITH_ALIAS_RE.sub(add_hint, parts[index])
    return "".join(parts)


def _normalize_reserved_table_aliases(sql: str) -> str:
    """Bracket parser-reserved table aliases without changing SQL semantics."""
    aliases: set[str] = set()

    def quote_declaration(match: re.Match[str]) -> str:
        alias = match.group("alias")
        if alias.casefold() not in _RESERVED_TABLE_ALIASES:
            return match.group(0)
        aliases.add(alias)
        return f"{match.group('prefix')}[{alias}]"

    parts = re.split(r"('(?:''|[^'])*')", sql)
    for index in range(0, len(parts), 2):
        parts[index] = _TABLE_ALIAS_RE.sub(quote_declaration, parts[index])
    if not aliases:
        return sql
    for index in range(0, len(parts), 2):
        for alias in aliases:
            parts[index] = re.sub(
                rf"(?<![\w\]]){re.escape(alias)}\s*\.",
                f"[{alias}].",
                parts[index],
                flags=re.IGNORECASE,
            )
    return "".join(parts)


def _normalize_quoted_runtime_placeholders(sql: str) -> str:
    """Treat an exactly quoted runtime placeholder as a parameter, not text."""
    return re.sub(r"'(?P<placeholder>\{\{[^{}]+\}\})'", r"\g<placeholder>", sql)


def _clean_sql(text: str) -> str:
    sql = text.strip()
    fenced_blocks = re.findall(
        r"```(?:sql)?\s*(.*?)\s*```", sql, flags=re.IGNORECASE | re.DOTALL
    )
    if len(fenced_blocks) == 1 and fenced_blocks[0].lstrip().lower().startswith("select"):
        sql = fenced_blocks[0]
    elif sql.startswith("```"):
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


def _build_structured_response_repair_feedback() -> str:
    return (
        "The previous response did not match the required JSON envelope. Return exactly one "
        "JSON object with exactly one field: {\"query_text\": \"SELECT ...\"}. Use "
        "{\"query_text\": null} only when no grounded query exists. Do not return markdown, "
        "explanations, additional fields, or text outside the JSON object."
    )


def _build_parse_repair_feedback() -> str:
    return (
        "The query_text value was not exactly one parseable T-SQL SELECT statement. "
        "Regenerate the same atomic query as one SELECT only inside the required JSON "
        "object. Do not put explanations, markdown, code fences, variable declarations, "
        "temporary tables, multiple SELECT alternatives, or semicolon-separated statements "
        "inside query_text. Preserve every required business filter, output, QueryParam "
        "placeholder, and DDL-grounded table/column mapping."
    )


def _build_table_repair_feedback(invalid_tables: list[str], ddl_context: str) -> str:
    allowed = sorted(_extract_ddl_table_names(ddl_context))
    return (
        "The previous SQL referenced table(s) not present in the provided DDL context: "
        f"{', '.join(invalid_tables)}. Regenerate the SQL using ONLY these fully "
        f"qualified tables: {', '.join(allowed)}. Do not invent tables, aliases for "
        "tables, or joins outside the DDL context. Return the corrected SELECT inside "
        "the required query_text JSON object."
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


def _repair_invalid_column_references(
    sql: str, ddl_context: str, invalid_columns: list[str]
) -> str:
    statement = _parse_generated_select(sql)
    if statement is None:
        return sql
    catalog = _extract_ddl_column_catalog(ddl_context)
    aliases: dict[str, str] = {}
    for table in statement.find_all(exp.Table):
        canonical = _canonical_ast_table(table)
        if canonical:
            aliases[table.alias_or_name.lower()] = canonical
    repaired = sql
    for invalid in invalid_columns:
        if "." not in invalid:
            continue
        raw_alias, raw_column = invalid.rsplit(".", 1)
        alias = raw_alias.strip('"[]').lower()
        column = raw_column.strip('"[]')
        normalized_column = re.sub(r"[^a-z0-9]", "", column.lower())
        suffix_matches = [
            (candidate_alias, allowed)
            for candidate_alias, table in aliases.items()
            for allowed in catalog.get(table, set())
            if len(allowed) >= 4 and normalized_column.endswith(
                re.sub(r"[^a-z0-9]", "", allowed.lower())
            )
        ]
        same_alias_suffix = [candidate for candidate in suffix_matches if candidate[0] == alias]
        suffix_usable = same_alias_suffix if len(same_alias_suffix) == 1 else suffix_matches
        if len(suffix_usable) == 1:
            replacement_alias, replacement_column = suffix_usable[0]
            pattern = re.compile(
                rf"(?<![A-Za-z0-9_])(?:\[{re.escape(alias)}\]|{re.escape(alias)})"
                rf"\s*\.\s*(?:\[{re.escape(column)}\]|\"{re.escape(column)}\"|{re.escape(column)})"
                rf"(?![A-Za-z0-9_])",
                re.IGNORECASE,
            )
            repaired = pattern.sub(f"{replacement_alias}.{replacement_column}", repaired)
            continue
        concepts = _semantic_concepts(column)
        if not concepts:
            continue
        candidates: list[tuple[str, str]] = []
        for candidate_alias, table in aliases.items():
            for allowed in catalog.get(table, set()):
                if concepts & _semantic_concepts(allowed):
                    candidates.append((candidate_alias, allowed))
        same_alias = [candidate for candidate in candidates if candidate[0] == alias]
        usable = same_alias if len(same_alias) == 1 else candidates
        if len(usable) != 1:
            continue
        replacement_alias, replacement_column = usable[0]
        pattern = re.compile(
            rf"(?<![A-Za-z0-9_])(?:\[{re.escape(alias)}\]|{re.escape(alias)})"
            rf"\s*\.\s*(?:\[{re.escape(column)}\]|\"{re.escape(column)}\"|{re.escape(column)})"
            rf"(?![A-Za-z0-9_])",
            re.IGNORECASE,
        )
        repaired = pattern.sub(
            f"{replacement_alias}.{replacement_column}", repaired
        )
    return repaired


def _column_repair_suggestions(
    invalid_columns: list[str], sql: str, ddl_context: str
) -> list[str]:
    statement = _parse_generated_select(sql)
    if statement is None:
        return []
    catalog = _extract_ddl_column_catalog(ddl_context)
    aliases: dict[str, str] = {}
    referenced_tables: list[str] = []
    for table in statement.find_all(exp.Table):
        canonical = _canonical_ast_table(table)
        if not canonical:
            continue
        aliases[table.alias_or_name.lower()] = canonical
        referenced_tables.append(canonical)
    suggestions: list[str] = []
    for invalid in invalid_columns:
        if "." not in invalid:
            continue
        alias, column = invalid.rsplit(".", 1)
        concepts = _semantic_concepts(column.strip('"[]'))
        if not concepts:
            continue
        preferred = aliases.get(alias.strip('"[]').lower())
        candidates: list[str] = []
        ordered_tables = ([preferred] if preferred else []) + [
            table for table in referenced_tables if table != preferred
        ]
        for table in ordered_tables:
            if not table:
                continue
            table_name = table.split(".")[-1]
            for allowed in sorted(catalog.get(table, set())):
                if concepts & _semantic_concepts(allowed):
                    candidates.append(f"{table_name}.{allowed}")
        if candidates:
            suggestions.append(
                f"{invalid} likely maps by business concept to one of: "
                + ", ".join(candidates[:6])
            )
    return suggestions


def _build_column_repair_feedback(
    invalid_columns: list[str], sql: str, ddl_context: str
) -> str:
    suggestions = _column_repair_suggestions(invalid_columns, sql, ddl_context)
    suggestion_text = (
        " Schema-grounded concept matches: " + "; ".join(suggestions) + "."
        if suggestions else ""
    )
    return (
        "The previous SQL referenced columns not present in the selected table DDL: "
        f"{', '.join(invalid_columns)}.{suggestion_text} Regenerate using only exact "
        "columns from the provided table DDLs. Move a business concept to the table "
        "that actually owns the matching column and use only reviewed joins. If an incoming "
        "GCN, NDC, Rx number, member, provider, date, or quantity is already supplied by the "
        "request, use a descriptive runtime placeholder instead of attaching it to an unrelated "
        "table. If a proposed join column is absent, use only an available reviewed key such as "
        "claimid; do not require claimline unless both joined DDLs contain it. Do not substitute "
        "an unrelated column or invent a predicate. Return the corrected SELECT "
        "inside the required query_text JSON object, or {\"query_text\": null} if the "
        "mapping cannot be grounded."
    )


def _find_required_business_concept_artifacts(
    sql: str, business_meaning: str
) -> list[str]:
    """Reject candidates that silently omit strongly named atomic constraints."""
    requirements = (
        (
            r"\bquantity(?:\s+dispensed)?\b",
            "quantity",
            r"\b(?:metricqty|qty|drug_qty|[a-z0-9_]*quantity[a-z0-9_]*)\b|\{\{[^}]*(?:quantity|qty)[^}]*\}\}",
        ),
        (
            r"\bdays[ _-]*supply\b",
            "days supply",
            r"\b[a-z0-9_]*days?[_]?supply[a-z0-9_]*\b|\{\{[^}]*days?[_]?(?:supply)?[^}]*\}\}",
        ),
        (r"\b(?:rx\s*number|prescription/service reference number)\b", "Rx number", r"\b(?:rxnumber|associatedprescriptionrefnumber)\b|\{\{[^}]*rx[^}]*\}\}"),
        (r"\bform\s*type\b|\bformtype\b", "form type", r"\bformtype\b"),
        (r"\bresubclaimid\b|\bnon-reversed\b", "reversal status", r"\bresubclaimid\b"),
        (r"\bgcn(?:_?seqno)?\b", "GCN", r"\bgcn(?:_?seqno)?\b|\{\{[^}]*gcn[^}]*\}\}"),
        (
            r"\b(?:same|selected)\b[^.\n]{0,80}\b(?:event|history)?\s*occurrence\b",
            "selected occurrence",
            r"\b(?:ndcindex|previcn|icn)\b|\{\{[^}]*(?:index|occurrence|event|icn)[^}]*\}\}|\[\[[^]]+\]\]",
        ),
    )
    normalized_sql = sql.lower()
    prefiltered_historical_tcns = bool(
        re.search(r"\[?\[?\{?\{?\s*historicaltcns\b", normalized_sql)
    )
    artifacts = []
    for requirement_pattern, label, sql_pattern in requirements:
        if not re.search(requirement_pattern, business_meaning, re.IGNORECASE):
            continue
        if prefiltered_historical_tcns and label in {"form type", "reversal status"}:
            continue
        if not re.search(sql_pattern, normalized_sql, re.IGNORECASE):
            artifacts.append(f"required business concept '{label}' is absent from the SQL")
    return artifacts


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


def _normalize_count_output_aliases(sql: str) -> str:
    """Name COUNT outputs after the rows counted, never the inverse condition."""
    pattern = re.compile(
        r"(?P<count>\bCOUNT\s*\(\s*(?:\*|1)\s*\)\s+AS\s+)"
        r"(?P<quoted>\[|\")?"
        r"(?P<alias>(?:Missing|No|NotFound|Absent|Without)[A-Za-z0-9]+)"
        r"(?(quoted)(?:\]|\"))",
        re.IGNORECASE,
    )

    def normalize(match: re.Match[str]) -> str:
        alias = match.group("alias")
        fact = re.sub(
            r"^(?:Missing|No|NotFound|Absent|Without)", "", alias, flags=re.IGNORECASE
        )
        if not fact:
            fact = "MatchingRecord"
        if not fact.lower().endswith("count"):
            fact += "Count"
        return f"{match.group('count')}{fact}"

    return pattern.sub(normalize, sql)


def _find_output_name_artifacts(sql: str) -> list[str]:
    statement = _parse_generated_select(sql)
    if not isinstance(statement, exp.Select):
        return []
    artifacts = []
    for projection in statement.expressions:
        alias = projection.alias
        if not alias:
            continue
        if len(alias) > 40:
            artifacts.append(f"output alias {alias!r} exceeds 40 characters")
        elif not re.fullmatch(r"[A-Z][A-Za-z0-9]*", alias):
            artifacts.append(f"output alias {alias!r} must use PascalCase")
        elif _is_decision_shaped_output_alias(alias):
            artifacts.append(
                f"output alias {alias!r} describes a final rule decision instead of an extracted fact"
            )
    return artifacts


def _is_decision_shaped_output_alias(alias: str) -> bool:
    """Reject explicit rule outcomes without blocking domain source-fact names."""
    return bool(
        re.search(
            r"^(?:Should|Must|Can|Is)(?:Bypass|Denied|Deny|Posted|Post|Eligible|Applicable)"
            r"|(?:Bypass|Deny|Denial|Post|Posting|Eligibility|Applicability)Decision$"
            r"|(?:Bypass|Denial|Posting|Eligibility)Applies$",
            alias,
            re.IGNORECASE,
        )
    )


def _parse_generated_select(sql: str) -> Expression | None:
    sanitized = re.sub(r"\[\[[^]]+\]\]", "NULL", sql)
    sanitized = re.sub(r"\{\{[^}]+\}\}", "NULL", sanitized)
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


def _find_ungrounded_subqueries(statement: Expression) -> list[str]:
    artifacts: list[str] = []
    all_tables = list(statement.find_all(exp.Table))
    aliases = {
        table.alias_or_name.lower(): table.name.lower()
        for table in all_tables
    }
    nested_selects = [
        select for select in statement.find_all(exp.Select)
        if select is not statement
    ]
    for nested in nested_selects:
        if any(
            ancestor is not nested
            for ancestor in nested.find_all(exp.Select)
        ):
            artifacts.append("nested subquery depth greater than one is not supported")
            continue
        nested_tables = [
            table for table in nested.find_all(exp.Table)
            if table.find_ancestor(exp.Select) is nested
        ]
        if len(nested_tables) != 1:
            artifacts.append("subquery must read exactly one grounded table")
            continue
        nested_alias = nested_tables[0].alias_or_name.lower()
        correlated = False
        unreviewed = False
        for equality in nested.find_all(exp.EQ):
            left, right = equality.left, equality.right
            if not isinstance(left, exp.Column) or not isinstance(right, exp.Column):
                continue
            left_alias = left.table.lower() if left.table else ""
            right_alias = right.table.lower() if right.table else ""
            if nested_alias not in {left_alias, right_alias} or left_alias == right_alias:
                continue
            outer_alias = right_alias if left_alias == nested_alias else left_alias
            if not outer_alias or outer_alias not in aliases:
                continue
            relationship = frozenset({
                (aliases[left_alias], left.name.lower()),
                (aliases[right_alias], right.name.lower()),
            })
            if relationship in _REVIEWED_JOIN_KEYS:
                correlated = True
            else:
                unreviewed = True
        if unreviewed or not correlated:
            artifacts.append(
                f"subquery on {nested_tables[0].sql()} is not correlated through a reviewed key"
            )
    return artifacts


def _business_meaning_names_table(business_meaning: str, table: exp.Table) -> bool:
    normalized = business_meaning.lower().replace("_", " ")
    table_name = table.name.lower().replace("_", " ")
    return bool(re.search(
        rf"(?<![a-z0-9]){re.escape(table_name)}(?![a-z0-9])",
        normalized,
    ))


def _find_noncontributing_two_table_artifacts(
    statement: Expression, tables: list[exp.Table], business_meaning: str
) -> list[str]:
    if len(tables) != 2:
        return []
    meaningful_aliases: set[str] = set()
    expressions = list(statement.expressions)
    for key in ("where", "group", "having", "order", "qualify"):
        expression = statement.args.get(key)
        if isinstance(expression, Expression):
            expressions.append(expression)
    for expression in expressions:
        for column in expression.find_all(exp.Column):
            if column.table:
                meaningful_aliases.add(column.table.lower())
    return [
        f"table {table.name} contributes no requested output or filter"
        for table in tables
        if table.alias_or_name.lower() not in meaningful_aliases
        and not _business_meaning_names_table(business_meaning, table)
    ]


def _semantic_concepts(name: str) -> set[str]:
    normalized = re.sub(r"[^a-z0-9]", "", name.lower().lstrip(":"))
    concepts: set[str] = set()
    families = {
        "rxnumber": ("rxnumber", "prescriptionnumber", "servicereferencenumber"),
        "editid": ("editid", "editeditid", "rejecteditseditid"),
        "memberid": ("memberid", "memid", "cardholderid"),
        "providerid": ("providerid", "provid", "pharmacynpi", "prescribernpi", "npi"),
        "ndc": ("ndc", "ndckey", "nationaldrugcode"),
        "gcn": ("gcn", "gcnseqno"),
        "date": ("date", "dos", "dateofservice", "effdate", "enddate", "termdate"),
        "quantity": ("quantity", "qty", "metricqty", "units"),
        "dayssupply": ("dayssupply",),
        "planid": ("planid", "benefitplanid"),
        "authorizationid": ("authorizationid", "authid", "referralid"),
        "claimid": ("claimid", "matchingclaimid"),
    }
    for concept, aliases in families.items():
        if any(alias in normalized for alias in aliases):
            concepts.add(concept)
    return concepts


def _expression_columns(expression: Expression) -> list[exp.Column]:
    if isinstance(expression, exp.Column):
        return [expression]
    return list(expression.find_all(exp.Column))


def _expression_runtime_names(
    expression: Expression, runtime_by_sentinel: dict[str, str]
) -> list[str]:
    literals = [expression] if isinstance(expression, exp.Literal) else list(
        expression.find_all(exp.Literal)
    )
    return [
        runtime_by_sentinel[str(literal.this)]
        for literal in literals
        if str(literal.this) in runtime_by_sentinel
    ]


def _runtime_semantic_statement(
    sql: str,
) -> tuple[Expression | None, dict[str, str]]:
    runtime_by_sentinel: dict[str, str] = {}

    def replace(match: re.Match[str]) -> str:
        runtime = match.group(1).strip()
        sentinel = f"__INRULE_RUNTIME_{len(runtime_by_sentinel)}__"
        runtime_by_sentinel[sentinel] = runtime
        return f"'{sentinel}'"

    sanitized = re.sub(r"'?\{\{([^}]+)\}\}'?", replace, sql)
    sanitized = _NOLOCK_HINT_RE.sub("WITH (NOLOCK)", sanitized)
    try:
        statements = sqlglot.parse(sanitized, read="tsql")
    except (ParseError, TokenError, ValueError):
        return None, runtime_by_sentinel
    parsed = [statement for statement in statements if statement is not None]
    return (parsed[0] if len(parsed) == 1 else None), runtime_by_sentinel


def _find_runtime_column_mapping_artifacts(sql: str) -> list[str]:
    artifacts: list[str] = []
    statement, runtime_by_sentinel = _runtime_semantic_statement(sql)
    if statement is None:
        return artifacts
    for equality in statement.find_all(exp.EQ):
        comparisons = (
            (equality.left, equality.right),
            (equality.right, equality.left),
        )
        for column_side, runtime_side in comparisons:
            columns = _expression_columns(column_side)
            runtimes = _expression_runtime_names(runtime_side, runtime_by_sentinel)
            for column in columns:
                for runtime in runtimes:
                    runtime_concepts = _semantic_concepts(runtime)
                    column_concepts = _semantic_concepts(column.name)
                    if (
                        runtime_concepts
                        and column_concepts
                        and runtime_concepts.isdisjoint(column_concepts)
                    ):
                        artifact = (
                            f"column {column.sql()} is semantically incompatible with "
                            f"runtime input {{{{{runtime}}}}}"
                        )
                        if artifact not in artifacts:
                            artifacts.append(artifact)
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
    artifacts.extend(_find_runtime_column_mapping_artifacts(sql))
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

    nested_selects = [
        select for select in statement.find_all(exp.Select)
        if select is not statement
    ]
    if nested_selects:
        artifacts.extend(_find_ungrounded_subqueries(statement))

    unique_tables = {
        canonical for table in tables if (canonical := _canonical_ast_table(table))
    }
    if len(unique_tables) > 1:
        outer_tables = [
            table for table in tables
            if table.find_ancestor(exp.Subquery) is None
        ]
        outer_joins = [
            join for join in statement.find_all(exp.Join)
            if join.find_ancestor(exp.Subquery) is None
        ]
        if outer_joins:
            artifacts.extend(_find_ungrounded_joins(outer_joins, outer_tables))
            artifacts.extend(
                _find_noncontributing_two_table_artifacts(
                    statement, outer_tables, business_meaning
                )
            )
        elif not nested_selects:
            artifacts.append("multi-table SELECT has no grounded JOIN")
    return artifacts


def _build_artifact_repair_feedback(invalid_artifacts: list[str]) -> str:
    completeness_feedback = (
        " The SQL omitted one or more explicitly required atomic concepts. Add each missing "
        "concept using its exact DDL column or an explicit runtime placeholder, preserving the "
        "required output and filters; do not silently drop the constraint."
        if any("required business concept" in artifact for artifact in invalid_artifacts)
        else ""
    )
    output_feedback = (
        " The output alias encoded a final rule decision. Replace decision-shaped "
        "COUNT/CASE/constant output with the underlying requested source fact, such as "
        "the matching row ID, code, date, value, or other DDL column, and give it a "
        "concise factual alias. Downstream InRule logic decides whether a bypass, denial, "
        "or other action applies."
        if any("output alias" in artifact for artifact in invalid_artifacts)
        else ""
    )
    return (
        "The previous SQL violated source, relationship, or SQL-quality rules: "
        f"{', '.join(invalid_artifacts)}. Regenerate one SELECT using only provided "
        "DDL tables and columns. InMemory tables must not use NOLOCK; physical tables "
        "must use NOLOCK. Prefer one complete table. Use any physical, InMemory, or "
        "mixed-source JOIN only when every table is explicitly required by the current "
        "atomic business meaning and the join key is a reviewed InRule SME relationship. "
        "If runtime placeholders already provide the target table's lookup keys, remove "
        "the unnecessary JOIN and filter that target table directly. Do not join claim or "
        "InMemory data merely to obtain values already supplied as runtime inputs. "
        "Do not use APPLY, UNION, INTERSECT, EXCEPT, or an ungrounded "
        "multi-table subquery. Also remove impossible predicates, tautologies, and "
        "raw HrxRequest/ClaimRequest paths."
        f"{completeness_feedback}{output_feedback} Use approved double-brace placeholders, preserve "
        "the current task's filters and exact output shape, and return the corrected SELECT "
        "inside the required query_text JSON object. If grounding is insufficient, return "
        "{\"query_text\": null}."
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
