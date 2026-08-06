import pytest


@pytest.fixture(autouse=True)
def disable_live_qdrant_by_default(monkeypatch):
    """Keep unit tests deterministic regardless of a developer's local .env."""
    monkeypatch.setenv("QDRANT_ENABLED", "false")
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "false")
