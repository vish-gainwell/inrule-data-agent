from __future__ import annotations

from dataclasses import FrozenInstanceError
from importlib import resources

import pytest
import yaml
from fastapi.testclient import TestClient

import inrules_data_agent.app as app_module
from inrules_data_agent.app import GenerateQueriesRequest, Step, create_app
from inrules_data_agent.data_query_intents import (
    load_intent_catalog,
    parse_intent_catalog,
)
from inrules_data_agent.retrieval.querytext_shadow import find_reuse_match

EXPECTED = {
    "NDCParams_ValueByNameAndDOS": (
        "068af474e0a3f8873140f9415fe2230c2bbb218ca8e67657f1216dd976d196ed",
        21,
        9,
    ),
    "NdcparametersByParameter_nameEnddate_1_1": (
        "a37ba43432e29aa05dd831db7fb03e2abcea06b6bf48daed3fb739aca19f62a9",
        13,
        10,
    ),
    "NdcparametersByParameter_nameEnddate_1_2": (
        "25efed50177868f3b7deb78024e85860359b8ea65a9c05cdabfff76aa4db8e96",
        12,
        7,
    ),
    "NdcparametersByParameter_nameEnddate_66": (
        "5480c82429aa1ea141c61eaf095bf06bbde41eb467f464d996214629e53bd359",
        12,
        6,
    ),
    "DrugoverridesByTypeTermdate_75": (
        "64667b5f4ea4f66b2d28ce9b2c3b9f89e7ca4e987a132b0e48af10788a60c687",
        8,
        7,
    ),
    "ProviderattributeByProvidAttributeidTermdate_268": (
        "06e358df463ce779bbcaa472f9f10a3f25af5c3a55d5e2d882f1baf69bf491c0",
        6,
        6,
    ),
}
PUBLIC_ITEM_KEYS = {
    "data_query_name",
    "query_intent_summary",
    "review_status",
    "usage",
}


def _valid_payload() -> dict:
    return {
        "schema_version": 1,
        "items": [
            {
                "data_query_name": "ExampleQuery",
                "query_intent_summary": "Retrieve the requested value.",
                "review_status": "pending",
                "usage": {
                    "curated_assignment_count": 1,
                    "distinct_rule_count": 1,
                },
                "query_text_sha256": "a" * 64,
            }
        ],
    }


def test_packaged_catalog_loads_exact_verified_six_as_immutable_pending_records():
    load_intent_catalog.cache_clear()
    catalog = load_intent_catalog()

    assert catalog.schema_version == 1
    assert len(catalog.items) == 6
    assert {
        item.data_query_name: (
            item.query_text_sha256,
            item.usage.curated_assignment_count,
            item.usage.distinct_rule_count,
        )
        for item in catalog.items
    } == EXPECTED
    assert {item.review_status for item in catalog.items} == {"pending"}
    with pytest.raises(FrozenInstanceError):
        catalog.items[0].review_status = "approved"  # type: ignore[misc]


def test_packaged_yaml_uses_only_internal_catalog_fields():
    catalog_text = resources.files("inrules_data_agent.data_query_intents").joinpath(
        "intents.v1.yaml"
    ).read_text(encoding="utf-8")
    payload = yaml.safe_load(catalog_text)

    assert set(payload) == {"schema_version", "items"}
    for item in payload["items"]:
        assert set(item) == PUBLIC_ITEM_KEYS | {"query_text_sha256"}
        assert set(item["usage"]) == {
            "curated_assignment_count",
            "distinct_rule_count",
        }


@pytest.mark.parametrize(
    ("mutate", "message"),
    [
        (lambda payload: payload.update(schema_version=2), "schema_version"),
        (lambda payload: payload.update(schema_version=True), "schema_version"),
        (
            lambda payload: payload["items"].append(payload["items"][0].copy()),
            "duplicate data query intent name",
        ),
        (
            lambda payload: payload["items"][0].update(review_status="Pending"),
            "review_status must be one of",
        ),
        (
            lambda payload: payload["items"][0].update(query_text_sha256="A" * 64),
            "64-character lowercase hex hash",
        ),
        (
            lambda payload: payload["items"][0].update(query_intent_summary=""),
            "query_intent_summary must be a nonempty string",
        ),
        (
            lambda payload: payload["items"][0].update(
                query_intent_summary="x" * 501
            ),
            "query_intent_summary must be at most 500 characters",
        ),
    ],
)
def test_catalog_rejects_invalid_content(mutate, message):
    payload = _valid_payload()
    mutate(payload)

    with pytest.raises(ValueError, match=message):
        parse_intent_catalog(yaml.safe_dump(payload, sort_keys=False))


def test_catalog_rejects_malformed_yaml():
    with pytest.raises(ValueError, match="malformed YAML"):
        parse_intent_catalog("items: [")


def test_list_filter_detail_and_not_found_contract():
    client = TestClient(create_app())

    all_response = client.get("/data-query-intents")
    pending_response = client.get("/data-query-intents", params={"status": "pending"})
    approved_response = client.get("/data-query-intents", params={"status": "approved"})
    detail_response = client.get("/data-query-intents/NDCParams_ValueByNameAndDOS")
    missing_response = client.get("/data-query-intents/UnknownQuery")

    assert all_response.status_code == 200
    assert all_response.json()["schema_version"] == 1
    assert all_response.json()["total"] == 6
    assert all(set(item) == PUBLIC_ITEM_KEYS for item in all_response.json()["items"])
    assert pending_response.json() == all_response.json()
    assert approved_response.json() == {"schema_version": 1, "total": 0, "items": []}
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert set(detail) == PUBLIC_ITEM_KEYS
    assert detail["data_query_name"] == "NDCParams_ValueByNameAndDOS"
    assert detail["review_status"] == "pending"
    assert detail["usage"] == {
        "curated_assignment_count": 21,
        "distinct_rule_count": 9,
    }
    assert missing_response.status_code == 404
    assert missing_response.json() == {"detail": "Data Query intent not found"}


@pytest.mark.parametrize("status", ["Pending", "unknown", ""])
def test_list_rejects_invalid_status_filter(status):
    response = TestClient(create_app()).get(
        "/data-query-intents", params={"status": status}
    )

    assert response.status_code == 422


def test_responses_do_not_expose_hash_sql_or_workbook_details():
    response = TestClient(create_app()).get("/data-query-intents")
    response_text = response.text.casefold()

    assert response.status_code == 200
    assert "query_text_sha256" not in response_text
    assert "evidence" not in response_text
    assert EXPECTED["NDCParams_ValueByNameAndDOS"][0] not in response_text
    assert "select " not in response_text
    assert "data query_usage_report.xlsx" not in response_text
    assert "project_artifacts" not in response_text


def test_cors_defaults_to_local_frontend_origins(monkeypatch):
    monkeypatch.delenv("CORS_ALLOWED_ORIGINS", raising=False)
    client = TestClient(create_app())

    localhost = client.get(
        "/data-query-intents", headers={"Origin": "http://localhost:5173"}
    )
    loopback = client.get(
        "/data-query-intents", headers={"Origin": "http://127.0.0.1:5173"}
    )

    assert localhost.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert loopback.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"


def test_cors_uses_trimmed_configured_origins_and_ignores_blanks(monkeypatch):
    monkeypatch.setenv(
        "CORS_ALLOWED_ORIGINS",
        " , https://review.example, ,https://other.example,https://review.example ",
    )
    client = TestClient(create_app())

    allowed = client.get(
        "/data-query-intents", headers={"Origin": "https://review.example"}
    )
    default = client.get(
        "/data-query-intents", headers={"Origin": "http://localhost:5173"}
    )

    assert allowed.headers["access-control-allow-origin"] == "https://review.example"
    assert "access-control-allow-origin" not in default.headers


def test_cors_rejects_wildcard_with_credentials(monkeypatch):
    monkeypatch.setenv("CORS_ALLOWED_ORIGINS", "https://review.example, *")

    with pytest.raises(ValueError, match="cannot contain '\\*'"):
        create_app()


def test_generation_and_reuse_do_not_consult_intent_catalog(monkeypatch):
    def fail_if_loaded():
        raise AssertionError("intent review catalog must not affect runtime behavior")

    monkeypatch.setattr(app_module, "load_intent_catalog", fail_if_loaded)
    monkeypatch.setattr(
        app_module,
        "generate_query_result_for_step",
        lambda *args, **kwargs: {"queries": ["SELECT 1"]},
    )
    request = GenerateQueriesRequest(
        edit_id="test-edit",
        steps=[
            Step(
                step_number=1,
                business_meaning="Retrieve a test value.",
                requires_data_query=True,
            )
        ],
    )

    generated = app_module.build_generate_queries_response(request)
    reuse_match = find_reuse_match("SELECT 1", {})

    assert generated["step_queries"][0]["query_generated"] is True
    assert reuse_match is None
