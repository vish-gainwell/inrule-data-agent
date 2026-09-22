from __future__ import annotations

import hashlib
import logging
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from importlib import resources
from typing import Any

import yaml

logger = logging.getLogger(__name__)
SEMANTIC_HINT_HEADER = "SUPPLEMENTAL SEMANTIC CONTEXT (bounded; lower priority):"
_RESOURCE = "concepts.v1.yaml"
_TRUE = {"1", "true", "yes", "on"}
_FALSE = {"0", "false", "no", "off"}


@dataclass(frozen=True)
class SemanticConcept:
    concept_id: str
    version: str
    required_phrases: tuple[str, ...]
    missing_detail: str


@dataclass(frozen=True)
class SemanticHintDecision:
    enabled: bool
    reason: str
    concept_id: str | None = None
    concept_version: str | None = None
    missing_detail: str = ""
    matched_required_phrases: tuple[str, ...] = ()
    hint_hash: str | None = None
    hint_length: int = 0
    semantic_hint_injected: bool = False
    semantic_context_section: str | None = None
    semantic_injection_position: str | None = None
    configuration_error: str | None = None
    catalog_error_type: str | None = None


def _configured() -> tuple[bool, str | None]:
    value = os.environ.get("SEMANTIC_QUERY_HINTS_ENABLED", "true").strip().lower()
    if value in _TRUE:
        return True, None
    if value in _FALSE:
        return False, None
    return False, (
        "Invalid SEMANTIC_QUERY_HINTS_ENABLED value; semantic hints were disabled. "
        "Use true/false, 1/0, yes/no, or on/off."
    )


def _strings(value: Any, field: str) -> tuple[str, ...]:
    if not isinstance(value, list) or not value or not all(
        isinstance(item, str) and item.strip() for item in value
    ):
        raise ValueError(f"{field} must be a non-empty string list")
    return tuple(item.strip() for item in value)


@lru_cache(maxsize=1)
def load_semantic_hints() -> tuple[SemanticConcept, ...]:
    payload = yaml.safe_load(
        resources.files(__package__).joinpath(_RESOURCE).read_text(encoding="utf-8")
    )
    if not isinstance(payload, dict) or payload.get("schema_version") != 1:
        raise ValueError("semantic hint catalog schema_version must be 1")
    raw_concepts = payload.get("concepts")
    if not isinstance(raw_concepts, list) or not raw_concepts:
        raise ValueError("semantic hint catalog concepts must be a non-empty list")

    concepts: list[SemanticConcept] = []
    seen: set[str] = set()
    for index, raw in enumerate(raw_concepts):
        if not isinstance(raw, dict):
            raise ValueError(f"concepts[{index}] must be a mapping")
        applies_when = raw.get("applies_when")
        semantic_hint = raw.get("semantic_hint")
        if not isinstance(applies_when, dict):
            raise ValueError(f"concepts[{index}].applies_when must be a mapping")
        if not isinstance(semantic_hint, dict):
            raise ValueError(f"concepts[{index}].semantic_hint must be a mapping")

        identity = _strings([raw.get("id"), raw.get("version")], f"concepts[{index}] identity")
        if identity[0] in seen:
            raise ValueError(f"duplicate semantic concept id: {identity[0]}")
        seen.add(identity[0])
        concepts.append(
            SemanticConcept(
                concept_id=identity[0],
                version=identity[1],
                required_phrases=_strings(
                    applies_when.get("required_phrases"),
                    f"concepts[{index}].applies_when.required_phrases",
                ),
                missing_detail=_strings(
                    [semantic_hint.get("missing_detail")],
                    f"concepts[{index}].semantic_hint.missing_detail",
                )[0],
            )
        )
    return tuple(concepts)


def _normalize(text: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", text.casefold()))


def _contains_phrase(normalized_text: str, phrase: str) -> bool:
    normalized_phrase = _normalize(phrase)
    return bool(normalized_phrase and f" {normalized_phrase} " in f" {normalized_text} ")


def select_semantic_hint(business_meaning: str) -> SemanticHintDecision:
    enabled, configuration_error = _configured()
    if configuration_error:
        return SemanticHintDecision(
            enabled=False,
            reason="invalid_configuration",
            configuration_error=configuration_error,
        )
    if not enabled:
        return SemanticHintDecision(enabled=False, reason="disabled")

    try:
        concepts = load_semantic_hints()
    except Exception as exc:
        return SemanticHintDecision(
            enabled=False,
            reason="invalid_catalog",
            catalog_error_type=type(exc).__name__,
        )

    meaning = _normalize(business_meaning)
    phrase_matches = [
        (concept, tuple(
            phrase for phrase in concept.required_phrases
            if _contains_phrase(meaning, phrase)
        ))
        for concept in concepts
    ]
    applicable = [
        (concept, matched)
        for concept, matched in phrase_matches
        if len(matched) == len(concept.required_phrases)
    ]
    if not applicable:
        matched = tuple(dict.fromkeys(
            phrase
            for _, concept_matches in phrase_matches
            for phrase in concept_matches
        ))
        return SemanticHintDecision(
            enabled=True,
            reason="no_match",
            matched_required_phrases=matched,
        )
    if len(applicable) != 1:
        return SemanticHintDecision(enabled=True, reason="ambiguous")

    concept, matched = applicable[0]
    return SemanticHintDecision(
        enabled=True,
        reason="selected",
        concept_id=concept.concept_id,
        concept_version=concept.version,
        missing_detail=concept.missing_detail,
        matched_required_phrases=matched,
        hint_hash=hashlib.sha256(concept.missing_detail.encode("utf-8")).hexdigest(),
        hint_length=len(concept.missing_detail),
    )


def log_semantic_hint_decision(decision: SemanticHintDecision) -> None:
    log = logger.warning if (
        decision.configuration_error or decision.catalog_error_type
    ) else logger.info
    log(
        "semantic_hint_decision",
        extra={
            "semantic_mode_enabled": decision.enabled,
            "semantic_concept_id": decision.concept_id,
            "semantic_concept_version": decision.concept_version,
            "semantic_decision_reason": decision.reason,
            "semantic_configuration_error": decision.configuration_error,
            "semantic_catalog_error_type": decision.catalog_error_type,
            "semantic_matched_required_phrases": decision.matched_required_phrases,
            "semantic_hint_hash": decision.hint_hash,
            "semantic_hint_length": decision.hint_length,
            "semantic_hint_injected": decision.semantic_hint_injected,
            "semantic_context_section": decision.semantic_context_section,
            "semantic_injection_position": decision.semantic_injection_position,
        },
    )


__all__ = [
    "SEMANTIC_HINT_HEADER",
    "load_semantic_hints",
    "log_semantic_hint_decision",
    "select_semantic_hint",
]
