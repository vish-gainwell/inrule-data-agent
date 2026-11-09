import importlib
import json
import logging
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock

import openpyxl
import pytest

DDL = """CREATE TABLE [HRX].[dbo].[NDCParameters] (
    [parameter_name] varchar(50),
    [parameter_value] varchar(100),
    [effdate] datetime,
    [enddate] datetime
);"""
MEANING = "Retrieve the configured parameter value for the supplied parameter name effective on the date of service."


def golden():
    return importlib.import_module("inrules_data_agent.golden_queries")


@pytest.fixture(autouse=True)
def enabled(monkeypatch):
    monkeypatch.setenv("GOLDEN_QUERY_EXAMPLES_ENABLED", "true")


def test_catalog_has_all_yes_rows_and_only_color_groups():
    entries = golden().load_golden_queries()
    assert len(entries) == 52
    variants = [v for entry in entries for v in entry.variants]
    assert len(variants) == 60
    assert len({v.name for v in variants}) == 60
    assert all(v.review_decision == "Yes" for v in variants)
    assert sorted(len(e.variants) for e in entries if len(e.variants) > 1) == [2, 3, 6]
    ndc = next(e for e in entries if len(e.variants) == 6)
    assert {v.row for v in ndc.variants} == {6, 8, 18, 49, 51, 55}
    assert all(v.query_text.lower().startswith("select") for v in variants)


def test_malformed_approved_sql_is_preserved_but_not_selected():
    g = golden()
    entry = next(e for e in g.load_golden_queries() if e.variants[0].row == 27)
    assert "where enrollid" in entry.variants[0].query_text
    assert not entry.variants[0].eligible
    assert entry.variants[0].issue
    selected = g.select_golden_queries(entry.variants[0].intent, "CREATE TABLE dbo.enrollkeys (enrollid int);")
    assert not any(v.row == 27 for _, v in selected)


def test_relevant_examples_are_unique_bounded_and_schema_scoped():
    g = golden()
    selected = g.select_golden_queries(MEANING, DDL)
    assert selected
    assert len(selected) <= 3
    assert len({entry.entry_id for entry, _ in selected}) == len(selected)
    assert any(len(entry.variants) == 6 for entry, _ in selected)
    assert all(set(v.tables) <= {"ndcparameters"} for _, v in selected)
    assert len(g.build_golden_query_context(MEANING, DDL)) <= g.MAX_CONTEXT_CHARS


@pytest.mark.parametrize("ddl", ["", "CREATE TABLE InMemory.dbo.NDCParameters (x int);", "CREATE TABLE HRX.dbo.OtherTable (x int);"])
def test_missing_or_inmemory_schema_does_not_authorize_physical_examples(ddl):
    assert golden().select_golden_queries(MEANING, ddl) == ()


def test_irrelevant_business_meaning_does_not_select_from_ddl_alone():
    assert golden().select_golden_queries("Send a welcome email to the user.", DDL) == ()


def test_explicit_request_source_does_not_select_examples_from_other_tables():
    ddl = "\n".join(p.read_text(encoding="utf-8") for p in (Path(__file__).resolve().parents[1] / "src/inrules_data_agent/schema").glob("*.sql"))
    selected = golden().select_golden_queries(
        "Return the Manufacturer from HRX.dbo.Covid_Config whose COVIDID equals {{CovidId}}. No date or drug filters, no joins, no aggregation.", ddl
    )
    assert selected == ()


def test_generic_parameter_request_does_not_select_dea_specialization():
    selected = golden().select_golden_queries(MEANING, DDL)
    assert selected
    assert not any(v.row == 90 for _, v in selected)


def test_adjudication_request_does_not_select_service_date_examples():
    selected = golden().select_golden_queries(
        "Retrieve the configured parameter value for a parameter name effective on the adjudication date.", DDL
    )
    assert selected
    assert all("date of service" not in v.example_intent.casefold() for _, v in selected)


def test_missing_best_match_schema_does_not_backfill_unrelated_provider_queries():
    assert golden().select_golden_queries(
        "Retrieves the requested attribute value for a provider and attribute identifier that is effective on the date of service.",
        "CREATE TABLE dbo.provider (provid int); CREATE TABLE dbo.planprovinfo (provid int);",
    ) == ()


def test_group_retains_and_selects_adjudication_date_variant():
    selected = golden().select_golden_queries(
        "Retrieve the configured parameter value for a parameter name effective on the adjudication date.", DDL
    )
    entry, variant = next((e, v) for e, v in selected if len(e.variants) == 6)
    assert variant.row == 49
    assert "{{:fdtAdjudDate}}" in variant.query_text
    assert len(entry.variants) == 6


def test_disabled_invalid_configuration_and_invalid_catalog_omit_examples(monkeypatch, caplog):
    g = golden()
    for value in ("false", "perhaps"):
        monkeypatch.setenv("GOLDEN_QUERY_EXAMPLES_ENABLED", value)
        assert g.build_golden_query_context(MEANING, DDL) == ""
    monkeypatch.setenv("GOLDEN_QUERY_EXAMPLES_ENABLED", "true")
    def fail():
        raise ValueError("SECRET /private/path")
    monkeypatch.setattr(g, "load_golden_queries", fail)
    with caplog.at_level(logging.WARNING, logger=g.__name__):
        assert g.build_golden_query_context(MEANING, DDL) == ""
    assert "SECRET" not in caplog.text
    assert "private/path" not in caplog.text


@pytest.mark.parametrize("field,value", [("suggested_changes", 42), ("comments", ["bad"]), ("row", -1), ("eligible", "true")])
def test_malformed_catalog_fields_safely_omit_examples(monkeypatch, caplog, field, value):
    g = golden()
    payload = g.yaml.safe_load(g.resources.files(g.__package__).joinpath("examples.v1.yaml").read_text(encoding="utf-8"))
    payload["entries"][0]["variants"][0][field] = value
    g.load_golden_queries.cache_clear()
    monkeypatch.setattr(g.yaml, "safe_load", lambda text: payload)
    try:
        with caplog.at_level(logging.WARNING, logger=g.__name__):
            assert g.build_golden_query_context(MEANING, DDL) == ""
        assert "invalid_catalog" == caplog.records[-1].golden_reason
    finally:
        g.load_golden_queries.cache_clear()


def test_prompt_preserves_current_task_and_output_boundary():
    from inrules_data_agent.generator.generate import _build_user_message
    g = golden()
    message = _build_user_message(MEANING, DDL, acceptance_criteria="Return the requested string, not a count.")
    assert g.GOLDEN_QUERY_HEADER in message
    assert message.index(g.GOLDEN_QUERY_HEADER) < message.index("CURRENT DATA QUERY BUSINESS MEANING")
    assert message.endswith(MEANING)
    assert "Return the requested string, not a count." in message
    assert "{{:output}}" in message
    assert "does not imply COUNT" in message
    assert "current requirement and DDL take precedence" in message


def test_actual_provider_request_contains_examples():
    from inrules_data_agent.generator.generate import _complete_query_request
    client = MagicMock()
    client.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps({"query_text": "SELECT parameter_value FROM HRX.dbo.NDCParameters"})))])
    _complete_query_request(client, "test-model", MEANING, DDL)
    messages = client.chat.completions.create.call_args.kwargs["messages"]
    assert golden().GOLDEN_QUERY_HEADER in messages[1]["content"]
    assert messages[1]["content"].endswith(MEANING)


@pytest.mark.parametrize("enabled", ["true", "false"])
def test_api_generation_passes_through_examples_and_existing_validation(monkeypatch, enabled):
    from fastapi.testclient import TestClient
    from inrules_data_agent.app import create_app
    from inrules_data_agent.generator import generate
    monkeypatch.setenv("GOLDEN_QUERY_EXAMPLES_ENABLED", enabled)
    monkeypatch.setattr(generate, "select_ddls", lambda *args, **kwargs: [DDL])
    sql = "SELECT parameter_value FROM HRX.dbo.NDCParameters WHERE parameter_name = '{{ParameterName}}' AND '{{DateOfService}}' BETWEEN effdate AND enddate"
    client = MagicMock()
    client.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps({"query_text": sql})))])
    def provider(task, ddl, repair_feedback=None, **kwargs):
        kwargs.pop("jurisdiction", None)
        return generate._complete_query_request(client, "test-model", task, ddl, repair_feedback=repair_feedback, **kwargs)
    monkeypatch.setattr(generate, "_call_configured_provider", provider)
    response = TestClient(create_app()).post("/generate_queries", json={
        "edit_id": "golden-integration", "generation_mode": "strict",
        "steps": [{"step_number": 1, "business_meaning": MEANING, "requires_data_query": True}],
    })
    assert response.status_code == 200
    result = response.json()["step_queries"][0]
    assert result["query_generated"] is True
    assert result["validation_status"] == "VALIDATED"
    message = client.chat.completions.create.call_args.kwargs["messages"][1]["content"]
    assert (golden().GOLDEN_QUERY_HEADER in message) is (enabled == "true")


def test_examples_do_not_bypass_sql_write_rejection(monkeypatch):
    from inrules_data_agent.generator import generate
    monkeypatch.setattr(generate, "select_ddls", lambda *args, **kwargs: [DDL])
    client = MagicMock()
    client.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=json.dumps({"query_text": "DELETE FROM HRX.dbo.NDCParameters"})))])
    def provider(task, ddl, repair_feedback=None, **kwargs):
        kwargs.pop("jurisdiction", None)
        return generate._complete_query_request(client, "test-model", task, ddl, repair_feedback=repair_feedback, **kwargs)
    monkeypatch.setattr(generate, "_call_configured_provider", provider)
    result = generate.generate_query_result_for_step(MEANING)
    assert result["queries"] == []
    assert golden().GOLDEN_QUERY_HEADER in client.chat.completions.create.call_args.kwargs["messages"][1]["content"]


def test_sql_validation_rejects_multi_statement_dml_and_select_into():
    check = golden().inspect_template
    for sql in ("EXECUTE dbo.test", "SELECT x FROM t; DELETE FROM t", "SELECT x INTO t2 FROM t", "SELECT x FROM t WHERE a=1 WHERE b=2"):
        tables, issue = check(sql)
        assert issue, sql
    tables, issue = check("select {{:output}} from dbo.t where id IN ([[:Ids]]) and code='{{:Code}}'")
    assert not issue
    assert tables == ("t",)


def test_exporter_filters_yes_and_groups_only_explicit_colors(tmp_path):
    spec = importlib.util.spec_from_file_location("export_golden_queries", Path(__file__).resolve().parents[1] / "scripts/export_golden_queries.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    p = tmp_path / "review.xlsx"
    w = openpyxl.Workbook(); s = w.active; s.title = "Review Results"
    s.append(["reviewer", "Name", "# Occurence", "Generic Query Template (QueryText)", "Draft Intent Summary", "Is Intent Summary Correct?", "Additional Comments", "Suggested Changes"])
    for name, sql, review in [("first", "SELECT x FROM t", "Yes"), ("alias", "SELECT x FROM t", "YES"), ("unfilled1", "SELECT x FROM t", "Yes"), ("unfilled2", "SELECT x FROM t", "Yes"), ("rejected", "SELECT x FROM t", "Not really")]:
        s.append(["Reviewer", name, 1, sql, "Retrieve x", review])
    for row in (2, 3): s.cell(row, 4).fill = openpyxl.styles.PatternFill("solid", fgColor="FFAAFFAA")
    w.save(p); before = p.read_bytes()
    payload = module.export_catalog(p)
    assert len(payload["entries"]) == 3
    assert sorted(len(e["variants"]) for e in payload["entries"]) == [1, 1, 2]
    assert payload["source"]["selected_rows"] == 4
    assert p.read_bytes() == before


def test_mismatched_color_group_is_rejected_instead_of_silently_merged(tmp_path):
    spec = importlib.util.spec_from_file_location("export_golden_queries", Path(__file__).resolve().parents[1] / "scripts/export_golden_queries.py")
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    p = tmp_path / "review.xlsx"
    w = openpyxl.Workbook(); s = w.active; s.title = "Review Results"
    s.append(["reviewer", "Name", "# Occurence", "Generic Query Template (QueryText)", "Draft Intent Summary", "Is Intent Summary Correct?", "Additional Comments", "Suggested Changes"])
    for name, sql in [("equals", "SELECT x FROM t WHERE type='{{:Type}}'"), ("like", "SELECT x FROM t WHERE type LIKE '{{:Type}}'")]:
        s.append(["Reviewer", name, 1, sql, "Retrieve x", "Yes"])
        s.cell(s.max_row, 4).fill = openpyxl.styles.PatternFill("solid", fgColor="FFAAFFAA")
    w.save(p)
    with pytest.raises(ValueError, match="color group"):
        module.export_catalog(p)
