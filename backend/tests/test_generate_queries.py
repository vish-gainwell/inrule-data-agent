from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from inrules_data_agent.app import create_app
from inrules_data_agent.generator.generate import (
    SYSTEM_PROMPT,
    _build_user_message,
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
        acceptance_criteria=[
            "Member has an active CHIP rate code",
            "Member has no active CHIP indicator",
        ],
        draft_mode=False,
    )
    assert response.json()["description"] == "CHIP eligibility rule"


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
    assert body["step_queries"][0]["query_task"] == (
        "Query HRX.dbo.NDCParameters WHERE PARAMETER_NAME = 'Medicare_Age_Years' RETURNS PARAMETER_VALUE."
    )
    assert body["step_queries"][0]["matched"] is True
    assert body["step_queries"][1]["matched"] is False
    assert body["unmatched_steps"] == [2]
    assert body["inconclusive_steps"] == []
    assert body["data_agent_status"] == "available"
    assert body["data_agent_mode"] == "in_process"
    assert body["generation_mode"] == "draft"
    assert generate_step.call_count == 2


def test_draft_mode_returns_review_only_candidate_when_business_validation_fails():
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
    assert result["validation_status"] == "DRAFT_REQUIRES_REVIEW"
    assert result["query_generated"] is True
    assert result["review_notes"]
    assert result["publishable"] is True
    assert result["failure_category"] == "VALIDATION_REJECTED"
    assert result["queries"] == ["SELECT Id FROM HRX.dbo.KnownTable WITH (NOLOCK) WHERE 1 = 1"]


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

    assert "RULE DESCRIPTION (context only):\nCHIP eligibility rule" in message
    assert "1. Member has active coverage" in message
    assert "2. No CHIP indicator" in message
    assert "CURRENT DATA QUERY BUSINESS MEANING (authoritative query task):" in message
    assert message.endswith("Return active member rate-code values")
    assert "Apply this information hierarchy strictly" in SYSTEM_PROMPT
    assert "project those exact mapped columns" in SYSTEM_PROMPT
    assert "do not import other acceptance-" in SYSTEM_PROMPT
    assert "Never guess semantic mappings" in SYSTEM_PROMPT


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


def test_matched_false_when_openai_returns_none():
    with patch("inrules_data_agent.generator.generate._call_openai", return_value=None):
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

    assert "Stores detailed records and attributes related to the Diagnosis Code" in diag_code_ddl
    assert "Code identifier associated with the DiagCode entry" in diag_code_ddl
    assert "Indicates if POA is required for the DiagCode entry" in diag_code_ddl
    assert "used for healthcare claims, IPA rule evaluation, validation, or audit tracking" in diag_code_ddl


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
            "Query claim JOIN claimpharm and enrollkeys LEFT JOIN member "
            "using NDC_Limits DaysTillRefill"
        )

    joined = "\n".join(ddls)
    assert "CREATE TABLE [plandata_rx_production].[dbo].[claimpharm]" in joined
    assert "CREATE TABLE [plandata_rx_production].[dbo].[enrollkeys]" in joined
    assert "CREATE TABLE [plandata_rx_production].[dbo].[member]" in joined
    assert "CREATE TABLE [HRX].[dbo].[NDC_Limits]" in joined
    assert read_live_schema.call_count == 4


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

    assert len(ddls) == 45
    joined = "\n".join(ddls)
    assert "[HRX].[dbo].[step_therapy_drug]" in joined
    assert "[HRX].[dbo].[step_therapy_level]" in joined
    assert "[plandata_rx_production].[dbo].[authservice]" in joined
    assert "[plandata_rx_production].[dbo].[enrollcoverage]" in joined
    assert "[plandata_rx_production].[dbo].[referral]" in joined


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
            side_effect=[
                "SELECT MemberId FROM InMemory.dbo.ENROLLMENT WITH (NOLOCK)",
                corrected_sql,
            ],
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
    assert call_openai.call_count == 2


def test_generate_queries_repairs_missing_physical_nolock_hint():
    ddl = "CREATE TABLE [HRX].[dbo].[DrugOverrides] ([NDCKey] int NULL);"
    corrected_sql = "SELECT NDCKey FROM HRX.dbo.DrugOverrides WITH (NOLOCK)"

    with (
        patch("inrules_data_agent.generator.generate.select_ddls", return_value=[ddl]),
        patch(
            "inrules_data_agent.generator.generate._call_openai",
            side_effect=[
                "SELECT NDCKey FROM HRX.dbo.DrugOverrides",
                corrected_sql,
            ],
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
    assert call_openai.call_count == 2


def test_generate_queries_rejects_mixed_inmemory_and_physical_join():
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
    assert result["matched"] is False
    assert result["queries"] == []
    assert call_openai.call_count == 2


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
