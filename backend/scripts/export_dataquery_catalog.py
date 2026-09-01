"""Create a local SQLite reuse catalog from the current ClaimEngine DataQuery set."""

from __future__ import annotations

import argparse
from pathlib import Path

from inrules_data_agent.retrieval.querytext_shadow import (
    _load_reuse_corpus_from_claimengine,
    write_reuse_catalog,
)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export approved ClaimEngine DataQueries into a local SQLite reuse catalog."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/inrules_data_agent/retrieval/data/dataquery_reuse_catalog.sqlite3"),
        help="SQLite catalog path to create.",
    )
    args = parser.parse_args()

    corpus = _load_reuse_corpus_from_claimengine()
    output = write_reuse_catalog(args.output, corpus)
    print(f"Exported {len(corpus)} DataQuery templates to {output}")


if __name__ == "__main__":
    main()
