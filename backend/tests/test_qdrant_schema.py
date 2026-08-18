from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from qdrant_client import models

from inrules_data_agent.generator.generate import select_ddls
from inrules_data_agent.retrieval.qdrant_schema import (
    _retrieval_text,
    _sparse_vector,
    index_schema_catalog,
    retrieve_schema_ddls,
)


def test_retrieval_text_labels_authoritative_task_and_supporting_context():
    text = _retrieval_text(
        "Return active member rate-code values",
        "CHIP eligibility rule",
        ["Member has active coverage", "Member has no active indicator"],
    )

    assert text.startswith(
        "Authoritative data-query business meaning:\n"
        "Return active member rate-code values"
    )
    assert "Supporting acceptance-criteria context:" in text
    assert "Member has active coverage" in text
    assert "Supporting rule-description context:\nCHIP eligibility rule" in text


def test_sparse_vector_is_deterministic_and_splits_schema_identifiers():
    first = _sparse_vector("NDCKey CHIP_Ratecode member eligibility")
    second = _sparse_vector("NDCKey CHIP_Ratecode member eligibility")

    assert first.indices == second.indices
    assert first.values == second.values
    assert len(first.indices) >= 6
    assert first.indices == sorted(first.indices)


def test_disabled_qdrant_returns_no_results_without_external_calls():
    with (
        patch.dict("os.environ", {"QDRANT_ENABLED": "false"}, clear=False),
        patch("inrules_data_agent.retrieval.qdrant_schema._embed") as embed,
        patch("inrules_data_agent.retrieval.qdrant_schema.QdrantClient") as client,
    ):
        result = retrieve_schema_ddls(
            "Return active member rate-code values",
            description="CHIP eligibility rule",
            acceptance_criteria="Member has active coverage",
        )

    assert result == []
    embed.assert_not_called()
    client.assert_not_called()


def test_retrieve_schema_ddls_uses_openai_dense_and_qdrant_sparse_fusion():
    physical_ddl = "CREATE TABLE [HRX].[dbo].[NDCParameters] ([PARAMETER_VALUE] varchar(50));"
    memory_ddl = "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] ([RateCode] nvarchar(max));"
    query_result = SimpleNamespace(
        points=[
            SimpleNamespace(
                score=0.9,
                payload={"source_type": "physical", "ddl": physical_ddl},
            ),
            SimpleNamespace(
                score=0.8,
                payload={"source_type": "in_memory", "ddl": memory_ddl},
            ),
        ]
    )
    qdrant = MagicMock()
    qdrant.query_points.return_value = query_result

    with (
        patch.dict(
            "os.environ",
            {
                "QDRANT_ENABLED": "true",
                "QDRANT_URL": "http://localhost:6333",
                "QDRANT_COLLECTION": "test_schema",
            },
            clear=False,
        ),
        patch(
            "inrules_data_agent.retrieval.qdrant_schema._embed",
            return_value=[[0.1, 0.2]],
        ) as embed,
        patch(
            "inrules_data_agent.retrieval.qdrant_schema.QdrantClient",
            return_value=qdrant,
        ),
    ):
        result = retrieve_schema_ddls(
            "Return active member rate-code values",
            description="CHIP eligibility rule",
            acceptance_criteria="Member has active coverage",
        )

    assert result == [memory_ddl, physical_ddl]
    embedded_text = embed.call_args.args[0][0]
    assert "Return active member rate-code values" in embedded_text
    assert "Member has active coverage" in embedded_text
    call = qdrant.query_points.call_args.kwargs
    assert call["collection_name"] == "test_schema"
    assert len(call["prefetch"]) == 2
    assert isinstance(call["query"], models.FusionQuery)


def test_select_ddls_passes_ado_context_to_qdrant_retrieval():
    ddl = "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] ([RateCode] nvarchar(max));"
    with patch(
        "inrules_data_agent.generator.generate.retrieve_schema_ddls",
        return_value=[ddl],
    ) as retrieve:
        result = select_ddls(
            "Return active member rate-code values",
            description="CHIP eligibility rule",
            acceptance_criteria=["Member has active coverage"],
        )

    assert result == [ddl]
    retrieve.assert_called_once_with(
        "Return active member rate-code values",
        description="CHIP eligibility rule",
        acceptance_criteria=["Member has active coverage"],
    )


def test_select_ddls_falls_back_to_packaged_catalog_when_qdrant_fails():
    with patch(
        "inrules_data_agent.generator.generate.retrieve_schema_ddls",
        side_effect=ConnectionError("Qdrant is unavailable"),
    ):
        result = select_ddls("Return active member rate-code values")

    assert len(result) == 62
    assert "[InMemory].[dbo]" in result[0]
    assert any("[plandata_rx_production].[dbo].[claim]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[DrugCoverage]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[NDC_DESI_Mstr]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[NDCMedicareCov]" in ddl for ddl in result)
    assert any("[plandata_rx_production].[dbo].[MemberLockIn]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[PA_Gap]" in ddl for ddl in result)
    assert any("[plandata_rx_production].[dbo].[provider]" in ddl for ddl in result)
    assert any("[plandata_rx_production].[dbo].[planprovinfo]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[COMPOUND]" in ddl for ddl in result)
    assert any("[plandata_rx_production].[dbo].[edi_pharm_universal]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[Covid_Config]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[re_group]" in ddl for ddl in result)
    assert any("[HRX].[dbo].[Route_Desc]" in ddl for ddl in result)


def test_index_schema_catalog_upserts_complete_dense_and_sparse_documents(tmp_path):
    memory_dir = tmp_path / "memory"
    schema_dir = tmp_path / "schema"
    memory_dir.mkdir()
    schema_dir.mkdir()
    (memory_dir / "enrollment.sql").write_text(
        "CREATE TABLE [InMemory].[dbo].[ENROLLMENT] ([RateCode] nvarchar(max));",
        encoding="utf-8",
    )
    (schema_dir / "claim.sql").write_text(
        "CREATE TABLE [plandata_rx_production].[dbo].[claim] ([claimid] int);",
        encoding="utf-8",
    )
    qdrant = MagicMock()
    qdrant.collection_exists.return_value = False

    with (
        patch(
            "inrules_data_agent.retrieval.qdrant_schema.QdrantClient",
            return_value=qdrant,
        ),
        patch(
            "inrules_data_agent.retrieval.qdrant_schema._embed",
            return_value=[[0.1, 0.2], [0.3, 0.4]],
        ),
    ):
        result = index_schema_catalog(schema_dir, memory_dir)

    assert result == {
        "collection": "inrule_schema",
        "indexed": 2,
        "in_memory": 1,
        "physical": 1,
    }
    qdrant.create_collection.assert_called_once()
    points = qdrant.upsert.call_args.kwargs["points"]
    assert len(points) == 2
    assert all("dense" in point.vector and "sparse" in point.vector for point in points)
    assert all("CREATE TABLE" in point.payload["ddl"] for point in points)
