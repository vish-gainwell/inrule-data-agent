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
    ("carriermemidhistory", ("plandata_rx_production", "dbo", "carriermemidhistory")),
    ("carrier member history", ("plandata_rx_production", "dbo", "carriermemidhistory")),
    ("secondaryid", ("plandata_rx_production", "dbo", "member")),
    ("secondary id", ("plandata_rx_production", "dbo", "member")),
    ("headofhouse", ("plandata_rx_production", "dbo", "member")),
    ("member table", ("plandata_rx_production", "dbo", "member")),
    (" left join member", ("plandata_rx_production", "dbo", "member")),
    ("ndc_limits", ("HRX", "dbo", "NDC_Limits")),
    ("ndc limits", ("HRX", "dbo", "NDC_Limits")),
    ("ndcmedicarecov", ("HRX", "dbo", "NDCMedicareCov")),
    ("ndc medicare cov", ("HRX", "dbo", "NDCMedicareCov")),
    ("part b drug coverage", ("HRX", "dbo", "NDCMedicareCov")),
    ("ndcmaintdetails", ("HRX", "dbo", "NDCMaintDetails")),
    ("ndc maint details", ("HRX", "dbo", "NDCMaintDetails")),
    ("ncpdp_reject_codes", ("HRX", "dbo", "NCPDP_Reject_Codes")),
    ("ncpdp reject codes", ("HRX", "dbo", "NCPDP_Reject_Codes")),
    ("ncpdp reject-code", ("HRX", "dbo", "NCPDP_Reject_Codes")),
    ("maxscriptdays", ("HRX", "dbo", "NDC_Mstr")),
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
   Current compound ingredient NDC: {{IngredientNdc}}
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
   - Current/selected compound ingredient NDC and Compound Product ID used as an NDC
     key mean {{IngredientNdc}}. Do not replace them with the transaction-level
     {{ClaimTransaction.Ndc}}.
   - {member_id}, {participant_id}, and resolved member id mean {{MemberId}}.
   - A submitted cardholder ID used to resolve a physical memid through enrollkeys,
     carriermemidhistory, or member.secondaryid means {{CardholderId}}. Do not label
     that lookup input {{MemberId}}; MemberId is the resolved output.
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

5. Preserve every authoritative literal value specified in the business requirement exactly
   as written in the semantic candidate SQL (e.g. Type = '3013_Opioid' or status = 'PAID').
   Never synthesize a configuration literal by prepending the current edit ID; numeric prefixes
   are valid only when they are part of the exact reviewed source value. Do NOT invent or
   substitute values. The downstream DataQuery contract builder will
   convert reusable assignment literals into named QueryParams; do not replace them with
   unrelated runtime entity paths.

6. Several columns in plandata_rx_production.dbo.claim are CHAR (fixed-width, space-padded).
   Always wrap them in RTRIM() for comparisons and use only the status family required
   by the current business meaning:
   - Paid, non-reversed history: RTRIM(status) IN ('PAID', 'PAY', 'WAITPAY')
     together with RTRIM(resubclaimid) = ''. Never include DENY, WAITDENY, or REV.
   - Include denied, waiting-denial, or reversal statuses only when explicitly required.
   - RTRIM(formtype) = 'UNIVERSALC'
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
      reviewed Type literal without deriving it from the edit ID, plus {{ClaimTransaction.Ndc}},
      {{ClaimRequest.DrugRequested.GCNSeqNo.Code}}, {{ClaimRequest.DrugRequested.HIC3.Code}},
      and {{DateOfService}} as lookup values. Never join InMemory.DRUG merely to recover
      those current-drug values. The contract/reuse layer will convert the Type literal and
      runtime placeholders into the generic DrugOverrideType, Ndc, GcnSeqNo, Hic3, and
      DateOfService parameter assignments.
    For active current-drug exclusion/existence lookups, combine NDCKey, GCN_SeqNo, and HIC3
    matches as alternatives and apply the inclusive DateOfService EffDate/TermDate window to
    that same DrugOverrides row; an NDC-only match is incomplete.
      Reusable MemberExclusion shape: query HRX.dbo.MemberExclusion directly and preserve
    its configured Type discriminator literals exactly. A GCN sequence-number exclusion uses
    Type = 'GCNSEQNO' (no underscore), with Value matched to the current GCN sequence number;
    do not derive the stored literal from a display label or physical column spelling. Apply
    member scope and the inclusive DateOfService EffDate/TermDate window to the same row.
      Reusable contract-term drug-match shape: InMemory.dbo.CONTRACT_TERM is the prefiltered
    ClaimRequest.ContractTerms result loaded by hrxHPA_GetContractTermValuesNDC2 for the
    resolved contract, submitted NDC range, and DOS. That loader encapsulates both direct
    termndc matching and product-name-group matching through termndcgroup/ndccode, excluding
    group terms already satisfied directly. Query CONTRACT_TERM directly; do not claim that
    a simple ContractId/date filter reconstructs those physical branches, and do not invent
    physical term-table SQL when their DDL is absent. For a no-match/count fact, count loaded
    rows whose ContractId is nonblank.
      Current submitted SCC shape: a submitted/current claim Submission Clarification Code
    is a runtime request value. Use {{SubmissionClarificationCode}} (or a routed submitted SCC
    collection placeholder when the task names multiple occurrences); never query
    edi_pharm_universal to recover it. Use EPU only when the business meaning explicitly asks
    for historical SCC claim data.
      Reusable SCC history shape: select edi_pharm_universal.metricqty and dayssupply;
    join claim on claimid for status/formtype/resubclaimid/date/member/provider filters;
    join claimpharm on claimid and claimline, then NDC_Mstr on claimpharm.ndckey for GCN;
    filter edi_pharm_universal.SubmissionClarification and rxnumber as required.
      Reusable prescription-history shape: when the task identifies a prescription by
    provider plus Rx/prescription-reference number, preserve both predicates. For an
    oldest/earliest occurrence use TOP (1) with ascending Fill_Date and a stable key as
    a tie-breaker; do not replace provider scope with member scope or order by the value
    being returned when the task names Fill_Date as the occurrence order.
      Deterministic scalar row-selection shape: when the task requests a fact from one
    initial/first/earliest/oldest/latest/newest qualifying row, use TOP (1) with ORDER BY.
    Derive the precedence column and ASC/DESC direction from the current business meaning
    and supplied DDL descriptions, then add a documented primary key or stable identifier as
    a tie-breaker; add further grain keys when joins can duplicate the selected row. Never
    hard-code domain-specific date or ID columns, and never use DISTINCT as a substitute for
    selecting the business-defined row. Aggregate count/existence queries remain set-based.
      Selected-row correlation shape: the query that selects an original/history row must
    return its stable identifier together with every fact needed by later steps. When several
    routed tasks describe the same selected occurrence but no semantic selected-row identifier
    is supplied, converge on one reusable selection query that returns the identifier and all
    dependent facts; do not create separate searches for each predicate. When a later task
    explicitly asks for a value from that selected row, filter by a semantic runtime identifier
    such as {{OriginalClaimId}} or {{SelectedPartialClaimId}}; an ambiguous {{ClaimId}} must
    never be assumed to identify a historical row. If the original query already returned the
    needed fact, downstream logic should reuse that DataQuery result directly.
      Same-row attribute-bundle shape: when several routed tasks explicitly consume attributes
    from the same selected lookup row, converge on one reusable query that selects the row once
    and returns every required source attribute together. Do not push downstream comparisons
    into separate queries or independently re-run the lookup for each attribute. If overlapping
    rows can qualify, use TOP (1) with business-defined precedence and the complete documented
    stable key as the final tie-breaker.
      Same-row existence shape: when several routed tasks describe predicates on the same
    candidate occurrence, converge on one reusable count/existence query with every predicate
    applied to one table alias. Do not emit separate queries that can be satisfied by different
    rows. For EO_HISTORY override-use checks, correlate CardHolderId, GCNSeqNo, the inclusive
    StartDate/EndDate DOS window, approved Status, RejectEdits_EditId, and IT_CNT on one EO row;
    use a semantic {{RejectEditId}} input rather than hard-coding one edit.
      Primary/fallback lookup shape: when the task names an authoritative primary table
    and a fallback source, a fallback-only query is incomplete. Retrieve the primary fact
    first using its exact live DDL. If the requested value is absent from that table's DDL,
    return null rather than inventing the column or silently substituting the fallback.
      Reusable member-resolution shape: preserve each explicitly requested source path as
    a distinct lookup using {{CardholderId}} as the submitted value and physical memid as
    the result. A current carrier-member lookup filters enrollkeys.carriermemid. A historical
    carrier-member lookup joins carriermemidhistory.enrollid to enrollkeys.enrollid and filters
    carriermemidhistory.carriermemid; order matching enrollkeys rows by segtype DESC, termdate
    DESC, then effdate ASC. A secondary-ID fallback filters physical member.secondaryid.
    Never replace either fallback with InMemory.MEMBER.CardholderID, and never reuse the
    direct enrollkeys.carriermemid query for the historical path. Keep downstream fallback
    sequencing outside these atomic source queries.
    NDC maintenance matching uses exact DDL names Planid, EffDate, TermDate, NDCKey,
    GCN_SeqNo, and TC; use inclusive DOS filtering and, when one row is requested, rank
    exact NDC before GCN sequence before therapeutic class, then latest EffDate and
    ChangedDate. Use semantic {{PlanId}} and {{TherapeuticClass}} inputs when concrete DTO
    paths are not supplied; never map either input to the NDC code. For a compound-ingredient
    MaxDayDose lookup, query NDCMaintDetails with {{IngredientNdc}}, {{PlanId}}, and
    {{DateOfService}} and return the raw MaxDayDose. Do not substitute NDC_Mstr, use the
    transaction-level NDC, or calculate ingredient quantity divided by days supply in SQL;
    those runtime comparisons remain downstream rule behavior.
      ICD diagnosis-reference shape: when validating a submitted ICD-10 diagnosis against
    IPA.dbo.DiagCode, compare the first four characters on both sides, for example
    SUBSTRING(codeid, 1, 4) = SUBSTRING({{DiagnosisCode}}, 1, 4). Do not replace this with
    exact full-code equality. Apply the prefix function directly to both operands so SQL null
    behavior is preserved; retain IcdVersion = '0' and the inclusive DOS effective window.
      Pattern and effective-period shape: preserve an explicitly supplied LIKE/contains/
    wildcard comparison; never collapse it to equality. A quoted configuration discriminator
    containing SQL wildcard characters such as % must use LIKE unless the supplied business
    meaning explicitly says those characters are literal stored data. When history must belong
    to the same season, configuration period, or effective override set as the incoming claim,
    constrain both the incoming date and the historical row date to the same effective/
    termination columns from the same configuration alias. A lookback window alone does
    not prove same-period membership.
      Date-sensitive parameter shape: when an NDCParameters value is used for a business
    date/timestamp evaluation, query NDCParameters directly and constrain the applicable
    runtime evaluation date to EFFDATE/ENDDATE. Preserve the business-specified runtime date
    source (for example DOS, adjudication date, or current date); do not silently substitute
    another date. When nullable EFFDATE/ENDDATE bounds represent an active configuration
    period, preserve open-ended records with ISNULL(EFFDATE, {{MinDate}}) and
    ISNULL(ENDDATE, {{MaxDate}}), unless the supplied business meaning defines different null
    semantics. A default/fallback value used when the configured parameter is absent or invalid
    remains downstream rule behavior and must not be encoded by broadening the SQL to an
    ineffective parameter row or by joining unrelated transaction history. When the compared
    current-claim value is already a runtime fact, return only the configured source value;
    never re-query the physical claim table by member/date to recover that current value.
      Reusable effective configuration-list shape: query the configuration table directly
    and return its configured values. Do not join physical transaction/history tables merely
    to re-read submitted request occurrences; the downstream rule retains the current
    occurrence index and submitted count boundary. In particular, the approved Other Payer
    Reject Code list is SELECT PARAMETER_VALUE FROM HRX.dbo.NDCParameters WHERE
    PARAMETER_NAME = 'REJECT_CODE' AND {{DateOfService}} BETWEEN EFFDATE AND ENDDATE.
    The DataQuery returns the active list; downstream occurrence-aware logic compares only
    the submitted reject-code positions allowed by the request's reject count.
      Effective master validation shape: when current submitted occurrences must be validated
    against an effective master table, pass the considered submitted values as a collection
    parameter and return only matching active master values. Never query transaction/history
    tables to recover those submitted values. For NCPDP reject-code validation, query
    HRX.dbo.NCPDP_Reject_Codes, filter reject_code with [[SubmittedOtherPayerRejectCodes]],
    and apply the inclusive DateOfService effdate/termdate window. Payer iteration, submitted
    reject count, the first-five boundary, blank handling, and invalid-code detection remain
    downstream rule behavior.
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
    frozenset({("carriermemidhistory", "enrollid"), ("enrollkeys", "enrollid")}),
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
                invalid_artifacts.extend(
                    _find_deterministic_selection_artifacts(
                        sql, business_meaning, ddl_context
                    )
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
        re.search(r"\bpackage[- ]billing\b[^.\n]{0,80}\bbypass\b|\bbypass\b[^.\n]{0,80}\bpackage[- ]billing\b", meaning)
        and "override" in meaning
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
WHERE d.Type = 'PkgBilling_Bypass'
  AND {{DateOfService}} BETWEEN d.EffDate AND d.TermDate
  AND (d.NDCKey = {{Ndc}} OR d.GCN_SeqNo = {{GCNSeqNo}} OR d.HIC3 = {{Hic3}})"""

    if (
        "inmemory.dbo.contract_term" in tables
        and re.search(r"\bcontract[- ]?term\b", meaning)
        and re.search(r"\b(?:ndc|gcn|drug)\b", meaning)
        and re.search(r"\b(?:no|not|count|exist|match)\b", meaning)
    ):
        return """SELECT COUNT(*) AS ContractTermCount
FROM InMemory.dbo.CONTRACT_TERM ct
WHERE RTRIM(ct.ContractId) <> ''"""

    if (
        "hrx.dbo.ncpdp_reject_codes" in tables
        and re.search(r"\bncpdp\b[^.\n]{0,80}\breject[-_ ]?code", meaning)
        and re.search(r"\b(?:submitted|current)\b", meaning)
        and re.search(r"\b(?:valid|master|effective|occurrence)\b", meaning)
    ):
        return """SELECT
    RTRIM(rc.reject_code) AS NcpdpRejectCode
FROM HRX.dbo.NCPDP_Reject_Codes rc WITH (NOLOCK)
WHERE rc.reject_code IN ([[SubmittedOtherPayerRejectCodes]])
  AND {{DateOfService}} BETWEEN rc.effdate AND rc.termdate"""

    if (
        "hrx.dbo.ndcmaintdetails" in tables
        and "compound ingredient" in meaning
        and "maxdaydose" in meaning
    ):
        return """SELECT TOP (1)
    nmd.MaxDayDose AS MaxDayDose
FROM HRX.dbo.NDCMaintDetails nmd WITH (NOLOCK)
WHERE nmd.NDCKey = {{IngredientNdc}}
  AND RTRIM(nmd.Planid) = RTRIM({{PlanId}})
  AND {{DateOfService}} BETWEEN nmd.EffDate AND nmd.TermDate
ORDER BY nmd.EffDate DESC, nmd.ChangedDate DESC,
         nmd.GCN_SeqNo ASC, nmd.TC ASC"""

    if (
        "hrx.dbo.ndc_desi_mstr" in tables
        and re.search(r"\bndc[_ ]?desi[_ ]?mstr\b", meaning)
        and re.search(r"\b(?:effective|active|desi|lookup|row|record)\b", meaning)
    ):
        ndc_input = (
            "{{IngredientNdc}}"
            if "compound ingredient" in meaning
            else "{{ClaimTransaction.Ndc}}"
        )
        return f"""SELECT TOP (1)
    1 AS RecordFound,
    d.DESI AS Desi,
    d.DESIDate AS DesiDate
FROM HRX.dbo.NDC_DESI_Mstr d WITH (NOLOCK)
WHERE d.NDCKey = {ndc_input}
  AND {{{{DateOfService}}}} BETWEEN d.EffDate AND d.EndDate
ORDER BY d.EffDate DESC, d.EndDate DESC"""

    if (
        "inmemory.dbo.eo_history" in tables
        and re.search(
            r"\bsame\s+candidate\s+eo(?:_history|-history|\s+history)?\s+occurrence\b",
            meaning,
        )
    ):
        return """SELECT COUNT(DISTINCT eh.AuthorizationId) AS MatchingEoCount
FROM InMemory.dbo.EO_HISTORY eh
WHERE eh.CardHolderId = {{MemberId}}
  AND eh.GCNSeqNo = {{ClaimRequest.DrugRequested.GCNSeqNo.Code}}
  AND {{DateOfService}} BETWEEN eh.StartDate AND eh.EndDate
  AND eh.Status = '1'
  AND eh.RejectEdits_EditId LIKE CONCAT('%', {{RejectEditId}}, '%')
  AND eh.IT_CNT > 0"""

    member_history_tables = {
        "plandata_rx_production.dbo.carriermemidhistory",
        "plandata_rx_production.dbo.enrollkeys",
    }
    if (
        member_history_tables <= tables
        and re.search(r"\b(?:carrier\s*member\s*id|carriermemid)\s*history|\bcarriermemidhistory\b", meaning)
        and re.search(r"\b(?:resolve|resolution|memid|member\s*id)\b", meaning)
    ):
        return """SELECT TOP (1)
    RTRIM(ek.memid) AS MemberId
FROM plandata_rx_production.dbo.carriermemidhistory cmh WITH (NOLOCK)
JOIN plandata_rx_production.dbo.enrollkeys ek WITH (NOLOCK)
    ON ek.enrollid = cmh.enrollid
WHERE RTRIM(cmh.carriermemid) = {{CardholderId}}
  AND RTRIM(ek.memid) <> ''
ORDER BY ek.segtype DESC, ek.termdate DESC, ek.effdate ASC, ek.enrollid ASC"""

    if (
        "plandata_rx_production.dbo.member" in tables
        and re.search(r"\b(?:member\.)?secondary\s*_?id\b|\bsecondaryid\b", meaning)
        and re.search(r"\b(?:resolve|resolution|memid|member\s*id|associated)\b", meaning)
    ):
        return """SELECT TOP (1)
    RTRIM(m.memid) AS MemberId
FROM plandata_rx_production.dbo.member m WITH (NOLOCK)
WHERE RTRIM(m.secondaryid) = {{CardholderId}}
  AND RTRIM(m.memid) <> ''
ORDER BY m.memid ASC"""

    partial_tables = {
        "plandata_rx_production.dbo.claimpartial",
        "plandata_rx_production.dbo.claim",
        "plandata_rx_production.dbo.claimpharm",
    }
    if (
        partial_tables <= tables
        and re.search(
            r"\b(?:same\s+)?selected\s+(?:prior\s+)?partial(?:-fill)?"
            r"(?:\s+history)?\s+occurrence\b",
            meaning,
        )
    ):
        return """SELECT TOP (1)
    c.claimid AS SelectedPartialClaimId,
    p.claimline AS SelectedPartialClaimLine,
    c.startdate AS SelectedPartialDateOfService,
    RTRIM(p.rxnumber) AS SelectedPartialRxNumber,
    RTRIM(p.ndckey) AS SelectedPartialNdc,
    RTRIM(c.provid) AS SelectedPartialProviderId,
    RTRIM(c.memid) AS SelectedPartialMemberId,
    RTRIM(cp.DispensingStatus) AS SelectedPartialDispensingStatus,
    RTRIM(c.status) AS SelectedPartialClaimStatus,
    RTRIM(c.resubclaimid) AS SelectedPartialResubmissionClaimId,
    RTRIM(cp.AssociatedPrescriptionRefNumber) AS SelectedPartialAssociatedRxNumber
FROM plandata_rx_production.dbo.claim c WITH (NOLOCK)
JOIN plandata_rx_production.dbo.claimpharm p WITH (NOLOCK)
    ON p.claimid = c.claimid
JOIN plandata_rx_production.dbo.ClaimPartial cp WITH (NOLOCK)
    ON cp.claimid = c.claimid
WHERE RTRIM(c.provid) = {{ProviderId}}
  AND RTRIM(c.memid) = {{MemberId}}
  AND RTRIM(c.status) IN ('PAID', 'PAY', 'WAITPAY')
  AND RTRIM(c.resubclaimid) = ''
  AND RTRIM(p.ndckey) = {{ClaimTransaction.Ndc}}
  AND TRY_CONVERT(bigint, RTRIM(p.rxnumber)) =
      TRY_CONVERT(bigint, {{AssociatedPrescriptionRefNumber}})
ORDER BY c.startdate DESC, c.claimid DESC, p.claimline DESC"""
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
        (r"\b(?:rx\s*number|prescription(?:/service)? reference number)\b", "Rx number", r"\b(?:rxnumber|rx_nbr|associatedprescriptionrefnumber)\b|\{\{[^}]*(?:rx|prescription)[^}]*\}\}"),
        (
            r"\b(?:same|current|incoming|submitted)\b[^.\n]{0,80}\b(?:provider|pharmacy)\b|"
            r"\b(?:provider|pharmacy)\b[^.\n]{0,80}\b(?:rx|prescription)",
            "provider scope",
            r"\b(?:provid|providerid|provider_npi|pharmacynpi)\b|\{\{[^}]*(?:provider|pharmacy)[^}]*\}\}",
        ),
        (r"\bform\s*type\b|\bformtype\b", "form type", r"\bformtype\b"),
        (r"\bresubclaimid\b|\bnon-reversed\b", "reversal status", r"\bresubclaimid\b"),
        (r"\bgcn(?:_?seqno)?\b", "GCN", r"\bgcn(?:_?seqno)?\b|\{\{[^}]*gcn[^}]*\}\}"),
        (
            r"\b(?:same|selected)\b[^.\n]{0,80}\b(?:event|history)?\s*occurrence\b",
            "selected occurrence",
            r"\b(?:ndcindex|previcn|icn|authorizationid)\b|"
            r"\{\{[^}]*(?:index|occurrence|event|icn|ingredientndc|(?:original|selected|prior)[^}]*claimid)[^}]*\}\}|"
            r"\bclaimid\b\s+as\s+(?:selected[a-z0-9_]*claimid|"
            r"[a-z_][a-z0-9_]+selected[a-z0-9_]*claimid)\b|"
            r"\[\[[^]]+\]\]",
        ),
    )
    normalized_sql = sql.lower()
    where_match = re.search(
        r"\bwhere\b(?P<where>.*?)(?:\bgroup\s+by\b|\border\s+by\b|\bhaving\b|$)",
        normalized_sql,
        re.IGNORECASE | re.DOTALL,
    )
    where_sql = where_match.group("where") if where_match else ""
    prefiltered_historical_tcns = bool(
        re.search(r"\[?\[?\{?\{?\s*historicaltcns\b", normalized_sql)
    )
    prefiltered_contract_terms = bool(re.search(
        r"\b(?:from|join)\s+\[?inmemory\]?\s*\.\s*\[?dbo\]?\s*\.\s*"
        r"\[?contract_term\]?\b",
        normalized_sql,
        re.IGNORECASE,
    ))
    compound_max_day_dose_source = bool(
        re.search(r"\bndcmaintdetails\b", normalized_sql)
        and re.search(r"\bmaxdaydose\b", normalized_sql)
        and re.search(r"\{\{[^}]*ingredientndc[^}]*\}\}", normalized_sql)
    )
    artifacts = []

    in_memory_member = re.search(
        r"\b(?:from|join)\s+\[?inmemory\]?\s*\.\s*\[?dbo\]?\s*\.\s*"
        r"\[?member\]?(?:\s+(?:as\s+)?(?P<alias>"
        r"(?!(?:where|join|inner|left|right|full|cross|on|with)\b)"
        r"[a-z_][a-z0-9_]*))?",
        normalized_sql,
        re.IGNORECASE,
    )
    if in_memory_member:
        member_alias = in_memory_member.group("alias")
        column_prefix = (
            rf"(?:{re.escape(member_alias)}\.)?" if member_alias else r"(?:member\.)?"
        )
        member_id_bound_to_cardholder = re.search(
            rf"(?:{column_prefix}cardholderid\s*=\s*\{{\{{memberid\}}\}}|"
            rf"\{{\{{memberid\}}\}}\s*=\s*{column_prefix}cardholderid)",
            normalized_sql,
            re.IGNORECASE,
        )
        if member_id_bound_to_cardholder:
            artifacts.append(
                "resolved MemberId cannot filter InMemory MEMBER.CardholderID; use MEMBER.MemberID"
            )

    for requirement_pattern, label, sql_pattern in requirements:
        if not re.search(requirement_pattern, business_meaning, re.IGNORECASE):
            continue
        if prefiltered_historical_tcns and label in {"form type", "reversal status"}:
            continue
        if prefiltered_contract_terms and label == "GCN":
            continue
        if compound_max_day_dose_source and label == "quantity":
            continue
        search_sql = where_sql if label == "provider scope" else normalized_sql
        if not re.search(sql_pattern, search_sql, re.IGNORECASE):
            artifacts.append(f"required business concept '{label}' is absent from the SQL")
    if re.search(r"\bndc\s*maint(?:enance)?\s*details\b|\bndcmaintdetails\b", business_meaning, re.IGNORECASE) and not re.search(
        r"\bndcmaintdetails\b", normalized_sql, re.IGNORECASE
    ):
        artifacts.append("required primary source 'NDCMaintDetails' is absent from the SQL")

    member_history_resolution = bool(re.search(
        r"\b(?:carrier\s*member\s*id|carriermemid)\s*history|\bcarriermemidhistory\b",
        business_meaning,
        re.IGNORECASE,
    ))
    if member_history_resolution:
        if not re.search(r"\bcarriermemidhistory\b", normalized_sql):
            artifacts.append(
                "historical carrier-member resolution is missing carriermemidhistory"
            )
        if not re.search(r"\benrollkeys\b", normalized_sql):
            artifacts.append(
                "historical carrier-member resolution is missing enrollkeys"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?enrollid\s*=\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?enrollid\b",
            normalized_sql,
        ):
            artifacts.append(
                "historical carrier-member resolution does not correlate enrollid"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?carriermemid\b[^=\n]{0,20}=\s*"
            r"\{\{[^}]*cardholderid[^}]*\}\}",
            normalized_sql,
        ):
            artifacts.append(
                "historical carrier-member resolution does not filter the submitted CardholderId"
            )

    secondary_id_resolution = bool(re.search(
        r"\b(?:member\.)?secondary\s*_?id\b|\bsecondaryid\b",
        business_meaning,
        re.IGNORECASE,
    ))
    if secondary_id_resolution:
        if not re.search(
            r"\b(?:from|join)\s+(?:\[?plandata_rx_production\]?\s*\.\s*)"
            r"\[?dbo\]?\s*\.\s*\[?member\]?\b",
            normalized_sql,
        ):
            artifacts.append(
                "secondary-ID member resolution must use physical plandata member"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?secondaryid\b[^=\n]{0,20}=\s*"
            r"\{\{[^}]*cardholderid[^}]*\}\}",
            normalized_sql,
        ):
            artifacts.append(
                "secondary-ID member resolution does not filter member.secondaryid by CardholderId"
            )

    compound_ingredient_max_day_dose = bool(
        re.search(r"\bcompound ingredient\b", business_meaning, re.IGNORECASE)
        and re.search(r"\bmaxdaydose\b|\bmaximum daily dose\b", business_meaning, re.IGNORECASE)
    )
    if compound_ingredient_max_day_dose:
        if not re.search(r"\bndcmaintdetails\b", normalized_sql):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup is missing NDCMaintDetails"
            )
        if re.search(r"\bndc_mstr\b", normalized_sql):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup incorrectly uses NDC_Mstr"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?ndckey\b[^=\n]{0,20}=\s*"
            r"\{\{[^}]*ingredientndc[^}]*\}\}",
            normalized_sql,
        ):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup is not scoped by IngredientNdc"
            )
        if not re.search(
            r"\b(?:rtrim\s*\(\s*)?(?:[a-z_][a-z0-9_]*\.)?planid\s*\)?\s*=\s*"
            r"(?:rtrim\s*\(\s*)?\{\{[^}]*planid[^}]*\}\}\s*\)?",
            normalized_sql,
        ):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup is not scoped by PlanId"
            )
        if not re.search(
            r"\{\{[^}]*dateofservice[^}]*\}\}\s+between\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+and\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?termdate",
            normalized_sql,
        ):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup is missing its DOS effective window"
            )
        if not re.search(r"\bselect\s+top\s*\(\s*1\s*\)", normalized_sql):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup does not select one applicable row"
            )
        if not re.search(
            r"\border\s+by\s+(?:[a-z_][a-z0-9_]*\.)?effdate\s+desc\s*,\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?changeddate\s+desc\s*,\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?gcn_seqno\s+asc\s*,\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?tc\s+asc",
            normalized_sql,
        ):
            artifacts.append(
                "compound-ingredient MaxDayDose lookup lacks deterministic maintenance-row ordering"
            )

    same_effective_ingredient_desi_row = bool(
        re.search(r"\bndc[_ ]?desi[_ ]?mstr\b", business_meaning, re.IGNORECASE)
        and re.search(r"\bcompound ingredient\b", business_meaning, re.IGNORECASE)
        and re.search(
            r"\bsame effective\b|\blookup\b[^.\n]{0,120}\b(?:desi\s+date|desidate)\b",
            business_meaning,
            re.IGNORECASE,
        )
    )
    if same_effective_ingredient_desi_row:
        projection_match = re.search(
            r"\bselect\b(?P<projection>.*?)\bfrom\b",
            normalized_sql,
            re.IGNORECASE | re.DOTALL,
        )
        projection_sql = projection_match.group("projection") if projection_match else ""
        required_outputs = (
            ("RecordFound", r"\b1\s+as\s+recordfound\b"),
            ("DESI", r"\b(?:[a-z_][a-z0-9_]*\.)?desi\s+as\s+desi\b"),
            ("DESIDate", r"\b(?:[a-z_][a-z0-9_]*\.)?desidate\s+as\s+desidate\b"),
        )
        missing_outputs = [
            label
            for label, pattern in required_outputs
            if not re.search(pattern, projection_sql, re.IGNORECASE)
        ]
        if missing_outputs:
            artifacts.append(
                "same effective ingredient DESI row is missing bundled outputs: "
                + ", ".join(missing_outputs)
            )
        if not re.search(r"\bndc_desi_mstr\b", normalized_sql):
            artifacts.append(
                "same effective ingredient DESI lookup is missing NDC_DESI_Mstr"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?ndckey\b[^=\n]{0,20}=\s*"
            r"\{\{[^}]*ingredientndc[^}]*\}\}",
            normalized_sql,
        ):
            artifacts.append(
                "same effective ingredient DESI lookup is not scoped by IngredientNdc"
            )
        if not re.search(
            r"\{\{[^}]*dateofservice[^}]*\}\}\s+between\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+and\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?enddate",
            normalized_sql,
        ):
            artifacts.append(
                "same effective ingredient DESI lookup is missing its DOS effective window"
            )
        if not re.search(r"\bselect\s+top\s*\(\s*1\s*\)", normalized_sql):
            artifacts.append(
                "same effective ingredient DESI lookup does not select one row"
            )
        if not re.search(
            r"\border\s+by\s+(?:[a-z_][a-z0-9_]*\.)?effdate\s+desc\s*,\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?enddate\s+desc",
            normalized_sql,
        ):
            artifacts.append(
                "same effective ingredient DESI lookup lacks deterministic effective-row ordering"
            )

    same_effective_current_ndc_desi_row = bool(
        re.search(r"\bndc[_ ]?desi[_ ]?mstr\b", business_meaning, re.IGNORECASE)
        and not re.search(r"\bcompound ingredient\b", business_meaning, re.IGNORECASE)
        and re.search(
            r"\bsame\b[^.\n]{0,80}\b(?:effective|active|record|row)\b|"
            r"\b(?:no\s+)?date-effective\b|\bactive\s+desi\s+lookup\s+row\b",
            business_meaning,
            re.IGNORECASE,
        )
    )
    if same_effective_current_ndc_desi_row:
        projection_match = re.search(
            r"\bselect\b(?P<projection>.*?)\bfrom\b",
            normalized_sql,
            re.IGNORECASE | re.DOTALL,
        )
        projection_sql = projection_match.group("projection") if projection_match else ""
        required_outputs = (
            ("RecordFound", r"\b1\s+as\s+recordfound\b"),
            ("DESI", r"\b(?:[a-z_][a-z0-9_]*\.)?desi\s+as\s+desi\b"),
            ("DESIDate", r"\b(?:[a-z_][a-z0-9_]*\.)?desidate\s+as\s+desidate\b"),
        )
        missing_outputs = [
            label
            for label, pattern in required_outputs
            if not re.search(pattern, projection_sql, re.IGNORECASE)
        ]
        if missing_outputs:
            artifacts.append(
                "same effective current-NDC DESI row is missing bundled outputs: "
                + ", ".join(missing_outputs)
            )
        if not re.search(r"\bndc_desi_mstr\b", normalized_sql):
            artifacts.append(
                "same effective current-NDC DESI lookup is missing NDC_DESI_Mstr"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?ndckey\b[^=\n]{0,20}=\s*"
            r"\{\{[^}]*claimtransaction[^}]*ndc[^}]*\}\}",
            normalized_sql,
        ):
            artifacts.append(
                "same effective current-NDC DESI lookup is not scoped by ClaimTransaction.Ndc"
            )
        if not re.search(
            r"\{\{[^}]*dateofservice[^}]*\}\}\s+between\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+and\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?enddate",
            normalized_sql,
        ):
            artifacts.append(
                "same effective current-NDC DESI lookup is missing its DOS effective window"
            )
        if not re.search(r"\bselect\s+top\s*\(\s*1\s*\)", normalized_sql):
            artifacts.append(
                "same effective current-NDC DESI lookup does not select one row"
            )
        if not re.search(
            r"\border\s+by\s+(?:[a-z_][a-z0-9_]*\.)?effdate\s+desc\s*,\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?enddate\s+desc",
            normalized_sql,
        ):
            artifacts.append(
                "same effective current-NDC DESI lookup lacks deterministic effective-row ordering"
            )

    physical_claim_history = bool(re.search(
        r"\b(?:from|join)\s+(?:\[[^]]+\]|[a-z0-9_]+)\s*\.\s*(?:\[[^]]+\]|[a-z0-9_]+)\s*\.\s*\[?claim\]?\b",
        normalized_sql,
        re.IGNORECASE,
    ))
    submitted_scc_lookup = bool(
        re.search(
            r"\b(?:submitted|current\s+claim|claim)\b[^.\n]{0,100}"
            r"\bsubmission\s+clarification(?:\s+code)?\b|"
            r"\bsubmission\s+clarification(?:\s+code)?\b[^.\n]{0,100}"
            r"\b(?:submitted|current\s+claim)\b",
            business_meaning,
            re.IGNORECASE,
        )
        and re.search(r"\bedi_pharm_universal\b", normalized_sql, re.IGNORECASE)
        and not re.search(r"\b(?:historical|history|prior|previous)\b", business_meaning, re.IGNORECASE)
    )
    if submitted_scc_lookup:
        artifacts.append(
            "submitted Submission Clarification Code must use a runtime request value, not EPU history"
        )

    current_claim_configuration_lookup = bool(
        physical_claim_history
        and re.search(r"\bndcparameters\b", normalized_sql, re.IGNORECASE)
        and re.search(r"\bcurrent\s+claim|\bclaim\s+amount\b", business_meaning, re.IGNORECASE)
        and re.search(r"\b(?:active|configured|threshold|parameter)\b", business_meaning, re.IGNORECASE)
    )
    if current_claim_configuration_lookup:
        artifacts.append(
            "active configuration lookup re-reads a current-claim runtime value from physical claim history"
        )

    if physical_claim_history and re.search(r"\bpaid\b", business_meaning, re.IGNORECASE):
        status_match = re.search(
            r"\bstatus\s*\)?\s+in\s*\((?P<values>[^)]*)\)",
            normalized_sql,
            re.IGNORECASE,
        )
        if status_match is None:
            artifacts.append("paid physical claim history has no status filter")
        else:
            statuses = {
                value.upper()
                for value in re.findall(r"'([^']+)'", status_match.group("values"))
            }
            forbidden = sorted(statuses & {"DENY", "WAITDENY", "REV"})
            if forbidden:
                artifacts.append(
                    "paid physical claim history includes non-paid statuses: "
                    + ", ".join(forbidden)
                )

    if re.search(r"\bLIKE\b|%[^%]+%|\b(?:contains|wildcard)\b", business_meaning, re.IGNORECASE) and not re.search(
        r"\bLIKE\b", normalized_sql, re.IGNORECASE
    ):
        artifacts.append("required comparison operator 'LIKE' is absent from the SQL")

    wildcard_discriminator_equality = re.search(
        r"(?:(?:rtrim|ltrim|trim)\s*\(\s*)?"
        r"(?:[a-z_][a-z0-9_]*\.)?(?:type|parameter_name|name|code)\b"
        r"(?:\s*\))?\s*=\s*'[^']*%[^']*'",
        normalized_sql,
        re.IGNORECASE,
    )
    literal_wildcard_intent = re.search(
        r"\b(?:literal|exact)\b[^.\n]{0,80}\b(?:percent|wildcard|%)\b",
        business_meaning,
        re.IGNORECASE,
    )
    if wildcard_discriminator_equality and literal_wildcard_intent is None:
        artifacts.append(
            "configuration discriminator containing SQL wildcards must use LIKE rather than equality"
        )

    if re.search(r"\bsame\b[^.\n]{0,80}\b(?:season|period|effective\s+(?:window|override\s+set))\b", business_meaning, re.IGNORECASE):
        current_window = re.search(
            r"\{\{[^}]*(?:dateofservice|incomingdate)[^}]*\}\}\s+between\s+"
            r"(?P<alias>[a-z_][a-z0-9_]*)\.(?:effdate|effectivedate)\s+and\s+"
            r"(?P=alias)\.(?:termdate|enddate|terminationdate)",
            normalized_sql,
            re.IGNORECASE,
        )
        if current_window is None:
            artifacts.append("same-period lookup does not bind the incoming date to an effective window")
        else:
            alias = re.escape(current_window.group("alias"))
            historical_window = re.search(
                rf"\b[a-z_][a-z0-9_]*\.(?:startdate|dateofservice|fill_?date|rxdate)\s+between\s+"
                rf"{alias}\.(?:effdate|effectivedate)\s+and\s+"
                rf"{alias}\.(?:termdate|enddate|terminationdate)",
                normalized_sql,
                re.IGNORECASE,
            )
            if historical_window is None:
                artifacts.append("same-period lookup does not bind history to the incoming effective window")

    drug_override_exclusion = bool(
        re.search(r"\bdrugoverrides\b", normalized_sql, re.IGNORECASE)
        and re.search(r"\bexclu(?:sion|ded|de)\b", business_meaning, re.IGNORECASE)
        and re.search(r"\b(?:current|incoming|submitted)\b", business_meaning, re.IGNORECASE)
    )
    if drug_override_exclusion:
        exclusion_sql = re.sub(r"[\[\]]", "", sql)
        match_patterns = (
            (
                "NDCKey",
                r"\b(?:[a-z_][a-z0-9_]*\.)?ndckey\b[^=\n]{0,20}=\s*"
                r"\{\{[^}]*ndc[^}]*\}\}",
            ),
            (
                "GCN_SeqNo",
                r"\b(?:[a-z_][a-z0-9_]*\.)?gcn_seqno\b[^=\n]{0,20}=\s*"
                r"\{\{[^}]*gcn[^}]*\}\}",
            ),
            (
                "HIC3",
                r"\b(?:[a-z_][a-z0-9_]*\.)?hic3\b[^=\n]{0,20}=\s*"
                r"\{\{[^}]*(?:hic3|therapeuticclass)[^}]*\}\}",
            ),
        )
        identifier_matches = [
            (label, re.search(pattern, exclusion_sql, re.IGNORECASE))
            for label, pattern in match_patterns
        ]
        missing_identifiers = [
            label for label, match in identifier_matches if match is None
        ]
        if missing_identifiers:
            artifacts.append(
                "DrugOverrides exclusion lookup is missing current-drug alternatives: "
                + ", ".join(missing_identifiers)
            )
        else:
            ordered_matches = sorted(
                (match for _, match in identifier_matches if match is not None),
                key=lambda match: match.start(),
            )
            alternatives_sql = exclusion_sql[
                ordered_matches[0].start():ordered_matches[-1].end()
            ]
            if len(re.findall(r"\bOR\b", alternatives_sql, re.IGNORECASE)) < 2:
                artifacts.append(
                    "DrugOverrides exclusion identifiers are not combined as NDC/GCN/HIC3 alternatives"
                )

        dos = r"\{\{[^}]*dateofservice[^}]*\}\}"
        effective_window = (
            rf"(?:{dos}\s+BETWEEN\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+AND\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?termdate|"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s*<=\s*"
            rf"{dos}\s+AND\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?termdate\s*>=\s*"
            rf"{dos}|{dos}\s*>=\s*"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+AND\s+"
            rf"{dos}\s*<=\s*(?:[a-z_][a-z0-9_]*\.)?termdate)"
        )
        if not re.search(effective_window, exclusion_sql, re.IGNORECASE):
            artifacts.append(
                "DrugOverrides exclusion lookup is missing its DateOfService EffDate/TermDate window"
            )

    active_drug_override_lookup = bool(
        re.search(r"\bdrugoverrides\b", normalized_sql, re.IGNORECASE)
        and re.search(r"\b(?:active|date\s+of\s+service|threshold\s+override)\b", business_meaning, re.IGNORECASE)
        and re.search(r"\boverride\b", business_meaning, re.IGNORECASE)
    )
    if active_drug_override_lookup:
        override_sql = re.sub(r"[\[\]]", "", sql)
        dos = r"\{\{[^}]*dateofservice[^}]*\}\}"
        override_window = (
            rf"(?:{dos}\s+BETWEEN\s+(?:[a-z_][a-z0-9_]*\.)?effdate\s+AND\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?termdate|"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s*<=\s*"
            rf"{dos}\s+AND\s+(?:[a-z_][a-z0-9_]*\.)?termdate\s*>=\s*{dos})"
        )
        if not re.search(override_window, override_sql, re.IGNORECASE):
            artifacts.append(
                "active DrugOverrides lookup is missing its DateOfService EffDate/TermDate window"
            )

    date_sensitive_parameter = bool(
        re.search(r"\bndcparameters\b", normalized_sql, re.IGNORECASE)
        and re.search(
            r"\b(?:configured|parameter)\b", business_meaning, re.IGNORECASE
        )
        and re.search(
            r"\b(?:date|timestamp|adjudication|evaluation|current\s+system)\b",
            business_meaning,
            re.IGNORECASE,
        )
    )
    if date_sensitive_parameter:
        effective_sql = re.sub(r"[\[\]]", "", sql)
        runtime_date = (
            r"(?:\{\{[^}]*(?:date|timestamp)[^}]*\}\}|"
            r"CONVERT\s*\(\s*date\s*,\s*GETDATE\s*\(\s*\)\s*\)|"
            r"CAST\s*\(\s*GETDATE\s*\(\s*\)\s+AS\s+date\s*\))"
        )
        start_bound = (
            r"(?:(?:isnull|coalesce)\s*\(\s*)?"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate"
            r"(?:\s*,\s*\{\{[^}]*mindate[^}]*\}\}\s*\))?"
        )
        end_bound = (
            r"(?:(?:isnull|coalesce)\s*\(\s*)?"
            r"(?:[a-z_][a-z0-9_]*\.)?enddate"
            r"(?:\s*,\s*\{\{[^}]*maxdate[^}]*\}\}\s*\))?"
        )
        effective_window = (
            rf"(?:{runtime_date}\s+BETWEEN\s+{start_bound}\s+AND\s+{end_bound}|"
            rf"{start_bound}\s*<=\s*{runtime_date}\s+AND\s+"
            rf"{end_bound}\s*>=\s*{runtime_date})"
        )
        if not re.search(effective_window, effective_sql, re.IGNORECASE):
            artifacts.append(
                "date-sensitive NDCParameters lookup is missing its EFFDATE/ENDDATE evaluation window"
            )

        open_ended_active_parameter = bool(re.search(
            r"\bactive\b[^.\n]{0,100}\b(?:default|threshold|configuration|parameter)\b|"
            r"\b(?:default|threshold|configuration|parameter)\b[^.\n]{0,100}\bactive\b",
            business_meaning,
            re.IGNORECASE,
        ))
        if open_ended_active_parameter:
            nullable_start = re.search(
                r"(?:isnull|coalesce)\s*\(\s*(?:[a-z_][a-z0-9_]*\.)?effdate\s*,\s*"
                r"\{\{[^}]*mindate[^}]*\}\}\s*\)",
                effective_sql,
                re.IGNORECASE,
            )
            nullable_end = re.search(
                r"(?:isnull|coalesce)\s*\(\s*(?:[a-z_][a-z0-9_]*\.)?enddate\s*,\s*"
                r"\{\{[^}]*maxdate[^}]*\}\}\s*\)",
                effective_sql,
                re.IGNORECASE,
            )
            if nullable_start is None or nullable_end is None:
                artifacts.append(
                    "active NDCParameters lookup is missing nullable EFFDATE/ENDDATE open-ended defaults"
                )

    ncpdp_reject_master_validation = bool(
        re.search(r"\bncpdp\b[^.\n]{0,100}\breject[-_ ]?code", business_meaning, re.IGNORECASE)
        and re.search(r"\b(?:submitted|occurrence|master|valid)\b", business_meaning, re.IGNORECASE)
    )
    if ncpdp_reject_master_validation:
        table_names = {
            canonical
            for match in _SQL_TABLE_RE.finditer(sql)
            if (canonical := _canonical_table_ref(match.group(1)))
        }
        if "hrx.dbo.ncpdp_reject_codes" not in table_names:
            artifacts.append(
                "submitted NCPDP reject validation is missing NCPDP_Reject_Codes"
            )
        extra_tables = sorted(
            table for table in table_names
            if table != "hrx.dbo.ncpdp_reject_codes"
        )
        if extra_tables:
            artifacts.append(
                "submitted NCPDP reject validation re-queries transaction/history data: "
                + ", ".join(extra_tables)
            )
        projection_match = re.search(
            r"\bselect\b(?P<projection>.*?)\bfrom\b",
            normalized_sql,
            re.IGNORECASE | re.DOTALL,
        )
        projection_sql = projection_match.group("projection") if projection_match else ""
        if not re.search(r"\breject_code\b", projection_sql):
            artifacts.append(
                "NCPDP reject master lookup does not return reject_code values"
            )
        if not re.search(
            r"\b(?:[a-z_][a-z0-9_]*\.)?reject_code\s+in\s*"
            r"\(\s*\[\[[^]]*submitted[^]]*reject[^]]*codes?[^]]*\]\]\s*\)",
            normalized_sql,
        ):
            artifacts.append(
                "NCPDP reject master lookup is not scoped to submitted reject codes"
            )
        if not re.search(
            r"\{\{[^}]*dateofservice[^}]*\}\}\s+between\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+and\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?termdate",
            normalized_sql,
        ):
            artifacts.append(
                "NCPDP reject master lookup is missing its DOS effective window"
            )
        if re.search(r"\b(?:COUNT|SUM|MIN|MAX|AVG)\s*\(", normalized_sql):
            artifacts.append(
                "NCPDP reject master lookup returns an aggregate instead of valid codes"
            )

    reject_code_list = bool(re.search(
        r"\bndcparameters\b[^\n]{0,100}\breject[_ ]?code\b|"
        r"\breject[_ ]?code\b[^\n]{0,100}\bndcparameters\b",
        business_meaning,
        re.IGNORECASE,
    ))
    if reject_code_list:
        table_names = {
            canonical
            for match in _SQL_TABLE_RE.finditer(sql)
            if (canonical := _canonical_table_ref(match.group(1)))
        }
        extra_tables = sorted(
            table for table in table_names
            if table != "hrx.dbo.ndcparameters"
        )
        if extra_tables:
            artifacts.append(
                "configuration-list query re-queries submitted or historical data: "
                + ", ".join(extra_tables)
            )
        if re.search(r"\bCOUNT\s*\(", normalized_sql, re.IGNORECASE):
            artifacts.append("configuration-list query returns an aggregate instead of configured values")
        if not re.search(
            r"\{\{[^}]*dateofservice[^}]*\}\}\s+between\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?effdate\s+and\s+"
            r"(?:[a-z_][a-z0-9_]*\.)?enddate",
            normalized_sql,
            re.IGNORECASE,
        ):
            artifacts.append("effective Reject_Code lookup is missing the EFFDATE/ENDDATE DOS filter")

    icd10_diagnosis_reference = bool(
        re.search(r"\b(?:icd[- ]?10|diagnosis\s+code)\b", business_meaning, re.IGNORECASE)
        and re.search(r"\b(?:valid|match|reference|found)\b", business_meaning, re.IGNORECASE)
        and re.search(
            r"\b(?:from|join)\s+(?:\[?ipa\]?\s*\.\s*)?\[?dbo\]?\s*\.\s*\[?diagcode\]?\b",
            normalized_sql,
            re.IGNORECASE,
        )
    )
    if icd10_diagnosis_reference:
        codeid_prefix = (
            r"(?:substring\s*\(\s*(?:(?:\[[^]]+\]|[a-z_][a-z0-9_]*)\s*\.\s*)?"
            r"\[?codeid\]?\s*,\s*1\s*,\s*4\s*\)|"
            r"left\s*\(\s*(?:(?:\[[^]]+\]|[a-z_][a-z0-9_]*)\s*\.\s*)?"
            r"\[?codeid\]?\s*,\s*4\s*\))"
        )
        runtime_prefix = (
            r"(?:substring\s*\(\s*\{\{[^}]*(?:diagnosis|diag)[^}]*code[^}]*\}\}"
            r"\s*,\s*1\s*,\s*4\s*\)|"
            r"left\s*\(\s*\{\{[^}]*(?:diagnosis|diag)[^}]*code[^}]*\}\}"
            r"\s*,\s*4\s*\))"
        )
        if not re.search(
            rf"(?:{codeid_prefix}\s*=\s*{runtime_prefix}|"
            rf"{runtime_prefix}\s*=\s*{codeid_prefix})",
            sql,
            re.IGNORECASE,
        ):
            artifacts.append(
                "ICD-10 diagnosis lookup does not compare the first four code characters on both sides"
            )

    reviewed_drug_override_types = (
        (
            re.compile(
                r"\bpackage[- ]billing\b[^.\n]{0,80}\bbypass\b|"
                r"\bbypass\b[^.\n]{0,80}\bpackage[- ]billing\b",
                re.IGNORECASE,
            ),
            "PkgBilling_Bypass",
        ),
    )
    if re.search(r"\bdrugoverrides\b", normalized_sql, re.IGNORECASE):
        for concept_pattern, required_type in reviewed_drug_override_types:
            if not concept_pattern.search(business_meaning):
                continue
            type_literals = re.findall(
                r"(?:(?:\[[^]]+\]|[a-z_][a-z0-9_]*)\s*\.\s*)?\[?type\]?\s*=\s*N?'([^']*)'",
                sql,
                re.IGNORECASE,
            )
            if required_type.casefold() not in {value.casefold() for value in type_literals}:
                found = ", ".join(repr(value) for value in type_literals) or "none"
                artifacts.append(
                    f"reviewed DrugOverrides Type literal '{required_type}' is required; found {found}"
                )

    same_candidate_eo = bool(
        re.search(r"\beo_history\b", normalized_sql, re.IGNORECASE)
        and re.search(
            r"\bsame\s+candidate\s+eo(?:_history|-history|\s+history)?\s+occurrence\b",
            business_meaning,
            re.IGNORECASE,
        )
    )
    if same_candidate_eo:
        eo_sources = [
            match for match in _SQL_TABLE_RE.finditer(sql)
            if _canonical_table_ref(match.group(1)) == "inmemory.dbo.eo_history"
        ]
        missing_eo_scope = []
        eo_scope_patterns = (
            (
                "CardHolderId",
                r"\bcardholderid\b\s*=\s*\{\{[^}]*member[^}]*\}\}",
            ),
            (
                "GCNSeqNo",
                r"\bgcnseqno\b\s*=\s*\{\{[^}]*gcn[^}]*\}\}",
            ),
            (
                "StartDate/EndDate DOS window",
                r"\{\{[^}]*dateofservice[^}]*\}\}\s+between\s+"
                r"(?:[a-z_][a-z0-9_]*\.)?startdate\s+and\s+"
                r"(?:[a-z_][a-z0-9_]*\.)?enddate",
            ),
            (
                "approved Status",
                r"\bstatus\b\s*=\s*N?'1'",
            ),
            (
                "RejectEdits_EditId",
                r"\brejectedits_editid\b\s+like\s+[^\n]*(?:\{\{[^}]*reject[^}]*edit[^}]*\}\}|'[^']+')",
            ),
            (
                "IT_CNT",
                r"\bit_cnt\b\s*>\s*0\b",
            ),
        )
        eo_sql = re.sub(r"[\[\]]", "", sql)
        for label, pattern in eo_scope_patterns:
            if not re.search(pattern, eo_sql, re.IGNORECASE):
                missing_eo_scope.append(label)
        if len(eo_sources) != 1:
            artifacts.append(
                "same-candidate EO lookup is split across multiple EO_HISTORY sources"
            )
        if missing_eo_scope:
            artifacts.append(
                "same-candidate EO lookup is missing correlated row predicates: "
                + ", ".join(missing_eo_scope)
            )

    contract_term_drug_lookup = bool(
        re.search(
            r"\b(?:from|join)\s+\[?inmemory\]?\s*\.\s*\[?dbo\]?\s*\.\s*"
            r"\[?contract_term\]?\b",
            normalized_sql,
            re.IGNORECASE,
        )
        and re.search(r"\bcontract[- ]?term\b", business_meaning, re.IGNORECASE)
        and re.search(r"\b(?:ndc|gcn|drug)\b", business_meaning, re.IGNORECASE)
    )
    if contract_term_drug_lookup and not re.search(
        r"(?:rtrim\s*\(\s*)?(?:[a-z_][a-z0-9_]*\.)?contractid\s*\)?\s*<>\s*''",
        normalized_sql,
        re.IGNORECASE,
    ):
        artifacts.append(
            "prefiltered contract-term drug lookup must evaluate loaded rows using nonblank ContractId"
        )

    member_exclusion_gcn = bool(
        re.search(r"\bmemberexclusion\b", normalized_sql, re.IGNORECASE)
        and re.search(
            r"\bgcn(?:\s+sequence(?:\s+number)?|_?seqno)?\b",
            business_meaning,
            re.IGNORECASE,
        )
    )
    if member_exclusion_gcn:
        type_literals = re.findall(
            r"(?:(?:\[[^]]+\]|[a-z_][a-z0-9_]*)\s*\.\s*)?\[?type\]?\s*=\s*N?'([^']*)'",
            sql,
            re.IGNORECASE,
        )
        if "gcnseqno" not in {value.casefold() for value in type_literals}:
            found = ", ".join(repr(value) for value in type_literals) or "none"
            artifacts.append(
                "reviewed MemberExclusion Type literal 'GCNSEQNO' is required; "
                f"found {found}"
            )

    selected_prior_row = bool(re.search(
        r"\b(?:same\s+)?selected\s+(?:original|prior|history|historical)\b|"
        r"\bfrom\s+(?:the\s+)?selected\s+(?:original|prior|history|historical)\b|"
        r"\bpreviously\s+selected\s+(?:claim|row|record)\b|"
        r"\bselected\s+(?:in|by)\s+(?:the\s+)?(?:prior|previous|earlier)\s+step\b",
        business_meaning,
        re.IGNORECASE,
    ))
    if selected_prior_row:
        stable_claim_correlation = bool(
            re.search(
                r"\b(?:[a-z_][a-z0-9_]*\.)?claimid\b\s*=\s*"
                r"\{\{[^}]*(?:original|selected|prior)[^}]*claimid[^}]*\}\}|"
                r"\{\{[^}]*(?:original|selected|prior)[^}]*claimid[^}]*\}\}\s*=\s*"
                r"\b(?:[a-z_][a-z0-9_]*\.)?claimid\b",
                normalized_sql,
                re.IGNORECASE,
            )
        )
        selected_row_projection = bool(
            re.search(r"\bTOP\s*\(\s*1\s*\)", sql, re.IGNORECASE)
            and re.search(
                r"\b(?:[a-z_][a-z0-9_]*\.)?claimid\b\s+AS\s+"
                r"(?:selected[a-z0-9_]*claimid|"
                r"[a-z_][a-z0-9_]+selected[a-z0-9_]*claimid)\b",
                sql,
                re.IGNORECASE,
            )
            and re.search(r"\bORDER\s+BY\b", sql, re.IGNORECASE)
        )
        if not stable_claim_correlation and not selected_row_projection:
            artifacts.append(
                "selected-row lookup repeats history without a stable claim identifier"
            )
    return artifacts


def _find_deterministic_selection_artifacts(
    sql: str, business_meaning: str, ddl_context: str = ""
) -> list[str]:
    """Require deterministic ordering for a business-defined single-row scalar."""

    aggregate_query = bool(
        re.search(r"\b(?:COUNT|SUM|MIN|MAX|AVG)\s*\(", sql, re.IGNORECASE)
    )
    ascending_selection = bool(re.search(
        r"\b(?:earliest|oldest)\b|"
        r"\b(?:initial|first)\b[^.\n]{0,80}"
        r"\b(?:claim|row|record|occurrence|fill|entry|result)\b",
        business_meaning,
        re.IGNORECASE,
    ))
    descending_selection = bool(re.search(
        r"\b(?:latest|newest|most\s+recent)\b[^.\n]{0,80}"
        r"\b(?:claim|row|record|occurrence|fill|entry|result)?\b",
        business_meaning,
        re.IGNORECASE,
    ))
    scalar_row_selection = not aggregate_query and (
        ascending_selection or descending_selection
    )
    has_top_one = bool(re.search(r"\bTOP\s*\(\s*1\s*\)", sql, re.IGNORECASE))
    if scalar_row_selection and not has_top_one:
        return ["business-defined scalar row selection must use TOP (1)"]
    if not has_top_one:
        return []

    order_match = re.search(
        r"\bORDER\s+BY\b(?P<order>.+)$", sql, re.IGNORECASE | re.DOTALL
    )
    if order_match is None:
        return ["TOP (1) selection has no ORDER BY"]
    order = order_match.group("order")
    order_terms = [term.strip() for term in order.split(",") if term.strip()]
    first_direction = re.search(
        r"\b(?:ASC|DESC)\b", order_terms[0] if order_terms else "", re.IGNORECASE
    )
    if ascending_selection and first_direction and first_direction.group(0).upper() == "DESC":
        return ["earliest/initial scalar row selection must order ascending"]
    if descending_selection and first_direction and first_direction.group(0).upper() == "ASC":
        return ["latest/newest scalar row selection must order descending"]

    if scalar_row_selection:
        primary_key_columns = {
            column.casefold()
            for key_list in re.findall(
                r"\bPRIMARY\s+KEY\s*\(([^)]*)\)", ddl_context, re.IGNORECASE
            )
            for column in re.findall(r"\[?([A-Za-z_][A-Za-z0-9_]*)\]?", key_list)
        }
        stable_term = next(
            (
                term for term in order_terms[1:]
                if (
                    (column_match := re.search(
                        r"(?:\.|^)\s*\[?([A-Za-z_][A-Za-z0-9_]*)\]?"
                        r"(?:\s+(?:ASC|DESC))?\s*$",
                        term,
                        re.IGNORECASE,
                    ))
                    and (
                        column_match.group(1).casefold() in primary_key_columns
                        or re.search(
                            r"(?:id|key|sequence|seq|ordinal|line)$",
                            column_match.group(1),
                            re.IGNORECASE,
                        )
                    )
                )
            ),
            None,
        )
        if stable_term is None:
            return [
                "business-defined scalar row selection is missing a stable tie-breaker"
            ]
    return []


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
