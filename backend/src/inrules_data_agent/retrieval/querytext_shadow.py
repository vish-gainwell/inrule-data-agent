from __future__ import annotations

import os
import re
import sqlite3
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

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


def _load_pyodbc():
    import pyodbc

    return pyodbc


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
    proposed_query_params: dict[str, object]
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


def _normalize_expression(
    expression: Expression | None,
    *,
    normalize_equality_rtrim: bool = False,
) -> str:
    if expression is None:
        return ""
    normalized = expression.copy()
    if normalize_equality_rtrim:
        for equality in normalized.find_all(exp.EQ):
            for side in ("this", "expression"):
                operand = equality.args.get(side)
                if (
                    isinstance(operand, exp.Trim)
                    and operand.args.get("position") == "TRAILING"
                    and isinstance(operand.this, exp.Column)
                ):
                    equality.set(side, operand.this.copy())
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
    predicates = _normalize_expression(
        where_expression,
        normalize_equality_rtrim=True,
    )
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


_CATALOG_SCHEMA_VERSION = 1
_CATALOG_ENVIRONMENT_VARIABLE = "DATAQUERY_CATALOG_PATH"
_PACKAGED_CATALOG_PATH = Path(__file__).resolve().parent / "data" / "dataquery_reuse_catalog.sqlite3"


class DataQueryCatalogError(RuntimeError):
    """The local catalog cannot safely be used for reuse validation."""


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


def _catalog_path() -> Path:
    configured = os.environ.get(_CATALOG_ENVIRONMENT_VARIABLE)
    return Path(configured).expanduser() if configured else _PACKAGED_CATALOG_PATH


def _catalog_connection(path: Path) -> sqlite3.Connection:
    if not path.is_file():
        raise DataQueryCatalogError(f"catalog file does not exist: {path}")
    return sqlite3.connect(f"{path.resolve().as_uri()}?mode=ro", uri=True)


def _validate_catalog(connection: sqlite3.Connection) -> None:
    version = connection.execute("PRAGMA user_version").fetchone()[0]
    if version != _CATALOG_SCHEMA_VERSION:
        raise DataQueryCatalogError(
            f"unsupported catalog schema version {version}; expected {_CATALOG_SCHEMA_VERSION}"
        )
    required_tables = {"catalog_metadata", "data_queries", "data_query_assignments"}
    actual_tables = {
        str(row[0])
        for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
    }
    missing = required_tables.difference(actual_tables)
    if missing:
        raise DataQueryCatalogError(
            "catalog is missing required tables: " + ", ".join(sorted(missing))
        )


def _load_catalog_reuse_corpus(
    path: Path,
) -> dict[int, tuple[StoredQueryText, tuple[DataQueryAssignmentExample, ...]]]:
    with _catalog_connection(path) as connection:
        _validate_catalog(connection)
        rows = connection.execute(
            """
            SELECT
                q.data_query_id, q.name, q.db_id, q.query_text,
                a.data_package_id, a.data_package_name,
                a.query_params, a.return_vals, a.priority,
                a.active, a.is_data_set
            FROM data_queries q
            LEFT JOIN data_query_assignments a
                ON a.data_query_id = q.data_query_id
            ORDER BY q.data_query_id, a.ordinal
            """
        ).fetchall()
    if not rows:
        raise DataQueryCatalogError("catalog contains no DataQuery templates")
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


def _load_catalog_querytext_rows(path: Path) -> tuple[StoredQueryText, ...]:
    corpus = _load_catalog_reuse_corpus(path)
    return tuple(query for query, _ in corpus.values())


def _load_querytext_rows_from_claimengine() -> tuple[StoredQueryText, ...]:
    pyodbc = _load_pyodbc()
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


def _load_reuse_corpus_from_claimengine() -> dict[int, tuple[StoredQueryText, tuple[DataQueryAssignmentExample, ...]]]:
    pyodbc = _load_pyodbc()
    with pyodbc.connect(_connection_string(), timeout=15) as connection:
        cursor = connection.cursor()
        try:
            rows = cursor.execute(
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
        except pyodbc.Error as exc:
            print(
                "[dataquery_reuse] assignment metadata unavailable; "
                f"matching against DataQuery templates only: {exc}"
            )
            rows = cursor.execute(
                """
                SELECT
                    dq.DataQueryId, dq.Name, dq.DbId, dq.QueryText,
                    NULL, NULL, NULL, NULL, NULL, NULL, NULL
                FROM [ClaimEngine].[dbo].[DataQuery] dq
                WHERE dq.QueryType = 'select' AND dq.QueryText IS NOT NULL
                ORDER BY dq.DataQueryId
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


def _with_catalog_fallback(loader, catalog_loader):
    path = _catalog_path()
    try:
        return catalog_loader(path)
    except (DataQueryCatalogError, sqlite3.Error, OSError) as exc:
        if path.is_file() or os.environ.get(_CATALOG_ENVIRONMENT_VARIABLE):
            print(f"[dataquery_reuse] local SQLite catalog unavailable; using ClaimEngine: {exc}")
        return loader()


def load_querytext_rows() -> tuple[StoredQueryText, ...]:
    """Load QueryText from the local catalog, falling back to ClaimEngine when needed."""
    return _with_catalog_fallback(
        _load_querytext_rows_from_claimengine,
        _load_catalog_querytext_rows,
    )


def load_reuse_corpus() -> dict[int, tuple[StoredQueryText, tuple[DataQueryAssignmentExample, ...]]]:
    """Load reuse templates locally first, preserving ClaimEngine fallback behavior."""
    return _with_catalog_fallback(
        _load_reuse_corpus_from_claimengine,
        _load_catalog_reuse_corpus,
    )


def write_reuse_catalog(
    output_path: str | Path,
    corpus: dict[int, tuple[StoredQueryText, tuple[DataQueryAssignmentExample, ...]]],
    *,
    source_description: str = "ClaimEngine DataQuery export",
) -> Path:
    """Create a versioned catalog snapshot. This is an explicit maintenance operation."""
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    if temporary.exists():
        temporary.unlink()
    connection = sqlite3.connect(temporary)
    try:
        connection.executescript(
            """
            CREATE TABLE catalog_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            CREATE TABLE data_queries (
                data_query_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                db_id INTEGER NOT NULL,
                query_text TEXT NOT NULL
            );
            CREATE TABLE data_query_assignments (
                data_query_id INTEGER NOT NULL REFERENCES data_queries(data_query_id),
                ordinal INTEGER NOT NULL,
                data_package_id INTEGER,
                data_package_name TEXT,
                query_params TEXT,
                return_vals TEXT,
                priority INTEGER,
                active INTEGER,
                is_data_set INTEGER,
                PRIMARY KEY (data_query_id, ordinal)
            );
            """
        )
        connection.execute(f"PRAGMA user_version = {_CATALOG_SCHEMA_VERSION}")
        connection.executemany(
            "INSERT INTO data_queries (data_query_id, name, db_id, query_text) VALUES (?, ?, ?, ?)",
            [
                (query.data_query_id, query.name, query.db_id, query.query_text)
                for query, _ in corpus.values()
            ],
        )
        assignments = []
        for query_id, (_, examples) in corpus.items():
            for ordinal, example in enumerate(examples):
                assignments.append(
                    (
                        query_id,
                        ordinal,
                        example.data_package_id,
                        example.data_package_name,
                        example.query_params,
                        example.return_vals,
                        example.priority,
                        None if example.active is None else int(example.active),
                        None if example.is_data_set is None else int(example.is_data_set),
                    )
                )
        connection.executemany(
            """
            INSERT INTO data_query_assignments (
                data_query_id, ordinal, data_package_id, data_package_name,
                query_params, return_vals, priority, active, is_data_set
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            assignments,
        )
        metadata = {
            "schema_version": str(_CATALOG_SCHEMA_VERSION),
            "source_description": source_description,
            "source_extracted_at": datetime.now(timezone.utc).isoformat(),
            "query_count": str(len(corpus)),
        }
        connection.executemany(
            "INSERT INTO catalog_metadata (key, value) VALUES (?, ?)",
            metadata.items(),
        )
        connection.commit()
    finally:
        connection.close()
    temporary.replace(output)
    return output


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


def _generated_runtime_values(sql: str) -> list[str]:
    return [
        f"{{{{{name}}}}}"
        for match in _PLACEHOLDER_RE.finditer(sql)
        if (name := match.group(1).strip()).lower().lstrip(":") != "output"
    ]


def _generated_parameter_values(sql: str, template_sql: str) -> list[str]:
    """Return runtime values and assignment literals in generated predicate order."""
    fixed_literals = Counter(_generated_string_literals(template_sql))
    token_re = re.compile(
        r"\{\{:?(?P<runtime>[^{}]+)\}\}|N?'(?P<literal>(?:''|[^'])*)'",
        re.IGNORECASE,
    )
    values: list[str] = []
    for match in token_re.finditer(sql):
        runtime = match.group("runtime")
        if runtime is not None:
            if runtime.strip().lower().lstrip(":") != "output":
                values.append(f"{{{{{runtime.strip()}}}}}")
            continue
        literal = (match.group("literal") or "").replace("''", "'")
        if fixed_literals[literal]:
            fixed_literals[literal] -= 1
        else:
            values.append(literal)
    return values


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


def _unique_parameter_name(base: str, used: set[str]) -> str:
    name = base or "Value"
    suffix = 2
    while name.lower() in used:
        name = f"{base}{suffix}"
        suffix += 1
    used.add(name.lower())
    return name


def _proposed_parameter_name(runtime_path: str, used: set[str]) -> str:
    normalized = re.sub(r"[^a-z0-9]", "", runtime_path.lower())
    special = {
        "claimtransactionndc": "Ndc",
        "claimrequestdrugrequestedgcnseqnocode": "GcnSeqNo",
        "claimrequestdrugrequestedhic3code": "Hic3",
        "dateofservice": "DateOfService",
        "memberid": "MemberId",
        "providerid": "ProviderId",
        "rxnumber": "RxNumber",
    }
    base = special.get(normalized)
    if base is None:
        words = re.findall(r"[A-Za-z0-9]+", runtime_path)
        base = "".join(word[:1].upper() + word[1:] for word in words) or "RuntimeValue"
    return _unique_parameter_name(base, used)


def _literal_parameter_name(column: str, sql: str, used: set[str]) -> str:
    runtime_match = _PLACEHOLDER_RE.fullmatch(column.strip())
    if runtime_match:
        runtime_name = re.sub(r"[^A-Za-z0-9]", "", runtime_match.group(1).lstrip(":"))
        base = f"Expected{runtime_name or 'Value'}"
        return _unique_parameter_name(base, used)
    normalized = re.sub(r"[^a-z0-9]", "", column.lower())
    special = {
        "parametername": "ParamName",
        "parametervalue": "ParameterValue",
        "formtype": "FormType",
        "priorauth": "PriorAuth",
        "ndckey": "Ndc",
        "gcnseqno": "GcnSeqNo",
        "hic3": "Hic3",
        "segtype": "SegType",
        "programid": "ProgramId",
        "planid": "PlanId",
    }
    if normalized == "type" and re.search(r"\bDrugOverrides\b", sql, re.IGNORECASE):
        base = "DrugOverrideType"
    else:
        base = special.get(normalized)
        if base is None:
            words = re.findall(r"[A-Za-z0-9]+", column)
            base = "".join(word[:1].upper() + word[1:] for word in words) or "Value"
    return _unique_parameter_name(base, used)


def _projection_parameter(sql: str) -> str | None:
    try:
        statement = sqlglot.parse_one(_sentinelize(sql), read="tsql")
    except (ParseError, TokenError, ValueError):
        return None
    if not isinstance(statement, exp.Select) or not statement.expressions:
        return None
    return ", ".join(
        expression.unalias().sql(dialect="tsql")
        for expression in statement.expressions
    )


def propose_new_data_query(generated_sql: str) -> ProposedDataQuery:
    """Create a reusable generic QueryText plus its DataPackage parameter set."""
    params: dict[str, object] = {}
    names_by_runtime: dict[str, str] = {}
    used_names: set[str] = set()
    query_text = generated_sql

    projection = _projection_parameter(generated_sql)
    projection_match = re.match(
        r"(?is)^(?P<prefix>\s*SELECT\s+)(?P<projection>.*?)(?P<from>\s+FROM\s+)",
        query_text,
    )
    if projection and projection_match:
        params[":output"] = projection
        used_names.add("output")
        query_text = (
            projection_match.group("prefix")
            + "{{:output}}"
            + projection_match.group("from")
            + query_text[projection_match.end():]
        )
    elif projection:
        projection_literal_re = re.compile(
            r"(?P<prefix>N?)'(?P<value>(?:''|[^'])*)'"
            r"(?P<spacing>\s+AS\s+)(?P<alias>\[[^]]+\]|[A-Za-z_]\w*)",
            re.IGNORECASE,
        )

        def replace_projection_literal(match: re.Match[str]) -> str:
            value = match.group("value").replace("''", "'")
            if not value or "{{" in value:
                return match.group(0)
            alias = match.group("alias").strip("[]")
            name = _literal_parameter_name(alias, generated_sql, used_names)
            params[f":{name}"] = value
            return (
                match.group("prefix")
                + f"'{{{{:{name}}}}}'"
                + match.group("spacing")
                + match.group("alias")
            )

        query_text = projection_literal_re.sub(replace_projection_literal, query_text)

    simple_column = (
        r"(?:\[[^]]+\]|[A-Za-z_]\w*)"
        r"(?:\s*\.\s*(?:\[[^]]+\]|[A-Za-z_]\w*))?"
    )
    column_or_runtime = (
        rf"(?:\{{\{{:?[^{{}}]+\}}\}}|"
        rf"(?:RTRIM|LTRIM)\s*\(\s*{simple_column}\s*\)|"
        rf"{simple_column})"
    )
    in_literal_re = re.compile(
        rf"(?P<column>{column_or_runtime})(?P<spacing>\s+IN\s*)"
        r"\((?P<values>\s*N?'(?:''|[^'])*'(?:\s*,\s*N?'(?:''|[^'])*')+\s*)\)",
        re.IGNORECASE,
    )

    def replace_in_literals(match: re.Match[str]) -> str:
        values = [
            value.replace("''", "'")
            for value in re.findall(r"N?'((?:''|[^'])*)'", match.group("values"), re.IGNORECASE)
        ]
        if not values or any(not value or "{{" in value for value in values):
            return match.group(0)
        column = re.split(r"\s*\.\s*", match.group("column"))[-1].strip("[]")
        singular = _literal_parameter_name(column, generated_sql, set())
        plural = (
            f"{singular}es"
            if singular.lower().endswith(("status", "class"))
            else singular
            if singular.lower().endswith("s")
            else f"{singular}s"
        )
        name = _unique_parameter_name(plural, used_names)
        params[f":{name}"] = values
        return match.group("column") + match.group("spacing") + f"([[:{name}]])"

    query_text = in_literal_re.sub(replace_in_literals, query_text)

    comparison_literal_re = re.compile(
        rf"(?P<column>{column_or_runtime})"
        r"(?P<spacing>\s*(?:=|<>|!=|LIKE)\s*)"
        r"(?P<prefix>N?)'(?P<value>(?:''|[^'])*)'",
        re.IGNORECASE,
    )

    def replace_literal(match: re.Match[str]) -> str:
        value = match.group("value").replace("''", "'")
        if not value or "{{" in value:
            return match.group(0)
        column = re.split(r"\s*\.\s*", match.group("column"))[-1].strip("[]")
        name = _literal_parameter_name(column, generated_sql, used_names)
        params[f":{name}"] = value
        return (
            match.group("column")
            + match.group("spacing")
            + match.group("prefix")
            + f"'{{{{:{name}}}}}'"
        )

    query_text = comparison_literal_re.sub(replace_literal, query_text)

    def replace_runtime(match: re.Match[str]) -> str:
        runtime_path = match.group(1).strip()
        if match.group(0).startswith("{{:"):
            return match.group(0)
        name = names_by_runtime.get(runtime_path)
        if name is None:
            name = _proposed_parameter_name(runtime_path, used_names)
            names_by_runtime[runtime_path] = name
            params[f":{name}"] = f"{{{{{runtime_path}}}}}"
        return f"{{{{:{name}}}}}"

    query_text = _PLACEHOLDER_RE.sub(replace_runtime, query_text)
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
        names = _template_parameter_names(query.query_text)
        if candidate.predicates == target.predicates:
            runtime_values = _generated_runtime_values(generated_sql)
            if names:
                if len(names) != len(runtime_values):
                    continue
                params = dict(zip(names, runtime_values, strict=True))
            else:
                params = {}
        else:
            values = _generated_parameter_values(generated_sql, query.query_text)
            if not names or len(names) != len(values):
                continue
            params = dict(zip(names, values, strict=True))
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
