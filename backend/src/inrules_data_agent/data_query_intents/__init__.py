from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from importlib import resources
from typing import Any, Literal, cast

import yaml

ReviewStatus = Literal["pending", "approved", "needs_changes", "rejected"]

_RESOURCE = "intents.v1.yaml"
_SCHEMA_VERSION = 1
_REVIEW_STATUSES = frozenset({"pending", "approved", "needs_changes", "rejected"})
_HASH_PATTERN = re.compile(r"[0-9a-f]{64}")
_MAX_NAME_LENGTH = 200
_MAX_SUMMARY_LENGTH = 500
_CATALOG_KEYS = frozenset({"schema_version", "items"})
_ITEM_KEYS = frozenset(
    {
        "data_query_name",
        "query_intent_summary",
        "review_status",
        "usage",
        "query_text_sha256",
    }
)
_USAGE_KEYS = frozenset({"curated_assignment_count", "distinct_rule_count"})


@dataclass(frozen=True, slots=True)
class DataQueryIntentUsage:
    curated_assignment_count: int
    distinct_rule_count: int


@dataclass(frozen=True, slots=True)
class DataQueryIntent:
    data_query_name: str
    query_intent_summary: str
    review_status: ReviewStatus
    usage: DataQueryIntentUsage
    query_text_sha256: str


@dataclass(frozen=True, slots=True)
class DataQueryIntentCatalog:
    schema_version: int
    items: tuple[DataQueryIntent, ...]


def _exact_keys(value: dict[str, Any], expected: frozenset[str], field: str) -> None:
    actual = frozenset(value)
    if actual != expected:
        missing = sorted(str(key) for key in expected - actual)
        unexpected = sorted(str(key) for key in actual - expected)
        details = []
        if missing:
            details.append(f"missing keys: {', '.join(missing)}")
        if unexpected:
            details.append(f"unexpected keys: {', '.join(unexpected)}")
        raise ValueError(f"{field} has invalid fields ({'; '.join(details)})")


def _bounded_string(value: Any, field: str, maximum: int) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a nonempty string")
    if value != value.strip():
        raise ValueError(f"{field} must not have surrounding whitespace")
    if len(value) > maximum:
        raise ValueError(f"{field} must be at most {maximum} characters")
    return value


def _nonnegative_integer(value: Any, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{field} must be a nonnegative integer")
    return value


def parse_intent_catalog(catalog_text: str) -> DataQueryIntentCatalog:
    try:
        payload = yaml.safe_load(catalog_text)
    except yaml.YAMLError as exc:
        raise ValueError(f"data query intent catalog is malformed YAML: {exc}") from exc

    if not isinstance(payload, dict):
        raise ValueError("data query intent catalog must be a mapping")
    _exact_keys(payload, _CATALOG_KEYS, "data query intent catalog")
    if (
        isinstance(payload["schema_version"], bool)
        or not isinstance(payload["schema_version"], int)
        or payload["schema_version"] != _SCHEMA_VERSION
    ):
        raise ValueError(
            f"data query intent catalog schema_version must be {_SCHEMA_VERSION}"
        )

    raw_items = payload["items"]
    if not isinstance(raw_items, list) or not raw_items:
        raise ValueError("data query intent catalog items must be a nonempty list")

    items: list[DataQueryIntent] = []
    seen_names: set[str] = set()
    for index, raw_item in enumerate(raw_items):
        field = f"items[{index}]"
        if not isinstance(raw_item, dict):
            raise ValueError(f"{field} must be a mapping")
        _exact_keys(raw_item, _ITEM_KEYS, field)

        data_query_name = _bounded_string(
            raw_item["data_query_name"],
            f"{field}.data_query_name",
            _MAX_NAME_LENGTH,
        )
        if data_query_name in seen_names:
            raise ValueError(f"duplicate data query intent name: {data_query_name}")
        seen_names.add(data_query_name)

        review_status = raw_item["review_status"]
        if not isinstance(review_status, str) or review_status not in _REVIEW_STATUSES:
            raise ValueError(
                f"{field}.review_status must be one of: "
                "approved, needs_changes, pending, rejected"
            )

        raw_usage = raw_item["usage"]
        if not isinstance(raw_usage, dict):
            raise ValueError(f"{field}.usage must be a mapping")
        _exact_keys(raw_usage, _USAGE_KEYS, f"{field}.usage")

        query_text_sha256 = raw_item["query_text_sha256"]
        if not isinstance(query_text_sha256, str) or not _HASH_PATTERN.fullmatch(
            query_text_sha256
        ):
            raise ValueError(
                f"{field}.query_text_sha256 must be a 64-character lowercase hex hash"
            )

        items.append(
            DataQueryIntent(
                data_query_name=data_query_name,
                query_intent_summary=_bounded_string(
                    raw_item["query_intent_summary"],
                    f"{field}.query_intent_summary",
                    _MAX_SUMMARY_LENGTH,
                ),
                review_status=cast(ReviewStatus, review_status),
                usage=DataQueryIntentUsage(
                    curated_assignment_count=_nonnegative_integer(
                        raw_usage["curated_assignment_count"],
                        f"{field}.usage.curated_assignment_count",
                    ),
                    distinct_rule_count=_nonnegative_integer(
                        raw_usage["distinct_rule_count"],
                        f"{field}.usage.distinct_rule_count",
                    ),
                ),
                query_text_sha256=query_text_sha256,
            )
        )

    return DataQueryIntentCatalog(
        schema_version=_SCHEMA_VERSION,
        items=tuple(items),
    )


@lru_cache(maxsize=1)
def load_intent_catalog() -> DataQueryIntentCatalog:
    resource = resources.files(__package__).joinpath(_RESOURCE)
    try:
        catalog_text = resource.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise RuntimeError(f"unable to read packaged data query intent catalog: {exc}") from exc
    return parse_intent_catalog(catalog_text)


__all__ = [
    "DataQueryIntent",
    "DataQueryIntentCatalog",
    "DataQueryIntentUsage",
    "ReviewStatus",
    "load_intent_catalog",
    "parse_intent_catalog",
]
