from unittest.mock import patch

from inrules_data_agent.retrieval.querytext_shadow import (
    DataQueryAssignmentExample,
    StoredQueryText,
    find_reuse_match,
    load_querytext_rows,
    load_reuse_corpus,
    write_reuse_catalog,
)


def _corpus():
    query = StoredQueryText(
        101,
        "NDCParams_ValueByName",
        1,
        "select {{:output}} from ndcparameters (nolock) "
        "where parameter_name = '{{:ParamName}}'",
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
    return {101: (query, (assignment,))}


def test_sqlite_catalog_reconstructs_reuse_corpus_without_claimengine(tmp_path, monkeypatch):
    catalog = write_reuse_catalog(tmp_path / "reuse.sqlite3", _corpus())
    monkeypatch.setenv("DATAQUERY_CATALOG_PATH", str(catalog))

    with patch(
        "inrules_data_agent.retrieval.querytext_shadow._load_reuse_corpus_from_claimengine",
        side_effect=AssertionError("live database should not be called"),
    ):
        corpus = load_reuse_corpus()

    query, assignments = corpus[101]
    assert query.name == "NDCParams_ValueByName"
    assert assignments == _corpus()[101][1]

    generated = (
        "SELECT PARAMETER_VALUE FROM HRX.dbo.NDCParameters WITH (NOLOCK) "
        "WHERE PARAMETER_NAME = 'Medicare_Age_Years'"
    )
    match = find_reuse_match(generated, corpus)
    assert match is not None
    assert match.proposed_query_params == {"ParamName": "Medicare_Age_Years"}


def test_sqlite_catalog_supplies_shadow_rows_without_claimengine(tmp_path, monkeypatch):
    catalog = write_reuse_catalog(tmp_path / "reuse.sqlite3", _corpus())
    monkeypatch.setenv("DATAQUERY_CATALOG_PATH", str(catalog))

    with patch(
        "inrules_data_agent.retrieval.querytext_shadow._load_querytext_rows_from_claimengine",
        side_effect=AssertionError("live database should not be called"),
    ):
        rows = load_querytext_rows()

    assert rows == (_corpus()[101][0],)


def test_invalid_sqlite_catalog_falls_back_to_claimengine(tmp_path, monkeypatch):
    catalog = tmp_path / "invalid.sqlite3"
    catalog.touch()
    monkeypatch.setenv("DATAQUERY_CATALOG_PATH", str(catalog))

    with patch(
        "inrules_data_agent.retrieval.querytext_shadow._load_reuse_corpus_from_claimengine",
        return_value=_corpus(),
    ) as live_loader:
        assert load_reuse_corpus() == _corpus()

    live_loader.assert_called_once_with()
