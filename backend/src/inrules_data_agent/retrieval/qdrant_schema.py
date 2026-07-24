from __future__ import annotations

import hashlib
import math
import os
import re
import uuid
from collections import Counter
from pathlib import Path

import httpx
from dotenv import load_dotenv
from openai import OpenAI
from qdrant_client import QdrantClient, models

_PROJECT_ROOT = Path(__file__).resolve().parents[4]
load_dotenv(_PROJECT_ROOT / ".env")
load_dotenv(_PROJECT_ROOT / "backend" / ".env")

_TABLE_RE = re.compile(
    r"\bCREATE\s+TABLE\s+((?:\[[^\]]+\]|[A-Za-z_]\w*)"
    r"(?:\s*\.\s*(?:\[[^\]]+\]|[A-Za-z_]\w*)){2})",
    re.IGNORECASE,
)
_TOKEN_RE = re.compile(r"[A-Za-z][A-Za-z0-9_]*|\d+(?:-\d+)*")
_SPARSE_BUCKETS = 1_000_003
_NAMESPACE = uuid.UUID("f1391586-9f46-4b05-9456-ff26680bcde3")


def qdrant_enabled() -> bool:
    return os.environ.get("QDRANT_ENABLED", "false").lower() in {"1", "true", "yes"}


def _settings() -> dict[str, str | int]:
    return {
        "url": os.environ.get("QDRANT_URL", "http://localhost:6333"),
        "collection": os.environ.get("QDRANT_COLLECTION", "inrule_schema"),
        "embedding_model": os.environ.get(
            "OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"
        ),
        "embedding_dimensions": int(
            os.environ.get("OPENAI_EMBEDDING_DIMENSIONS", "1536")
        ),
        "dense_limit": int(os.environ.get("SCHEMA_RETRIEVAL_DENSE_LIMIT", "20")),
        "sparse_limit": int(os.environ.get("SCHEMA_RETRIEVAL_SPARSE_LIMIT", "20")),
        "final_limit": int(os.environ.get("SCHEMA_RETRIEVAL_FINAL_LIMIT", "8")),
    }


def _openai_client() -> OpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for schema embeddings")
    verify_ssl = os.environ.get("OPENAI_VERIFY_SSL", "false").lower() in {
        "1",
        "true",
        "yes",
    }
    kwargs: dict = {
        "api_key": api_key,
        "http_client": httpx.Client(verify=verify_ssl, timeout=60.0),
    }
    base_url = os.environ.get("OPENAI_BASE_URL") or os.environ.get("OPENAI_API_BASE")
    if base_url:
        kwargs["base_url"] = base_url
    return OpenAI(**kwargs)


def _embed(texts: list[str]) -> list[list[float]]:
    settings = _settings()
    response = _openai_client().embeddings.create(
        model=str(settings["embedding_model"]),
        input=texts,
        dimensions=int(settings["embedding_dimensions"]),
    )
    return [item.embedding for item in sorted(response.data, key=lambda item: item.index)]


def _canonical_table_name(ddl: str) -> str:
    match = _TABLE_RE.search(ddl)
    if not match:
        raise ValueError("DDL does not contain a fully qualified CREATE TABLE statement")
    return ".".join(
        part.strip().strip("[]")
        for part in re.split(r"\s*\.\s*", match.group(1))
    )


def _source_type(table_name: str) -> str:
    return "in_memory" if table_name.lower().startswith("inmemory.") else "physical"


def _document_text(ddl: str) -> str:
    table_name = _canonical_table_name(ddl)
    source = "InMemory frontier" if _source_type(table_name) == "in_memory" else "Physical database fallback"
    return f"Source: {source}\nTable: {table_name}\nComplete DDL and descriptions:\n{ddl}"


def _tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for raw in _TOKEN_RE.findall(text):
        lowered = raw.lower()
        tokens.append(lowered)
        if "_" in lowered:
            tokens.extend(part for part in lowered.split("_") if part)
        camel_parts = re.findall(r"[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|\d+", raw)
        tokens.extend(part.lower() for part in camel_parts if part.lower() != lowered)
    return tokens


def _sparse_vector(text: str) -> models.SparseVector:
    counts = Counter(_tokens(text))
    weighted: dict[int, float] = {}
    for token, count in counts.items():
        index = int.from_bytes(
            hashlib.blake2b(token.encode("utf-8"), digest_size=8).digest(), "big"
        ) % _SPARSE_BUCKETS
        weight = 1.0 + math.log(count)
        weighted[index] = weighted.get(index, 0.0) + weight
    norm = math.sqrt(sum(value * value for value in weighted.values())) or 1.0
    ordered = sorted((index, value / norm) for index, value in weighted.items())
    return models.SparseVector(
        indices=[index for index, _ in ordered],
        values=[value for _, value in ordered],
    )


def _retrieval_text(
    business_meaning: str,
    description: str | None,
    acceptance_criteria: str | list[str] | None,
) -> str:
    if isinstance(acceptance_criteria, list):
        acceptance_text = "\n".join(acceptance_criteria)
    else:
        acceptance_text = acceptance_criteria or ""
    return (
        "Authoritative data-query business meaning:\n"
        f"{business_meaning.strip()}\n\n"
        "Supporting acceptance-criteria context:\n"
        f"{acceptance_text.strip()}\n\n"
        "Supporting rule-description context:\n"
        f"{(description or '').strip()}"
    )


def load_packaged_ddls(schema_dir: Path, in_memory_schema_dir: Path) -> list[str]:
    in_memory = [
        path.read_text(encoding="utf-8")
        for path in sorted(in_memory_schema_dir.glob("*.sql"))
    ]
    physical = [
        path.read_text(encoding="utf-8") for path in sorted(schema_dir.glob("*.sql"))
    ]
    return in_memory + physical


def index_schema_catalog(
    schema_dir: Path,
    in_memory_schema_dir: Path,
    *,
    recreate: bool = False,
) -> dict[str, int | str]:
    settings = _settings()
    client = QdrantClient(url=str(settings["url"]))
    collection = str(settings["collection"])
    exists = client.collection_exists(collection)
    if recreate and exists:
        client.delete_collection(collection)
        exists = False
    if not exists:
        client.create_collection(
            collection_name=collection,
            vectors_config={
                "dense": models.VectorParams(
                    size=int(settings["embedding_dimensions"]),
                    distance=models.Distance.COSINE,
                )
            },
            sparse_vectors_config={
                "sparse": models.SparseVectorParams(
                    index=models.SparseIndexParams(on_disk=False)
                )
            },
        )

    ddls = load_packaged_ddls(schema_dir, in_memory_schema_dir)
    documents = [_document_text(ddl) for ddl in ddls]
    dense_vectors = _embed(documents)
    points: list[models.PointStruct] = []
    for ddl, document, dense in zip(ddls, documents, dense_vectors, strict=True):
        table_name = _canonical_table_name(ddl)
        content_hash = hashlib.sha256(ddl.encode("utf-8")).hexdigest()
        points.append(
            models.PointStruct(
                id=str(uuid.uuid5(_NAMESPACE, table_name.lower())),
                vector={"dense": dense, "sparse": _sparse_vector(document)},
                payload={
                    "table": table_name,
                    "source_type": _source_type(table_name),
                    "content_hash": content_hash,
                    "ddl": ddl,
                },
            )
        )
    client.upsert(collection_name=collection, points=points, wait=True)
    return {
        "collection": collection,
        "indexed": len(points),
        "in_memory": sum(point.payload["source_type"] == "in_memory" for point in points),
        "physical": sum(point.payload["source_type"] == "physical" for point in points),
    }


def retrieve_schema_ddls(
    business_meaning: str,
    *,
    description: str | None = None,
    acceptance_criteria: str | list[str] | None = None,
) -> list[str]:
    if not qdrant_enabled():
        return []
    settings = _settings()
    query_text = _retrieval_text(business_meaning, description, acceptance_criteria)
    dense = _embed([query_text])[0]
    client = QdrantClient(url=str(settings["url"]))
    result = client.query_points(
        collection_name=str(settings["collection"]),
        prefetch=[
            models.Prefetch(
                query=dense,
                using="dense",
                limit=int(settings["dense_limit"]),
            ),
            models.Prefetch(
                query=_sparse_vector(query_text),
                using="sparse",
                limit=int(settings["sparse_limit"]),
            ),
        ],
        query=models.FusionQuery(fusion=models.Fusion.RRF),
        limit=int(settings["final_limit"]),
        with_payload=True,
    )
    points = result.points
    # Preserve the frontier policy among retrieved candidates without forcing an
    # incomplete InMemory mapping: the SQL prompt still validates completeness.
    points.sort(
        key=lambda point: (
            point.payload.get("source_type") != "in_memory",
            -(point.score or 0.0),
        )
    )
    return [str(point.payload["ddl"]) for point in points if point.payload.get("ddl")]
