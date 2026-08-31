from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import sqlglot
from sqlglot import exp
from sqlglot.errors import ParseError, TokenError
from sqlglot.expressions.core import Expression

_NOLOCK_RE = re.compile(r"\(\s*nolock\s*\)", re.IGNORECASE)
_LIST_PLACEHOLDER_RE = re.compile(r"\[\[:?([^\[\]]+)\]\]")
_COLLECTION_PLACEHOLDER_RE = re.compile(r"\[\[([^\[\]]+)\]\]")
_PLACEHOLDER_RE = re.compile(r"\{\{:?([^{}]+)\}\}")


@dataclass(frozen=True)
class TableEvidence:
    raw_name: str
    normalized_name: str
    has_nolock: bool
    source: str
    basis: str


@dataclass(frozen=True)
class SelectEvidence:
    parse_status: str
    query_shape: str
    source: str
    tables: tuple[TableEvidence, ...]
    joins: tuple[str, ...]
    filter_columns: tuple[str, ...]
    placeholders: tuple[str, ...]
    has_dynamic_output: bool
    has_effective_date_filter: bool
    has_order_by: bool
    statement_count: int
    parse_error: str | None = None


def load_frontier_tables(schema_directory: Path) -> frozenset[str]:
    return frozenset(path.stem.rsplit(".", 1)[-1].upper() for path in schema_directory.glob("*.sql"))


def _sentinelize(query_text: str) -> str:
    text = _NOLOCK_RE.sub("WITH (NOLOCK)", query_text)
    text = re.sub(r"\bWITH\s+WITH\s+\(", "WITH (", text, flags=re.IGNORECASE)
    text = _LIST_PLACEHOLDER_RE.sub("'__INRULE_LIST__'", text)
    text = _COLLECTION_PLACEHOLDER_RE.sub("'__INRULE_COLLECTION__'", text)
    text = _PLACEHOLDER_RE.sub("__INRULE_RUNTIME__", text)
    return text.strip()


def _has_nolock(table: exp.Table) -> bool:
    return any("NOLOCK" in hint.sql().upper() for hint in table.args.get("hints") or ())


def _table_evidence(table: exp.Table, frontier_tables: frozenset[str]) -> TableEvidence:
    raw_name = table.name.strip("[]")
    normalized = raw_name.lower()
    has_nolock = _has_nolock(table)
    if has_nolock:
        source = "PHYSICAL"
        basis = "NOLOCK"
    elif raw_name == raw_name.upper() and raw_name.upper() in frontier_tables:
        source = "INMEMORY"
        basis = "UPPERCASE_FRONTIER_WITHOUT_NOLOCK"
    else:
        source = "PHYSICAL"
        basis = "NON_FRONTIER_DEFAULT"
    return TableEvidence(raw_name, normalized, has_nolock, source, basis)


def _query_source(tables: tuple[TableEvidence, ...]) -> str:
    sources = {table.source for table in tables}
    if not sources:
        return "NOT_APPLICABLE"
    if len(sources) > 1:
        return "MIXED"
    return next(iter(sources))


def _filter_columns(statement: Expression) -> tuple[str, ...]:
    columns: set[str] = set()
    for where in statement.find_all(exp.Where):
        columns.update(column.name.lower() for column in where.find_all(exp.Column))
    return tuple(sorted(columns))


def analyze_select(query_text: str, frontier_tables: frozenset[str]) -> SelectEvidence:
    placeholders = tuple(dict.fromkeys(match.group(1).strip() for match in _PLACEHOLDER_RE.finditer(query_text)))
    has_dynamic_output = any(value.lower() == "output" for value in placeholders)
    leading = query_text.lstrip().lower()
    if not leading.startswith(("select", "with")):
        return SelectEvidence(
            "NON_SELECT_TEXT",
            "FRAGMENT",
            "UNKNOWN",
            (),
            (),
            (),
            placeholders,
            has_dynamic_output,
            False,
            False,
            0,
        )

    try:
        statements = sqlglot.parse(_sentinelize(query_text), read="tsql")
    except (ParseError, TokenError, ValueError) as exc:
        return SelectEvidence(
            "PARSE_ERROR",
            "MALFORMED",
            "UNKNOWN",
            (),
            (),
            (),
            placeholders,
            has_dynamic_output,
            False,
            False,
            0,
            str(exc),
        )

    parsed = tuple(statement for statement in statements if statement is not None)
    if len(parsed) != 1:
        return SelectEvidence(
            "MULTIPLE_STATEMENTS",
            "MULTIPLE_STATEMENTS",
            "UNKNOWN",
            (),
            (),
            (),
            placeholders,
            has_dynamic_output,
            False,
            False,
            len(parsed),
        )

    statement = parsed[0]
    if not isinstance(statement, (exp.Select, exp.Union, exp.Intersect, exp.Except)):
        return SelectEvidence(
            "NON_SELECT_AST",
            "UNSUPPORTED",
            "UNKNOWN",
            (),
            (),
            (),
            placeholders,
            has_dynamic_output,
            False,
            False,
            1,
        )

    tables = tuple(_table_evidence(table, frontier_tables) for table in statement.find_all(exp.Table))
    joins = tuple(
        f"{join.side or 'INNER'} {join.kind or 'JOIN'} {join.this.sql(dialect='tsql')} ON "
        f"{join.args['on'].sql(dialect='tsql') if join.args.get('on') else ''}".strip()
        for join in statement.find_all(exp.Join)
    )
    if isinstance(statement, (exp.Union, exp.Intersect, exp.Except)):
        shape = "SET_OPERATION"
    elif not tables:
        shape = "EXPRESSION_SELECT"
    elif len({table.normalized_name for table in tables}) == 1:
        shape = "SINGLE_TABLE_SELECT"
    else:
        shape = "MULTI_TABLE_SELECT"

    lowered = query_text.lower()
    return SelectEvidence(
        "PARSED",
        shape,
        _query_source(tables),
        tables,
        joins,
        _filter_columns(statement),
        placeholders,
        has_dynamic_output,
        " between " in f" {lowered} " and any(name in lowered for name in ("effdate", "enddate", "termdate")),
        statement.args.get("order") is not None or any(True for _ in statement.find_all(exp.Order)),
        1,
    )
