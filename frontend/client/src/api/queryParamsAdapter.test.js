import assert from "node:assert/strict";
import test from "node:test";
import {
  getTypedBackendMessage,
  normalizeGenerateQueriesResponse,
  normalizeGenerateSqlResponse,
} from "./queryParamsAdapter.js";

test("normalizes generate_queries response", () => {
  const result = normalizeGenerateQueriesResponse({
    edit_id: "3015",
    queries: [
      {
        step_number: 4,
        business_meaning: "Use incoming NDC to query DrugOverrides...",
        queries: ["select count(*) from drugoverrides"],
        matched: true,
      },
    ],
  });

  assert.equal(result.kind, "generated_queries");
  assert.equal(result.editId, "3015");
  assert.equal(result.steps[0].stepNumber, 4);
  assert.equal(
    result.steps[0].businessMeaning,
    "Use incoming NDC to query DrugOverrides...",
  );
  assert.deepEqual(result.steps[0].queries, [
    "select count(*) from drugoverrides",
  ]);
  assert.equal(result.steps[0].matched, true);
});

test("normalizes no-match generate_queries step", () => {
  const result = normalizeGenerateQueriesResponse({
    edit_id: "x",
    queries: [
      {
        step_number: 99,
        business_meaning: "Unsupported lookup",
        queries: [],
        matched: false,
      },
    ],
  });

  assert.equal(result.steps[0].matched, false);
  assert.deepEqual(result.steps[0].queries, []);
});

test("derives matched from non-empty queries when omitted", () => {
  const result = normalizeGenerateQueriesResponse({
    editId: "3015",
    queries: [{ stepNumber: 6, queries: ["select 1", "select 2"] }],
  });

  assert.equal(result.editId, "3015");
  assert.equal(result.steps[0].matched, true);
  assert.equal(result.steps[0].queries.length, 2);
});

test("normalizes generate_query S5 SQL response", () => {
  const result = normalizeGenerateSqlResponse({
    sql: "select 1",
    canGenerate: true,
    selectedTables: ["HRX.dbo.DrugOverrides"],
    selectedColumns: ["HRX.dbo.DrugOverrides.NDCKey"],
    joinAssumptions: [{ predicate: "d.NDCKey = n.NDCKey", confidence: 0.8 }],
    warnings: [],
    blocking_errors: [],
    confidence: "high",
  });

  assert.equal(result.kind, "sql");
  assert.equal(result.sql, "select 1");
  assert.equal(result.canGenerate, true);
  assert.equal(result.confidence, "high");
  assert.equal(result.joinAssumptions[0].confidence, 0.8);
});

test("normalizes generate_query blocked schema unavailable response", () => {
  const result = normalizeGenerateSqlResponse({
    sql: null,
    canGenerate: false,
    blocking_errors: [
      { code: "SCHEMA_UNAVAILABLE", message: "Required schema is missing." },
    ],
    reason: "schema_unavailable",
    missing: ["plandata_rx_production.dbo.claimpharm"],
    nextAction: "provide live DDL / schema workbook",
    confidence: "low",
  });

  assert.equal(result.canGenerate, false);
  assert.equal(result.reason, "schema_unavailable");
  assert.equal(result.missing[0], "plandata_rx_production.dbo.claimpharm");
  assert.equal(result.blocking_errors[0].code, "SCHEMA_UNAVAILABLE");
});

test("maps typed backend not-ready messages", () => {
  assert.equal(
    getTypedBackendMessage({ code: "NOT_IMPLEMENTED" }),
    "NL-to-SQL generation is coming in a later phase.",
  );
  assert.equal(
    getTypedBackendMessage({ code: "DB_UNAVAILABLE" }),
    "Query execution is unavailable because this environment has no database connectivity.",
  );
  assert.equal(
    getTypedBackendMessage({ code: "LLM_UNAVAILABLE" }),
    "NL-to-SQL generation is temporarily unavailable because the LLM gateway could not be reached.",
  );
});

test("maps typed backend messages from blocking_errors", () => {
  assert.equal(
    getTypedBackendMessage({
      blocking_errors: [
        {
          code: "DB_UNAVAILABLE",
          message: "SQL Server connectivity is unavailable.",
        },
      ],
    }),
    "Query execution is unavailable because this environment has no database connectivity.",
  );
});
