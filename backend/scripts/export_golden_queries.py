"""Explicit read-only Excel -> packaged golden-set export. Never runs at API startup."""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

import openpyxl
import yaml

from inrules_data_agent.golden_queries import inspect_template, template_signature


def export_catalog(path: Path) -> dict:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    workbook = openpyxl.load_workbook(path, data_only=True)
    try:
        sheet = workbook["Review Results"]
        header_row = next((r for r in range(1, min(sheet.max_row, 30) + 1)
                           if "Is Intent Summary Correct?" in [c.value for c in sheet[r]]), None)
        if header_row is None:
            raise ValueError("review header not found")
        columns = {str(c.value).strip(): c.column for c in sheet[header_row] if c.value}
        required = ("Name", "Generic Query Template (QueryText)", "Draft Intent Summary", "Is Intent Summary Correct?", "reviewer", "Additional Comments", "Suggested Changes")
        if any(c not in columns for c in required):
            raise ValueError("required review columns missing")
        groups = {}
        for row in range(header_row + 1, sheet.max_row + 1):
            def cell(label): return sheet.cell(row, columns[label])
            if str(cell("Is Intent Summary Correct?").value or "").strip().casefold() != "yes":
                continue
            name = str(cell("Name").value or "").strip()
            sql = str(cell("Generic Query Template (QueryText)").value or "").strip()
            intent = str(cell("Draft Intent Summary").value or "").strip()
            if not name or not sql or not intent:
                raise ValueError(f"missing approved source at row {row}")
            fill = cell("Generic Query Template (QueryText)").fill
            color = f"{fill.patternType}:{fill.fgColor.type}:{fill.fgColor.index}:{fill.fgColor.tint}"
            key = color if fill.patternType else f"row:{row}"
            tables, issue = inspect_template(sql)
            variant = {
                "name": name, "row": row, "reviewer": str(cell("reviewer").value or ""),
                "review_decision": "Yes", "intent": intent, "query_text": sql,
                "comments": str(cell("Additional Comments").value or ""),
                "suggested_changes": str(cell("Suggested Changes").value or ""),
                "source_cells": {label: cell(label).coordinate for label in required},
                "tables": list(tables), "eligible": issue is None, "issue": issue,
            }
            groups.setdefault(key, []).append(variant)
        entries = []
        for key, variants in groups.items():
            if len(variants) > 1:
                if any(not v["eligible"] for v in variants) or len({template_signature(v["query_text"]) for v in variants}) != 1:
                    raise ValueError(f"SQL differs within color group {key}: {[v['row'] for v in variants]}")
            entries.append({"id": f"dq-review-{variants[0]['row']:03d}", "color_group": key if not key.startswith("row:") else None, "variants": variants})
        if not entries:
            raise ValueError("no Yes rows found")
        return {"schema_version": 1, "source": {"workbook": path.name, "sha256": digest, "sheet": sheet.title, "filter": "Is Intent Summary Correct? = Yes", "selected_rows": sum(len(e["variants"]) for e in entries)}, "entries": entries}
    finally:
        workbook.close()
        if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise RuntimeError("source workbook changed during export")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workbook", type=Path)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "src/inrules_data_agent/golden_queries/examples.v1.yaml")
    args = parser.parse_args()
    payload = export_catalog(args.workbook)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(yaml.safe_dump(payload, sort_keys=False, allow_unicode=True, width=110), encoding="utf-8")
    variants = [v for e in payload["entries"] for v in e["variants"]]
    print(f"Exported {len(variants)} Yes rows into {len(payload['entries'])} unique groups; {sum(not v['eligible'] for v in variants)} source SQL issues retained.")
    for v in variants:
        if v["issue"]:
            print(f"Review Results!D{v['row']} ({v['name']}): {v['issue']}")


if __name__ == "__main__":
    main()
