import pytest


@pytest.fixture(autouse=True)
def isolate_test_environment(monkeypatch):
    """Keep unit tests deterministic and provider routing explicit."""
    monkeypatch.setenv("QDRANT_ENABLED", "false")
    monkeypatch.setenv("DATAQUERY_SHADOW_ENABLED", "false")
    monkeypatch.setenv("ENVIRONMENT", "SIT")
    monkeypatch.delenv("KUBERNETES_SERVICE_HOST", raising=False)
