import hashlib
import logging
import re
from dataclasses import replace
from importlib import resources

import pytest
import yaml

import inrules_data_agent.semantic_query_hints as semantic  # pyright: ignore[reportMissingImports]
from inrules_data_agent.generator.generate import _build_user_message  # pyright: ignore[reportMissingImports]
from inrules_data_agent.semantic_query_hints import (  # pyright: ignore[reportMissingImports]
    SEMANTIC_HINT_HEADER,
    load_semantic_hints,
    select_semantic_hint,
)

REQUIRED_PHRASES = ("other payer reject code", "valid ncpdp reject code")
MISSING_DETAIL = (
    "When validating the reject-code record, also require the date of service to fall "
    "inclusively within that record's effective and term dates."
)
MEANING = (
    "Determine whether each submitted Other Payer Reject Code is a valid NCPDP reject code "
    "in the master."
)
APPROVED_LIST_REQUIRED_PHRASES = (
    "other payer reject codes",
    "approved",
    "reject code list",
)
APPROVED_LIST_MISSING_DETAIL = (
    "Only approved reject-code entries effective on the claim’s date of service are valid."
)
APPROVED_LIST_MEANING = (
    "For the COB reject-code scope evaluated by the reject-count gate, none of the submitted "
    "Other Payer Reject Codes is in the approved NDCParameters Reject_Code list."
)
ICD10_REQUIRED_PHRASES = ("diagnosis code", "icd-10", "matching", "reference")
ICD10_MISSING_DETAIL = (
    "When validating an ICD-10 diagnosis code, match using its first four characters rather "
    "than requiring exact full-code equality."
)
ICD10_I255_MEANING = (
    "At least one submitted diagnosis code occurrence has no matching active ICD-10 "
    "diagnosis-code reference row for the claim date of service."
)


@pytest.fixture(autouse=True)
def enable_semantic_hints(monkeypatch):
    monkeypatch.setenv("SEMANTIC_QUERY_HINTS_ENABLED", "true")


def test_packaged_schema_separates_applicability_from_sme_detail():
    resource = resources.files("inrules_data_agent.semantic_query_hints").joinpath(
        "concepts.v1.yaml"
    )
    payload = yaml.safe_load(resource.read_text(encoding="utf-8"))
    load_semantic_hints.cache_clear()
    concepts = load_semantic_hints()

    assert resource.is_file()
    assert payload["schema_version"] == 1
    assert len(payload["concepts"]) == len(concepts) == 3
    raw = payload["concepts"][0]
    concept = concepts[0]

    assert set(raw) == {"id", "version", "applies_when", "semantic_hint"}
    assert raw["id"] == concept.concept_id == "reject-code-dos-effective-validity"
    assert raw["version"] == concept.version == "1.1.2"
    assert raw["applies_when"] == {
        "required_phrases": list(REQUIRED_PHRASES),
        "provenance": {
            "workbook": "DataQuery_EVAL_072926.xlsx",
            "references": [
                "Edit Review!N42:O42",
                "Rule Steps!K162",
                "Data Queries!H161",
            ],
        },
    }
    assert raw["semantic_hint"] == {
        "missing_detail": MISSING_DETAIL,
        "provenance": {
            "workbook": "DataQuery_EVAL_072926.xlsx",
            "reference": "Data Queries!Q161:R161",
            "excerpt": "GT Query validates DOS between EFF and Term dates.",
        },
        "corroboration": {
            "workbook": "IL_DataQuery_GroundTruth_08042026.xlsx",
            "reference": "Sheet1!V160",
        },
    }
    assert concept.required_phrases == REQUIRED_PHRASES
    assert concept.missing_detail == MISSING_DETAIL


def test_packaged_approved_list_concept_uses_authoritative_applicability():
    resource = resources.files("inrules_data_agent.semantic_query_hints").joinpath(
        "concepts.v1.yaml"
    )
    payload = yaml.safe_load(resource.read_text(encoding="utf-8"))
    raw = payload["concepts"][1]
    concept = load_semantic_hints()[1]

    assert raw["id"] == concept.concept_id == "approved-reject-code-dos-validity"
    assert raw["version"] == concept.version == "1.0.0"
    assert raw["applies_when"] == {
        "required_phrases": list(APPROVED_LIST_REQUIRED_PHRASES),
        "provenance": {
            "workbook": "DataQuery_EVAL_072926.xlsx",
            "references": [
                "Edit Review!N35:O35",
                "Data Queries!H119",
                "Data Queries!L119",
            ],
        },
    }
    assert raw["semantic_hint"] == {
        "missing_detail": APPROVED_LIST_MISSING_DETAIL,
        "provenance": {
            "workbook": "DataQuery_EVAL_072926.xlsx",
            "reference": "Data Queries!Q119:R119",
            "excerpt": "GT Query validates DOS between EFF and Term dates.",
        },
        "corroboration": {
            "workbook": "IL_DataQuery_GroundTruth_08042026.xlsx",
            "references": ["Sheet1!P204", "Sheet1!V204"],
        },
    }
    assert concept.required_phrases == APPROVED_LIST_REQUIRED_PHRASES
    assert concept.missing_detail == APPROVED_LIST_MISSING_DETAIL


def test_packaged_icd10_concept_is_ground_truth_backed_and_business_only():
    resource = resources.files("inrules_data_agent.semantic_query_hints").joinpath(
        "concepts.v1.yaml"
    )
    catalog_text = resource.read_text(encoding="utf-8")
    raw = yaml.safe_load(catalog_text)["concepts"][2]
    concept = load_semantic_hints()[2]

    assert "7528" not in catalog_text

    assert raw["id"] == concept.concept_id == "icd10-four-character-reference-match"
    assert raw["version"] == concept.version == "1.0.0"
    assert raw["applies_when"]["required_phrases"] == list(ICD10_REQUIRED_PHRASES)
    assert raw["applies_when"]["provenance"]["evidence_status"] == "ground_truth_backed"
    assert raw["applies_when"]["provenance"]["requires_sme_confirmation"] is True
    assert raw["semantic_hint"]["missing_detail"] == ICD10_MISSING_DETAIL
    assert raw["semantic_hint"]["provenance"]["evidence_status"] == "ground_truth_backed"
    assert raw["semantic_hint"]["provenance"]["requires_sme_confirmation"] is True
    assert concept.required_phrases == ICD10_REQUIRED_PHRASES
    assert concept.missing_detail == ICD10_MISSING_DETAIL


def test_catalog_prompt_content_has_no_operational_implementation_details():
    prompt_content = " ".join(
        value
        for concept in load_semantic_hints()
        for value in (*concept.required_phrases, concept.missing_detail)
    )
    forbidden_identifiers = (
        "HRX", "dbo", "NCPDP_Reject_Codes", "reject_code", "effdate", "termdate",
        "DateOfService", "SubmittedOtherPayerRejectCodes", "{{", "[[", "7046", "7258",
    )

    assert not any(item.casefold() in prompt_content.casefold() for item in forbidden_identifiers)
    assert not re.search(r"\b(table|column|runtime|edit|select|from|join|where|output)\b", prompt_content, re.I)


@pytest.mark.parametrize(
    ("meaning", "expected_reason", "matched"),
    [
        (MEANING, "selected", REQUIRED_PHRASES),
        ("OTHER-PAYER REJECT CODE is a VALID NCPDP REJECT-CODE.", "selected", REQUIRED_PHRASES),
        ("Validate an other payer reject code.", "no_match", REQUIRED_PHRASES[:1]),
        ("Determine whether this is a valid NCPDP reject code.", "no_match", REQUIRED_PHRASES[1:]),
        (
            "Other payer submitted reject code must be a valid NCPDP reject code.",
            "no_match",
            REQUIRED_PHRASES[1:],
        ),
        (
            "Other payer reject code must be a valid NCPDP submitted reject code.",
            "no_match",
            REQUIRED_PHRASES[:1],
        ),
        (
            "Other Payer values include a Reject Code; determine whether it is a valid "
            "NCPDP submitted reject code.",
            "no_match",
            (),
        ),
    ],
)
def test_all_exact_requirement_phrases_are_required_contiguously(meaning, expected_reason, matched):
    decision = select_semantic_hint(meaning)

    assert decision.reason == expected_reason
    assert decision.matched_required_phrases == matched
    assert bool(decision.missing_detail) is (expected_reason == "selected")


@pytest.mark.parametrize(
    ("meaning", "expected_reason", "matched"),
    [
        (APPROVED_LIST_MEANING, "selected", APPROVED_LIST_REQUIRED_PHRASES),
        (
            "OTHER-PAYER REJECT-CODES are in the APPROVED NDCParameters REJECT_CODE LIST.",
            "selected",
            APPROVED_LIST_REQUIRED_PHRASES,
        ),
        (
            "Other Payer Reject Codes are in the approved configuration.",
            "no_match",
            APPROVED_LIST_REQUIRED_PHRASES[:2],
        ),
        (
            "The approved Reject Code list is used for COB validation.",
            "no_match",
            APPROVED_LIST_REQUIRED_PHRASES[1:],
        ),
        (
            "Other Payer submitted Reject Codes are in the approved Reject Code list.",
            "no_match",
            APPROVED_LIST_REQUIRED_PHRASES[1:],
        ),
    ],
)
def test_approved_list_requires_all_exact_phrases_contiguously(
    meaning, expected_reason, matched
):
    decision = select_semantic_hint(meaning)

    assert decision.reason == expected_reason
    assert decision.matched_required_phrases == matched
    assert bool(decision.missing_detail) is (expected_reason == "selected")


@pytest.mark.parametrize(
    "meaning",
    [
        ICD10_I255_MEANING,
        (
            "Validate the diagnosis code by matching its ICD-10 value to an active "
            "reference entry."
        ),
    ],
)
def test_icd10_reference_meanings_select_four_character_hint(meaning):
    decision = select_semantic_hint(meaning)

    assert decision.reason == "selected"
    assert decision.concept_id == "icd10-four-character-reference-match"
    assert decision.matched_required_phrases == ICD10_REQUIRED_PHRASES
    assert decision.missing_detail == ICD10_MISSING_DETAIL


def test_unrelated_icd10_retrieval_does_not_select_four_character_hint():
    decision = select_semantic_hint(
        "Retrieve ICD-10 diagnosis code descriptions for display from the reference catalog."
    )

    assert decision.reason == "no_match"
    assert not decision.missing_detail


def test_description_and_acceptance_criteria_cannot_activate_hint():
    message = _build_user_message(
        "Return one unrelated value.",
        "CREATE TABLE [Any].[dbo].[Table] ([Value] int);",
        description=MEANING,
        acceptance_criteria=[MEANING],
    )

    assert SEMANTIC_HINT_HEADER not in message

    approved_list_message = _build_user_message(
        "Return one unrelated value.",
        "CREATE TABLE [Any].[dbo].[Table] ([Value] int);",
        description=APPROVED_LIST_MEANING,
        acceptance_criteria=[APPROVED_LIST_MEANING],
    )
    assert SEMANTIC_HINT_HEADER not in approved_list_message

    icd10_message = _build_user_message(
        "Return one unrelated value.",
        "CREATE TABLE [Any].[dbo].[Table] ([Value] int);",
        description=ICD10_I255_MEANING,
        acceptance_criteria=[ICD10_I255_MEANING],
    )
    assert SEMANTIC_HINT_HEADER not in icd10_message


def test_icd10_supplemental_section_contains_only_business_missing_detail():
    message = _build_user_message(
        ICD10_I255_MEANING,
        "CREATE TABLE [IPA].[dbo].[DiagCode] ([codeid] char(8));",
        description="Missing or invalid diagnosis.",
        acceptance_criteria="Use the active diagnosis reference for the claim date.",
    )
    supplemental = message[
        message.index(SEMANTIC_HINT_HEADER) : message.index(
            "DIRECTLY REFERENCED ACCEPTANCE CRITERIA"
        )
    ]

    assert supplemental == f"{SEMANTIC_HINT_HEADER}\n{ICD10_MISSING_DETAIL}\n\n"
    forbidden = (
        "7528", "IPA", "DiagCode", "codeid", "table", "column", "runtime",
        "output", "SUBSTRING", "LEFT(", "SELECT", "FROM", "WHERE", "{{", "[[",
    )
    assert not any(value.casefold() in supplemental.casefold() for value in forbidden)


def test_approved_list_hint_is_injected_once_at_the_existing_boundary():
    message = _build_user_message(
        APPROVED_LIST_MEANING,
        "CREATE TABLE [HRX].[dbo].[NDCParameters] ([PARAMETER_VALUE] nvarchar(100));",
        description="Invalid Other Payer Reject Code.",
        acceptance_criteria="Return the configured values.",
    )

    assert message.index(SEMANTIC_HINT_HEADER) < message.index(
        "DIRECTLY REFERENCED ACCEPTANCE CRITERIA"
    ) < message.index("CURRENT DATA QUERY BUSINESS MEANING")
    assert message.endswith(APPROVED_LIST_MEANING)
    supplemental = message[
        message.index(SEMANTIC_HINT_HEADER) : message.index(
            "DIRECTLY REFERENCED ACCEPTANCE CRITERIA"
        )
    ]
    assert supplemental.count(APPROVED_LIST_MISSING_DETAIL) == 1


def test_multiple_matching_concepts_safely_omit_hint(monkeypatch):
    concept = load_semantic_hints()[0]
    monkeypatch.setattr(
        semantic,
        "load_semantic_hints",
        lambda: (concept, replace(concept, concept_id="second-concept")),
    )

    decision = select_semantic_hint(MEANING)

    assert decision.reason == "ambiguous"
    assert not decision.missing_detail


def test_disabled_and_invalid_environment_values_safely_omit_hints(monkeypatch, caplog):
    caplog.set_level(logging.INFO, logger=semantic.__name__)
    monkeypatch.setenv("SEMANTIC_QUERY_HINTS_ENABLED", "false")
    disabled_message = _build_user_message(MEANING, "SECRET DDL CONTEXT")
    disabled_record = next(
        item for item in caplog.records if item.message == "semantic_hint_decision"
    )

    assert SEMANTIC_HINT_HEADER not in disabled_message
    assert disabled_record.semantic_decision_reason == "disabled"
    assert disabled_record.semantic_hint_injected is False
    assert disabled_record.semantic_context_section is None
    assert disabled_record.semantic_injection_position is None

    caplog.clear()
    monkeypatch.setenv("SEMANTIC_QUERY_HINTS_ENABLED", "sometimes")
    message = _build_user_message(MEANING, "SECRET DDL CONTEXT")

    assert SEMANTIC_HINT_HEADER not in message
    record = next(item for item in caplog.records if item.message == "semantic_hint_decision")
    assert record.semantic_decision_reason == "invalid_configuration"
    assert record.semantic_hint_injected is False
    assert record.semantic_context_section is None
    assert record.semantic_injection_position is None
    assert "Use true/false" in record.semantic_configuration_error


def test_catalog_failure_safely_uses_baseline_prompt_and_sanitized_log(monkeypatch, caplog):
    load_semantic_hints.cache_clear()
    caplog.set_level(logging.WARNING, logger=semantic.__name__)

    def fail_catalog_load():
        raise yaml.YAMLError("SECRET YAML CONTENT AT C:/private/catalog.yaml")

    with monkeypatch.context() as catalog_patch:
        catalog_patch.setattr(semantic, "load_semantic_hints", fail_catalog_load)
        message = _build_user_message(MEANING, "SAFE DDL CONTEXT")

    semantic.load_semantic_hints.cache_clear()
    recovered = select_semantic_hint(MEANING)
    record = next(item for item in caplog.records if item.message == "semantic_hint_decision")

    assert SEMANTIC_HINT_HEADER not in message
    assert message.endswith(MEANING)
    assert record.semantic_mode_enabled is False
    assert record.semantic_decision_reason == "invalid_catalog"
    assert record.semantic_catalog_error_type == "YAMLError"
    assert record.semantic_matched_required_phrases == ()
    assert record.semantic_hint_injected is False
    assert record.semantic_context_section is None
    assert record.semantic_injection_position is None
    serialized = repr(record.__dict__)
    assert "SECRET YAML CONTENT" not in serialized
    assert "private/catalog.yaml" not in serialized
    assert "SAFE DDL CONTEXT" not in serialized
    assert recovered.reason == "selected"
    assert recovered.missing_detail == MISSING_DETAIL


def test_structured_decision_logging_is_sanitized(caplog):
    caplog.set_level(logging.INFO, logger=semantic.__name__)
    business_meaning = f"{MEANING} FULL PRIVATE BUSINESS MEANING"

    _build_user_message(
        business_meaning,
        "SELECT SecretColumn FROM SecretEvidence;",
        description="PRIVATE WORKBOOK DESCRIPTION",
        acceptance_criteria="PRIVATE ACCEPTANCE CRITERIA AND EVIDENCE EXCERPT",
    )

    record = next(item for item in caplog.records if item.message == "semantic_hint_decision")
    assert record.semantic_mode_enabled is True
    assert record.semantic_concept_id == "reject-code-dos-effective-validity"
    assert record.semantic_concept_version == "1.1.2"
    assert record.semantic_decision_reason == "selected"
    assert record.semantic_matched_required_phrases == REQUIRED_PHRASES
    assert record.semantic_hint_hash == hashlib.sha256(MISSING_DETAIL.encode()).hexdigest()
    assert record.semantic_hint_length == len(MISSING_DETAIL)
    assert record.semantic_hint_injected is True
    assert record.semantic_context_section == "SUPPLEMENTAL SEMANTIC CONTEXT"
    assert record.semantic_injection_position == (
        "before_acceptance_criteria_and_authoritative_business_meaning"
    )
    serialized = repr(record.__dict__)
    forbidden = (
        business_meaning,
        "SecretEvidence",
        "SecretColumn",
        "SELECT",
        "PRIVATE WORKBOOK DESCRIPTION",
        "PRIVATE ACCEPTANCE CRITERIA AND EVIDENCE EXCERPT",
        MISSING_DETAIL,
        "DataQuery_EVAL_072926.xlsx",
    )
    assert not any(value in serialized for value in forbidden)

    caplog.clear()
    _build_user_message(
        "FULL UNMATCHED PRIVATE BUSINESS MEANING",
        "SELECT OtherSecret FROM WorkbookEvidence;",
        description="PRIVATE NO-MATCH DESCRIPTION",
        acceptance_criteria="PRIVATE NO-MATCH ACCEPTANCE CRITERIA",
    )
    no_match_record = next(
        item for item in caplog.records if item.message == "semantic_hint_decision"
    )
    assert no_match_record.semantic_decision_reason == "no_match"
    assert no_match_record.semantic_hint_injected is False
    assert no_match_record.semantic_context_section is None
    assert no_match_record.semantic_injection_position is None
    no_match_serialized = repr(no_match_record.__dict__)
    assert not any(
        value in no_match_serialized
        for value in (
            "FULL UNMATCHED PRIVATE BUSINESS MEANING",
            "OtherSecret",
            "WorkbookEvidence",
            "PRIVATE NO-MATCH DESCRIPTION",
            "PRIVATE NO-MATCH ACCEPTANCE CRITERIA",
        )
    )


def test_prompt_orders_and_bounds_exact_missing_detail():
    criterion = "Use explicit current instructions for mapping and output."
    message = _build_user_message(
        MEANING,
        "CREATE TABLE [Any].[dbo].[RejectRecords] ([Code] varchar(3));",
        description="Validate supplied codes.",
        acceptance_criteria=criterion,
    )

    assert message.index(SEMANTIC_HINT_HEADER) < message.index(
        "DIRECTLY REFERENCED ACCEPTANCE CRITERIA"
    ) < message.index("CURRENT DATA QUERY BUSINESS MEANING")
    assert message.endswith(MEANING)
    assert "may fill only an omitted, compatible detail" in message
    assert "Explicit current details always win" in message
    supplemental = message[
        message.index(SEMANTIC_HINT_HEADER) : message.index(
            "DIRECTLY REFERENCED ACCEPTANCE CRITERIA"
        )
    ]
    assert supplemental.count(MISSING_DETAIL) == 1
    assert "workbook" not in supplemental.casefold()
