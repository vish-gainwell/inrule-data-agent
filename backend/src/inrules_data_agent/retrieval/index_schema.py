from __future__ import annotations

import argparse
from pathlib import Path

from .qdrant_schema import index_schema_catalog


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Embed packaged DDL metadata with OpenAI and index it in Qdrant."
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="Delete and recreate the configured collection before indexing.",
    )
    args = parser.parse_args()
    package_dir = Path(__file__).resolve().parents[1]
    result = index_schema_catalog(
        package_dir / "schema",
        package_dir / "in_memory_schema",
        recreate=args.recreate,
    )
    print(
        f"Indexed {result['indexed']} schemas into {result['collection']} "
        f"({result['in_memory']} InMemory, {result['physical']} physical)."
    )


if __name__ == "__main__":
    main()
