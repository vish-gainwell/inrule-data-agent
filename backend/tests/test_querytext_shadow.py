from unittest.mock import patch

from fastapi.testclient import TestClient

from inrules_data_agent.app import create_app
from inrules_data_agent.retrieval.querytext_shadow import (
    DataQueryAssignmentExample,
    StoredQueryText,
    extract_pattern,
    find_comparison_candidates,
    find_reuse_match,
    find_shadow_match,
    propose_new_data_query,
    patterns_equivalent,
)


def test_strict_match_translates_runtime_placeholder_dialect(monkeypatch):
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "true")
    generated = (
        "SELECT parameter_value FROM HRX.dbo.NDCParameters WITH (NOLOCK) "
        "WHERE parameter_name = 'MAGIC_PLAN' "
        "AND {{DateOfService}} BETWEEN effdate AND enddate"
    )
    stored = StoredQueryText(
        5,
        "MagicPlan",
        1,
        "select parameter_value from ndcparameters (nolock) "
        "where parameter_name = 'MAGIC_PLAN' "
        "and '{{:DateOfService}}' between effdate and enddate",
    )

    match = find_shadow_match(generated, (stored,))

    assert match is not None
    assert match.data_query_id == 5


def test_business_literal_difference_is_not_a_match(monkeypatch):
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "true")
    generated = (
        "SELECT parameter_value FROM HRX.dbo.NDCParameters "
        "WHERE parameter_name = 'CHIP_Indicator'"
    )
    stored = StoredQueryText(
        5,
        "MagicPlan",
        1,
        "SELECT parameter_value FROM ndcparameters WHERE parameter_name = 'MAGIC_PLAN'",
    )

    assert find_shadow_match(generated, (stored,)) is None


def test_operator_and_boolean_topology_must_match():
    equal = extract_pattern("SELECT claimid FROM claim WHERE resubclaimid = ''", 2)
    not_equal = extract_pattern("SELECT claimid FROM claim WHERE resubclaimid <> ''", 2)
    alternate = extract_pattern(
        "SELECT claimid FROM claim WHERE status = 'PAID' OR resubclaimid = ''", 2
    )
    conjunctive = extract_pattern(
        "SELECT claimid FROM claim WHERE status = 'PAID' AND resubclaimid = ''", 2
    )

    assert equal and not_equal and alternate and conjunctive
    assert not patterns_equivalent(equal, not_equal)
    assert not patterns_equivalent(alternate, conjunctive)


def test_multi_table_fragments_and_token_errors_are_ineligible():
    assert extract_pattern("SELECT c.claimid FROM claim c JOIN claimpharm p ON p.claimid=c.claimid", 2) is None
    assert extract_pattern("'DEA_Days_{{:DeaInt}}'", 1) is None
    assert extract_pattern("SELECT 'unterminated", 1) is None


def test_shadow_metadata_does_not_replace_generated_sql(monkeypatch):
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "true")
    sql = "SELECT parameter_value FROM HRX.dbo.NDCParameters WHERE parameter_name = 'MAGIC_PLAN'"
    stored = StoredQueryText(
        5,
        "MagicPlan",
        1,
        "SELECT {{:output}} FROM ndcparameters WHERE parameter_name = 'MAGIC_PLAN'",
    )
    with (
        patch(
            "inrules_data_agent.app.generate_query_result_for_step",
            return_value={"queries": [sql], "failure_category": None, "failure_reason": None},
        ),
        patch("inrules_data_agent.app.load_reuse_corpus", return_value={}),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "test",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return MAGIC_PLAN value",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["queries"] == [sql]
    assert "querytext_shadow_matches" not in result


def test_shadow_database_failure_keeps_generated_sql(monkeypatch):
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "true")
    sql = "SELECT parameter_value FROM HRX.dbo.NDCParameters WHERE parameter_name = 'MAGIC_PLAN'"
    with (
        patch(
            "inrules_data_agent.app.generate_query_result_for_step",
            return_value={"queries": [sql], "failure_category": None, "failure_reason": None},
        ),
        patch(
            "inrules_data_agent.app.load_reuse_corpus",
            side_effect=RuntimeError("ClaimEngine unavailable"),
        ),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "test",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return MAGIC_PLAN value",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["queries"] == [sql]
    assert result["reuse_decision"] == "REUSE_VALIDATION_UNAVAILABLE"
    assert result["data_query"] is None
    assert "querytext_comparison_candidates" not in result


def test_reuse_match_binds_generic_parameter_and_returns_assignment_examples():
    query = StoredQueryText(
        101,
        "NDCParams_ValueByName",
        1,
        "select {{:output}} from ndcparameters (nolock) where parameter_name = '{{:ParamName}}'",
    )
    assignment = DataQueryAssignmentExample(
        200,
        "Edit 7200",
        "ParamName=7200_LookBack_Days",
        "PARAMETER_VALUE",
        1,
        True,
        True,
    )
    generated = (
        "SELECT PARAMETER_VALUE FROM HRX.dbo.NDCParameters WITH (NOLOCK) "
        "WHERE PARAMETER_NAME = 'Medicare_Age_Years'"
    )

    match = find_reuse_match(generated, {101: (query, (assignment,))})

    assert match is not None
    assert match.data_query_id == 101
    assert match.proposed_query_params == {"ParamName": "Medicare_Age_Years"}
    assert match.proposed_return_vals == ["PARAMETER_VALUE"]
    assert match.assignment_examples[0].data_package_name == "Edit 7200"


def test_api_returns_reuse_decision_with_query_params(monkeypatch):
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "true")
    sql = (
        "SELECT PARAMETER_VALUE FROM HRX.dbo.NDCParameters WITH (NOLOCK) "
        "WHERE PARAMETER_NAME = 'Medicare_Age_Years'"
    )
    stored = StoredQueryText(
        101,
        "NDCParams_ValueByName",
        1,
        "select {{:output}} from ndcparameters (nolock) where parameter_name = '{{:ParamName}}'",
    )
    assignment = DataQueryAssignmentExample(200, "Edit 7200", "ParamName=7200_LookBack_Days", "PARAMETER_VALUE", 1, True, True)
    with (
        patch(
            "inrules_data_agent.app.generate_query_result_for_step",
            return_value={"queries": [sql], "failure_category": None, "failure_reason": None},
        ),
        patch("inrules_data_agent.app.load_reuse_corpus", return_value={101: (stored, (assignment,))}),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "9999",
                "steps": [{"step_number": 1, "business_meaning": "Get Medicare age threshold", "requires_data_query": True}],
            },
        )

    result = response.json()["step_queries"][0]
    assert result["reuse_decision"] == "REUSE_EXISTING_DATAQUERY"
    assert result["data_query"] == {
        "data_query_id": 101,
        "data_query_name": "NDCParams_ValueByName",
        "query_text": "select {{:output}} from ndcparameters (nolock) where parameter_name = '{{:ParamName}}'",
        "query_params": {"ParamName": "Medicare_Age_Years"},
        "return_vals": ["PARAMETER_VALUE"],
    }
    assert "reuse_matches" not in result
    assert "proposed_new_data_queries" not in result


def test_proposed_new_data_query_derives_runtime_params_and_return_values():
    proposal = propose_new_data_query(
        "SELECT p.PARAMETER_VALUE AS ParameterValue FROM HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "WHERE p.PARAMETER_NAME = '7200_LookBack_Days' AND {{DateOfService}} BETWEEN p.EFFDATE AND p.ENDDATE"
    )

    assert "{{:DateOfService}}" in proposal.query_text
    assert proposal.proposed_query_params == {":DateOfService": "{{DateOfService}}"}
    assert proposal.proposed_return_vals == ["ParameterValue"]


def test_reuse_match_rejects_template_with_extra_predicate():
    query = StoredQueryText(
        101,
        "NDCParams_ValueByName",
        1,
        "select {{:output}} from ndcparameters (nolock) "
        "where parameter_name = '{{:ParamName}}' and '{{:DateOfService}}' between effdate and enddate",
    )
    generated = (
        "SELECT PARAMETER_VALUE FROM HRX.dbo.NDCParameters WITH (NOLOCK) "
        "WHERE PARAMETER_NAME = 'Medicare_Age_Years'"
    )

    assert find_reuse_match(generated, {101: (query, ())}) is None


def test_same_table_candidates_show_filter_differences(monkeypatch):
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "true")
    target = "SELECT parameter_value FROM HRX.dbo.NDCParameters WHERE parameter_name = 'X' AND {{DateOfService}} BETWEEN effdate AND enddate"
    stored = StoredQueryText(
        8,
        "ParameterWithoutDates",
        1,
        "SELECT parameter_value FROM ndcparameters WHERE parameter_name = 'X'",
    )

    candidates = find_comparison_candidates(target, (stored,))

    assert len(candidates) == 1
    assert candidates[0].common_filter_columns == ("parameter_name",)
    assert candidates[0].missing_filter_columns == ("effdate", "enddate")
    assert candidates[0].strict_match is False
