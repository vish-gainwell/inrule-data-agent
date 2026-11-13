"""Unit tests for the input data query fit assessment module."""

from unittest.mock import MagicMock, patch

import pytest

from inrules_data_agent.app import Step, create_app
from inrules_data_agent.fit_assessment import (
    assess_fit,
    augment_query,
    evaluate_input_data_query,
)

MOCK_SQL = (
    "SELECT [PARAMETER_VALUE] FROM [HRX].[dbo].[NDCParameters] WITH (NOLOCK) "
    "WHERE [PARAMETER_NAME] = 'Medicare_Age_Years'"
)
AUGMENTED_SQL = (
    "SELECT [PARAMETER_VALUE] FROM [HRX].[dbo].[NDCParameters] WITH (NOLOCK) "
    "WHERE [PARAMETER_NAME] = 'Medicare_Age_Years' "
    "AND {{DateOfService}} BETWEEN [EFFDATE] AND [ENDDATE]"
)
MOCK_DDL = "CREATE TABLE [HRX].[dbo].[NDCParameters] ([PARAMETER_NAME] varchar(50), [PARAMETER_VALUE] varchar(50), [EFFDATE] datetime, [ENDDATE] datetime);"


def _mock_llm_response(content: dict):
    """Build a mock OpenAI chat completion response."""
    import json

    choice = MagicMock()
    choice.message.content = json.dumps(content)
    response = MagicMock()
    response.choices = [choice]
    return response


# --- assess_fit tests ---


def test_assess_fit_returns_fit_verdict():
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_llm_response(
        {"verdict": "FIT", "reason": "Query matches the business meaning.", "missing_params": []}
    )

    with patch("inrules_data_agent.fit_assessment._build_llm_client", return_value=(mock_client, "test-model")):
        result = assess_fit("Return the configured Medicare age threshold.", MOCK_SQL)

    assert result["verdict"] == "FIT"
    assert result["reason"] == "Query matches the business meaning."
    assert result["missing_params"] == []


def test_assess_fit_returns_partial_fit_with_missing_params():
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_llm_response({
        "verdict": "PARTIAL_FIT",
        "reason": "Missing DateOfService effective window.",
        "missing_params": ["DateOfService BETWEEN EFFDATE AND ENDDATE"],
    })

    with patch("inrules_data_agent.fit_assessment._build_llm_client", return_value=(mock_client, "test-model")):
        result = assess_fit("Return the active configured parameter for date of service.", MOCK_SQL)

    assert result["verdict"] == "PARTIAL_FIT"
    assert len(result["missing_params"]) == 1


def test_assess_fit_returns_not_fit():
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_llm_response({
        "verdict": "NOT_FIT",
        "reason": "Query retrieves a different parameter.",
        "missing_params": [],
    })

    with patch("inrules_data_agent.fit_assessment._build_llm_client", return_value=(mock_client, "test-model")):
        result = assess_fit("Count active enrollment segments for the member.", MOCK_SQL)

    assert result["verdict"] == "NOT_FIT"


def test_assess_fit_falls_back_to_fit_on_llm_failure():
    with patch("inrules_data_agent.fit_assessment._build_llm_client", side_effect=Exception("LLM unavailable")):
        result = assess_fit("Some business meaning.", MOCK_SQL)

    assert result["verdict"] == "FIT"
    assert "unavailable" in result["reason"].lower()


def test_assess_fit_treats_unexpected_verdict_as_not_fit():
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_llm_response({
        "verdict": "MAYBE",
        "reason": "Not sure.",
        "missing_params": [],
    })

    with patch("inrules_data_agent.fit_assessment._build_llm_client", return_value=(mock_client, "test-model")):
        result = assess_fit("Some meaning.", MOCK_SQL)

    assert result["verdict"] == "NOT_FIT"


# --- augment_query tests ---


def test_augment_query_returns_augmented_sql():
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_llm_response(
        {"query_text": AUGMENTED_SQL}
    )

    with patch("inrules_data_agent.fit_assessment._build_llm_client", return_value=(mock_client, "test-model")):
        result = augment_query(
            MOCK_SQL,
            "Return the active configured parameter for date of service.",
            ["DateOfService BETWEEN EFFDATE AND ENDDATE"],
            MOCK_DDL,
        )

    assert result == AUGMENTED_SQL


def test_augment_query_returns_none_on_null_response():
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_llm_response(
        {"query_text": None}
    )

    with patch("inrules_data_agent.fit_assessment._build_llm_client", return_value=(mock_client, "test-model")):
        result = augment_query(MOCK_SQL, "Some meaning.", ["missing filter"], MOCK_DDL)

    assert result is None


def test_augment_query_returns_none_on_exception():
    with patch("inrules_data_agent.fit_assessment._build_llm_client", side_effect=Exception("fail")):
        result = augment_query(MOCK_SQL, "Some meaning.", ["missing filter"], MOCK_DDL)

    assert result is None


# --- evaluate_input_data_query tests ---


def test_evaluate_returns_none_when_no_input_query():
    step = Step(step_number=1, business_meaning="Some meaning", requires_data_query=True)
    result = evaluate_input_data_query(step, "Some meaning")
    assert result is None


def test_evaluate_returns_none_when_input_query_is_empty():
    step = Step(
        step_number=1,
        business_meaning="Some meaning",
        requires_data_query=True,
        input_data_query={"query_text": ""},
    )
    result = evaluate_input_data_query(step, "Some meaning")
    assert result is None


def test_evaluate_fit_returns_reuse_decision():
    step = Step(
        step_number=1,
        business_meaning="Return the configured Medicare age threshold.",
        requires_data_query=True,
        input_data_query={"query_text": MOCK_SQL, "data_query_id": 42, "data_query_name": "DQ_MedicareAge"},
    )

    with patch("inrules_data_agent.fit_assessment.assess_fit", return_value={
        "verdict": "FIT",
        "reason": "Query matches.",
        "missing_params": [],
    }):
        result = evaluate_input_data_query(step, "Return the configured Medicare age threshold.")

    assert result is not None
    assert result["reuse_decision"] == "REUSE_INPUT_DATAQUERY"
    assert result["data_query"]["query_text"] == MOCK_SQL
    assert result["data_query"]["data_query_id"] == 42
    assert result["data_query"]["data_query_name"] == "DQ_MedicareAge"
    assert result["fit_assessment"]["verdict"] == "FIT"
    assert result["fit_assessment"]["original_query"] == MOCK_SQL
    assert result["queries"] == [MOCK_SQL]
    assert result["matched"] is True


def test_evaluate_partial_fit_augmented():
    step = Step(
        step_number=1,
        business_meaning="Return the active configured parameter for date of service.",
        requires_data_query=True,
        input_data_query={"query_text": MOCK_SQL},
    )

    with (
        patch("inrules_data_agent.fit_assessment.assess_fit", return_value={
            "verdict": "PARTIAL_FIT",
            "reason": "Missing date window.",
            "missing_params": ["DateOfService effective window"],
        }),
        patch("inrules_data_agent.fit_assessment.select_ddls", return_value=[MOCK_DDL]),
        patch("inrules_data_agent.fit_assessment.augment_query", return_value=AUGMENTED_SQL),
    ):
        result = evaluate_input_data_query(
            step, "Return the active configured parameter for date of service."
        )

    assert result is not None
    assert result["reuse_decision"] == "REUSE_INPUT_DATAQUERY_AUGMENTED"
    assert result["data_query"]["query_text"] == AUGMENTED_SQL
    assert result["fit_assessment"]["verdict"] == "PARTIAL_FIT"
    assert result["fit_assessment"]["original_query"] == MOCK_SQL
    assert result["queries"] == [AUGMENTED_SQL]


def test_evaluate_partial_fit_augmentation_fails_falls_through():
    step = Step(
        step_number=1,
        business_meaning="Some meaning.",
        requires_data_query=True,
        input_data_query={"query_text": MOCK_SQL},
    )

    with (
        patch("inrules_data_agent.fit_assessment.assess_fit", return_value={
            "verdict": "PARTIAL_FIT",
            "reason": "Missing filter.",
            "missing_params": ["some filter"],
        }),
        patch("inrules_data_agent.fit_assessment.select_ddls", return_value=[MOCK_DDL]),
        patch("inrules_data_agent.fit_assessment.augment_query", return_value=None),
    ):
        result = evaluate_input_data_query(step, "Some meaning.")

    assert result is None


def test_evaluate_partial_fit_no_ddl_falls_through():
    step = Step(
        step_number=1,
        business_meaning="Some meaning.",
        requires_data_query=True,
        input_data_query={"query_text": MOCK_SQL},
    )

    with (
        patch("inrules_data_agent.fit_assessment.assess_fit", return_value={
            "verdict": "PARTIAL_FIT",
            "reason": "Missing filter.",
            "missing_params": ["some filter"],
        }),
        patch("inrules_data_agent.fit_assessment.select_ddls", return_value=[]),
    ):
        result = evaluate_input_data_query(step, "Some meaning.")

    assert result is None


def test_evaluate_not_fit_falls_through():
    step = Step(
        step_number=1,
        business_meaning="Count enrollment segments.",
        requires_data_query=True,
        input_data_query={"query_text": MOCK_SQL},
    )

    with patch("inrules_data_agent.fit_assessment.assess_fit", return_value={
        "verdict": "NOT_FIT",
        "reason": "Query retrieves a different parameter.",
        "missing_params": [],
    }):
        result = evaluate_input_data_query(step, "Count enrollment segments.")

    assert result is None


def test_evaluate_accepts_string_input_data_query():
    step = Step(
        step_number=1,
        business_meaning="Return the threshold.",
        requires_data_query=True,
        input_data_query=MOCK_SQL,
    )

    with patch("inrules_data_agent.fit_assessment.assess_fit", return_value={
        "verdict": "FIT",
        "reason": "Matches.",
        "missing_params": [],
    }):
        result = evaluate_input_data_query(step, "Return the threshold.")

    assert result is not None
    assert result["reuse_decision"] == "REUSE_INPUT_DATAQUERY"
    assert result["data_query"]["data_query_id"] is None
