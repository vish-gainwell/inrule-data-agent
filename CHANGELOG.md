# Changelog

## 2026-09-01T17:05:24+05:30

### Added

- Added a local SQLite catalog of 917 approved ClaimEngine DataQuery templates and 1,284 assignment records for deterministic reuse validation without a per-request ClaimEngine connection.
- Added an explicit catalog-export command for controlled snapshot creation.
- Added catalog-first reuse loading with ClaimEngine fallback when a local catalog is unavailable or invalid.
- Added tests for local catalog loading, fallback behavior, and Windows-safe catalog creation.

### Validated

- Revalidated eight regenerated reuse cases from `131_TEST_for_eval_V1_Review Results_SME Feedback Fix Review.xlsx` against the local catalog; all eight matched approved existing DataQueries.
- Ran the backend test suite: 193 passed.
