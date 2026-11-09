"""Reviewed intent/SQL examples for generation; never execution or reuse authority."""
from __future__ import annotations

import json
import logging
import math
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from importlib import resources

import sqlglot
import yaml
from sqlglot import exp
from sqlglot.errors import ParseError, TokenError

logger = logging.getLogger(__name__)
GOLDEN_QUERY_HEADER = "REVIEWED GOLDEN-SET FEW-SHOT EXAMPLES (guidance only):"
MAX_EXAMPLES = 3
MAX_CONTEXT_CHARS = 10000
# Keep only near-best semantic matches; never backfill weaker examples for volume.
MIN_RELATIVE_SCORE = 0.9
_SCALAR = re.compile(r"\{\{:?([^{}]+)\}\}")
_LIST = re.compile(r"\[\[:([^\]]+)\]\]")
_STOP = set("a an the and or for from of to in on by with whose that when is are be as only supplied requested configured matching match effective records record retrieves retrieve returns return value values date service count counts query data current given determine whether".split())


def _parse_template(sql: str) -> exp.Select:
    # Placeholders are parsed as inert sentinels, never interpolated or executed.
    text = re.sub(r"\(\s*nolock\s*\)", "WITH (NOLOCK)", sql, flags=re.I)
    text = re.sub(r"\bWITH\s+WITH\b", "WITH", text, flags=re.I)
    names: dict[str, str] = {}
    def sentinel(match):
        name = match.group(1).casefold()
        return names.setdefault(name, f"__golden_param_{len(names)}__")
    text = _LIST.sub(lambda m: "'" + sentinel(m) + "'", text)
    text = _SCALAR.sub(sentinel, text)
    statements = sqlglot.parse(text, read="tsql")
    if len(statements) != 1 or not isinstance(statements[0], exp.Select):
        raise ValueError("not a single SELECT template")
    statement = statements[0]
    if any(isinstance(n, (exp.Into, exp.DML, exp.DDL, exp.Command)) for n in statement.walk()):
        raise ValueError("template contains a write or command")
    return statement


def inspect_template(sql: str) -> tuple[tuple[str, ...], str | None]:
    try:
        statement = _parse_template(sql)
    except (ParseError, TokenError, ValueError):
        return (), "SQL template is not a parseable single read-only SELECT; source correction required."
    return tuple(sorted({t.name.casefold() for t in statement.find_all(exp.Table)})), None


def template_signature(sql: str) -> str:
    """Compare explicit color-group members, ignoring casing/parentheses/binding names."""
    statement = _parse_template(sql)
    statement = statement.transform(lambda n: n.this if isinstance(n, exp.Paren) else n)
    return statement.sql(dialect="tsql", normalize=True).casefold()


@dataclass(frozen=True)
class GoldenVariant:
    name: str
    row: int
    intent: str
    query_text: str
    review_decision: str
    reviewer: str
    comments: str
    suggested_changes: str
    tables: tuple[str, ...]
    eligible: bool
    issue: str | None

    @property
    def example_intent(self) -> str:
        return self.suggested_changes or self.intent


@dataclass(frozen=True)
class GoldenEntry:
    entry_id: str
    variants: tuple[GoldenVariant, ...]


def _required_string(value, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"invalid {label}")
    return value


@lru_cache(maxsize=1)
def load_golden_queries() -> tuple[GoldenEntry, ...]:
    payload = yaml.safe_load(resources.files(__package__).joinpath("examples.v1.yaml").read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or payload.get("schema_version") != 1 or not isinstance(payload.get("entries"), list):
        raise ValueError("invalid golden catalog schema")
    entries = []
    seen_ids, seen_names = set(), set()
    for raw in payload["entries"]:
        if not isinstance(raw, dict) or not isinstance(raw.get("variants"), list):
            raise ValueError("invalid golden entry")
        identity = _required_string(raw["id"], "entry id")
        if identity in seen_ids:
            raise ValueError("duplicate golden entry id")
        seen_ids.add(identity)
        variants = []
        for v in raw["variants"]:
            if not isinstance(v, dict):
                raise ValueError("invalid golden variant")
            if any(not isinstance(v.get(k), str) for k in ("comments", "suggested_changes")):
                raise ValueError("invalid golden review wording")
            if type(v.get("row")) is not int or v["row"] < 1 or type(v.get("eligible")) is not bool:
                raise ValueError("invalid golden source metadata")
            name = _required_string(v["name"], "name")
            if name in seen_names or v["review_decision"] != "Yes":
                raise ValueError("duplicate or unapproved golden source")
            seen_names.add(name)
            sql = _required_string(v["query_text"], "SQL")
            tables, issue = inspect_template(sql)
            if v["eligible"] != (issue is None) or list(tables) != v["tables"]:
                raise ValueError("golden SQL eligibility metadata does not match source")
            variants.append(GoldenVariant(
                name, int(v["row"]), _required_string(v["intent"], "intent"), sql,
                v["review_decision"], _required_string(v["reviewer"], "reviewer"),
                v["comments"], v["suggested_changes"], tables, issue is None, issue,
            ))
        if not variants:
            raise ValueError("empty golden group")
        if len(variants) > 1 and len({template_signature(v.query_text) for v in variants}) != 1:
            raise ValueError("inconsistent golden group")
        entries.append(GoldenEntry(identity, tuple(variants)))
    if not entries:
        raise ValueError("empty golden catalog")
    return tuple(entries)


def _terms(text: str) -> set[str]:
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
    terms = set(re.findall(r"[a-z][a-z0-9]+", text.casefold())) - _STOP
    return {t[:-1] if t.endswith("s") and not t.endswith("ss") else t for t in terms}


def _ddl_tables(ddl: str) -> dict[str, set[str]]:
    tables: dict[str, set[str]] = {}
    for name in re.findall(r"\bCREATE\s+TABLE\s+([\w\[\].]+)", ddl, re.I):
        parts = name.replace("[", "").replace("]", "").casefold().split(".")
        database = parts[-3] if len(parts) >= 3 else ""
        tables.setdefault(parts[-1], set()).add(database)
    return tables


def select_golden_queries(business_meaning: str, ddl_context: str) -> tuple[tuple[GoldenEntry, GoldenVariant], ...]:
    enabled = os.getenv("GOLDEN_QUERY_EXAMPLES_ENABLED", "true").strip().casefold()
    if enabled not in {"true", "1", "yes", "on"}:
        logger.log(logging.INFO if enabled in {"false", "0", "no", "off"} else logging.WARNING,
                   "golden_query_selection", extra={"golden_reason": "disabled_or_invalid_configuration"})
        return ()
    try:
        entries = load_golden_queries()
    except (ValueError, KeyError, TypeError, OSError, yaml.YAMLError) as exc:
        logger.warning("golden_query_selection", extra={"golden_reason": "invalid_catalog", "golden_error_type": type(exc).__name__})
        return ()
    query_terms = _terms(business_meaning)
    available = _ddl_tables(ddl_context)
    # A named physical source is stronger evidence than shared words (including
    # words in negative constraints such as "no date or drug filters").
    requested_tables = {
        name.casefold()
        for name in re.findall(
            r"\b\[?\w+\]?\s*\.\s*\[?\w+\]?\s*\.\s*\[?(\w+)\]?",
            business_meaning,
        )
        if name.casefold() in available
    }
    documents = {e.entry_id: set().union(*(_terms(v.example_intent + " " + v.name) for v in e.variants)) for e in entries}
    frequencies = {t: sum(t in d for d in documents.values()) for t in query_terms}
    ranked = []
    for entry in entries:
        candidates = []
        for v in entry.variants:
            if not v.eligible:
                continue
            if requested_tables and (not v.tables or not set(v.tables) <= requested_tables):
                continue
            if "adjudication" in v.example_intent.casefold() and "adjudication" not in business_meaning.casefold():
                continue
            if "adjudication" in business_meaning.casefold() and "date of service" in v.example_intent.casefold():
                continue
            terms = _terms(v.example_intent + " " + v.name)
            overlap = terms & query_terms
            exact_name = v.name.casefold() in business_meaning.casefold()
            if len(overlap) < 2 and not exact_name:
                continue
            score = sum(math.log(1 + len(entries) / (1 + frequencies[t])) for t in overlap)
            score /= math.sqrt(max(len(terms), 1))
            if exact_name:
                score += 10
            candidates.append((score, -v.row, v))
        if candidates:
            score, _, variant = max(candidates, key=lambda x: (x[0], x[1]))
            ranked.append((score, entry.entry_id, entry, variant))
    ranked.sort(key=lambda x: (-x[0], x[1]))
    selected = []
    for score, _, entry, variant in ranked:
        if score < ranked[0][0] * MIN_RELATIVE_SCORE:
            break
        if any(t not in available or available[t] == {"inmemory"} for t in variant.tables):
            continue
        # Do not let an explicitly qualified example cross a supplied database boundary.
        if any(t.catalog and t.catalog.casefold() not in available.get(t.name.casefold(), set()) for t in _parse_template(variant.query_text).find_all(exp.Table)):
            continue
        selected.append((entry, variant))
        if len(selected) == MAX_EXAMPLES:
            break
    return tuple(selected)


def build_golden_query_context(business_meaning: str, ddl_context: str) -> str:
    selected = select_golden_queries(business_meaning, ddl_context)
    if not selected:
        logger.info("golden_query_selection", extra={"golden_reason": "no_examples", "golden_example_ids": (), "golden_context_chars": 0})
        return ""
    context = (
        GOLDEN_QUERY_HEADER + "\n"
        "These reviewed intent -> SQL template pairs illustrate reusable patterns. The current requirement and DDL take precedence. "
        "Do not import example-only filters, constants, joins, runtime paths, or ordering. "
        "{{:output}} is configurable and does not imply COUNT or a specific output field. "
        "Bind projection, parameters, list placeholders and dates only from the current task and consumer contract; "
        "use the runtime placeholder syntax required by the current generation instructions. "
        "Reviewer qualifications constrain the example. This is not execution approval or an exact reuse decision.\n"
    )
    included = []
    for entry, variant in selected:
        example = json.dumps({
            "example_id": entry.entry_id, "source_name": variant.name,
            "reviewed_intent": variant.example_intent,
            "sql_template": variant.query_text,
            "reviewer_qualification": variant.comments,
        }, ensure_ascii=False)
        if len(context) + len(example) + 2 > MAX_CONTEXT_CHARS:
            continue
        context += "\n" + example + "\n"
        included.append(entry.entry_id)
    logger.info("golden_query_selection", extra={"golden_reason": "selected" if included else "budget_exceeded", "golden_example_ids": tuple(included), "golden_context_chars": len(context) if included else 0})
    return context if included else ""
