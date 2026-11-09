"""Regressions from actual live-provider failures; no provider responses are mocked."""
import pytest

from inrules_data_agent.generator.generate import (
    _find_atomic_source_guard_artifacts,
    _find_required_business_concept_artifacts,
)

SQL = (
    "SELECT COUNT(*) AS MatchCount FROM HRX.dbo.DrugOverrides d WITH (NOLOCK) "
    "WHERE d.Type = 'SMOKE_TYPE' "
    "AND (d.NDCKey = {{Ndc}} OR d.GCN_SeqNo = {{GcnSeqno}} OR d.HIC3 = {{Hic3}}) "
    "AND {{DateOfService}} BETWEEN d.EffDate AND d.TermDate"
)


def test_actual_live_candidate_is_not_rejected_for_negated_like_or_sequence_number():
    meaning = (
        "Count effective drug override records from HRX.dbo.DrugOverrides of the configured type "
        "'SMOKE_TYPE' that match the claim drug by NDC {{Ndc}}, GCN sequence number {{GcnSeqno}}, "
        "or HIC3 {{Hic3}}, and are effective on the date of service {{DateOfService}} between "
        "EffDate and TermDate inclusive. Match Type by exact equality, not LIKE. "
        "Return a scalar count as MatchCount."
    )
    assert _find_required_business_concept_artifacts(SQL, meaning) == []


@pytest.mark.parametrize("label", ["GCN sequence number", "GCN sequence no", "GCN seqno", "GCN_SeqNo", "GCN sequence"])
def test_sequence_number_is_one_identifier_not_an_additional_gcn(label):
    meaning = f"Count drug override records matching the claim drug by NDC, {label}, or HIC3."
    assert _find_atomic_source_guard_artifacts(SQL, meaning) == []


def test_explicit_separate_gcn_is_still_required():
    meaning = "Count drug override records matching the claim drug by NDC, GCN sequence number, GCN, or HIC3."
    assert any("GCN" in issue for issue in _find_atomic_source_guard_artifacts(SQL, meaning))
    complete = SQL.replace("OR d.HIC3", "OR d.GCN = {{Gcn}} OR d.HIC3")
    assert _find_atomic_source_guard_artifacts(complete, meaning) == []


@pytest.mark.parametrize("instruction", [
    "Match Type by exact equality, not LIKE.",
    "Use exact equality instead of LIKE.",
    "Use exact equality rather than LIKE.",
    "Do not use LIKE.",
])
def test_instruction_to_avoid_like_does_not_require_like(instruction):
    assert _find_required_business_concept_artifacts(SQL, instruction) == []


@pytest.mark.parametrize("instruction", [
    "Match Type using LIKE.",
    "Match Type NOT LIKE {{Pattern}}.",
    "Match Type NOT LIKE '%Excluded%'.",
    "Use exact equality instead of LIKE for Type. Use LIKE for Message.",
    "Do not use LIKE for Type. Use LIKE for Message.",
])
def test_positive_or_sql_negated_like_still_requires_the_operator(instruction):
    assert "required comparison operator 'LIKE' is absent from the SQL" in _find_required_business_concept_artifacts(SQL, instruction)
