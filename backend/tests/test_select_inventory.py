from pathlib import Path

from inrules_data_agent.retrieval.select_inventory import analyze_select, load_frontier_tables


FRONTIER = frozenset({"DRUG", "MEMBER", "MEMBER_HISTORY"})


def test_load_frontier_tables_uses_schema_filenames(tmp_path: Path):
    (tmp_path / "InMemory.dbo.DRUG.sql").write_text("CREATE TABLE DRUG", encoding="utf-8")
    (tmp_path / "InMemory.dbo.MEMBER_HISTORY.sql").write_text("CREATE TABLE MEMBER_HISTORY", encoding="utf-8")

    assert load_frontier_tables(tmp_path) == frozenset({"DRUG", "MEMBER_HISTORY"})


def test_uppercase_frontier_without_nolock_is_inmemory():
    evidence = analyze_select("SELECT DEA FROM DRUG WHERE NDC.Code = '{{:Ndckey}}'", FRONTIER)

    assert evidence.parse_status == "PARSED"
    assert evidence.query_shape == "SINGLE_TABLE_SELECT"
    assert evidence.source == "INMEMORY"
    assert evidence.tables[0].basis == "UPPERCASE_FRONTIER_WITHOUT_NOLOCK"


def test_nolock_takes_precedence_over_frontier_name():
    evidence = analyze_select("SELECT DEA FROM DRUG (nolock) WHERE NDCKey = '{{:Ndckey}}'", FRONTIER)

    assert evidence.source == "PHYSICAL"
    assert evidence.tables[0].has_nolock is True
    assert evidence.tables[0].basis == "NOLOCK"


def test_physical_dynamic_output_and_effective_date_are_recorded():
    evidence = analyze_select(
        "select {{:output}} from NDCParameters (nolock) "
        "where parameter_name = '{{:ParameterName}}' "
        "and '{{:DateOfService}}' between EffDate and EndDate",
        FRONTIER,
    )

    assert evidence.source == "PHYSICAL"
    assert evidence.has_dynamic_output is True
    assert evidence.has_effective_date_filter is True
    assert evidence.placeholders == ("output", "ParameterName", "DateOfService")
    assert evidence.filter_columns == ("effdate", "enddate", "parameter_name")


def test_multi_table_join_retains_each_table_source():
    evidence = analyze_select(
        "select ek.carriermemid from enrollkeys ek (nolock) "
        "join Member m (nolock) on m.memid = ek.memid where m.ssn = '{{:SSN}}'",
        FRONTIER,
    )

    assert evidence.query_shape == "MULTI_TABLE_SELECT"
    assert evidence.source == "PHYSICAL"
    assert [table.raw_name for table in evidence.tables] == ["enrollkeys", "Member"]
    assert evidence.joins


def test_expression_fragment_and_malformed_rows_are_not_discarded():
    expression = analyze_select("SELECT IIF('{{:Value}}' = '', 'A', 'B')", FRONTIER)
    fragment = analyze_select("'DEA_Days_{{:DeaInt}}'", FRONTIER)
    malformed = analyze_select("SELECT 'unterminated", FRONTIER)

    assert expression.query_shape == "EXPRESSION_SELECT"
    assert expression.source == "NOT_APPLICABLE"
    assert fragment.parse_status == "NON_SELECT_TEXT"
    assert fragment.query_shape == "FRAGMENT"
    assert malformed.parse_status == "PARSE_ERROR"
    assert malformed.query_shape == "MALFORMED"


def test_meaningful_trailing_zero_is_preserved():
    evidence = analyze_select("SELECT value FROM Config WHERE value = 0", FRONTIER)

    assert evidence.parse_status == "PARSED"
    assert evidence.filter_columns == ("value",)
