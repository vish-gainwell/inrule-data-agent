from types import SimpleNamespace
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
    load_reuse_corpus,
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


def test_reuse_match_treats_rtrimmed_column_equality_as_equivalent():
    query = StoredQueryText(
        101,
        "NDCParams_ValueByName",
        1,
        "select {{:output}} from ndcparameters (nolock) "
        "where parameter_name = '{{:ParamName}}'",
    )
    generated = (
        "SELECT p.parameter_value AS ReversalDaysThreshold "
        "FROM HRX.dbo.NDCParameters AS p WITH (NOLOCK) "
        "WHERE RTRIM(p.parameter_name) = '7013_Reversal_Days'"
    )

    match = find_reuse_match(generated, {101: (query, ())})

    assert match is not None
    assert match.proposed_query_params == {"ParamName": "7013_Reversal_Days"}


def test_rtrim_normalization_does_not_hide_additional_predicates():
    query = StoredQueryText(
        101,
        "NDCParams_ValueByName",
        1,
        "select {{:output}} from ndcparameters (nolock) "
        "where parameter_name = '{{:ParamName}}'",
    )
    generated = (
        "SELECT p.parameter_value FROM HRX.dbo.NDCParameters AS p WITH (NOLOCK) "
        "WHERE RTRIM(p.parameter_name) = 'X' AND p.effdate <= GETDATE()"
    )

    assert find_reuse_match(generated, {101: (query, ())}) is None


def test_carrier_member_history_path_does_not_reuse_direct_enrollkeys_lookup():
    direct = StoredQueryText(
        7178,
        "EnrollKeys_ByCarrierMemId",
        2,
        "select {{:output}} from enrollkeys (nolock) "
        "where carriermemid = '{{:CardholderId}}'",
    )
    history_sql = (
        "SELECT TOP (1) RTRIM(ek.memid) AS MemberId "
        "FROM plandata_rx_production.dbo.carriermemidhistory cmh WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.enrollkeys ek WITH (NOLOCK) "
        "ON ek.enrollid = cmh.enrollid "
        "WHERE RTRIM(cmh.carriermemid) = {{CardholderId}} "
        "ORDER BY ek.segtype DESC, ek.termdate DESC, ek.effdate ASC"
    )

    assert find_reuse_match(history_sql, {7178: (direct, ())}) is None


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
    assert result["data_query"] == {
        "data_query_id": None,
        "data_query_name": None,
        "query_text": (
            "SELECT {{:output}} FROM HRX.dbo.NDCParameters "
            "WHERE parameter_name = '{{:ParamName}}'"
        ),
        "query_params": {
            ":output": "parameter_value",
            ":ParamName": "MAGIC_PLAN",
        },
        "return_vals": ["parameter_value"],
    }
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


def test_reuse_match_binds_runtime_value_to_stored_parameter():
    query = StoredQueryText(
        102,
        "NDC_ByKey",
        1,
        "select {{:output}} from NDC_Mstr (nolock) where NDCKey = '{{:Ndckey}}'",
    )
    generated = (
        "SELECT NDCKey FROM HRX.dbo.NDC_Mstr WITH (NOLOCK) "
        "WHERE NDCKey = {{ClaimTransaction.Ndc}}"
    )

    match = find_reuse_match(generated, {102: (query, ())})

    assert match is not None
    assert match.proposed_query_params == {"Ndckey": "{{ClaimTransaction.Ndc}}"}


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


def test_proposed_new_data_query_derives_runtime_literal_output_and_return_contract():
    proposal = propose_new_data_query(
        "SELECT p.PARAMETER_VALUE AS ParameterValue FROM HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "WHERE p.PARAMETER_NAME = '7200_LookBack_Days' AND {{DateOfService}} BETWEEN p.EFFDATE AND p.ENDDATE"
    )

    assert "SELECT {{:output}} FROM" in proposal.query_text
    assert "p.PARAMETER_NAME = '{{:ParamName}}'" in proposal.query_text
    assert "{{:DateOfService}}" in proposal.query_text
    assert proposal.proposed_query_params == {
        ":output": "p.PARAMETER_VALUE",
        ":ParamName": "7200_LookBack_Days",
        ":DateOfService": "{{DateOfService}}",
    }
    assert proposal.proposed_return_vals == ["ParameterValue"]


def test_proposed_parameter_only_query_parameterizes_literal_return_values():
    proposal = propose_new_data_query(
        "SELECT {{ProviderId}} AS ProviderId, {{DateOfService}} AS DateOfService, "
        "'MSCD00000000102' AS ExceptionAttributeCode, 'S' AS ExceptionAttributeValue"
    )

    assert "{{:ProviderId}} AS ProviderId" in proposal.query_text
    assert "'{{:ExceptionAttributeCode}}' AS ExceptionAttributeCode" in proposal.query_text
    assert "'{{:ExceptionAttributeValue}}' AS ExceptionAttributeValue" in proposal.query_text
    assert proposal.proposed_query_params == {
        ":ExceptionAttributeCode": "MSCD00000000102",
        ":ExceptionAttributeValue": "S",
        ":ProviderId": "{{ProviderId}}",
        ":DateOfService": "{{DateOfService}}",
    }
    assert proposal.proposed_return_vals == [
        "ProviderId",
        "DateOfService",
        "ExceptionAttributeCode",
        "ExceptionAttributeValue",
    ]


def test_proposed_drug_override_query_parameterizes_assignment_and_runtime_values():
    proposal = propose_new_data_query(
        "SELECT COUNT(*) AS ExclusionOverrideCount "
        "FROM HRX.dbo.DrugOverrides AS o WITH (NOLOCK) "
        "WHERE o.Type = '7672_Excluded' "
        "AND (o.NDCKey = {{ClaimTransaction.Ndc}} "
        "OR o.GCN_SeqNo = {{ClaimRequest.DrugRequested.GCNSeqNo.Code}} "
        "OR o.HIC3 = {{ClaimRequest.DrugRequested.HIC3.Code}}) "
        "AND {{DateOfService}} BETWEEN o.EffDate AND o.TermDate"
    )

    assert "SELECT {{:output}} FROM" in proposal.query_text
    assert "o.Type = '{{:DrugOverrideType}}'" in proposal.query_text
    assert "o.NDCKey = {{:Ndc}}" in proposal.query_text
    assert proposal.proposed_query_params == {
        ":output": "COUNT(*)",
        ":DrugOverrideType": "7672_Excluded",
        ":Ndc": "{{ClaimTransaction.Ndc}}",
        ":GcnSeqNo": "{{ClaimRequest.DrugRequested.GCNSeqNo.Code}}",
        ":Hic3": "{{ClaimRequest.DrugRequested.HIC3.Code}}",
        ":DateOfService": "{{DateOfService}}",
    }
    assert proposal.proposed_return_vals == ["ExclusionOverrideCount"]


def test_proposed_query_parameterizes_in_lists_and_runtime_comparison_values():
    proposal = propose_new_data_query(
        "SELECT c.claimid AS ClaimId FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "WHERE RTRIM(c.status) IN ('PAID', 'WAITPAY', 'PAY') "
        "AND np.PARAMETER_VALUE IN ('I', 'D', 'L', 'W', 'N') "
        "AND {{CompoundIndicator}} = '1' "
        "AND RTRIM(c.resubclaimid) = ''"
    )

    assert "RTRIM(c.status) IN ([[:Statuses]])" in proposal.query_text
    assert "np.PARAMETER_VALUE IN ([[:ParameterValues]])" in proposal.query_text
    assert "{{:CompoundIndicator}} = '{{:ExpectedCompoundIndicator}}'" in proposal.query_text
    assert "RTRIM(c.resubclaimid) = ''" in proposal.query_text
    assert proposal.proposed_query_params[":Statuses"] == ["PAID", "WAITPAY", "PAY"]
    assert proposal.proposed_query_params[":ParameterValues"] == ["I", "D", "L", "W", "N"]
    assert proposal.proposed_query_params[":CompoundIndicator"] == "{{CompoundIndicator}}"
    assert proposal.proposed_query_params[":ExpectedCompoundIndicator"] == "1"


def test_reuse_corpus_falls_back_to_templates_without_assignment_permissions():
    class PermissionDenied(Exception):
        pass

    class FakeCursor:
        rows = []

        def execute(self, sql):
            if "DataPackageDataQuery" in sql:
                raise PermissionDenied("SELECT permission denied")
            self.rows = [
                (
                    68,
                    "DrugOverrides_ByTypeAndDrugAndDOS",
                    1,
                    "select {{:output}} from DrugOverrides where Type = '{{:DrugOverrideType}}'",
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                    None,
                )
            ]
            return self

        def fetchall(self):
            return self.rows

    class FakeConnection:
        def __enter__(self):
            return self

        def __exit__(self, *_):
            return None

        def cursor(self):
            return FakeCursor()

    with patch(
        "inrules_data_agent.retrieval.querytext_shadow._load_pyodbc",
        return_value=SimpleNamespace(
            Error=PermissionDenied,
            connect=lambda *args, **kwargs: FakeConnection(),
        ),
    ), patch(
        "inrules_data_agent.retrieval.querytext_shadow._connection_string",
        return_value="test",
    ):
        corpus = load_reuse_corpus()

    query, assignments = corpus[68]
    assert query.name == "DrugOverrides_ByTypeAndDrugAndDOS"
    assert assignments == ()


def test_reuse_match_binds_mixed_literal_and_runtime_drug_override_parameters():
    query = StoredQueryText(
        68,
        "DrugOverrides_ByTypeAndDrugAndDOS",
        1,
        "select {{:output}} from DrugOverrides (nolock) "
        "where Type = '{{:DrugOverrideType}}' "
        "and (NDCKey = '{{:Ndc}}' or GCN_SeqNo = '{{:GcnSeqNo}}' or HIC3 = '{{:Hic3}}') "
        "and '{{:DateOfService}}' between effdate and termdate",
    )
    generated = (
        "SELECT COUNT(*) AS ExclusionOverrideCount "
        "FROM HRX.dbo.DrugOverrides AS o WITH (NOLOCK) "
        "WHERE o.Type = '7672_Excluded' "
        "AND (o.NDCKey = {{ClaimTransaction.Ndc}} "
        "OR o.GCN_SeqNo = {{ClaimRequest.DrugRequested.GCNSeqNo.Code}} "
        "OR o.HIC3 = {{ClaimRequest.DrugRequested.HIC3.Code}}) "
        "AND {{DateOfService}} BETWEEN o.EffDate AND o.TermDate"
    )

    match = find_reuse_match(generated, {68: (query, ())})

    assert match is not None
    assert match.data_query_id == 68
    assert match.proposed_query_params == {
        "DrugOverrideType": "7672_Excluded",
        "Ndc": "{{ClaimTransaction.Ndc}}",
        "GcnSeqNo": "{{ClaimRequest.DrugRequested.GCNSeqNo.Code}}",
        "Hic3": "{{ClaimRequest.DrugRequested.HIC3.Code}}",
        "DateOfService": "{{DateOfService}}",
    }


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
