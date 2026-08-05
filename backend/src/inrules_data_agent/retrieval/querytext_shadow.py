from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Iterable

import pyodbc
import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError, TokenError
from sqlglot.expressions import Expression

_DB_ID_DATABASE = {
    0: "inmemory",
    1: "hrx",
    2: "plandata_rx_production",
    4: "ipa",
}


@dataclass(frozen=True)
class StoredQueryText:
    data_query_id: int
    name: str
    db_id: int
    query_text: str


@dataclass(frozen=True)
class DataQueryAssignmentExample:
    data_package_id: int | None
    data_package_name: str | None
    query_params: str | None
    return_vals: str | None
    priority: int | None
    active: bool | None
    is_data_set: bool | None

    def as_dict(self) -> dict[str, object | None]:
        return {
            "data_package_id": self.data_package_id,
            "data_package_name": self.data_package_name,
            "query_params": self.query_params,
            "return_vals": self.return_vals,
            "priority": self.priority,
            "active": self.active,
            "is_data_set": self.is_data_set,
        }


@dataclass(frozen=True)
class ProposedDataQuery:
    query_text: str
    proposed_query_params: dict[str, str]
    proposed_return_vals: list[str]

    def as_dict(self) -> dict[str, object]:
        return {
            "query_text": self.query_text,
            "proposed_query_params": self.proposed_query_params,
            "proposed_return_vals": self.proposed_return_vals,
            "assignment_action": "CREATE_OR_REVIEW_NEW_DATAQUERY",
        }


@dataclass(frozen=True)
class ReuseMatch:
    data_query_id: int
    name: str
    db_id: int
    query_text: str
    proposed_query_params: dict[str, str]
    proposed_return_vals: list[str]
    assignment_examples: tuple[DataQueryAssignmentExample, ...]

    def as_dict(self) -> dict[str, object]:
        return {
            "reuse_decision": "REUSE_EXISTING_DATAQUERY",
            "data_query_id": self.data_query_id,
            "data_query_name": self.name,
            "db_id": self.db_id,
            "query_text": self.query_text,
            "proposed_query_params": self.proposed_query_params,
            "proposed_return_vals": self.proposed_return_vals,
            "assignment_examples": [example.as_dict() for example in self.assignment_examples],
            "assignment_action": "CREATE_OR_REVIEW_DATAPACKAGE_DATAQUERY",
        }


@dataclass(frozen=True)
class QueryPattern:
    tables: tuple[str, ...]
    predicates: str
    projection: str
    filter_columns: tuple[str, ...]


@dataclass(frozen=True)
class ComparisonCandidate:
    data_query_id: int
    name: str
    db_id: int
    query_text: str
    tables: tuple[str, ...]
    filter_columns: tuple[str, ...]
    common_filter_columns: tuple[str, ...]
    missing_filter_columns: tuple[str, ...]
    extra_filter_columns: tuple[str, ...]

    @property
    def strict_match(self) -> bool:
        return not self.missing_filter_columns and not self.extra_filter_columns

    def as_dict(self) -> dict[str, object]:
        return {
            "data_query_id": self.data_query_id,
            "name": self.name,
            "db_id": self.db_id,
            "query_text": self.query_text,
            "tables": list(self.tables),
            "filter_columns": list(self.filter_columns),
            "common_filter_columns": list(self.common_filter_columns),
            "missing_filter_columns": list(self.missing_filter_columns),
            "extra_filter_columns": list(self.extra_filter_columns),
            "strict_match": self.strict_match,
        }


@dataclass(frozen=True)
class ShadowMatch:
    data_query_id: int
    name: str
    db_id: int
    query_text: str
    tables: tuple[str, ...]
    predicates: str

    def as_dict(self) -> dict[str, object]:
        return {
            "data_query_id": self.data_query_id,
            "name": self.name,
            "db_id": self.db_id,
            "query_text": self.query_text,
            "match_basis": {
                "tables": list(self.tables),
                "normalized_predicates": self.predicates,
            },
        }


_PLACEHOLDER_RE = re.compile(r"\{\{:?([^{}]+)\}\}")
_LIST_PLACEHOLDER_RE = re.compile(r"\[\[:?([^\[\]]+)\]\]")
_COLLECTION_PLACEHOLDER_RE = re.compile(r"\[\[([^\[\]]+)\]\]")
_NOLOCK_RE = re.compile(r"\(\s*nolock\s*\)", re.IGNORECASE)


def shadow_matching_enabled() -> bool:
    return os.environ.get("DATAQUERY_SHADOW_ENABLED", "false").lower() in {
        "1",
        "true",
        "yes",
    }


def reuse_matching_enabled() -> bool:
    """Reuse is a core Data Agent function; disable only for offline development."""
    return os.environ.get("DATAQUERY_REUSE_ENABLED", "true").lower() in {
        "1",
        "true",
        "yes",
    }



def _sentinelize(sql: str) -> str:
    text = _NOLOCK_RE.sub("WITH (NOLOCK)", sql)
    text = re.sub(r"\bWITH\s+WITH\s+\(", "WITH (", text, flags=re.IGNORECASE)
    text = _LIST_PLACEHOLDER_RE.sub("'__INRULE_LIST__'", text)
    text = _COLLECTION_PLACEHOLDER_RE.sub("'__INRULE_COLLECTION__'", text)
    text = _PLACEHOLDER_RE.sub("__INRULE_RUNTIME__", text)
    # A placeholder is frequently surrounded by quotes in stored QueryText.
    text = text.replace("'__INRULE_RUNTIME__'", "'__INRULE_RUNTIME__'")
    return text.strip().rstrip("; 0").strip()


def _canonical_table(table: exp.Table, default_database: str | None) -> str:
    database = (table.catalog or default_database or "").strip("[]").lower()
    schema = (table.db or "dbo").strip("[]").lower()
    name = table.name.strip("[]").lower()
    return ".".join(part for part in (database, schema, name) if part)


def _normalize_expression(expression: Expression | None) -> str:
    if expression is None:
        return ""
    normalized = expression.copy()
    for column in normalized.find_all(exp.Column):
        column.set("table", None)
        column.set("db", None)
        column.set("catalog", None)
        column.set("this", exp.Identifier(this=column.name.lower(), quoted=False))
    for literal in normalized.find_all(exp.Literal):
        if str(literal.this).startswith("__INRULE_"):
            literal.replace(exp.Literal.string("__runtime__"))
    for identifier in normalized.find_all(exp.Identifier):
        if str(identifier.this).lower().startswith("__inrule_"):
            identifier.replace(exp.Identifier(this="__runtime__", quoted=False))
    rendered = normalized.sql(dialect="tsql", normalize=True, pretty=False)
    return rendered.replace("'__runtime__'", "__runtime__")


def _projection_pattern(statement: Expression) -> str:
    selects = statement.expressions if isinstance(statement, exp.Select) else []
    if any("__inrule_runtime__" in item.sql().lower() for item in selects):
        return "dynamic"
    return "|".join(_normalize_expression(item.unalias()) for item in selects)


def extract_pattern(sql: str, db_id: int | None = None) -> QueryPattern | None:
    default_database = _DB_ID_DATABASE.get(db_id) if db_id is not None else None
    try:
        statement = sqlglot.parse_one(_sentinelize(sql), read="tsql")
    except (ParseError, TokenError, ValueError):
        return None
    if not isinstance(statement, (exp.Select, exp.Union)):
        return None
    tables = tuple(
        sorted({_canonical_table(table, default_database) for table in statement.find_all(exp.Table)})
    )
    if len(tables) != 1:
        return None
    where = statement.args.get("where")
    where_expression = where.this if where else None
    predicates = _normalize_expression(where_expression)
    filter_columns = tuple(
        sorted(
            {
                column.name.lower()
                for column in where_expression.find_all(exp.Column)
                if not column.name.lower().startswith("__inrule_")
            }
        )
    ) if where_expression else ()
    return QueryPattern(tables, predicates, _projection_pattern(statement), filter_columns)


def patterns_equivalent(target: QueryPattern, candidate: QueryPattern) -> bool:
    return (
        target.tables == candidate.tables
        and target.predicates == candidate.predicates
        and (candidate.projection == "dynamic" or target.projection == candidate.projection)
    )


def _connection_string() -> str:
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
        f"SERVER={hostname},{port};DATABASE=master;UID={username};PWD={password};"
        f"TrustServerCertificate={trust};"
    )


def load_querytext_rows() -> tuple[StoredQueryText, ...]:
    """Read the current QueryText pool directly; intentionally no cache for MVP1."""
    with pyodbc.connect(_connection_string(), timeout=15) as connection:
        rows = connection.cursor().execute(
            """
            SELECT DataQueryId, Name, DbId, QueryText
            FROM [ClaimEngine].[dbo].[DataQuery]
            WHERE QueryType = 'select' AND QueryText IS NOT NULL
            """
        ).fetchall()
    return tuple(
        StoredQueryText(int(row[0]), str(row[1]), int(row[2]), str(row[3]))
        for row in rows
    )


def load_reuse_corpus() -> dict[int, tuple[StoredQueryText, tuple[DataQueryAssignmentExample, ...]]]:
    """Load generic SELECT DataQueries and their observed edit assignments."""
    with pyodbc.connect(_connection_string(), timeout=15) as connection:
        rows = connection.cursor().execute(
            """
            SELECT
                dq.DataQueryId, dq.Name, dq.DbId, dq.QueryText,
                dp.DataPackageId, dp.DataPackageName,
                dpdq.QueryParams, dpdq.ReturnVals, dpdq.Priority,
                dpdq.Active, dpdq.IsDataSet
            FROM [ClaimEngine].[dbo].[DataQuery] dq
            LEFT JOIN [ClaimEngine].[dbo].[DataPackageDataQuery] dpdq
                ON dpdq.DataQuery_Id = dq.DataQueryId
            LEFT JOIN [ClaimEngine].[dbo].[DataPackage] dp
                ON dp.DataPackageId = dpdq.DataPackage_Id
            WHERE dq.QueryType = 'select' AND dq.QueryText IS NOT NULL
            ORDER BY dq.DataQueryId, dpdq.Priority
            """
        ).fetchall()
    corpus: dict[int, tuple[StoredQueryText, list[DataQueryAssignmentExample]]] = {}
    for row in rows:
        query = StoredQueryText(int(row[0]), str(row[1]), int(row[2]), str(row[3]))
        if query.data_query_id not in corpus:
            corpus[query.data_query_id] = (query, [])
        if row[4] is not None:
            corpus[query.data_query_id][1].append(
                DataQueryAssignmentExample(
                    int(row[4]), str(row[5]) if row[5] is not None else None,
                    str(row[6]) if row[6] is not None else None,
                    str(row[7]) if row[7] is not None else None,
                    int(row[8]) if row[8] is not None else None,
                    bool(row[9]) if row[9] is not None else None,
                    bool(row[10]) if row[10] is not None else None,
                )
            )
    return {query_id: (query, tuple(examples)) for query_id, (query, examples) in corpus.items()}


def find_shadow_match(
    generated_sql: str,
    rows: Iterable[StoredQueryText] | None = None,
) -> ShadowMatch | None:
    if not shadow_matching_enabled():
        return None
    target = extract_pattern(generated_sql)
    if target is None:
        return None
    candidates = load_querytext_rows() if rows is None else rows
    for candidate in candidates:
        pattern = extract_pattern(candidate.query_text, candidate.db_id)
        if pattern is None or not patterns_equivalent(target, pattern):
            continue
        return ShadowMatch(
            candidate.data_query_id,
            candidate.name,
            candidate.db_id,
            candidate.query_text,
            pattern.tables,
            pattern.predicates,
        )
    return None


def find_comparison_candidates(
    generated_sql: str,
    rows: Iterable[StoredQueryText] | None = None,
    limit: int = 5,
) -> list[ComparisonCandidate]:
    if not shadow_matching_enabled():
        return []
    target = extract_pattern(generated_sql)
    if target is None:
        return []
    target_filters = set(target.filter_columns)
    candidates = load_querytext_rows() if rows is None else rows
    ranked: list[tuple[tuple[int, int, int], ComparisonCandidate]] = []
    for stored in candidates:
        pattern = extract_pattern(stored.query_text, stored.db_id)
        if pattern is None or pattern.tables != target.tables:
            continue
        candidate_filters = set(pattern.filter_columns)
        common = tuple(sorted(target_filters & candidate_filters))
        missing = tuple(sorted(target_filters - candidate_filters))
        extra = tuple(sorted(candidate_filters - target_filters))
        item = ComparisonCandidate(
            stored.data_query_id,
            stored.name,
            stored.db_id,
            stored.query_text,
            pattern.tables,
            pattern.filter_columns,
            common,
            missing,
            extra,
        )
        rank = (len(common), -len(missing), -len(extra))
        ranked.append((rank, item))
    ranked.sort(key=lambda pair: (pair[0], -pair[1].data_query_id), reverse=True)
    return [item for _, item in ranked[:limit]]


def _template_parameter_names(query_text: str) -> list[str]:
    return [
        name for match in _PLACEHOLDER_RE.finditer(query_text)
        if (name := match.group(1).lstrip(":").strip()).lower() != "output"
    ]


def _generated_string_literals(sql: str) -> list[str]:
    try:
        statement = sqlglot.parse_one(_sentinelize(sql), read="tsql")
    except (ParseError, TokenError, ValueError):
        return []
    return [str(literal.this) for literal in statement.find_all(exp.Literal) if literal.is_string and not str(literal.this).startswith("__INRULE_")]


def _projection_columns(sql: str) -> list[str]:
    try:
        statement = sqlglot.parse_one(_sentinelize(sql), read="tsql")
    except (ParseError, TokenError, ValueError):
        return []
    if not isinstance(statement, exp.Select):
        return []
    return [expression.alias_or_name or expression.sql(dialect="tsql") for expression in statement.expressions]


def _proposed_parameter_name(runtime_path: str, used: set[str]) -> str:
    words = re.findall(r"[A-Za-z0-9]+", runtime_path)
    base = "".join(word[:1].upper() + word[1:] for word in words) or "RuntimeValue"
    name = base
    suffix = 2
    while name.lower() in used:
        name = f"{base}{suffix}"
        suffix += 1
    used.add(name.lower())
    return name


def propose_new_data_query(generated_sql: str) -> ProposedDataQuery:
    """Create a reviewable generic-query contract from generated SQL.

    Runtime ClaimEngine placeholders become named DataQuery parameters. Business
    literals remain in the proposed QueryText because their semantic reuse role
    must be confirmed by the later configuration review.
    """
    params: dict[str, str] = {}
    names_by_runtime: dict[str, str] = {}
    used_names: set[str] = set()

    def replace_runtime(match: re.Match[str]) -> str:
        runtime_path = match.group(1).strip()
        if runtime_path.startswith(":"):
            return match.group(0)
        name = names_by_runtime.get(runtime_path)
        if name is None:
            name = _proposed_parameter_name(runtime_path, used_names)
            names_by_runtime[runtime_path] = name
            params[f":{name}"] = f"{{{{{runtime_path}}}}}"
        return f"{{{{:{name}}}}}"

    query_text = _PLACEHOLDER_RE.sub(replace_runtime, generated_sql)
    return ProposedDataQuery(query_text, params, _projection_columns(generated_sql))


def find_reuse_match(
    generated_sql: str,
    corpus: dict[int, tuple[StoredQueryText, tuple[DataQueryAssignmentExample, ...]]] | None = None,
) -> ReuseMatch | None:
    """Return an exact reusable generic DataQuery match and assignment evidence.

    A candidate must have identical canonical source tables and predicates. Dynamic
    {{:output}} projections are reusable for the generated projection; a stored
    runtime placeholder can bind the generated literal in positional order.
    """
    target = extract_pattern(generated_sql)
    if target is None:
        return None
    entries = load_reuse_corpus() if corpus is None else corpus
    for query, examples in entries.values():
        candidate = extract_pattern(query.query_text, query.db_id)
        if candidate is None or candidate.tables != target.tables:
            continue
        projection_matches = candidate.projection == "dynamic" or candidate.projection == target.projection
        if not projection_matches:
            continue
        if candidate.predicates == target.predicates:
            params: dict[str, str] = {}
        else:
            names = _template_parameter_names(query.query_text)
            literals = _generated_string_literals(generated_sql)
            if not names or len(names) != len(literals):
                continue
            params = dict(zip(names, literals, strict=True))
            template_with_values = query.query_text
            for name, value in params.items():
                template_with_values = re.sub(
                    r"\{\{:?" + re.escape(name) + r"\}\}", value, template_with_values, flags=re.IGNORECASE
                )
            value_pattern = extract_pattern(template_with_values, query.db_id)
            if value_pattern is None or value_pattern.predicates != target.predicates:
                continue
        return ReuseMatch(
            query.data_query_id,
            query.name,
            query.db_id,
            query.query_text,
            params,
            _projection_columns(generated_sql),
            examples,
        )
    return None


def find_shadow_matches(generated_queries: Iterable[str]) -> list[dict[str, object]]:
    if not shadow_matching_enabled():
        return []
    # Each step intentionally performs a fresh database read in MVP1.
    matches = []
    for sql in generated_queries:
        match = find_shadow_match(sql)
        if match:
            matches.append(match.as_dict())
    return matches
