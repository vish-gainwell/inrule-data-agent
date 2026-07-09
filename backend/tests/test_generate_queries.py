from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from inrules_data_agent.app import create_app
from inrules_data_agent.generator.generate import select_ddls

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
            json={
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


def test_matched_true_when_openai_returns_sql():
    with patch("inrules_data_agent.generator.generate._call_openai", return_value=MOCK_SQL):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={
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
            json={
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
            json={
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


def test_select_ddls_drugoverrides():
    ddls = select_ddls("Query DrugOverrides where NDC matches incoming ndc")
    assert any("DrugOverrides" in ddl for ddl in ddls)
    assert any("NDCKey" in ddl for ddl in ddls)


def test_select_ddls_claim_history():
    ddls = select_ddls("ClaimHistory where status is PAID")
    assert any("CREATE TABLE" in ddl and "claim" in ddl.lower() for ddl in ddls)
    assert any("status" in ddl.lower() for ddl in ddls)


def test_select_ddls_memberattribute_adds_known_gap_note():
    ddls = select_ddls("Query MemberAttribute where attributevalue is NURSING_HOME")
    assert any("MemberAttribute table DDL is not yet available" in ddl for ddl in ddls)


def test_select_ddls_fallback_returns_all_schema_files():
    ddls = select_ddls("Completely unknown data requirement")
    assert len(ddls) >= 20
    assert any("DrugOverrides" in ddl for ddl in ddls)
    assert any("NDCParameters" in ddl for ddl in ddls)


def test_rejects_non_select_llm_output():
    with patch(
        "inrules_data_agent.generator.generate._call_openai",
        return_value="delete from HRX.dbo.DrugOverrides",
    ):
        client = TestClient(create_app())
        response = client.post(
            "/generate_queries",
            json={
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
            json={
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
            json={
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
            json={
                "sql": "select {{DateOfService}} as dos",
                "params": {"DateOfService": "2026-07-09"},
            },
        )

    assert response.status_code == 200
    cursor.execute.assert_called_once_with("select '2026-07-09' as dos")


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
            json={
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
