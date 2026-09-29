from pathlib import Path

import yaml


MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "semantic_models"
    / "claim_edit_semantic_model.yaml"
)


def test_draft_semantic_model_records_original_claim_composite_match():
    model = yaml.safe_load(MODEL_PATH.read_text(encoding="utf-8"))

    assert model["status"] == "draft_not_runtime"
    original_claim = next(
        entity for entity in model["entities"] if entity["name"] == "original_claim"
    )
    contract = next(
        contract
        for contract in original_claim["match_contracts"]
        if contract["name"] == "rx_ndc_provider_dos"
    )

    assert contract["status"] == "draft_for_sme_review"
    assert contract["match_type"] == "all_of"
    assert [field["semantic_input"] for field in contract["fields"]] == [
        "RxNumber",
        "ClaimTransaction.Ndc",
        "ProviderId",
        "DateOfService",
    ]
    assert contract["provenance"] == {
        "source": "acceptance_criteria_and_sme_review",
        "reference": "Edit 7013 - ORIGINAL CLAIM MATCH INCOMPLETE",
    }
