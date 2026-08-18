from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from inrules_data_agent.app import (
    Step,
    _acceptance_criteria_for_step,
    _query_task_for_step,
    create_app,
)
from inrules_data_agent.generator.generate import (
    SYSTEM_PROMPT,
    _build_artifact_repair_feedback,
    _build_user_message,
    _column_repair_suggestions,
    _find_deterministic_selection_artifacts,
    _find_output_name_artifacts,
    _find_required_business_concept_artifacts,
    _find_runtime_column_mapping_artifacts,
    _grounded_business_pattern_candidate,
    _normalize_count_output_aliases,
    _normalize_missing_physical_table_hints,
    _normalize_quoted_runtime_placeholders,
    _normalize_physical_hint_alias_order,
    _normalize_reserved_table_aliases,
    _parse_model_query_response,
    _repair_invalid_column_references,
    generate_query_result_for_step,
    select_ddls,
)

MOCK_SQL = "select count(*) from HRX.dbo.DrugOverrides (nolock) where Type = '3013_Opioid'"


def test_create_app_smoke():
    app = create_app()
    assert app is not None


def test_health():
    client = TestClient(create_app())
    assert client.get("/health").json() == {"status": "ok"}


def test_requires_data_query_filter_skips_false_steps():
    with patch(
        "inrules_data_agent.generator.generate._call_openai", return_value=MOCK_SQL
    ) as call_openai:
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "test",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "global check only",
                        "requires_data_query": False,
                    },
                    {
                        "step_number": 2,
                        "business_meaning": "Query DrugOverrides where NDC matches incoming ndc",
                        "requires_data_query": True,
                    },
                ],
            },
        )

    body = response.json()
    assert len(body["queries"]) == 1
    assert body["queries"][0]["step_number"] == 2
    assert body["queries"][0]["queries"] == [MOCK_SQL]
    call_openai.assert_called_once()


def test_rule_context_is_passed_to_data_query_generation():
    with patch(
        "inrules_data_agent.app.generate_query_result_for_step",
        return_value={
            "queries": [MOCK_SQL],
            "failure_category": None,
            "failure_reason": None,
            "generation_attempts": [{"attempt": 1, "outcome": "accepted"}],
        },
    ) as generate_step:
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "3018",
                "description": "CHIP eligibility rule",
                "acceptance_criteria": [
                    "Member has an active CHIP rate code",
                    "Member has no active CHIP indicator",
                ],
                "steps": [
                    {
                        "step_number": 4,
                        "business_meaning": "Return active member rate-code values",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    assert response.status_code == 200
    generate_step.assert_called_once_with(
        "Return active member rate-code values",
        description="CHIP eligibility rule",
        acceptance_criteria=None,
        draft_mode=False,
    )
    assert response.json()["description"] == "CHIP eligibility rule"
    assert response.json()["queries"][0]["generation_attempts"] == [
        {"attempt": 1, "outcome": "accepted"}
    ]


def test_uses_atomic_data_query_reason_when_no_resolved_instruction_exists():
    step = Step(
        step_number=2,
        business_meaning="Compare the original claim date plus the configured reversal threshold.",
        requires_data_query=True,
        data_query_reason="Lookup NDCParameters value for 7013_Reversal_Days.",
    )

    assert _query_task_for_step(step) == (
        "ATOMIC DATA RETRIEVAL OBJECTIVE:\n"
        "Lookup NDCParameters value for 7013_Reversal_Days.\n\n"
        "CURRENT BUSINESS FACT CONSTRAINTS AND REQUESTED OUTPUT:\n"
        "Compare the original claim date plus the configured reversal threshold."
    )


def test_uses_resolved_query_instruction_and_reports_unmatched_step():
    with patch(
        "inrules_data_agent.app.generate_query_result_for_step",
        side_effect=[
            {
                "queries": [
                    "SELECT [PARAMETER_VALUE] FROM [HRX].[dbo].[NDCParameters] WITH (NOLOCK) "
                    "WHERE [PARAMETER_NAME] = 'Medicare_Age_Years'"
                ],
                "failure_category": None,
                "failure_reason": None,
            },
            {
                "queries": [],
                "failure_category": "NO_SUPPORTED_GROUNDED_QUERY",
                "failure_reason": "The task could not be mapped to a safe, grounded SELECT query.",
            },
        ],
    ) as generate_step:
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={
                "edit_id": "9999",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Determine the configured Medicare age threshold in years.",
                        "requires_data_query": True,
                        "entity_resolution": {
                            "entities": [
                                {
                                    "data_query_instruction": "Query HRX.dbo.NDCParameters WHERE PARAMETER_NAME = 'Medicare_Age_Years' RETURNS PARAMETER_VALUE."
                                }
                            ]
                        },
                    },
                    {
                        "step_number": 2,
                        "business_meaning": "Retrieve a value from an unsupported source.",
                        "requires_data_query": True,
                        "entity_resolution": {
                            "entities": [
                                {"data_query_instruction": "Query an unsupported source."}
                            ]
                        },
                    },
                ],
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["step_queries"] == body["queries"]
    assert "query_task" not in body["step_queries"][0]
    assert body["step_queries"][0]["matched"] is True
    assert body["step_queries"][1]["matched"] is False
    assert body["unmatched_steps"] == [2]
    assert body["inconclusive_steps"] == []
    assert body["data_agent_status"] == "available"
    assert body["data_agent_mode"] == "in_process"
    assert body["generation_mode"] == "draft"
    assert generate_step.call_count == 2


def test_draft_mode_returns_safe_schema_valid_candidate_with_review_warnings():
    with patch(
        "inrules_data_agent.generator.generate.select_ddls",
        return_value=["CREATE TABLE [HRX].[dbo].[KnownTable] ([Id] int NULL);"],
    ), patch(
        "inrules_data_agent.generator.generate._call_openai",
        return_value="SELECT Id FROM HRX.dbo.KnownTable WITH (NOLOCK) WHERE 1 = 1",
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={
                "edit_id": "draft-test",
                "generation_mode": "draft",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Retrieve a value from an unresolved source.",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["step_queries"][0]
    assert result["matched"] is True
    assert result["query_generated"] is True
    assert result["validation_status"] == "DRAFT_REQUIRES_REVIEW"
    assert "1 = 0/1 predicate" in result["review_warnings"]
    assert result["failure_category"] is None
    assert result["failure_reason"] is None
    assert result["queries"] == [
        "SELECT Id FROM HRX.dbo.KnownTable WITH (NOLOCK) WHERE 1 = 1"
    ]


def test_strict_mode_still_rejects_semantically_incomplete_candidate():
    with patch(
        "inrules_data_agent.generator.generate.select_ddls",
        return_value=["CREATE TABLE [HRX].[dbo].[KnownTable] ([Id] int NULL);"],
    ), patch(
        "inrules_data_agent.generator.generate._call_openai",
        return_value="SELECT Id FROM HRX.dbo.KnownTable WITH (NOLOCK) WHERE 1 = 1",
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "strict-test",
                "generation_mode": "strict",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Retrieve a value from an unresolved source.",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["step_queries"][0]
    assert result["matched"] is False
    assert result["failure_category"] == "VALIDATION_REJECTED"
    assert result["queries"] == []


def test_draft_mode_retries_model_null_with_runtime_placeholder_instruction():
    candidate = "SELECT {{SystemProcessingHalt}} AS SystemProcessingHalt"
    with (
        patch(
            "inrules_data_agent.generator.generate.select_ddls",
            return_value=["CREATE TABLE [HRX].[dbo].[KnownTable] ([Id] int NULL);"],
        ),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=["NO_SUPPORTED_QUERY", candidate],
        ) as call_openai,
    ):
        result = generate_query_result_for_step(
            "Determine whether a system-related condition prevents processing.",
            description="Processing halted due to a system condition.",
            acceptance_criteria="Stop when processing cannot continue.",
            draft_mode=True,
        )

    assert result["queries"] == [candidate]
    assert result["validation_status"] == "DRAFT_REQUIRES_REVIEW"
    repair_feedback = call_openai.call_args_list[1].args[2]
    assert "do not return null" in repair_feedback
    assert "authoritative business meaning" in repair_feedback
    assert "do not use irAuthor contracts" in repair_feedback
    assert "maximum available grounded DDL facts" in repair_feedback
    assert "tableless SELECT only when no DDL table maps" in repair_feedback


def test_draft_mode_returns_safe_runtime_only_select_with_warning():
    candidate = "SELECT {{PrescriberIdQualifier}} AS PrescriberIdQualifier"
    with (
        patch(
            "inrules_data_agent.generator.generate.select_ddls",
            return_value=["CREATE TABLE [HRX].[dbo].[KnownTable] ([Id] int NULL);"],
        ),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=candidate,
        ),
    ):
        result = generate_query_result_for_step(
            "Confirm the submitted Prescriber ID Qualifier indicates NPI.",
            draft_mode=True,
        )

    assert result["queries"] == [candidate]
    assert result["validation_status"] == "DRAFT_REQUIRES_REVIEW"
    assert "SELECT has no table reference" in result["review_warnings"]


def test_draft_mode_does_not_return_unknown_table_candidate():
    with patch(
        "inrules_data_agent.generator.generate.select_ddls",
        return_value=["CREATE TABLE [HRX].[dbo].[KnownTable] ([Id] int NULL);"],
    ), patch(
        "inrules_data_agent.generator.generate._call_openai",
        return_value="SELECT Id FROM HRX.dbo.UnknownTable WITH (NOLOCK)",
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "unknown-table",
                "generation_mode": "draft",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Retrieve a value from an unresolved source.",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["step_queries"][0]
    assert result["queries"] == []
    assert result["matched"] is False
    assert result["failure_category"] == "TABLE_NOT_IN_DDL"




def test_prompt_separates_context_from_authoritative_query_task():
    message = _build_user_message(
        "Return active member rate-code values",
        "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] ([RateCode] nvarchar(max));",
        description="CHIP eligibility rule",
        acceptance_criteria=["Member has active coverage", "No CHIP indicator"],
    )

    assert "RULE DESCRIPTION (overall objective only; do not import query logic):\nCHIP eligibility rule" in message
    assert "1. Member has active coverage" in message
    assert "2. No CHIP indicator" in message
    assert "DIRECTLY REFERENCED ACCEPTANCE CRITERIA (supporting context only):" in message
    assert "CURRENT DATA QUERY BUSINESS MEANING (authoritative atomic query task):" in message
    assert message.endswith("Return active member rate-code values")
    assert "Apply this information hierarchy strictly" in SYSTEM_PROMPT
    assert "project those exact mapped columns" in SYSTEM_PROMPT
    assert "do not import other acceptance-" in SYSTEM_PROMPT
    assert "Never guess semantic mappings" in SYSTEM_PROMPT
    assert "One business fact" in SYSTEM_PROMPT
    assert "no more than 40 characters" in SYSTEM_PROMPT


def test_selects_only_acceptance_criterion_referenced_by_step():
    step = Step(
        step_number=4,
        business_meaning="Retrieve SCC=05 historical source values.",
        requires_data_query=True,
        ado_criterion_ref="Acceptance Criteria 4",
    )
    criteria = ["Partial fill", "CII history", "SCC=61 history", "SCC=05 history"]

    assert _acceptance_criteria_for_step(step, criteria) == ["SCC=05 history"]


def test_omits_unreferenced_acceptance_criteria_from_query_context():
    step = Step(step_number=1, business_meaning="Retrieve one fact", requires_data_query=True)

    assert _acceptance_criteria_for_step(step, ["Unrelated flow A", "Unrelated flow B"]) is None


def test_grounded_scc_history_pattern_uses_clean_column_ownership():
    ddl = "\n".join([
        "CREATE TABLE [plandata_rx_production].[dbo].[edi_pharm_universal] ([claimid] char(15), [claimline] int, [metricqty] money, [dayssupply] int, [rxnumber] char(15), [SubmissionClarification] char(2));",
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] char(15), [memid] char(15), [provid] char(15), [startdate] datetime, [status] char(10), [formtype] char(15), [resubclaimid] char(15));",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] ([claimid] char(15), [claimline] int, [ndckey] char(11));",
        "CREATE TABLE [HRX].[dbo].[NDC_Mstr] ([NDCKey] char(11), [GCN_SeqNo] char(6));",
    ])
    sql = _grounded_business_pattern_candidate(
        "For SCC=05 Therapy Change, return same-GCN history quantity and days supply", ddl
    )

    assert sql is not None
    assert "e.SubmissionClarification" in sql
    assert "e.metricqty AS HistoryQuantity" in sql
    assert "c.status" in sql
    assert "n.GCN_SeqNo = {{GCNSeqNo}}" in sql


def test_grounded_compound_pattern_uses_prefiltered_tcns():
    ddl = "\n".join([
        "CREATE TABLE [HRX].[dbo].[COMPOUND] ([tcn] nvarchar(17), [ndc] nvarchar(50), [drug_qty] nvarchar(50));",
        "CREATE TABLE [HRX].[dbo].[NDC_Mstr] ([NDCKey] char(11), [GCN_SeqNo] char(6));",
    ])
    sql = _grounded_business_pattern_candidate(
        "Calculate historical compound quantity for the same GCN_SeqNo", ddl
    )

    assert sql is not None
    assert "c.tcn IN ([[HistoricalTcns]])" in sql
    assert "n.NDCKey = c.ndc" in sql
    assert "SUM(TRY_CONVERT(decimal(29,9), c.drug_qty))" in sql


def test_required_business_concepts_accept_approved_runtime_placeholders():
    sql = (
        "SELECT {{QuantityDispensed}} AS QuantityDispensed, n.PS AS PackageSize "
        "FROM HRX.dbo.NDC_Mstr n WITH (NOLOCK) "
        "WHERE n.NDCKey = {{ClaimTransaction.Ndc}}"
    )

    assert _find_required_business_concept_artifacts(
        sql, "The claim quantity dispensed is not an exact multiple of the package size."
    ) == []
    assert _find_required_business_concept_artifacts(
        "SELECT {{DaysSupply}} AS DaysSupply FROM InMemory.dbo.DRUG",
        "Return the current claim days supply.",
    ) == []
    assert _find_required_business_concept_artifacts(
        "SELECT cp.IntendedQuantityToBeDispensed, cp.IntendedDaysSupply "
        "FROM plandata_rx_production.dbo.ClaimPartial cp WITH (NOLOCK)",
        "Return the intended quantity and intended days supply.",
    ) == []


def test_system_prompt_honors_routed_runtime_input_query_contracts():
    assert "Honor the routed query task" in SYSTEM_PROMPT
    assert "Do not return null merely" in SYSTEM_PROMPT


def test_selected_occurrence_requires_a_correlation_key():
    meaning = "For the same selected DUR event occurrence, return the severity value."
    uncorrelated = "SELECT e.SeverityLevel FROM InMemory.dbo.EVENT e"
    correlated = (
        "SELECT e.SeverityLevel FROM InMemory.dbo.EVENT e "
        "WHERE e.NdcIndex = {{EventIndex}}"
    )

    assert _find_required_business_concept_artifacts(uncorrelated, meaning) == [
        "required business concept 'selected occurrence' is absent from the SQL"
    ]
    assert _find_required_business_concept_artifacts(correlated, meaning) == []


def test_required_business_concepts_reject_silently_incomplete_sql():
    meaning = (
        "Return same-GCN history quantity and days supply by Rx number for the current "
        "provider, with formtype UNIVERSALC and blank resubclaimid"
    )
    incomplete = "SELECT COUNT(*) FROM HRX.dbo.DrugOverrides WITH (NOLOCK) WHERE GCN_SeqNo = {{GCNSeqNo}}"

    artifacts = _find_required_business_concept_artifacts(incomplete, meaning)

    assert "required business concept 'quantity' is absent from the SQL" in artifacts
    assert "required business concept 'days supply' is absent from the SQL" in artifacts
    assert "required business concept 'Rx number' is absent from the SQL" in artifacts
    assert "required business concept 'provider scope' is absent from the SQL" in artifacts
    assert "required business concept 'form type' is absent from the SQL" in artifacts
    assert "required business concept 'reversal status' is absent from the SQL" in artifacts
    assert not any("'GCN'" in artifact for artifact in artifacts)


def test_provider_scope_must_be_a_history_filter_not_only_an_output():
    meaning = "Return the oldest prescription for the current provider and Rx number."
    projection_only = (
        "SELECT h.ProviderId, h.RxNumber FROM InMemory.dbo.MEMBER_HISTORY h "
        "WHERE h.RxNumber = {{RxNumber}}"
    )

    assert _find_required_business_concept_artifacts(projection_only, meaning) == [
        "required business concept 'provider scope' is absent from the SQL"
    ]


def test_required_business_concepts_preserve_primary_before_fallback():
    meaning = (
        "Read the plan/date-effective NDCMaintDetails value first; when it is missing "
        "or zero use NDCParameters as the fallback."
    )
    fallback_only = (
        "SELECT p.PARAMETER_VALUE FROM HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "WHERE p.PARAMETER_NAME = 'DEA_DAYS_2'"
    )

    assert _find_required_business_concept_artifacts(fallback_only, meaning) == [
        "required primary source 'NDCMaintDetails' is absent from the SQL"
    ]


def test_paid_physical_history_rejects_non_paid_statuses():
    meaning = "Count paid, non-reversed historical claims for the member."
    sql = (
        "SELECT COUNT(*) AS PaidHistoryCount "
        "FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "WHERE RTRIM(c.status) IN ('PAID', 'PAY', 'WAITPAY', 'DENY', 'WAITDENY', 'REV') "
        "AND RTRIM(c.resubclaimid) = ''"
    )

    assert _find_required_business_concept_artifacts(sql, meaning) == [
        "paid physical claim history includes non-paid statuses: DENY, REV, WAITDENY"
    ]


def test_required_like_and_same_period_semantics_are_preserved():
    meaning = (
        "Return history in the same vaccine season where override Type LIKE "
        "'%Vaccine%' and both dates use the same effective period."
    )
    exact_and_history_only = (
        "SELECT mh.GCNSeqNo FROM InMemory.dbo.MEMBER_HISTORY mh "
        "JOIN HRX.dbo.DrugOverrides d WITH (NOLOCK) ON d.GCN_SeqNo = mh.GCNSeqNo "
        "WHERE d.Type = 'Vaccine' "
        "AND mh.DateOfService BETWEEN d.EffDate AND d.TermDate"
    )
    artifacts = _find_required_business_concept_artifacts(
        exact_and_history_only, meaning
    )

    assert "required comparison operator 'LIKE' is absent from the SQL" in artifacts
    assert (
        "same-period lookup does not bind the incoming date to an effective window"
        in artifacts
    )


def test_reject_code_configuration_list_stays_effective_and_occurrence_independent():
    meaning = (
        "Return the approved NDCParameters Reject_Code list for the submitted COB "
        "reject-code occurrence scope."
    )
    wrong = (
        "SELECT COUNT(*) AS MatchCount "
        "FROM plandata_rx_production.dbo.edi_pharm_universal e WITH (NOLOCK) "
        "JOIN HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "ON e.OtherPayerRejects = p.PARAMETER_VALUE "
        "WHERE p.PARAMETER_NAME = 'REJECT_CODE'"
    )
    corrected = (
        "SELECT p.PARAMETER_VALUE AS RejectCode "
        "FROM HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "WHERE p.PARAMETER_NAME = 'REJECT_CODE' "
        "AND {{DateOfService}} BETWEEN p.EFFDATE AND p.ENDDATE"
    )

    artifacts = _find_required_business_concept_artifacts(wrong, meaning)
    assert any("configuration-list query re-queries" in item for item in artifacts)
    assert "configuration-list query returns an aggregate instead of configured values" in artifacts
    assert "effective Reject_Code lookup is missing the EFFDATE/ENDDATE DOS filter" in artifacts
    assert _find_required_business_concept_artifacts(corrected, meaning) == []


def test_selected_history_row_requires_stable_identifier_correlation():
    meaning = "Return Quantity Prescribed from the selected original paid claim."
    repeated_search = (
        "SELECT s.QuantityPrescribed AS OriginalQuantityPrescribed "
        "FROM InMemory.dbo.SCHEDULEII s "
        "WHERE s.MemberId = {{MemberId}} AND s.ProviderId = {{ProviderId}} "
        "AND s.RXNumber = {{RxNumber}}"
    )
    keyed_lookup = (
        "SELECT s.QuantityPrescribed AS OriginalQuantityPrescribed "
        "FROM InMemory.dbo.SCHEDULEII s "
        "WHERE s.ClaimId = {{OriginalClaimId}}"
    )
    initial_selection = (
        "SELECT s.ClaimId AS OriginalClaimId, "
        "s.QuantityPrescribed AS OriginalQuantityPrescribed "
        "FROM InMemory.dbo.SCHEDULEII s "
        "WHERE s.MemberId = {{MemberId}} AND s.ProviderId = {{ProviderId}} "
        "AND s.RXNumber = {{RxNumber}}"
    )

    assert _find_required_business_concept_artifacts(repeated_search, meaning) == [
        "selected-row lookup repeats history without a stable claim identifier"
    ]
    assert _find_required_business_concept_artifacts(keyed_lookup, meaning) == []
    assert _find_required_business_concept_artifacts(
        initial_selection,
        "Select an original paid CII claim and return its ClaimId and Quantity Prescribed.",
    ) == []


def test_top_one_selection_requires_business_direction():
    assert _find_deterministic_selection_artifacts(
        "SELECT TOP (1) h.RxDateWritten FROM InMemory.dbo.MEMBER_HISTORY h",
        "Return the oldest qualifying prescription occurrence.",
    ) == ["TOP (1) selection has no ORDER BY"]
    assert _find_deterministic_selection_artifacts(
        "SELECT TOP (1) h.RxDateWritten FROM InMemory.dbo.MEMBER_HISTORY h "
        "ORDER BY h.Fill_Date DESC, h.ClaimId",
        "Return the oldest qualifying prescription occurrence.",
    ) == ["oldest/earliest TOP (1) selection must order ascending"]
    assert _find_deterministic_selection_artifacts(
        "SELECT TOP (1) h.RxDateWritten FROM InMemory.dbo.MEMBER_HISTORY h "
        "ORDER BY h.Fill_Date ASC, h.ClaimId",
        "Return the oldest qualifying prescription occurrence.",
    ) == []


def test_prompt_preserves_history_scope_and_primary_lookup():
    assert "preserve both predicates" in SYSTEM_PROMPT
    assert "ascending Fill_Date" in SYSTEM_PROMPT
    assert "a fallback-only query is incomplete" in SYSTEM_PROMPT
    assert "exact NDC before GCN sequence before therapeutic class" in SYSTEM_PROMPT


def test_prefiltered_historical_tcns_represent_upstream_claim_scope():
    meaning = (
        "Sum historical compound quantity for paid UNIVERSALC claims with blank "
        "resubclaimid and the same GCN"
    )
    sql = (
        "SELECT SUM(TRY_CONVERT(decimal(29,9), c.drug_qty)) AS HistoricalQuantity "
        "FROM HRX.dbo.COMPOUND c WITH (NOLOCK) "
        "JOIN HRX.dbo.NDC_Mstr n WITH (NOLOCK) ON n.NDCKey = c.ndc "
        "WHERE c.tcn IN ([[HistoricalTcns]]) AND n.GCN_SeqNo = {{GCNSeqNo}}"
    )

    assert _find_required_business_concept_artifacts(sql, meaning) == []


def test_output_alias_repair_requests_raw_source_fact():
    feedback = _build_artifact_repair_feedback([
        "output alias 'Active7239BypassFound' describes a final rule decision instead of an extracted fact"
    ])

    assert "underlying requested source fact" in feedback
    assert "matching row ID" in feedback
    assert "Downstream InRule logic decides" in feedback


def test_exactly_quoted_runtime_placeholders_are_normalized_to_parameters():
    sql = (
        "SELECT * FROM HRX.dbo.Example WITH (NOLOCK) "
        "WHERE MemberId = '{{MemberId}}' AND Status LIKE '{{Status}}%' "
        "AND LiteralValue = 'keep me'"
    )

    assert _normalize_quoted_runtime_placeholders(sql) == (
        "SELECT * FROM HRX.dbo.Example WITH (NOLOCK) "
        "WHERE MemberId = {{MemberId}} AND Status LIKE '{{Status}}%' "
        "AND LiteralValue = 'keep me'"
    )


def test_count_output_alias_names_the_rows_counted_not_inverse_condition():
    sql = (
        "SELECT TOP (1) COUNT(*) AS MissingActiveNDCDesiMstr "
        "FROM HRX.dbo.NDC_DESI_Mstr d WITH (NOLOCK)"
    )

    assert _normalize_count_output_aliases(sql) == (
        "SELECT TOP (1) COUNT(*) AS ActiveNDCDesiMstrCount "
        "FROM HRX.dbo.NDC_DESI_Mstr d WITH (NOLOCK)"
    )
    assert _normalize_count_output_aliases(
        "SELECT COUNT(1) AS [NoMatchingProvider] FROM HRX.dbo.Provider"
    ) == "SELECT COUNT(1) AS MatchingProviderCount FROM HRX.dbo.Provider"
    assert _normalize_count_output_aliases(
        "SELECT COUNT(*) AS ActiveRecordCount FROM HRX.dbo.Example"
    ) == "SELECT COUNT(*) AS ActiveRecordCount FROM HRX.dbo.Example"


def test_output_alias_validation_allows_domain_facts_but_rejects_rule_decisions():
    artifacts = _find_output_name_artifacts(
        "SELECT COUNT(*) AS ErBypassDueToScc0580PercentSameGcnPaidHistory "
        "FROM HRX.dbo.ClaimHistory WITH (NOLOCK)"
    )

    assert artifacts == [
        "output alias 'ErBypassDueToScc0580PercentSameGcnPaidHistory' exceeds 40 characters"
    ]
    assert _find_output_name_artifacts(
        "SELECT COUNT(*) AS Scc05HistoryFound FROM HRX.dbo.ClaimHistory WITH (NOLOCK)"
    ) == []
    assert _find_output_name_artifacts(
        "SELECT COUNT(*) AS PackageBillingBypassOverrideCount "
        "FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    ) == []
    assert _find_output_name_artifacts(
        "SELECT OverrideID AS ActivePackageBillingBypassOverrideId "
        "FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    ) == []
    assert _find_output_name_artifacts(
        "SELECT COUNT(*) AS ActiveExclusionCount "
        "FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    ) == []
    assert _find_output_name_artifacts(
        "SELECT COUNT(*) AS ShouldBypass FROM HRX.dbo.ClaimHistory WITH (NOLOCK)"
    ) == [
        "output alias 'ShouldBypass' describes a final rule decision instead of an extracted fact"
    ]
    assert _find_output_name_artifacts(
        "SELECT COUNT(*) AS BypassDecision FROM HRX.dbo.ClaimHistory WITH (NOLOCK)"
    ) == [
        "output alias 'BypassDecision' describes a final rule decision instead of an extracted fact"
    ]


def test_reserved_table_aliases_are_bracketed_before_sql_parsing():
    sql = (
        "SELECT DO.OverrideID FROM HRX.dbo.DrugOverrides DO WITH (NOLOCK) "
        "WHERE DO.Type = 'value.do.not.change'"
    )

    normalized = _normalize_reserved_table_aliases(sql)

    assert "DrugOverrides [DO] WITH (NOLOCK)" in normalized
    assert "[DO].OverrideID" in normalized
    assert "[DO].Type" in normalized
    assert "'value.do.not.change'" in normalized


def test_physical_nolock_hint_is_moved_after_alias():
    sql = "SELECT d.OverrideID FROM HRX.dbo.DrugOverrides WITH (NOLOCK) AS d"

    assert _normalize_physical_hint_alias_order(sql) == (
        "SELECT d.OverrideID FROM HRX.dbo.DrugOverrides AS d WITH (NOLOCK)"
    )


def test_missing_nolock_is_added_only_to_physical_tables():
    sql = (
        "SELECT mh.GCNSeqNo FROM InMemory.dbo.MEMBER_HISTORY mh "
        "JOIN HRX.dbo.DrugOverrides dox ON dox.GCN_SeqNo = mh.GCNSeqNo"
    )

    normalized = _normalize_missing_physical_table_hints(sql)

    assert "MEMBER_HISTORY mh WITH (NOLOCK)" not in normalized
    assert "DrugOverrides dox WITH (NOLOCK) ON" in normalized


def test_existing_physical_nolock_hint_is_not_duplicated():
    sql = "SELECT d.OverrideID FROM HRX.dbo.DrugOverrides d WITH (NOLOCK)"

    assert _normalize_missing_physical_table_hints(sql) == sql


def test_nonreserved_table_alias_is_unchanged():
    sql = "SELECT d.OverrideID FROM HRX.dbo.DrugOverrides AS d WITH (NOLOCK)"

    assert _normalize_reserved_table_aliases(sql) == sql


def test_generation_repairs_reserved_alias_then_runs_normal_validation():
    ddl = (
        "CREATE TABLE [HRX].[dbo].[DrugOverrides] ("
        "[OverrideID] int NOT NULL, [NDCKey] char(11) NULL, "
        "[Type] varchar(50) NOT NULL, [EffDate] datetime NOT NULL, "
        "[TermDate] datetime NOT NULL);"
    )
    generated = (
        "SELECT DO.OverrideID AS OverrideId "
        "FROM HRX.dbo.DrugOverrides WITH (NOLOCK) AS DO "
        "WHERE DO.Type = '7239_PkgBilling_Bypass' "
        "AND DO.NDCKey = {{ClaimTransaction.Ndc}} "
        "AND {{DateOfService}} BETWEEN DO.EffDate AND DO.TermDate"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=generated),
        patch("inrules_data_agent.app.load_reuse_corpus", return_value={}),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "7239",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return the active package-billing override ID",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["step_queries"][0]
    assert result["query_generated"] is True
    assert "DrugOverrides AS [DO] WITH (NOLOCK)" in result["queries"][0]
    assert "[DO].OverrideID" in result["queries"][0]


def test_structured_model_response_parser_enforces_query_text_contract():
    assert _parse_model_query_response(
        '{"query_text":"SELECT 1 AS Value"}'
    ) == "SELECT 1 AS Value"
    assert _parse_model_query_response('{"query_text":null}') == "NO_SUPPORTED_QUERY"
    assert _parse_model_query_response("SELECT 1") == "INVALID_STRUCTURED_RESPONSE"
    assert _parse_model_query_response('{"sql":"SELECT 1"}') == "INVALID_STRUCTURED_RESPONSE"
    assert _parse_model_query_response(
        '{"query_text":"SELECT 1","reason":"extra"}'
    ) == "INVALID_STRUCTURED_RESPONSE"
    assert _parse_model_query_response('{"query_text":""}') == "INVALID_STRUCTURED_RESPONSE"


def test_generation_attempts_preserve_rejected_candidate_and_final_success():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    invalid = "SELECT MissingColumn FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    corrected = "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[invalid, corrected],
        ),
    ):
        result = generate_query_result_for_step("Return DrugOverrides NDCKey values")

    assert result["queries"] == [corrected]
    assert result["failure_category"] is None
    assert result["generation_attempts"] == [
        {
            "attempt": 1,
            "source": "model",
            "outcome": "rejected",
            "failure_category": "COLUMN_NOT_IN_DDL",
            "failure_reason": (
                "The generated SQL referenced columns outside the selected DDL context: "
                "MissingColumn"
            ),
            "candidate_query_text": invalid,
        },
        {
            "attempt": 2,
            "source": "model",
            "outcome": "accepted",
            "failure_category": None,
            "failure_reason": None,
            "candidate_query_text": corrected,
        },
    ]


def test_generate_queries_retries_invalid_structured_model_response():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    corrected = "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=["INVALID_STRUCTURED_RESPONSE", corrected],
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "invalid-json-envelope",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return DrugOverrides NDCKey values",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected]
    assert call_openai.call_count == 2
    assert "required JSON envelope" in call_openai.call_args_list[1].args[2]


def test_prompt_requires_structured_query_text_json():
    assert 'Return ONLY one JSON object' in SYSTEM_PROMPT
    assert '{"query_text": "SELECT ..."}' in SYSTEM_PROMPT
    assert '{"query_text": null}' in SYSTEM_PROMPT


def test_prompt_allows_any_explicit_runtime_input_to_become_a_query_param():
    assert "open-ended DataQuery contract, not a fixed whitelist" in SYSTEM_PROMPT
    assert "Rx Number:         {{RxNumber}}" in SYSTEM_PROMPT
    assert "{{AssociatedPrescriptionRefNumber}}" in SYSTEM_PROMPT
    assert "never a reason to reject an otherwise table-and-column-grounded query" in SYSTEM_PROMPT


def test_runtime_column_semantics_reject_unrelated_identifier_mapping():
    assert _find_runtime_column_mapping_artifacts(
        "SELECT COUNT(*) FROM InMemory.dbo.EO_HISTORY eh "
        "WHERE eh.RejectEdits_EditId = {{RxNumber}}"
    ) == [
        "column eh.RejectEdits_EditId is semantically incompatible with runtime input {{RxNumber}}"
    ]
    assert _find_runtime_column_mapping_artifacts(
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claimpharm cp "
        "WHERE cp.rxnumber = {{RxNumber}}"
    ) == []
    assert _find_runtime_column_mapping_artifacts(
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claim c "
        "WHERE RTRIM(c.referralid) = RTRIM({{RxNumber}})"
    ) == [
        "column c.referralid is semantically incompatible with runtime input {{RxNumber}}"
    ]
    assert _find_runtime_column_mapping_artifacts(
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claim c "
        "WHERE CAST({{RxNumber}} AS varchar(50)) = RTRIM(c.referralid)"
    ) == [
        "column c.referralid is semantically incompatible with runtime input {{RxNumber}}"
    ]
    assert _find_runtime_column_mapping_artifacts(
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claimpharm cp "
        "WHERE RTRIM(cp.rxnumber) = RTRIM({{RxNumber}})"
    ) == []


def test_generate_queries_repairs_semantically_incompatible_runtime_column():
    ddl = (
        "CREATE TABLE [InMemory].[dbo].[EO_HISTORY] "
        "([RejectEdits_EditId] nvarchar(max), [MemberId] nvarchar(max));\n"
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] "
        "([rxnumber] char(50));"
    )
    wrong = (
        "SELECT COUNT(*) AS PaidClaimCount FROM InMemory.dbo.EO_HISTORY eh "
        "WHERE eh.RejectEdits_EditId = {{RxNumber}}"
    )
    corrected = (
        "SELECT COUNT(*) AS PaidClaimCount "
        "FROM plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "WHERE cp.rxnumber = {{RxNumber}}"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[wrong, corrected],
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "semantic-runtime-mapping",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Count paid claims for the same Rx number",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected]
    assert call_openai.call_count == 2


def test_generate_queries_repairs_prescription_history_scope_and_ordering():
    ddl = (
        "CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY] "
        "([ProviderId] nvarchar(max), [RxNumber] nvarchar(max), "
        "[Fill_Date] datetime, [RxDateWritten] datetime, [ClaimId] bigint);"
    )
    wrong = (
        "SELECT TOP (1) h.RxDateWritten AS DatePrescriptionWritten "
        "FROM InMemory.dbo.MEMBER_HISTORY h "
        "WHERE h.RxNumber = {{RxNumber}} ORDER BY h.RxDateWritten ASC"
    )
    corrected = (
        "SELECT TOP (1) h.RxDateWritten AS DatePrescriptionWritten "
        "FROM InMemory.dbo.MEMBER_HISTORY h "
        "WHERE h.ProviderId = {{ProviderId}} AND h.RxNumber = {{RxNumber}} "
        "ORDER BY h.Fill_Date ASC, h.ClaimId ASC"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[wrong, corrected],
        ) as call_openai,
    ):
        result = generate_query_result_for_step(
            "Return the oldest prescription occurrence for the current provider and "
            "submitted Rx number, ordered by earliest Fill_Date."
        )

    assert result["queries"] == [corrected]
    assert result["validation_status"] == "VALIDATED"
    assert call_openai.call_count == 2
    assert "provider scope" in call_openai.call_args_list[1].args[2]


def test_generate_queries_repairs_reject_code_configuration_list_lookup():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[edi_pharm_universal] "
        "([OtherPayerRejects] char(3), [claimid] bigint);",
        "CREATE TABLE [HRX].[dbo].[NDCParameters] "
        "([PARAMETER_NAME] varchar(100), [PARAMETER_VALUE] varchar(100), "
        "[EFFDATE] datetime, [ENDDATE] datetime);",
    ]
    wrong = (
        "SELECT COUNT(*) AS MatchCount "
        "FROM plandata_rx_production.dbo.edi_pharm_universal e WITH (NOLOCK) "
        "JOIN HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "ON e.OtherPayerRejects = p.PARAMETER_VALUE "
        "WHERE p.PARAMETER_NAME = 'REJECT_CODE'"
    )
    corrected = (
        "SELECT p.PARAMETER_VALUE AS RejectCode "
        "FROM HRX.dbo.NDCParameters p WITH (NOLOCK) "
        "WHERE p.PARAMETER_NAME = 'REJECT_CODE' "
        "AND {{DateOfService}} BETWEEN p.EFFDATE AND p.ENDDATE"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[wrong, corrected],
        ) as call_openai,
    ):
        result = generate_query_result_for_step(
            "Return the approved NDCParameters Reject_Code list for the submitted COB "
            "reject-code occurrence scope."
        )

    assert result["queries"] == [corrected]
    assert result["validation_status"] == "VALIDATED"
    assert call_openai.call_count == 2
    assert "configuration-list query" in call_openai.call_args_list[1].args[2]


def test_generate_queries_repairs_selected_row_to_use_stable_identifier():
    ddls = [
        "CREATE TABLE [InMemory].[dbo].[SCHEDULEII] "
        "([ClaimId] nvarchar(max), [MemberId] nvarchar(max), "
        "[ProviderId] nvarchar(max), [RXNumber] nvarchar(max), "
        "[QuantityPrescribed] decimal(29,9));",
        "CREATE TABLE [plandata_rx_production].[dbo].[ClaimPartial] "
        "([claimid] char(15), [AssociatedPrescriptionRefNumber] varchar(50), "
        "[IntendedQuantityToBeDispensed] decimal(29,9));",
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] "
        "([claimid] char(15), [memid] char(15), [provid] char(15));",
    ]
    wrong = (
        "SELECT cp.IntendedQuantityToBeDispensed AS OriginalQuantityPrescribed "
        "FROM plandata_rx_production.dbo.ClaimPartial cp WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "ON c.claimid = cp.claimid "
        "WHERE c.memid = {{MemberId}} AND c.provid = {{ProviderId}} "
        "AND cp.AssociatedPrescriptionRefNumber = {{RxNumber}}"
    )
    corrected = (
        "SELECT s.QuantityPrescribed AS OriginalQuantityPrescribed "
        "FROM InMemory.dbo.SCHEDULEII s "
        "WHERE s.ClaimId = {{OriginalClaimId}}"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[wrong, corrected],
        ) as call_openai,
    ):
        result = generate_query_result_for_step(
            "Return Quantity Prescribed from the selected original paid claim."
        )

    assert result["queries"] == [corrected]
    assert result["validation_status"] == "VALIDATED"
    assert call_openai.call_count == 2
    assert "stable claim identifier" in call_openai.call_args_list[1].args[2]


def test_deterministic_column_repair_uses_unique_schema_owner():
    ddl = """
    CREATE TABLE [plandata_rx_production].[dbo].[claimpharm]
    ([metricqty] money, [dayssupply] int, [ndckey] char(11));
    CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY]
    ([GCNSeqNo] nvarchar(max), [Quantity] decimal(29,9));
    """
    sql = (
        "SELECT cp.QuantityDispensed, cp.DaysSupply, mh.GCNSeqNo_Code "
        "FROM plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "JOIN InMemory.dbo.MEMBER_HISTORY mh ON cp.ndckey = mh.GCNSeqNo"
    )

    repaired = _repair_invalid_column_references(
        sql,
        ddl,
        ["cp.QuantityDispensed", "cp.DaysSupply", "mh.GCNSeqNo_Code"],
    )

    assert "cp.metricqty" in repaired
    assert "cp.dayssupply" in repaired
    assert "mh.gcnseqno" in repaired


def test_deterministic_column_repair_strips_hallucinated_prefix_from_real_column():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([OverrideID] int);"
    sql = "SELECT d.OvrRuleMatchOverrideID FROM HRX.dbo.DrugOverrides d WITH (NOLOCK)"

    repaired = _repair_invalid_column_references(
        sql, ddl, ["d.OvrRuleMatchOverrideID"]
    )

    assert repaired == "SELECT d.overrideid FROM HRX.dbo.DrugOverrides d WITH (NOLOCK)"


def test_generate_queries_returns_deterministically_repaired_column_without_retry():
    ddl = (
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] "
        "([metricqty] money);"
    )
    generated = (
        "SELECT cp.QuantityDispensed AS HistoryQuantity "
        "FROM plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK)"
    )
    corrected = (
        "SELECT cp.metricqty AS HistoryQuantity "
        "FROM plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK)"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=generated,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "deterministic-column-repair",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return historical quantity dispensed",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected]
    assert call_openai.call_count == 1


def test_column_repair_suggests_schema_owned_business_columns():
    ddl = """
    CREATE TABLE [plandata_rx_production].[dbo].[claimpharm]
    ([ndckey] char(11), [metricqty] money, [dayssupply] int);
    CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY]
    ([GCNSeqNo] nvarchar(max), [Quantity] decimal(29,9), [DaysSupply] int);
    """
    sql = (
        "SELECT cp.QuantityDispensed, cp.DaysSupply, mh.GCNSeqNo_Code "
        "FROM plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "JOIN InMemory.dbo.MEMBER_HISTORY mh ON cp.ndckey = mh.GCNSeqNo"
    )

    suggestions = _column_repair_suggestions(
        ["cp.QuantityDispensed", "cp.DaysSupply", "mh.GCNSeqNo_Code"],
        sql,
        ddl,
    )

    assert any("claimpharm.metricqty" in item for item in suggestions)
    assert any("claimpharm.dayssupply" in item for item in suggestions)
    assert any("member_history.gcnseqno" in item for item in suggestions)


def test_prompt_uses_nolock_only_for_physical_tables():
    assert "Never add NOLOCK to InMemory logical DTO table references." in SYSTEM_PROMPT
    assert (
        "Add WITH (NOLOCK) after every physical SQL Server table reference."
        in SYSTEM_PROMPT
    )


def test_generate_queries_repairs_count_when_values_are_requested():
    ddl = (
        "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] "
        "([MemberId] nvarchar(max), [RateCode] nvarchar(max));"
    )
    corrected_sql = (
        "SELECT RateCode FROM InMemory.dbo.ENROLLMENT "
        "WHERE MemberId = {{MemberId}}"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT COUNT(*) FROM InMemory.dbo.ENROLLMENT "
                "WHERE MemberId = {{MemberId}}",
                corrected_sql,
            ],
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "3018",
                "description": "CHIP eligibility rule",
                "acceptance_criteria": "Member must have active coverage",
                "steps": [
                    {
                        "step_number": 4,
                        "business_meaning": "Return active member rate-code values",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 2
    repair_feedback = call_openai.call_args_list[1].args[2]
    assert "COUNT(*) output does not match" in repair_feedback


def test_generate_queries_rejects_count_when_values_are_requested_after_repair():
    ddl = (
        "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] "
        "([MemberId] nvarchar(max), [RateCode] nvarchar(max));"
    )
    count_sql = "SELECT COUNT(*) FROM InMemory.dbo.ENROLLMENT"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=count_sql,
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "3018",
                "steps": [
                    {
                        "step_number": 4,
                        "business_meaning": "Return active member rate-code values",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_matched_true_when_openai_returns_sql():
    with patch("inrules_data_agent.generator.generate._call_openai", return_value=MOCK_SQL):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "3015",
                "steps": [
                    {
                        "step_number": 4,
                        "business_meaning": "Query DrugOverrides WHERE ndc = incoming_ndc AND type = '3013_Opioid'",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [MOCK_SQL]


def test_empty_model_completion_is_retried_before_failure():
    with patch(
        "inrules_data_agent.generator.generate._call_openai", return_value=None
    ) as call_openai:
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "3015",
                "steps": [
                    {
                        "step_number": 4,
                        "business_meaning": "Query DrugOverrides WHERE ndc = incoming_ndc",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert result["failure_category"] == "EMPTY_MODEL_COMPLETION"
    assert call_openai.call_count == 4


def test_repeated_rejected_candidate_stops_repairs_early():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    repeated = "SELECT MissingColumn FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=repeated,
        ) as call_openai,
    ):
        result = generate_query_result_for_step("Return DrugOverrides NDCKey values")

    assert result["queries"] == []
    assert result["failure_category"] == "COLUMN_NOT_IN_DDL"
    assert call_openai.call_count == 2
    assert [attempt["failure_category"] for attempt in result["generation_attempts"]] == [
        "COLUMN_NOT_IN_DDL",
        "REPEATED_MODEL_CANDIDATE",
    ]


def test_bulk_generate_queries_returns_result_per_item_in_order():
    with patch("inrules_data_agent.generator.generate._call_openai", return_value=MOCK_SQL):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries/bulk",
            json={"generation_mode": "strict",
                "items": [
                    {
                        "edit_id": "3015",
                        "steps": [
                            {
                                "step_number": 1,
                                "business_meaning": "global check only",
                                "requires_data_query": False,
                            },
                            {
                                "step_number": 4,
                                "business_meaning": "Query DrugOverrides WHERE ndc = incoming_ndc",
                                "requires_data_query": True,
                            },
                        ],
                    },
                    {
                        "edit_id": "3002",
                        "steps": [
                            {
                                "step_number": 3,
                                "business_meaning": "Query DrugOverrides WHERE hic3 = incoming_hic3",
                                "requires_data_query": True,
                            }
                        ],
                    },
                ]
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert [item["edit_id"] for item in body["items"]] == ["3015", "3002"]
    assert len(body["items"][0]["queries"]) == 1
    assert body["items"][0]["queries"][0]["step_number"] == 4
    assert body["items"][0]["queries"][0]["queries"] == [MOCK_SQL]
    assert len(body["items"][1]["queries"]) == 1
    assert body["items"][1]["queries"][0]["step_number"] == 3
    assert body["items"][1]["queries"][0]["queries"] == [MOCK_SQL]


def test_select_ddls_lists_in_memory_frontier_before_physical_fallback():
    ddls = select_ddls("Return active member rate-code values")

    assert "[InMemory].[dbo]" in ddls[0]
    first_physical = next(
        index for index, ddl in enumerate(ddls) if "[InMemory].[dbo]" not in ddl
    )
    assert all("[InMemory].[dbo]" in ddl for ddl in ddls[:first_physical])


def test_select_ddls_drugoverrides():
    ddls = select_ddls("Query DrugOverrides where NDC matches incoming ndc")
    assert any("DrugOverrides" in ddl for ddl in ddls)
    assert any("NDCKey" in ddl for ddl in ddls)


def test_select_ddls_claim_history():
    ddls = select_ddls("ClaimHistory where status is PAID")
    assert any("CREATE TABLE" in ddl and "claim" in ddl.lower() for ddl in ddls)
    assert any("status" in ddl.lower() for ddl in ddls)


def test_select_ddls_diagnosis_code_includes_complete_ipa_metadata():
    ddls = select_ddls("Query diagnosis code where code matches incoming diagnosis")
    diag_code_ddl = next(ddl for ddl in ddls if "[IPA].[dbo].[DiagCode]" in ddl)

    assert "Stores diagnosis-code reference data used for IPA processing" in diag_code_ddl
    assert "Diagnosis code identifier representing ICD value" in diag_code_ddl
    assert "Present on Admission (POA) value is required" in diag_code_ddl
    assert "Version of ICD coding standard associated with diagnosis code" in diag_code_ddl


def test_select_ddls_includes_enriched_plandata_metadata():
    ddls = select_ddls("Query active member coverage and associated claim")
    claim_ddl = next(
        ddl for ddl in ddls if "[plandata_rx_production].[dbo].[claim]" in ddl
    )
    coverage_ddl = next(
        ddl
        for ddl in ddls
        if "[plandata_rx_production].[dbo].[enrollcoverage]" in ddl
    )

    assert "Header-level claim records for pharmacy or medical services" in claim_ddl
    assert "Primary key of the claim table" in claim_ddl
    assert "Coverage elections for enrolled members" in coverage_ddl
    assert "Ratecode (group num) assigned for the coverage" in coverage_ddl


def test_select_ddls_adds_live_schema_for_history_support_tables():
    def fake_live_schema(database, schema, table):
        return f"CREATE TABLE [{database}].[{schema}].[{table}] ([id] int)"

    with patch(
        "inrules_data_agent.generator.generate._read_live_schema_table",
        side_effect=fake_live_schema,
        create=True,
    ) as read_live_schema:
        ddls = select_ddls(
            "Query claim JOIN claimpharm and enrollkeys LEFT JOIN member using "
            "NDC_Limits DaysTillRefill and NDCMaintDetails MaxScriptDays"
        )

    joined = "\n".join(ddls)
    assert "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm]" in joined
    assert "CREATE TABLE [plandata_rx_production].[dbo].[enrollkeys]" in joined
    assert "CREATE TABLE [plandata_rx_production].[dbo].[member]" in joined
    assert "CREATE TABLE [HRX].[dbo].[NDC_Limits]" in joined
    assert "CREATE TABLE [HRX].[dbo].[NDCMaintDetails]" in joined
    assert "CREATE TABLE [HRX].[dbo].[NDC_Mstr]" in joined
    assert read_live_schema.call_count == 6


def test_packaged_ndc_maintenance_schema_uses_verified_physical_columns():
    with (
        patch("inrules_data_agent.generator.generate.retrieve_schema_ddls", return_value=[]),
        patch("inrules_data_agent.generator.generate._read_live_schema_table", return_value=None),
    ):
        ddls = select_ddls("Read NDCMaintDetails for the current plan and date")

    ddl = next(ddl for ddl in ddls if "[HRX].[dbo].[NDCMaintDetails]" in ddl)
    assert "[Planid] varchar(15) NOT NULL" in ddl
    assert "[GCN_SeqNo] char(6) NOT NULL" in ddl
    assert "[TC] char(3) NOT NULL" in ddl
    assert "[EffDate] smalldatetime NOT NULL" in ddl
    assert "[TermDate] smalldatetime NOT NULL" in ddl
    assert "[MaxScriptDays]" not in ddl


def test_select_ddls_includes_dto_derived_in_memory_tables():
    ddls = select_ddls("Query logical Rules Engine data")
    joined = "\n".join(ddls)

    assert "[InMemory].[dbo].[MEMBER_ATTRIBUTE]" in joined
    assert "[Address_CountryCode] nvarchar(max) NULL" in joined
    assert "[InMemory].[dbo].[DRUG]" in joined
    assert "[NDC_AttrDaysTillRefill] int NOT NULL" in joined
    assert "[InMemory].[dbo].[EO_HISTORY]" in joined
    assert "[RejectEdits_EditId] nvarchar(max) NOT NULL" in joined
    assert "[InMemory].[dbo].[EVENT]" in joined
    assert "[SeverityRankingCode] int NOT NULL" in joined
    assert "[SeverityLevel] nvarchar(max) NULL" in joined
    assert "[ConflictCode] nvarchar(max) NULL" in joined
    assert "[ICN] nvarchar(max) NULL" in joined
    assert "[PrevICN] nvarchar(max) NULL" in joined
    assert "[NdcIndex] int NOT NULL" in joined
    assert "[InMemory].[dbo].[PLAN_AFFILIATIONS]" in joined
    assert "[ContractTermDate] datetime2 NULL" in joined
    assert "[RateCode] nvarchar(max) NULL, -- Displays the rate code of the enrollment record" in joined
    assert "[EffectiveDate] datetime2 NOT NULL, -- Displays the effective date of the member's enrollment segment" in joined
    assert "[PDLStatus] nvarchar(max) NULL, -- PDLStatus represents the status of a drug on a Preferred Drug List" in joined
    assert "[NDC_Code] nvarchar(max) NOT NULL, -- Ndc code" in joined
    assert "Column description source: IR_DTO_schema.xlsx, DTO Schema tab" in joined


def test_select_ddls_without_table_keywords_returns_all_packaged_schemas():
    ddls = select_ddls("Completely unknown data requirement")

    assert len(ddls) == 62
    joined = "\n".join(ddls)
    assert "[HRX].[dbo].[step_therapy_drug]" in joined
    assert "[HRX].[dbo].[step_therapy_level]" in joined
    assert "[plandata_rx_production].[dbo].[authservice]" in joined
    assert "[plandata_rx_production].[dbo].[enrollcoverage]" in joined
    assert "[plandata_rx_production].[dbo].[referral]" in joined
    assert "[plandata_rx_production].[dbo].[ClaimPartial]" in joined
    assert "[plandata_rx_production].[dbo].[claimpharm]" in joined
    assert "[HRX].[dbo].[DrugCoverage]" in joined
    assert "[HRX].[dbo].[FED_FIN_Participation]" in joined
    assert "[HRX].[dbo].[PA_master]" in joined
    assert "[HRX].[dbo].[NDC_DESI_Mstr]" in joined
    assert "[HRX].[dbo].[NDCMedicareCov]" in joined
    assert "[plandata_rx_production].[dbo].[MemberLockIn]" in joined
    assert "[HRX].[dbo].[PA_Gap]" in joined
    assert "[plandata_rx_production].[dbo].[provider]" in joined
    assert "[plandata_rx_production].[dbo].[planprovinfo]" in joined
    assert "[HRX].[dbo].[COMPOUND]" in joined
    assert "[plandata_rx_production].[dbo].[edi_pharm_universal]" in joined
    assert "[HRX].[dbo].[Covid_Config]" in joined
    assert "[HRX].[dbo].[re_group]" in joined
    assert "[HRX].[dbo].[Route_Desc]" in joined


def test_rejects_non_select_llm_output():
    with patch(
        "inrules_data_agent.generator.generate._call_openai",
        return_value="delete from HRX.dbo.DrugOverrides",
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "unsafe",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Query DrugOverrides where NDC matches incoming ndc",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []


def test_generate_queries_retries_when_sql_uses_table_outside_schema():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    corrected_sql = "SELECT COUNT(*) FROM HRX.dbo.DrugOverrides WITH (nolock)"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT COUNT(*) FROM HRX.dbo.HrxRequest WITH (nolock)",
                corrected_sql,
            ],
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "strict",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Query DrugOverrides",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 2


def test_generate_queries_retries_when_sql_has_junk_predicates():
    ddl = "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] ([ndckey] int NULL);"
    corrected_sql = (
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claimpharm WITH (nolock) "
        "WHERE ndckey = {{ClaimTransaction.Ndc}}"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT COUNT(*) FROM plandata_rx_production.dbo.claimpharm WITH (nolock) "
                "WHERE 1 = 0 AND ndckey = ndckey",
                corrected_sql,
            ],
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "strict",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Query claimpharm",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 2


def test_generate_queries_retries_when_sql_uses_join():
    ddl = (
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);"
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdetail] ([claimid] int NULL);"
    )
    corrected_sql = (
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claim WITH (nolock)"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT COUNT(*) FROM plandata_rx_production.dbo.claim c WITH (nolock) "
                "JOIN plandata_rx_production.dbo.claimdetail cd WITH (nolock) "
                "ON cd.claimid = c.claimid",
                corrected_sql,
            ],
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "single-table",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Count matching claims using claim only",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 2


def test_generate_queries_accepts_grounded_physical_join_requested_by_business_meaning():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[enrollkeys] ([memid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[Member] ([memid] int NULL);",
    ]
    joined_sql = (
        "SELECT ek.memid FROM plandata_rx_production.dbo.enrollkeys ek WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.Member m WITH (NOLOCK) "
        "ON ek.memid = m.memid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=joined_sql,
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "grounded-join",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": (
                            "Return enrollkeys memid values that have a matching Member "
                            "using enrollkeys.memid = Member.memid"
                        ),
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [joined_sql]
    call_openai.assert_called_once()


def test_generate_queries_accepts_reviewed_member_history_drugoverride_gcn_join():
    ddls = [
        "CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY] "
        "([GCNSeqNo] nvarchar(6) NULL, [DateOfService] datetime2 NULL);",
        "CREATE TABLE [HRX].[dbo].[DrugOverrides] "
        "([GCN_SeqNo] varchar(6) NULL, [Type] varchar(50) NOT NULL, "
        "[EffDate] smalldatetime NOT NULL, [TermDate] smalldatetime NOT NULL);",
    ]
    joined_sql = (
        "SELECT mh.GCNSeqNo, mh.DateOfService "
        "FROM InMemory.dbo.MEMBER_HISTORY mh "
        "JOIN HRX.dbo.DrugOverrides dox WITH (NOLOCK) "
        "ON dox.GCN_SeqNo = mh.GCNSeqNo "
        "WHERE dox.Type LIKE '%FluVaccine%' "
        "AND {{DateOfService}} BETWEEN dox.EffDate AND dox.TermDate "
        "AND mh.DateOfService BETWEEN dox.EffDate AND dox.TermDate"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=joined_sql),
        patch("inrules_data_agent.app.load_reuse_corpus", return_value={}),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "edit_id": "7290",
                "steps": [{
                    "step_number": 2,
                    "business_meaning": (
                        "Return MEMBER_HISTORY GCNSeqNo and DateOfService rows in the same "
                        "vaccine season whose GCN matches DrugOverrides GCN_SeqNo where "
                        "Type LIKE '%FluVaccine%' and both incoming and history dates fall "
                        "within the same effective period"
                    ),
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["step_queries"][0]
    assert result["query_generated"] is True
    assert result["queries"] == [joined_sql]


def test_generate_queries_rejects_ungrounded_join_key_after_two_attempts():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[enrollkeys] "
        "([memid] int NULL, [familyid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[Member] "
        "([memid] int NULL, [familyid] int NULL);",
    ]
    ungrounded_join_sql = (
        "SELECT ek.memid FROM plandata_rx_production.dbo.enrollkeys ek WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.Member m WITH (NOLOCK) "
        "ON ek.familyid = m.familyid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=ungrounded_join_sql,
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "ungrounded-join",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": (
                            "Return enrollkeys memid values that have a matching Member"
                        ),
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2
    repair_feedback = call_openai.call_args_list[1].args[2].lower()
    assert "join key" in repair_feedback
    assert "ground" in repair_feedback
    assert "runtime placeholders" in repair_feedback
    assert "filter that target table directly" in repair_feedback


def test_generate_queries_rejects_join_that_does_not_connect_its_target():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdiag] ([claimid] int NULL);",
    ]
    disconnected_sql = (
        "SELECT c.claimid FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "ON c.claimid = cp.claimid "
        "JOIN plandata_rx_production.dbo.claimdiag cd WITH (NOLOCK) "
        "ON c.claimid = cp.claimid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=disconnected_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "disconnected-join",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": (
                            "Return claim values joined to claimpharm and claimdiag"
                        ),
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_rejects_repeated_table_join_with_disconnected_alias():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdiag] ([claimid] int NULL);",
    ]
    disconnected_sql = (
        "SELECT c.claimid FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claimdiag cd1 WITH (NOLOCK) "
        "ON c.claimid = cd1.claimid "
        "JOIN plandata_rx_production.dbo.claimdiag cd2 WITH (NOLOCK) "
        "ON c.claimid = cd1.claimid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=disconnected_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "repeated-disconnected-join",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return claim values joined to claimdiag",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_does_not_treat_table_name_substring_as_explicit_intent():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] "
        "([claimid] int NULL, [metricqty] int NULL);",
    ]
    joined_sql = (
        "SELECT cp.metricqty FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "ON c.claimid = cp.claimid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=joined_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "atomic-table-intent",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return claimpharm metricqty values",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_rejects_join_when_repair_still_uses_multiple_tables():
    ddl = (
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);"
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdetail] ([claimid] int NULL);"
    )
    joined_sql = (
        "SELECT COUNT(*) FROM plandata_rx_production.dbo.claim c WITH (nolock) "
        "JOIN plandata_rx_production.dbo.claimdetail cd WITH (nolock) "
        "ON cd.claimid = c.claimid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=joined_sql,
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "single-table",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Count matching claims",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_repairs_inmemory_nolock_hint():
    ddl = "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] ([MemberId] nvarchar(max));"
    corrected_sql = "SELECT MemberId FROM InMemory.dbo.ENROLLMENT"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value="SELECT MemberId FROM InMemory.dbo.ENROLLMENT WITH (NOLOCK)",
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "inmemory-nolock",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return MemberId values from ENROLLMENT",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 1


def test_generate_queries_normalizes_inmemory_nolock_after_alias():
    ddl = "CREATE TABLE [InMemory].[dbo].[MEMBER_HISTORY] ([MemberId] nvarchar(max));"
    generated = "SELECT mh.MemberId FROM InMemory.dbo.MEMBER_HISTORY AS mh WITH (NOLOCK)"
    corrected = "SELECT mh.MemberId FROM InMemory.dbo.MEMBER_HISTORY AS mh"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=generated),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "inmemory-alias-nolock",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return MEMBER_HISTORY MemberId values",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected]


def test_generate_queries_repairs_missing_physical_nolock_hint():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    corrected_sql = "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value="SELECT NDCKey FROM HRX.dbo.DrugOverrides",
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "physical-nolock",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return NDCKey values from DrugOverrides",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 1


def test_generate_queries_allows_sme_grounded_mixed_inmemory_and_physical_join():
    ddls = [
        "CREATE TABLE [InMemory].[dbo].[MEMBER] ([memid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[enrollkeys] ([memid] int NULL);",
    ]
    joined_sql = (
        "SELECT ek.memid FROM plandata_rx_production.dbo.enrollkeys ek WITH (NOLOCK) "
        "JOIN InMemory.dbo.MEMBER m ON ek.memid = m.memid"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=joined_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "mixed-source",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": (
                            "Return enrollkeys memid values matched to MEMBER memid"
                        ),
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [joined_sql]
    assert call_openai.call_count == 1


def test_generate_queries_allows_grounded_tables_implied_by_business_columns():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] "
        "([claimid] char(15), [memid] char(15), [provid] char(15), "
        "[status] char(10), [resubclaimid] char(15));",
        "CREATE TABLE [plandata_rx_production].[dbo].[ClaimPartial] "
        "([claimid] char(15), [DispensingStatus] char(1), "
        "[AssociatedPrescriptionRefNumber] char(15));",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] "
        "([claimid] char(15), [rxnumber] char(50));",
    ]
    sql = (
        "SELECT COUNT(*) AS PriorPartialCount "
        "FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.ClaimPartial p WITH (NOLOCK) "
        "ON p.claimid = c.claimid "
        "JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "ON cp.claimid = c.claimid "
        "WHERE c.memid = {{MemberId}} AND c.provid = {{ProviderId}} "
        "AND cp.rxnumber = {{RxNumber}} AND p.DispensingStatus = 'P'"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=sql),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "concept-grounded-tables",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": (
                        "Count prior P partial fills for the same member, provider, and Rx number"
                    ),
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [sql]


def test_generate_queries_extracts_single_fenced_select_from_model_prose():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    sql = "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    response_text = f"Here is the query:\n```sql\n{sql}\n```\n"
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=response_text,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "fenced-select",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return DrugOverrides NDCKey values",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [sql]
    assert call_openai.call_count == 1


def test_generate_queries_repairs_unparseable_or_multiple_statement_output():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    corrected = "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK); SELECT 1",
                corrected,
            ],
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "repair-multiple-selects",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return DrugOverrides NDCKey values",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected]
    assert call_openai.call_count == 2
    assert "exactly one parseable T-SQL SELECT" in call_openai.call_args_list[1].args[2]


def test_generate_queries_allows_live_fk_claimdetail_claimpharm_relationships():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] char(15));",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdetail] "
        "([claimid] char(15), [claimline] int);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] "
        "([claimid] char(15), [claimline] int, [metricqty] money);",
    ]
    sql = (
        "SELECT cp.metricqty FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claimdetail cd WITH (NOLOCK) "
        "ON cd.claimid = c.claimid "
        "JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "ON cp.claimid = cd.claimid AND cp.claimline = cd.claimline"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=sql),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "live-claim-fks",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return claimpharm metric quantity through claim detail",
                    "requires_data_query": True,
                }],
            },
        )
    assert response.json()["queries"][0]["matched"] is True


def test_generate_queries_allows_live_fk_referral_authservice_relationship():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[referral] "
        "([referralid] char(30), [memid] char(15));",
        "CREATE TABLE [plandata_rx_production].[dbo].[authservice] "
        "([referralid] char(30), [status] char(10));",
    ]
    sql = (
        "SELECT r.referralid FROM plandata_rx_production.dbo.referral r WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.authservice a WITH (NOLOCK) "
        "ON a.referralid = r.referralid WHERE a.status = 'APPROVED'"
    )
    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=sql),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "live-referral-fk",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return approved authservice referral IDs",
                    "requires_data_query": True,
                }],
            },
        )
    assert response.json()["queries"][0]["matched"] is True


def test_generate_queries_rejects_multiple_select_statements():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    multiple_sql = (
        "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK); "
        "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=multiple_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "multiple-statements",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return NDCKey values from DrugOverrides",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_rejects_table_reading_exists_subquery():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdiag] "
        "([claimid] int NULL, [diagcode] nvarchar(max) NULL);",
    ]
    nested_sql = (
        "SELECT diagcode FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "ON c.claimid = cp.claimid WHERE EXISTS (SELECT 1 FROM "
        "plandata_rx_production.dbo.claimdiag cd WITH (NOLOCK))"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=nested_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "nested-scope",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": (
                            "Return claim diagcode using claimpharm and claimdiag"
                        ),
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_allows_grounded_correlated_exists_subquery():
    ddls = [
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] ([claimid] int NULL);",
        "CREATE TABLE [plandata_rx_production].[dbo].[claimdiag] "
        "([claimid] int NULL, [diagcode] nvarchar(max) NULL);",
    ]
    nested_sql = (
        "SELECT cp.claimid FROM plandata_rx_production.dbo.claim c WITH (NOLOCK) "
        "JOIN plandata_rx_production.dbo.claimpharm cp WITH (NOLOCK) "
        "ON c.claimid = cp.claimid WHERE EXISTS (SELECT 1 FROM "
        "plandata_rx_production.dbo.claimdiag cd WITH (NOLOCK) "
        "WHERE cd.claimid = c.claimid)"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=ddls),
        patch("inrules_data_agent.generator.generate._call_openai", return_value=nested_sql),
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={
                "generation_mode": "strict",
                "edit_id": "grounded-subquery",
                "steps": [{
                    "step_number": 1,
                    "business_meaning": "Return claimpharm claim IDs for claim rows having claimdiag history",
                    "requires_data_query": True,
                }],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [nested_sql]


def test_generate_queries_rejects_commented_unknown_table_reference():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    unknown_sql = "SELECT * FROM /* generated */ Evil.dbo.Secrets"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            return_value=unknown_sql,
        ) as call_openai,
    ):
        response = TestClient(create_app()).post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "unknown-table",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Return values from Secrets",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


def test_generate_queries_retries_when_sql_has_raw_request_object_references():
    ddl = "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm] ([metricqty] int NULL);"
    corrected_sql = (
        "SELECT SUM(metricqty) FROM plandata_rx_production.dbo.claimpharm WITH (nolock) "
        "HAVING SUM(metricqty) > {{QuantityDispensed}}"
    )

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT SUM(metricqty) FROM plandata_rx_production.dbo.claimpharm WITH (nolock) "
                "HAVING SUM(metricqty) > HrxRequest.ClaimDetail.ClaimSeg.qtyDispensed_442_E7",
                corrected_sql,
            ],
        ) as call_openai,
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "strict",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Query claimpharm",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == [corrected_sql]
    assert call_openai.call_count == 2


def test_execute_query_returns_results():
    cursor = MagicMock()
    cursor.description = [("n",)]
    cursor.fetchmany.return_value = [(42,)]
    conn = MagicMock()
    conn.__enter__.return_value = conn
    conn.cursor.return_value = cursor

    with patch("inrules_data_agent.app.pyodbc.connect", return_value=conn):
        client = TestClient(create_app())
        response = client.post(
            "/execute_query",
            json={"generation_mode": "strict",
                "sql": "select count(*) as n from HRX.dbo.DrugOverrides (nolock)",
                "params": {},
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["columns"] == ["n"]
    assert body["rows"] == [[42]]
    assert body["row_count"] == 1
    assert "execution_ms" in body


def test_execute_query_substitutes_placeholders():
    cursor = MagicMock()
    cursor.description = [("memid",)]
    cursor.fetchmany.return_value = [("TEST_MEMBER",)]
    conn = MagicMock()
    conn.__enter__.return_value = conn
    conn.cursor.return_value = cursor

    with patch("inrules_data_agent.app.pyodbc.connect", return_value=conn):
        client = TestClient(create_app())
        response = client.post(
            "/execute_query",
            json={"generation_mode": "strict",
                "sql": "select '{{MemberId}}' as memid",
                "params": {"memberid": "TEST_MEMBER"},
            },
        )

    assert response.status_code == 200
    cursor.execute.assert_called_once_with("select 'TEST_MEMBER' as memid")


def test_execute_query_quotes_unquoted_placeholders():
    cursor = MagicMock()
    cursor.description = [("dos",)]
    cursor.fetchmany.return_value = [("2026-07-09",)]
    conn = MagicMock()
    conn.__enter__.return_value = conn
    conn.cursor.return_value = cursor

    with patch("inrules_data_agent.app.pyodbc.connect", return_value=conn):
        client = TestClient(create_app())
        response = client.post(
            "/execute_query",
            json={"generation_mode": "strict",
                "sql": "select {{DateOfService}} as dos",
                "params": {"DateOfService": "2026-07-09"},
            },
        )

    assert response.status_code == 200
    cursor.execute.assert_called_once_with("select '2026-07-09' as dos")


def test_execute_query_rejects_inmemory_logical_table():
    client = TestClient(create_app())
    response = client.post(
        "/execute_query",
        json={"sql": "select * from InMemory.dbo.ENROLLMENT", "params": {}},
    )

    assert response.status_code == 400
    assert "InMemory logical queries" in response.json()["error"]


def test_execute_query_rejects_non_select():
    client = TestClient(create_app())
    response = client.post(
        "/execute_query",
        json={"sql": "delete from HRX.dbo.DrugOverrides", "params": {}},
    )

    assert response.status_code == 400
    assert "Only SELECT" in response.json()["error"]


def test_execute_query_db_error_returns_500():
    with patch("inrules_data_agent.app.pyodbc.connect", side_effect=Exception("db down")):
        client = TestClient(create_app())
        response = client.post(
            "/execute_query",
            json={"sql": "select 1", "params": {}},
        )

    assert response.status_code == 500
    assert "db down" in response.json()["error"]


def test_cleans_sql_code_fence():
    with patch(
        "inrules_data_agent.generator.generate._call_openai",
        return_value="```sql\nselect count(*) from HRX.dbo.DrugOverrides (nolock)\n```",
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={"generation_mode": "strict",
                "edit_id": "clean",
                "steps": [
                    {
                        "step_number": 1,
                        "business_meaning": "Query DrugOverrides where NDC matches incoming ndc",
                        "requires_data_query": True,
                    }
                ],
            },
        )

    result = response.json()["queries"][0]
    assert result["matched"] is True
    assert result["queries"] == ["select count(*) from HRX.dbo.DrugOverrides (nolock)"]
